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

  if (!code) {
    return NextResponse.redirect(new URL("/?slack_error=missing_code", req.url));
  }

  const res = await fetch(`${apiBase}/auth/slack/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeadersFromRequest(req) },
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = encodeURIComponent(body.detail ?? "slack_install_failed");
    return NextResponse.redirect(new URL(`/?slack_error=${message}`, req.url));
  }

  return NextResponse.redirect(new URL("/?slack_connected=1", req.url));
}
