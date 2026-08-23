"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// 결정 1 — 이 버튼은 /api/settlements/runs/[runId]/approve 하나만 부른다.
// 승인+송금 체이닝은 그 route handler 안에서 끝난다. 이 컴포넌트는 토큰을
// 본 적도 없고 볼 일도 없다.
export default function ApproveButton({
  runId,
  disabled,
  disabledReason,
}: {
  runId: string;
  disabled: boolean;
  disabledReason?: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/settlements/runs/${runId}/approve`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        setError(body.detail ?? body.error ?? `승인 실패 (${res.status})`);
        return;
      }
      router.refresh();
    } catch {
      setError("승인 처리 중 네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <button onClick={handleClick} disabled={disabled || submitting} title={disabledReason}>
        {submitting ? "처리 중..." : "최종 승인 및 송금 실행"}
      </button>
      {disabled && disabledReason && <p className="hint">{disabledReason}</p>}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
