import { NextRequest, NextResponse } from "next/server";
import { authHeadersFromRequest } from "@/lib/session";

// 대시보드의 "Slack 워크스페이스 연결" 버튼이 부르는 얇은 BFF — api에서
// authorize_url을 받아 그리로 리다이렉트한다. SLACK_APP_CLIENT_SECRET을
// 아는 건 api뿐이다(web은 시크릿이 없다).
export async function GET(req: NextRequest) {
  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) {
    return NextResponse.json({ error: "API_BASE_URL not set" }, { status: 500 });
  }

  const res = await fetch(`${apiBase}/auth/slack/install`, {
    headers: authHeadersFromRequest(req),
  });
  const body = await res.json();

  if (!res.ok) {
    return NextResponse.json(body, { status: res.status });
  }

  return NextResponse.redirect(body.authorize_url);
}
