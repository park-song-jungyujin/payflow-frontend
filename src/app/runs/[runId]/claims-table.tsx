"use client";

import { Fragment, useState } from "react";
import { ACCOUNT_CATEGORY_LABEL } from "@/lib/accountCategory";
import { t, type Locale } from "@/lib/i18n";
import { formatMinor, formatUsd } from "@/lib/money";
import { itemDisplayName, merchantDisplay } from "@/lib/receiptText";
import type { ClaimSummary, ReceiptItem } from "@/types/settlement";

// 청구 반려 — DRAFT 상태에서만 물품 체크를 해제할 수 있다(승인 이후엔
// approval_amount_hash가 금액을 이미 고정한다). 서버가 돌려주는 amount_minor를
// 그대로 반영한다 — 금액 계산은 여기서 하지 않는다(CLAUDE.md "하지 말 것").
export default function ClaimsTable({
  runId,
  claims: initialClaims,
  fxRates,
  canEditItems,
  locale,
}: {
  runId: string;
  claims: ClaimSummary[];
  fxRates: Record<string, string>;
  canEditItems: boolean;
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
          </tr>
        </thead>
        <tbody>
          {claims.map((c) => {
            // 가맹점명은 en 로케일에서 번역명을 먼저 보여주고, 그 아래 회색으로
            // 영수증에 찍힌 원문을 괄호로 덧붙인다 — 영수증·카드 명세와 대조할
            // 때 실제 상호가 보여야 한다(lib/receiptText.ts merchantDisplay).
            const merchant = merchantDisplay(c.merchant_name, c.merchant_name_en, locale);
            return (
              <Fragment key={c.claim_id}>
                <tr className={c.items.length > 0 ? "claim-row has-items" : "claim-row"}>
                  <td>{c.recipient_name}</td>
                  <td>
                    {merchant.primary ?? "-"}
                    {merchant.original && (
                      <span className="merchant-original">({merchant.original})</span>
                    )}
                  </td>
                  <td>{c.transaction_date ?? "-"}</td>
                  <td className="amount">
                    {formatUsd(c.amount_minor, c.currency, fxRates)}
                    {c.currency === "KRW" && (
                      <span className="hint"> ({formatMinor(c.amount_minor, c.currency)})</span>
                    )}
                  </td>
                  <td>{ACCOUNT_CATEGORY_LABEL[locale][c.account_category_code]}</td>
                </tr>
                {c.items.length > 0 && (
                  <tr className="item-row">
                    <td colSpan={5}>
                      <ul className="item-list">
                        {c.items.map((item, i) => {
                          const key = `${c.claim_id}:${i}`;
                          // en 로케일에선 Gemma가 번역한 name_en을 쓴다 — 체크박스
                          // 라벨(스크린리더)도 같은 이름이어야 화면과 어긋나지 않는다.
                          const displayName = itemDisplayName(item, locale);
                          return (
                            <li key={i} className={canEditItems ? "has-checkbox" : undefined}>
                              {canEditItems && (
                                <input
                                  type="checkbox"
                                  checked={!item.excluded}
                                  disabled={pending === key}
                                  aria-label={s.itemIncludeLabel(displayName)}
                                  onChange={() => toggleItem(c.claim_id, i, item)}
                                />
                              )}
                              <span className={`item-name${item.excluded ? " item-excluded" : ""}`}>
                                {displayName}
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
            );
          })}
        </tbody>
      </table>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
