import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session";

// architecture.md "org 스코핑과 로그인" — Google authorization code는 여기서
// api로 그대로 넘긴다. GOOGLE_CLIENT_SECRET을 아는 건 api뿐이다(web은 시크릿이
// 없다). approve/route.ts의 승인 토큰 패턴과 같다 — 민감한 값(여기선 세션
// 토큰)이 이 함수 스코프 밖으로 나갈 때는 httpOnly 쿠키뿐이다.
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const orgName = req.nextUrl.searchParams.get("state") || undefined;
  const apiBase = process.env.API_BASE_URL;

  if (!apiBase) {
    return NextResponse.json({ error: "API_BASE_URL not set" }, { status: 500 });
  }

  // Cloud Run에서 req.nextUrl.origin이 컨테이너 내부 바인딩 주소
  // (http://localhost:8080)로 나온다 — 로그인 페이지가 Google에 보낸
  // redirect_uri(window.location.origin 기반)와 달라져서 Google 토큰 교환이
  // redirect_uri_mismatch로 거부된다. PUBLIC_APP_URL을 배포 시점에 고정해
  // 두 값을 일치시킨다. 로컬 dev는 이 값이 없으니 기존대로 origin을 쓴다.
  const appOrigin = process.env.PUBLIC_APP_URL || req.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", appOrigin));
  }

  const redirectUri = `${appOrigin}/api/auth/google/callback`;
  const res = await fetch(`${apiBase}/auth/google/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, redirect_uri: redirectUri, org_name: orgName }),
  });
  const body = await res.json();

  if (!res.ok) {
    const message = encodeURIComponent(body.detail ?? "login_failed");
    return NextResponse.redirect(new URL(`/login?error=${message}`, appOrigin));
  }

  const sessionToken: string | undefined = body.session_token;
  if (!sessionToken) {
    // 200인데 토큰이 없으면 계약 위반이다 — approve/route.ts와 같은 원칙.
    return NextResponse.redirect(new URL("/login?error=missing_session_token", appOrigin));
  }

  const response = NextResponse.redirect(new URL("/", appOrigin));
  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return response;
}
