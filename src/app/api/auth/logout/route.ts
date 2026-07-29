import { NextResponse } from "next/server";
import { clearAuthCookiesOnResponse } from "@/lib/spotify";

export async function POST(request: Request) {
  const isProd = process.env.NODE_ENV === "production";
  const redirectUrl = new URL(request.url);
  redirectUrl.pathname = "/";
  redirectUrl.search = "";

  const res = NextResponse.redirect(redirectUrl);
  clearAuthCookiesOnResponse(res.cookies, isProd);
  return res;
}

