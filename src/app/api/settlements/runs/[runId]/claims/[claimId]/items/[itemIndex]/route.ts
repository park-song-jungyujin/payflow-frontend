import { NextRequest, NextResponse } from "next/server";
import { authHeadersFromRequest } from "@/lib/session";

// 청구 반려(물품 체크 해제) — api PATCH를 그대로 프록시한다. 금액 재계산은
// api가 한다(CLAUDE.md "하지 말 것" — 비즈니스 로직·금액 계산은 여기 두지 않는다).
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ runId: string; claimId: string; itemIndex: string }> }
) {
  const { runId, claimId, itemIndex } = await params;
  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) {
    return NextResponse.json({ error: "API_BASE_URL not set" }, { status: 500 });
  }

  const body = await req.json();
  const session = authHeadersFromRequest(req);
  const res = await fetch(
    `${apiBase}/settlements/runs/${runId}/claims/${claimId}/items/${itemIndex}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...session },
      body: JSON.stringify(body),
    }
  );
  const responseBody = await res.json();
  return NextResponse.json(responseBody, { status: res.status });
}
