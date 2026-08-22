import { NextRequest, NextResponse } from "next/server";
import { authHeadersFromRequest } from "@/lib/session";

// 승인 카드 — schema-contract.md §7 승인 토큰 흐름을 이 route handler 안에서
// 끝낸다. approve가 평문으로 한 번 내주는 토큰을 이 함수 스코프 밖으로
// 절대 내보내지 않는다 — 브라우저는 최종 상태(EXECUTING 등)만 받는다
// (plans/2026-08-21-web-dashboard.md 결정 1). 사람이 판단하는 시점은 "승인 및
// 송금" 버튼을 누르기 전(요약 카드를 보고 결정)이지, 토큰 발급과 송금 사이가
// 아니다 — 토큰 자체가 10분 TTL·금액 해시 바인딩·1회용으로 지연 없이 바로
// 소비되도록 설계돼 있다(money-safety.md).
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
  const approveRes = await fetch(`${apiBase}/settlements/runs/${runId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...session },
    body: JSON.stringify({}),
  });
  const approveBody = await approveRes.json();

  if (!approveRes.ok) {
    // 캡 초과(403) · 상태 불일치(409) · 링크된 claim 없음(422) 등 — 토큰이
    // 발급되지 않았으니 여기서 끝낸다. payout을 부를 게 없다.
    return NextResponse.json(approveBody, { status: approveRes.status });
  }

  const approvalToken: string | undefined = approveBody.approval_token;
  if (!approvalToken) {
    // approve가 200인데 토큰이 없으면 계약 위반이다 — 조용히 넘어가지 않는다.
    return NextResponse.json(
      { error: "approve response missing approval_token" },
      { status: 502 }
    );
  }

  const payoutRes = await fetch(`${apiBase}/payouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Approval-Token": approvalToken,
    },
    body: JSON.stringify({ settlement_run_id: runId }),
  });
  const payoutBody = await payoutRes.json();

  // approvalToken 변수는 여기서 스코프가 끝난다. payoutBody는 애초에 토큰을
  // 안 담고 있다(payouts/routes.py 응답 계약: settlement_run_id/status/note뿐)
  // — 그래도 실수로라도 approveBody를 그대로 반환하지 않도록 payoutBody만 쓴다.
  return NextResponse.json(payoutBody, { status: payoutRes.status });
}
