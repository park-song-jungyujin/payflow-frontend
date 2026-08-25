import { NextRequest, NextResponse } from "next/server";
import { authHeadersFromRequest } from "@/lib/session";

// 청구 통째 제외 — items/[itemIndex]/route.ts와 같은 패턴, api POST를 그대로
// 프록시한다. claim을 이 run에서 완전히 뺀다(금액 차감이 아니다) — backend
// settlements/routes.py.exclude_claim_from_run_route 참조.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ runId: string; claimId: string }> }
) {
  const { runId, claimId } = await params;
  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) {
    return NextResponse.json({ error: "API_BASE_URL not set" }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const session = authHeadersFromRequest(req);
  const res = await fetch(`${apiBase}/settlements/runs/${runId}/claims/${claimId}/exclude`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...session },
    body: JSON.stringify(body),
  });
  const responseBody = await res.json();
  return NextResponse.json(responseBody, { status: res.status });
}
