import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAMES, clearAuthCookiesOnResponse, getSpotifyAccessToken, setAuthTokenCookies, ALLOWED_REFRESH_RETURN_TO } from "@/lib/spotify";

export async function GET(request: Request) {
  const isProd = process.env.NODE_ENV === "production";
  const url = new URL(request.url);
  const returnToRaw = url.searchParams.get("returnTo") ?? "/dashboard";
  const returnTo = ALLOWED_REFRESH_RETURN_TO.includes(returnToRaw as "/dashboard" | "/playlists/new")
    ? returnToRaw
    : "/dashboard";

  const redirectUrl = new URL(request.url);
  redirectUrl.pathname = returnTo;
  redirectUrl.search = "";

  const res = NextResponse.redirect(redirectUrl);
  res.headers.set("Cache-Control", "no-store");

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(COOKIE_NAMES.accessToken)?.value;
    const refreshToken = cookieStore.get(COOKIE_NAMES.refreshToken)?.value;
    const expiresAt = cookieStore.get(COOKIE_NAMES.expiresAt)?.value;

    if (!refreshToken) {
      clearAuthCookiesOnResponse(res.cookies, isProd);
      const failureRedirect = new URL(request.url);
      failureRedirect.pathname = "/";
      failureRedirect.search = "";
      failureRedirect.searchParams.set("authError", "refresh_missing");
      const failureRes = NextResponse.redirect(failureRedirect);
      failureRes.headers.set("Cache-Control", "no-store");
      return failureRes;
    }

    const tokenResult = await getSpotifyAccessToken(accessToken, refreshToken, expiresAt ? Number(expiresAt) : undefined);

    if (tokenResult.refreshed && tokenResult.tokenData) {
      setAuthTokenCookies(res.cookies, tokenResult.tokenData, isProd);
    }

    return res;
  } catch {
    clearAuthCookiesOnResponse(res.cookies, isProd);
    const failureRedirect = new URL(request.url);
    failureRedirect.pathname = "/";
    failureRedirect.search = "";
    failureRedirect.searchParams.set("authError", "refresh_failed");
    const failureRes = NextResponse.redirect(failureRedirect);
    failureRes.headers.set("Cache-Control", "no-store");
    return failureRes;
  }
}

