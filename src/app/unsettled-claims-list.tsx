"use client";

import { useState } from "react";
import { ACCOUNT_CATEGORY_LABEL } from "@/lib/accountCategory";
import { t, type Locale } from "@/lib/i18n";
import { formatMinor, formatUsd } from "@/lib/money";
import type { ClaimSummary } from "@/types/settlement";

const VISIBLE_LIMIT = 10;

// runs-table.tsx와 같은 패턴(로컬 페이지네이션) — 정산 실행에 아직 안 들어간
// 확정 청구를 그대로 보여준다. 조회 전용이다: 여기서 항목을 골라 정산 실행을
// 만드는 선택 UI는 없다 — 그건 여전히 오른쪽 "새 정산 실행" 폼(기간·계정과목
// 필터)의 독립적인 몫이다.
export default function UnsettledClaimsList({
  claims,
  locale,
}: {
  claims: ClaimSummary[];
  locale: Locale;
}) {
  const s = t(locale);
  const [showAll, setShowAll] = useState(false);

  if (claims.length === 0) {
    return <p className="card card-muted">{s.noUnsettledClaims}</p>;
  }

  const visibleClaims = showAll ? claims : claims.slice(0, VISIBLE_LIMIT);

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>{s.colRequester}</th>
            <th>{s.colMerchant}</th>
            <th>{s.colTxDate}</th>
            <th className="amount">{s.colAmount}</th>
            <th>{s.colCategory}</th>
          </tr>
        </thead>
        <tbody>
          {visibleClaims.map((c) => (
            <tr key={c.claim_id}>
              <td>{c.recipient_name}</td>
              <td>{(locale === "en" && c.merchant_name_en) || c.merchant_name || "-"}</td>
              <td>{c.transaction_date ?? "-"}</td>
              <td className="amount">
                {formatUsd(c.amount_minor, c.currency)}
                {c.currency === "KRW" && (
                  <span className="hint"> ({formatMinor(c.amount_minor, c.currency)})</span>
                )}
              </td>
              <td>{ACCOUNT_CATEGORY_LABEL[locale][c.account_category_code]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!showAll && claims.length > VISIBLE_LIMIT && (
        <button onClick={() => setShowAll(true)}>{s.showAll(claims.length)}</button>
      )}
    </>
  );
}
