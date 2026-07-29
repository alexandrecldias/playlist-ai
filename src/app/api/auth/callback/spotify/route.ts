import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForToken, validateEnv, COOKIE_NAMES, COOKIE_OPTIONS, clearTemporaryAuthCookiesOnResponse } from "@/lib/spotify";

export async function GET(request: Request) {
  const isProd = process.env.NODE_ENV === "production";
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("authError", String(error));
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("authError", "missing_code");
    return NextResponse.redirect(redirectUrl);
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get(COOKIE_NAMES.authState)?.value;
  const codeVerifier = cookieStore.get(COOKIE_NAMES.codeVerifier)?.value;

  if (!state || !storedState || state !== storedState) {
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("authError", "invalid_state");
    return NextResponse.redirect(redirectUrl);
  }

  if (!codeVerifier) {
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("authError", "missing_code_verifier");
    return NextResponse.redirect(redirectUrl);
  }

  try {
    // validate env early
    validateEnv();

    const tokenData = await exchangeCodeForToken(code, codeVerifier);

    const expiresAt = Date.now() + tokenData.expires_in * 1000;
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";

    const res = NextResponse.redirect(redirectUrl);

    res.cookies.set({
      name: COOKIE_NAMES.accessToken,
      value: tokenData.access_token,
      ...COOKIE_OPTIONS(isProd),
      maxAge: tokenData.expires_in,
    });

    if (tokenData.refresh_token) {
      res.cookies.set({
        name: COOKIE_NAMES.refreshToken,
        value: tokenData.refresh_token,
        ...COOKIE_OPTIONS(isProd),
      });
    }

    res.cookies.set({
      name: COOKIE_NAMES.expiresAt,
      value: String(expiresAt),
      ...COOKIE_OPTIONS(isProd),
    });

    clearTemporaryAuthCookiesOnResponse(res.cookies, isProd);

    return res;
  } catch (err) {
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("authError", err instanceof Error ? err.message : "unknown_error");
    return NextResponse.redirect(redirectUrl);
  }
}

