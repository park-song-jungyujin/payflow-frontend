import { NextRequest, NextResponse } from "next/server";
import { authHeadersFromRequest } from "@/lib/session";

// Slack이 authorization code를 여기로 돌려준다. api가 code 교환을 하고
// slack_workspaces에 저장한다 — code 자체는 여기서 그대로 넘기기만 한다
// (SLACK_APP_CLIENT_SECRET을 아는 건 api뿐이다).
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const apiBase = process.env.API_BASE_URL;

  if (!apiBase) {
    return NextResponse.json({ error: "API_BASE_URL not set" }, { status: 500 });
  }

  // google/callback, logout route.ts와 같은 이유 — Cloud Run에서 req.url이
  // 컨테이너 내부 바인딩 주소(localhost)로 나와서 그대로 쓰면 Allow 후
  // localhost로 리다이렉트된다.
  const appOrigin = process.env.PUBLIC_APP_URL || req.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(new URL("/?slack_error=missing_code", appOrigin));
  }

  const res = await fetch(`${apiBase}/auth/slack/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeadersFromRequest(req) },
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = encodeURIComponent(body.detail ?? "slack_install_failed");
    return NextResponse.redirect(new URL(`/?slack_error=${message}`, appOrigin));
  }

  return NextResponse.redirect(new URL("/?slack_connected=1", appOrigin));
}
