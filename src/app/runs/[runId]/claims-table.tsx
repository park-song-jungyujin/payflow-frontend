"use client";

import { Fragment, useState } from "react";
import { ACCOUNT_CATEGORY_LABEL } from "@/lib/accountCategory";
import { t, type Locale } from "@/lib/i18n";
import { formatMinor, formatUsd } from "@/lib/money";
import type { ClaimSummary, ReceiptItem } from "@/types/settlement";
import ExcludeClaimButton from "./exclude-claim-button";

// 청구 반려 — DRAFT 상태에서만 물품 체크를 해제할 수 있다(승인 이후엔
// approval_amount_hash가 금액을 이미 고정한다). 서버가 돌려주는 amount_minor를
// 그대로 반영한다 — 금액 계산은 여기서 하지 않는다(CLAUDE.md "하지 말 것").
export default function ClaimsTable({
  runId,
  claims: initialClaims,
  fxRates,
  canEditItems,
  canExcludeClaims,
  locale,
}: {
  runId: string;
  claims: ClaimSummary[];
  fxRates: Record<string, string>;
  canEditItems: boolean;
  canExcludeClaims: boolean;
  locale: Locale;
}) {
  const s = t(locale);
  const [claims, setClaims] = useState(initialClaims);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggleItem(claimId: string, itemIndex: number, item: ReceiptItem) {
    const excluded = !item.excluded;
    const key = `${claimId}:${itemIndex}`;
    setPending(key);
    setError(null);
    try {
      const res = await fetch(
        `/api/settlements/runs/${runId}/claims/${claimId}/items/${itemIndex}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ excluded }),
        }
      );
      const body = await res.json();
      if (!res.ok) {
        setError(body.detail ?? body.error ?? s.itemToggleFailed(res.status));
        return;
      }
      setClaims((prev) =>
        prev.map((c) =>
          c.claim_id === claimId ? { ...c, amount_minor: body.amount_minor, items: body.items } : c
        )
      );
    } catch {
      setError(s.itemToggleNetworkError);
    } finally {
      setPending(null);
    }
  }

  if (claims.length === 0) {
    return <p className="card card-muted">{s.noClaims}</p>;
  }

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
            {canExcludeClaims && <th></th>}
          </tr>
        </thead>
        <tbody>
          {claims.map((c) => (
            <Fragment key={c.claim_id}>
              <tr className={c.items.length > 0 ? "claim-row has-items" : "claim-row"}>
                <td>{c.recipient_name}</td>
                <td>{c.merchant_name ?? "-"}</td>
                <td>{c.transaction_date ?? "-"}</td>
                <td className="amount">
                  {formatUsd(c.amount_minor, c.currency, fxRates)}
                  {c.currency === "KRW" && (
                    <span className="hint"> ({formatMinor(c.amount_minor, c.currency)})</span>
                  )}
                </td>
                <td>{ACCOUNT_CATEGORY_LABEL[locale][c.account_category_code]}</td>
                {canExcludeClaims && (
                  <td>
                    <ExcludeClaimButton runId={runId} claimId={c.claim_id} locale={locale} />
                  </td>
                )}
              </tr>
              {c.items.length > 0 && (
                <tr className="item-row">
                  <td colSpan={canExcludeClaims ? 6 : 5}>
                    <ul className="item-list">
                      {c.items.map((item, i) => {
                        const key = `${c.claim_id}:${i}`;
                        return (
                          <li key={i} className={canEditItems ? "has-checkbox" : undefined}>
                            {canEditItems && (
                              <input
                                type="checkbox"
                                checked={!item.excluded}
                                disabled={pending === key}
                                aria-label={s.itemIncludeLabel(item.name)}
                                onChange={() => toggleItem(c.claim_id, i, item)}
                              />
                            )}
                            <span className={`item-name${item.excluded ? " item-excluded" : ""}`}>
                              {item.name}
                            </span>
                            {item.amount_minor !== null && (
                              <span className={`item-amount${item.excluded ? " item-excluded" : ""}`}>
                                {formatMinor(item.amount_minor, c.currency)}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
