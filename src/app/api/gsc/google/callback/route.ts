import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getPayload } from "payload";

import config, { PAYLOAD_ADMIN_ROUTE } from "@/payload.config";
import { getGoogleOAuthClient } from "@/lib/google/gsc-oauth";
import { env } from "@/lib/env";

const GSC_OAUTH_STATE_COOKIE = "gsc_oauth_state";
const GSC_OAUTH_STATE_TTL_SECONDS = 10 * 60;

type SignedState = {
  state: string;
  userId: string | number;
  issuedAt: number;
};

function getSafeError(message: string, status: number, clearCookie = false) {
  const response = NextResponse.json({ error: message }, { status });
  if (clearCookie) clearStateCookie(response);
  return response;
}

function verifyState(value: string): SignedState | null {
  const separatorIndex = value.lastIndexOf(".");
  if (separatorIndex <= 0) return null;

  const payload = value.slice(0, separatorIndex);
  const signature = value.slice(separatorIndex + 1);
  const expectedSignature = createHmac("sha256", env.PAYLOAD_SECRET)
    .update(payload)
    .digest("base64url");
  const providedSignature = Buffer.from(signature, "base64url");
  const expectedSignatureBuffer = Buffer.from(expectedSignature, "base64url");

  if (
    providedSignature.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(providedSignature, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Partial<SignedState>;
    if (
      typeof parsed.state !== "string" ||
      (typeof parsed.userId !== "string" &&
        typeof parsed.userId !== "number") ||
      typeof parsed.issuedAt !== "number"
    ) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (
      parsed.issuedAt > now ||
      now - parsed.issuedAt > GSC_OAUTH_STATE_TTL_SECONDS
    ) {
      return null;
    }

    return parsed as SignedState;
  } catch {
    return null;
  }
}

function clearStateCookie(response: NextResponse) {
  response.cookies.set({
    name: GSC_OAUTH_STATE_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/api/gsc/google",
  });
}

function normalizePropertyUrl(rawUrl: string): string {
  const url = rawUrl.trim();
  if (url.startsWith("sc-domain:")) {
    return `sc-domain:${url.slice(10).toLowerCase()}`;
  }
  try {
    const parsed = new URL(url);
    parsed.hostname = parsed.hostname.toLowerCase();
    parsed.protocol = parsed.protocol.toLowerCase();
    let pathname = parsed.pathname;
    if (!pathname || pathname === "") {
      pathname = "/";
    }
    return `${parsed.protocol}//${parsed.host}${pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return url.toLowerCase();
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const oauthError = requestUrl.searchParams.get("error");
  if (oauthError) {
    return getSafeError("Google OAuth authorization was denied.", 400);
  }

  const code = requestUrl.searchParams.get("code");
  const queryState = requestUrl.searchParams.get("state");
  if (!code || !queryState) {
    return getSafeError("Google OAuth callback is missing code or state.", 400);
  }

  const cookieStore = await cookies();
  const signedState = cookieStore.get(GSC_OAUTH_STATE_COOKIE)?.value;
  const verifiedState = signedState ? verifyState(signedState) : null;
  if (!verifiedState) {
    return getSafeError("Google OAuth state is invalid or expired.", 400);
  }

  if (verifiedState.state !== queryState) {
    return getSafeError("Google OAuth state does not match.", 400, true);
  }

  try {
    const payload = await getPayload({ config });
    const authResult = await payload.auth({ headers: await headers() });
    if (!authResult.user) {
      return getSafeError("Authentication required.", 401, true);
    }
    if (String(authResult.user.id) !== String(verifiedState.userId)) {
      return getSafeError(
        "Google OAuth state is not associated with this user.",
        400,
        true,
      );
    }

    const oauthClient = getGoogleOAuthClient();
    const tokenResponse = await oauthClient.getToken(code);
    const tokens = tokenResponse.tokens;
    if (!tokens.refresh_token) {
      return getSafeError(
        "Google did not provide a refresh token. Please retry and grant offline access.",
        400,
        true,
      );
    }

    oauthClient.setCredentials(tokens);
    const oauth2 = google.oauth2({
      version: "v2",
      auth: oauthClient,
    });
    const identity = await oauth2.userinfo.get();
    const googleAccountEmail = identity.data.email;
    if (!googleAccountEmail) {
      return getSafeError(
        "Google account email could not be determined.",
        400,
        true,
      );
    }



    const searchConsole = google.searchconsole({
      version: "v1",
      auth: oauthClient,
    });
    const sitesResponse = await searchConsole.sites.list();
    const siteEntries = sitesResponse.data.siteEntry ?? [];

    const configuredPropertyUrl = env.GOOGLE_SEARCH_CONSOLE_PROPERTY_URL.trim();
    const normalizedConfigured = normalizePropertyUrl(configuredPropertyUrl);

    const matchingEntry = siteEntries.find((entry) => {
      if (!entry.siteUrl) return false;
      return normalizePropertyUrl(entry.siteUrl) === normalizedConfigured;
    });

    if (!matchingEntry || !matchingEntry.siteUrl) {
      return getSafeError(
        "This Google account does not have access to the configured Search Console property.",
        400,
        true,
      );
    }

    const propertyUrl = matchingEntry.siteUrl;

    const connection = await payload.find({
      collection: "gsc-connections",
      where: {
        and: [
          { user: { equals: verifiedState.userId } },
          { propertyUrl: { equals: propertyUrl } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    });
    const data = {
      user: verifiedState.userId as typeof authResult.user.id,
      googleAccountEmail,
      propertyUrl,
      refreshToken: tokens.refresh_token,
      ...(tokens.access_token ? { accessToken: tokens.access_token } : {}),
      ...(tokens.expiry_date ? { tokenExpiry: tokens.expiry_date } : {}),
    };

    if (connection.docs[0]) {
      await payload.update({
        collection: "gsc-connections",
        id: connection.docs[0].id,
        data,
        overrideAccess: true,
      });
    } else {
      await payload.create({
        collection: "gsc-connections",
        data,
        overrideAccess: true,
      });
    }

    const response = NextResponse.redirect(
      new URL(PAYLOAD_ADMIN_ROUTE, request.url),
    );
    clearStateCookie(response);
    return response;
  } catch {
    return getSafeError(
      "Google Search Console connection could not be completed.",
      500,
      true,
    );
  }
}
