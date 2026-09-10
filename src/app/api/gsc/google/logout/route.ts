import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getPayload } from "payload";

import config from "@/payload.config";
import { env } from "@/lib/env";

/**
 * Disconnects the signed-in admin user's Google Search Console connection:
 * best-effort revocation of the Google refresh token, then deletion of the
 * stored gsc-connections doc so the insights API reports `connected: false`.
 */
export async function POST() {
  const payload = await getPayload({ config });
  const authResult = await payload.auth({ headers: await headers() });

  if (!authResult.user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const connectionResult = await payload.find({
      collection: "gsc-connections",
      where: { user: { equals: authResult.user.id } },
      limit: 1,
      overrideAccess: true,
    });

    const connection = connectionResult.docs[0];

    if (connection) {
      if (connection.refreshToken) {
        // Best effort: tell Google to stop honouring the refresh token. A
        // failure here (network, already revoked) must not block disconnect.
        try {
          await fetch("https://oauth2.googleapis.com/revoke", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ token: connection.refreshToken }),
          });
        } catch (revokeError) {
          console.error("GSC token revocation failed:", revokeError);
        }
      }

      await payload.delete({
        collection: "gsc-connections",
        id: connection.id,
        overrideAccess: true,
      });
    }

    return NextResponse.json({ connected: false });
  } catch (err: unknown) {
    console.error("GSC disconnect failed:", err);
    return NextResponse.json(
      { error: "Failed to disconnect Google Search Console." },
      { status: 500 },
    );
  }
}

export function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 },
  );
}
