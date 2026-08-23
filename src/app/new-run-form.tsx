"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ACCOUNT_CATEGORIES,
  ACCOUNT_CATEGORY_LABEL,
  type AccountCategoryCode,
} from "@/lib/accountCategory";
import { t, type Locale } from "@/lib/i18n";
import type { SettlementFilter, SettlementRun } from "@/types/settlement";

// 새 정산 실행 폼. 결정 2 — 자연어 입력은 없다, 폼 필드만. 결정 4 — recipient_ids는
// 뺐다(GET /recipients 없음). 클라이언트 컴포넌트인 이유: onSubmit·state가
// 필요하다 — 부수효과 있는 액션은 BFF route handler를 거친다는 원칙 그대로,
// 여기서 직접 API_BASE_URL을 부르지 않고 /api/settlements/runs를 부른다.
// locale은 부모 서버 컴포넌트가 쿠키에서 읽어 prop으로 내려준다 — 클라이언트
// 컴포넌트는 next/headers를 못 쓴다.
export default function NewRunForm({ locale }: { locale: Locale }) {
  const s = t(locale);
  const router = useRouter();
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [categories, setCategories] = useState<Set<AccountCategoryCode>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleCategory(code: AccountCategoryCode) {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const filter: SettlementFilter = {
      period_start: periodStart || null,
      period_end: periodEnd || null,
      account_categories: categories.size > 0 ? Array.from(categories) : null,
    };

    try {
      const res = await fetch("/api/settlements/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filter),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.detail ?? body.error ?? s.createFailed(res.status));
        return;
      }
      const run = body as SettlementRun;
      router.push(`/runs/${run.settlement_run_id}`);
    } catch {
      setError(s.createNetworkError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{s.newRunTitle}</h2>
      <div className="field">
        <label htmlFor="period-start">{s.periodStart}</label>
        <input
          id="period-start"
          type="date"
          value={periodStart}
          onChange={(e) => setPeriodStart(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="period-end">{s.periodEnd}</label>
        <input
          id="period-end"
          type="date"
          value={periodEnd}
          onChange={(e) => setPeriodEnd(e.target.value)}
        />
      </div>
      <fieldset>
        <legend>{s.categoriesLegend}</legend>
        <div className="checkbox-grid">
          {ACCOUNT_CATEGORIES.map((code) => (
            <label key={code}>
              <input
                type="checkbox"
                checked={categories.has(code)}
                onChange={() => toggleCategory(code)}
              />
              {ACCOUNT_CATEGORY_LABEL[locale][code]}
            </label>
          ))}
        </div>
      </fieldset>
      <button type="submit" disabled={submitting}>
        {submitting ? s.creating : s.createRun}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
