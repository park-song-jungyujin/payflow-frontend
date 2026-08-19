import { NextRequest, NextResponse } from "next/server";

// 얇은 BFF 프록시 — 승인 판단·토큰 발급은 전부 api(guards/routes.py)가 한다.
// TODO(B): 대시보드/요약 카드가 붙으면 approved_by를 로그인 사용자로 채운다.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;
  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) {
    return NextResponse.json({ error: "API_BASE_URL not set" }, { status: 500 });
  }

  const res = await fetch(`${apiBase}/settlements/runs/${runId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}
