import Link from "next/link";
import { notFound } from "next/navigation";
import ApproveButton from "./approve-button";
import StatusPoller from "./status-poller";
import { ACCOUNT_CATEGORY_LABEL } from "@/lib/accountCategory";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { formatMinor } from "@/lib/money";
import { SETTLEMENT_STATUS_COLOR, SETTLEMENT_STATUS_LABEL } from "@/lib/settlementStatus";
import type { SettlementRun } from "@/types/settlement";

// Server Component — 결정 3: 상세 조회는 API_BASE_URL을 직접 부른다. 클라이언트
// 쪽 재조회(StatusPoller)만 /api/settlements/runs/[runId](BFF)를 쓴다 — 클라이언트
// 컴포넌트는 서버 전용 env인 API_BASE_URL에 접근할 수 없다.
async function getRun(runId: string): Promise<SettlementRun | null> {
  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) return null;

  const res = await fetch(`${apiBase}/settlements/runs/${runId}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`failed to load run: ${res.status}`);
  return res.json();
}

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  const [run, locale] = await Promise.all([getRun(runId), getLocale()]);
  if (run === null) notFound();
  const s = t(locale);

  // 결정 6 — 다중 수취인 run은 /payouts가 501을 낸다(get_sole_recipient_id).
  // 근본 해결은 backend 몫이라 여기서는 안내만 한다.
  const recipientIds = new Set(run.claims.map((c) => c.recipient_id));
  let disabledReason: string | undefined;
  if (recipientIds.size === 0) {
    disabledReason = s.noRecipientsReason;
  } else if (recipientIds.size > 1) {
    disabledReason = s.multiRecipientReason;
  }

  const canApprove = run.status === "DRAFT" || run.status === "FAILED";

  const hasAnomalies =
    run.executor_analysis !== null && run.executor_analysis.anomalies.length > 0;

  return (
    <main className="page">
      <Link href="/" className="back-link">
        {s.backToList}
      </Link>
      <div className="page-header">
        <h1>{run.settlement_run_id}</h1>
      </div>
      <StatusPoller status={run.status} />

      <section className="card">
        <div className="meta-row">
          <span>
            {s.statusLabel}:{" "}
            <span className="badge" style={{ color: SETTLEMENT_STATUS_COLOR[run.status] }}>
              {SETTLEMENT_STATUS_LABEL[locale][run.status]}
            </span>
          </span>
          <span>
            {s.totalLabel}:{" "}
            <span className="value">{formatMinor(run.total_amount_minor, run.base_currency)}</span>
          </span>
        </div>
        {run.status === "DRAFT" && <p className="hint">{s.draftHint}</p>}
      </section>

      <section>
        <h2>{s.claimsTitle}</h2>
        {run.claims.length === 0 ? (
          <p className="card card-muted">{s.noClaims}</p>
        ) : (
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
              {run.claims.map((c) => (
                <tr key={c.claim_id}>
                  <td>{c.recipient_name}</td>
                  <td>{c.merchant_name ?? "-"}</td>
                  <td>{c.transaction_date ?? "-"}</td>
                  <td className="amount">{formatMinor(c.amount_minor, c.currency)}</td>
                  <td>{ACCOUNT_CATEGORY_LABEL[locale][c.account_category_code]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>{s.anomalyTitle}</h2>
        {run.executor_analysis === null ? (
          <p className="card card-muted">{s.analysisPending}</p>
        ) : (
          <div className={`card${hasAnomalies ? " anomaly-card" : ""}`}>
            {run.executor_analysis.anomalies.length === 0 ? (
              <p>
                {s.noAnomalies}
                {run.executor_analysis.summary_text ? ` — ${run.executor_analysis.summary_text}` : ""}
              </p>
            ) : (
              <>
                <ul>
                  {run.executor_analysis.anomalies.map((anomaly, i) => (
                    <li key={i}>{anomaly}</li>
                  ))}
                </ul>
                {run.executor_analysis.summary_text && (
                  <p className="hint">{run.executor_analysis.summary_text}</p>
                )}
              </>
            )}
          </div>
        )}
      </section>

      <section>
        <a className="btn-outline" href={`/api/settlements/runs/${run.settlement_run_id}/export`}>
          {s.exportLink}
        </a>
      </section>

      {canApprove && (
        <section>
          <h2>{s.approveTitle}</h2>
          <ApproveButton
            runId={run.settlement_run_id}
            disabled={disabledReason !== undefined}
            disabledReason={disabledReason}
            locale={locale}
          />
        </section>
      )}
    </main>
  );
}
