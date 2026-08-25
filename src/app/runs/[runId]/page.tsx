import Link from "next/link";
import { notFound } from "next/navigation";
import ApproveButton from "./approve-button";
import ClaimsTable from "./claims-table";
import RetryAnalysisButton from "./retry-analysis-button";
import StatusPoller from "./status-poller";
import {
  EXECUTOR_ANALYSIS_STATUS_COLOR,
  EXECUTOR_ANALYSIS_STATUS_LABEL,
} from "@/lib/executorAnalysisStatus";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { formatUsd } from "@/lib/money";
import { authHeaders } from "@/lib/session";
import { SETTLEMENT_STATUS_COLOR, SETTLEMENT_STATUS_LABEL } from "@/lib/settlementStatus";
import type { SettlementRun } from "@/types/settlement";

// Server Component — 결정 3: 상세 조회는 API_BASE_URL을 직접 부른다. 클라이언트
// 쪽 재조회(StatusPoller)만 /api/settlements/runs/[runId](BFF)를 쓴다 — 클라이언트
// 컴포넌트는 서버 전용 env인 API_BASE_URL에 접근할 수 없다.
async function getRun(runId: string): Promise<SettlementRun | null> {
  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) return null;

  const res = await fetch(`${apiBase}/settlements/runs/${runId}`, {
    cache: "no-store",
    headers: await authHeaders(),
  });
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

  // 결정 6 — 다중 수취인 run 501 게이트(get_sole_recipient_id)는 backend에서
  // 제거됐다(feat/multi-recipient-payout, PR #25) — 이제 recipient당 item으로
  // 단일 배치 전송을 지원하므로 여기서 더 이상 막지 않는다.
  const recipientIds = new Set(run.claims.map((c) => c.recipient_id));
  const disabledReason = recipientIds.size === 0 ? s.noRecipientsReason : undefined;

  const canApprove = run.status === "DRAFT" || run.status === "FAILED";

  const hasAnomalies =
    run.executor_analysis !== null && run.executor_analysis.anomalies.length > 0;

  // agent가 anomalies_en/summary_text_en을 채우기 전에 쓰인 draft는 이 필드가
  // 비어 있다 — 그럴 땐 en 선택 시에도 한국어로 대체 표시한다(빈 화면보다 낫다).
  const displayedAnomalies =
    locale === "en" && run.executor_analysis && run.executor_analysis.anomalies_en.length > 0
      ? run.executor_analysis.anomalies_en
      : (run.executor_analysis?.anomalies ?? []);
  const displayedSummary =
    locale === "en" && run.executor_analysis?.summary_text_en
      ? run.executor_analysis.summary_text_en
      : (run.executor_analysis?.summary_text ?? null);

  return (
    <main className="page">
      <Link href="/" className="back-link">
        {s.backToList}
      </Link>
      <div className="page-header">
        <h1>{run.settlement_run_id}</h1>
      </div>
      <StatusPoller
        status={run.status}
        executorAnalysisStatus={run.executor_analysis?.status ?? null}
      />

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
            <span className="value">
              {formatUsd(run.total_amount_minor, run.base_currency, run.fx_rates)}
            </span>
          </span>
        </div>
        {run.status === "DRAFT" && <p className="hint">{s.draftHint}</p>}
      </section>

      <section>
        <h2>{s.claimsTitle}</h2>
        <ClaimsTable
          runId={run.settlement_run_id}
          claims={run.claims}
          fxRates={run.fx_rates}
          canEditItems={run.status === "DRAFT"}
          locale={locale}
        />
      </section>

      <section>
        <div className="meta-row">
          <h2>{s.anomalyTitle}</h2>
          {run.executor_analysis !== null && (
            <span
              className="badge"
              style={{ color: EXECUTOR_ANALYSIS_STATUS_COLOR[run.executor_analysis.status] }}
            >
              {EXECUTOR_ANALYSIS_STATUS_LABEL[locale][run.executor_analysis.status]}
            </span>
          )}
          {/* 승인 이후엔 금액이 고정돼 재분석이 의미가 없다(backend가 DRAFT가 아니면
              409로 거부한다) — run.status로 먼저 막고, PROCESSING 중 중복 클릭은
              버튼 disabled로 막는다. */}
          {run.status === "DRAFT" && (
            <RetryAnalysisButton
              runId={run.settlement_run_id}
              disabled={run.executor_analysis?.status === "PROCESSING"}
              locale={locale}
            />
          )}
        </div>
        {run.executor_analysis === null || run.executor_analysis.status === "PROCESSING" ? (
          <p className="card card-muted">{s.analysisPending}</p>
        ) : run.executor_analysis.status === "FAILED" ? (
          <div className="card card-muted">
            <p>{s.analysisFailed}</p>
            {/* 백엔드가 실패 사유를 실어 보낸다 — 없으면(구 draft) 문구만 남는다. */}
            {run.executor_analysis.reason && (
              <p className="hint failure-reason">{run.executor_analysis.reason}</p>
            )}
          </div>
        ) : (
          <div className={`card${hasAnomalies ? " anomaly-card" : ""}`}>
            {displayedAnomalies.length === 0 ? (
              <p>
                {s.noAnomalies}
                {displayedSummary ? ` — ${displayedSummary}` : ""}
              </p>
            ) : (
              <>
                <ul>
                  {displayedAnomalies.map((anomaly, i) => (
                    <li key={i}>{anomaly}</li>
                  ))}
                </ul>
                {displayedSummary && <p className="hint">{displayedSummary}</p>}
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
