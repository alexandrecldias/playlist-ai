import { NextResponse } from "next/server";
import { generateCodeVerifier, generateCodeChallenge, generateState, SPOTIFY_AUTH_URL, SCOPES, validateEnv, COOKIE_NAMES } from "@/lib/spotify";

export async function GET() {
  const isProd = process.env.NODE_ENV === "production";

  // validate env and get redirect uri/client id
  const { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } = validateEnv();

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();

  // Build Spotify authorize URL
  const params = new URLSearchParams({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: SCOPES,
    state,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  const redirectUrl = `${SPOTIFY_AUTH_URL}?${params.toString()}`;

  const res = NextResponse.redirect(redirectUrl);

  // Store code_verifier and state in HttpOnly cookies (temporary)
  res.cookies.set({
    name: COOKIE_NAMES.codeVerifier,
    value: codeVerifier,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: isProd,
  });

  res.cookies.set({
    name: COOKIE_NAMES.authState,
    value: state,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: isProd,
  });

  return res;
}

