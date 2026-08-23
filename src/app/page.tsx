import Link from "next/link";
import NewRunForm from "./new-run-form";
import { formatMinor } from "@/lib/money";
import { SETTLEMENT_STATUS_COLOR, SETTLEMENT_STATUS_LABEL } from "@/lib/settlementStatus";
import type { SettlementRunListItem } from "@/types/settlement";

// Server Component — 결정 3: 목록 조회는 API_BASE_URL을 직접 부른다(BFF route
// handler를 안 거친다). 부수효과 없는 GET이라 서버 컴포넌트 렌더 중에 바로
// fetch하는 게 왕복을 하나 줄인다. /api/settlements(기존 BFF route)는 안
// 건드리고 그대로 둔다 — 클라이언트 쪽에서 필요해질 때를 위해 남겨둔다.
async function getSettlements(): Promise<SettlementRunListItem[]> {
  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) return [];

  const res = await fetch(`${apiBase}/settlements`, { cache: "no-store" });
  if (!res.ok) return [];
  const body = await res.json();
  return body.settlement_runs ?? [];
}

export default async function Home() {
  const runs = await getSettlements();

  return (
    <main className="page">
      <div className="page-header">
        <h1>Payflow</h1>
        <span className="card-muted">정산 관리자 대시보드</span>
      </div>

      <section>
        <h2>정산 실행 목록</h2>
        {runs.length === 0 ? (
          <p className="card card-muted">정산 실행이 없습니다.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>상태</th>
                <th className="amount">총액</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.settlement_run_id}>
                  <td>{run.settlement_run_id}</td>
                  <td>
                    <span className="badge" style={{ color: SETTLEMENT_STATUS_COLOR[run.status] }}>
                      {SETTLEMENT_STATUS_LABEL[run.status]}
                    </span>
                  </td>
                  <td className="amount">{formatMinor(run.total_amount_minor, run.base_currency)}</td>
                  <td>
                    <Link href={`/runs/${run.settlement_run_id}`}>상세 보기</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <NewRunForm />
      </section>
    </main>
  );
}
