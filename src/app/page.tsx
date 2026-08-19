"use client";

import { useState } from "react";

// TODO(B): 대시보드(정산 기간 선택 · 실행 트리거 버튼), 자연어 입력창 → 필터 확인 카드,
// 요약 카드(정산 명세 + 위험 알림 렌더), OpenAPI 타입 생성 파이프라인 — plan.md Track B "web"
// 절 참조. 여기는 사람 승인 게이트(POST /settlements/runs/{run_id}/approve) 버튼 하나만
// A/C의 E2E 확인용으로 최소 동작시켜 둔 자리다.
export default function Home() {
  const [runId, setRunId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleApprove() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/settlements/runs/${runId}/approve`, {
        method: "POST",
      });
      const body = await res.json();
      setResult(res.ok ? JSON.stringify(body, null, 2) : `error: ${JSON.stringify(body)}`);
    } catch (e) {
      setResult(`error: ${String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Payflow</h1>
      <p>
        <label htmlFor="run-id">settlement_run_id</label>
        <br />
        <input
          id="run-id"
          value={runId}
          onChange={(e) => setRunId(e.target.value)}
        />
      </p>
      <button onClick={handleApprove} disabled={loading || !runId}>
        승인
      </button>
      {result && <pre>{result}</pre>}
    </main>
  );
}
