import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session";

async function logout(req: NextRequest) {
  const apiBase = process.env.API_BASE_URL;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (apiBase && token) {
    await fetch(`${apiBase}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }

  // google/callback/route.ts와 같은 이유 — Cloud Run에서 req.nextUrl.origin이
  // 컨테이너 내부 바인딩 주소(localhost)로 나와서 그대로 쓰면 로그아웃 후
  // localhost로 리다이렉트된다.
  const appOrigin = process.env.PUBLIC_APP_URL || req.nextUrl.origin;
  const response = NextResponse.redirect(new URL("/login", appOrigin));
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

// GET도 받는다 — 대시보드의 "로그아웃"은 평범한 링크(<a href>)라 GET으로 온다.
export const GET = logout;
export const POST = logout;
