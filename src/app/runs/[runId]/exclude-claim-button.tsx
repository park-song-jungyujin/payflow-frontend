"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { t, type Locale } from "@/lib/i18n";

// approve-button.tsx와 같은 패턴 — claim 하나를 이 run에서 통째로 제외한다
// (item 반려와 달리 금액을 깎는 게 아니라 claim을 IN_RUN → CONFIRMED로
// 되돌린다, backend settlements/routes.py.exclude_claim_from_run_route).
// 확인 없이 누르면 재청구 의심 claim을 실수로 빼기 쉬워 confirm()으로 한 번 더 묻는다.
export default function ExcludeClaimButton({
  runId,
  claimId,
  locale,
}: {
  runId: string;
  claimId: string;
  locale: Locale;
}) {
  const s = t(locale);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!window.confirm(s.excludeClaimConfirm)) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/settlements/runs/${runId}/claims/${claimId}/exclude`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) }
      );
      const body = await res.json();
      if (!res.ok) {
        setError(body.detail ?? body.error ?? s.excludeClaimFailed(res.status));
        return;
      }
      router.refresh();
    } catch {
      setError(s.approveNetworkError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <span>
      <button type="button" className="btn-outline" onClick={handleClick} disabled={submitting}>
        {submitting ? s.excluding : s.excludeClaimButton}
      </button>
      {error && <p role="alert">{error}</p>}
    </span>
  );
}
