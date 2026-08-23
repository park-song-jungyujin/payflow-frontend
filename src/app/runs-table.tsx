"use client";

import Link from "next/link";
import { useState } from "react";
import { t, type Locale } from "@/lib/i18n";
import { formatUsd } from "@/lib/money";
import { SETTLEMENT_STATUS_COLOR, SETTLEMENT_STATUS_LABEL } from "@/lib/settlementStatus";
import type { SettlementRunListItem } from "@/types/settlement";

const VISIBLE_LIMIT = 10;

export default function RunsTable({
  runs,
  locale,
}: {
  runs: SettlementRunListItem[];
  locale: Locale;
}) {
  const s = t(locale);
  const [showAll, setShowAll] = useState(false);
  const visibleRuns = showAll ? runs : runs.slice(0, VISIBLE_LIMIT);

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>{s.colId}</th>
            <th>{s.colStatus}</th>
            <th className="amount">{s.colAmount}</th>
            <th>{s.colRequester}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {visibleRuns.map((run) => (
            <tr key={run.settlement_run_id}>
              <td>{run.settlement_run_id}</td>
              <td>
                <span className="badge" style={{ color: SETTLEMENT_STATUS_COLOR[run.status] }}>
                  {SETTLEMENT_STATUS_LABEL[locale][run.status]}
                </span>
              </td>
              <td className="amount">
                {formatUsd(run.total_amount_minor, run.base_currency, run.fx_rates)}
              </td>
              <td>{run.recipient_names.join(", ") || "-"}</td>
              <td>
                <Link href={`/runs/${run.settlement_run_id}`}>{s.detailLink}</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!showAll && runs.length > VISIBLE_LIMIT && (
        <button onClick={() => setShowAll(true)}>{s.showAll(runs.length)}</button>
      )}
    </>
  );
}
