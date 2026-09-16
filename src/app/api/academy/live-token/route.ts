import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      roomName = "*",
      isInstructor = false,
      displayName = "Guest",
      email = "",
      userId = `user-${Date.now()}`,
    } = body;

    const appId = process.env.NEXT_PUBLIC_JAAS_APP_ID || "vpaas-magic-cookie-61afd8e844544b6ca25d2ecc93d19670";
    const apiKeyId = process.env.JAAS_API_KEY_ID || `${appId}/52d009`;

    // 1. Check environment variable first, then fallback to local certs
    let privateKey = (process.env.JAAS_PRIVATE_KEY || "").replace(/\\n/g, "\n").trim();

    if (!privateKey) {
      const keyPaths = [
        path.join(process.cwd(), "certs", "jaas-private.pk"),
        path.join(process.cwd(), "..", "Sajjad-academy.pk"),
        "/home/keshav-pathak/Projects/LegalTech/Sajjad-academy.pk",
      ];

      for (const p of keyPaths) {
        if (fs.existsSync(p)) {
          privateKey = fs.readFileSync(p, "utf8");
          break;
        }
      }
    }

    if (!privateKey) {
      console.warn("8x8 JaaS private key not found. Falling back to unauthenticated mode.");
      return NextResponse.json({ token: null });
    }

    const nowSeconds = Math.floor(Date.now() / 1000);

    const header = Buffer.from(
      JSON.stringify({
        alg: "RS256",
        typ: "JWT",
        kid: apiKeyId,
      })
    ).toString("base64url");

    const payload = Buffer.from(
      JSON.stringify({
        aud: "jitsi",
        iss: "chat",
        iat: nowSeconds,
        exp: nowSeconds + 10800, // 3 hours validity
        nbf: nowSeconds - 10,
        sub: appId,
        room: "*",
        context: {
          features: {
            livestreaming: isInstructor,
            recording: isInstructor,
            transcription: false,
            "outbound-call": false,
            "sip-outbound-call": false,
          },
          user: {
            id: String(userId),
            name: String(displayName),
            email: String(email),
            avatar: "",
            moderator: Boolean(isInstructor),
            "hidden-from-recorder": false,
          },
        },
      })
    ).toString("base64url");

    const sign = crypto.createSign("RSA-SHA256");
    sign.update(`${header}.${payload}`);
    const signature = sign.sign(privateKey, "base64url");
    const jwt = `${header}.${payload}.${signature}`;

    return NextResponse.json({ token: jwt });
  } catch (error: any) {
    console.error("Error generating 8x8 JaaS token:", error);
    return NextResponse.json({ token: null, error: error.message }, { status: 500 });
  }
}
