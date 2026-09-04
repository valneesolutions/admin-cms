import { createHmac, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { getPayload } from "payload";

import config from "@/payload.config";
import { getGoogleAuthorizationUrl } from "@/lib/google/gsc-oauth";
import { env } from "@/lib/env";

const GSC_OAUTH_STATE_COOKIE = "gsc_oauth_state";
const GSC_OAUTH_STATE_TTL_SECONDS = 10 * 60;

function signState(state: string, userId: string | number, issuedAt: number) {
  const payload = Buffer.from(
    JSON.stringify({ state, userId, issuedAt }),
  ).toString("base64url");
  const signature = createHmac("sha256", env.PAYLOAD_SECRET)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export async function GET() {
  const payload = await getPayload({ config });
  const authResult = await payload.auth({ headers: await headers() });

  if (!authResult.user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  const state = randomBytes(32).toString("base64url");
  const issuedAt = Math.floor(Date.now() / 1000);
  const response = NextResponse.redirect(getGoogleAuthorizationUrl(state));
  const cookieStore = await cookies();

  cookieStore.set({
    name: GSC_OAUTH_STATE_COOKIE,
    value: signState(state, authResult.user.id, issuedAt),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: GSC_OAUTH_STATE_TTL_SECONDS,
    path: "/api/gsc/google",
  });

  return response;
}
