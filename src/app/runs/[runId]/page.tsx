import Link from "next/link";
import { notFound } from "next/navigation";
import ApproveButton from "./approve-button";
import StatusPoller from "./status-poller";
import { ACCOUNT_CATEGORY_LABEL } from "@/lib/accountCategory";
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
  const run = await getRun(runId);
  if (run === null) notFound();

  // 결정 6 — 다중 수취인 run은 /payouts가 501을 낸다(get_sole_recipient_id).
  // 근본 해결은 backend 몫이라 여기서는 안내만 한다.
  const recipientIds = new Set(run.claims.map((c) => c.recipient_id));
  let disabledReason: string | undefined;
  if (recipientIds.size === 0) {
    disabledReason = "연결된 청구 항목이 없어 승인할 수 없습니다.";
  } else if (recipientIds.size > 1) {
    disabledReason = "이 배치는 수취인이 2명 이상이라 아직 자동 송금을 지원하지 않습니다.";
  }

  const canApprove = run.status === "DRAFT" || run.status === "FAILED";

  return (
    <main>
      <p>
        <Link href="/">← 목록으로</Link>
      </p>
      <h1>{run.settlement_run_id}</h1>
      <StatusPoller status={run.status} />

      <section>
        <p>
          상태:{" "}
          <span style={{ color: SETTLEMENT_STATUS_COLOR[run.status] }}>
            {SETTLEMENT_STATUS_LABEL[run.status]}
          </span>
        </p>
        <p>총액: {formatMinor(run.total_amount_minor, run.base_currency)}</p>
        {run.status === "DRAFT" && (
          <p>(승인 전 잠정치 — 승인 시점 환율로 다시 계산됩니다)</p>
        )}
      </section>

      <section>
        <h2>정산 명세</h2>
        {run.claims.length === 0 ? (
          <p>연결된 청구 항목이 없습니다.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>가맹점</th>
                <th>거래일</th>
                <th>금액</th>
                <th>계정과목</th>
              </tr>
            </thead>
            <tbody>
              {run.claims.map((c) => (
                <tr key={c.claim_id}>
                  <td>{c.merchant_name ?? "-"}</td>
                  <td>{c.transaction_date ?? "-"}</td>
                  <td>{formatMinor(c.amount_minor, c.currency)}</td>
                  <td>{ACCOUNT_CATEGORY_LABEL[c.account_category_code]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>이상 징후 (집행자 에이전트)</h2>
        {run.executor_analysis === null ? (
          <p>분석 대기 중</p>
        ) : run.executor_analysis.anomalies.length === 0 ? (
          <p>이상 없음{run.executor_analysis.summary_text ? ` — ${run.executor_analysis.summary_text}` : ""}</p>
        ) : (
          <>
            <ul>
              {run.executor_analysis.anomalies.map((anomaly, i) => (
                <li key={i}>{anomaly}</li>
              ))}
            </ul>
            {run.executor_analysis.summary_text && <p>{run.executor_analysis.summary_text}</p>}
          </>
        )}
      </section>

      <section>
        <a href={`/api/settlements/runs/${run.settlement_run_id}/export`}>
          세무사 전달용 XLSX 다운로드
        </a>
      </section>

      {canApprove && (
        <section>
          <h2>승인</h2>
          <ApproveButton
            runId={run.settlement_run_id}
            disabled={disabledReason !== undefined}
            disabledReason={disabledReason}
          />
        </section>
      )}
    </main>
  );
}
