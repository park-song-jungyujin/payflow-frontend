import { NextRequest, NextResponse } from "next/server";

// 얇은 BFF 프록시 — 상세 조회만, 로직 없음.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;
  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) {
    return NextResponse.json({ error: "API_BASE_URL not set" }, { status: 500 });
  }

  const res = await fetch(`${apiBase}/settlements/runs/${runId}`, { cache: "no-store" });
  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}
