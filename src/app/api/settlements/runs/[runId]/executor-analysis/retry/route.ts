import { NextRequest, NextResponse } from "next/server";
import { authHeadersFromRequest } from "@/lib/session";

// 이상징후 재시도 버튼 — api POST를 그대로 프록시한다. enqueue·상태 기록은
// api가 한다(settlements/routes.py.retry_executor_analysis_route).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;
  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) {
    return NextResponse.json({ error: "API_BASE_URL not set" }, { status: 500 });
  }

  const session = authHeadersFromRequest(req);
  const res = await fetch(`${apiBase}/settlements/runs/${runId}/executor-analysis/retry`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...session },
  });
  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}
