"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { t, type Locale } from "@/lib/i18n";

// approve-button.tsx와 같은 패턴 — /api/settlements/runs/[runId]/executor-analysis/retry
// (BFF 프록시) 하나만 부른다. 성공하면 backend가 이미 status를 PROCESSING으로
// 남겨뒀으니 router.refresh()만 하면 StatusPoller가 폴링을 이어받는다.
export default function RetryAnalysisButton({
  runId,
  disabled,
  locale,
}: {
  runId: string;
  disabled: boolean;
  locale: Locale;
}) {
  const s = t(locale);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/settlements/runs/${runId}/executor-analysis/retry`, {
        method: "POST",
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.detail ?? body.error ?? s.retryAnalysisFailed(res.status));
        return;
      }
      router.refresh();
    } catch {
      setError(s.retryAnalysisNetworkError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <span className="retry-analysis">
      <button onClick={handleClick} disabled={disabled || submitting}>
        {submitting ? s.retryingAnalysis : s.retryAnalysisButton}
      </button>
      {error && <span role="alert">{error}</span>}
    </span>
  );
}
