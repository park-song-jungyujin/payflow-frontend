import NewRunForm from "./new-run-form";
import RunsTable from "./runs-table";
import UnsettledClaimsList from "./unsettled-claims-list";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { authHeaders } from "@/lib/session";
import type { ClaimSummary, SettlementRunListItem } from "@/types/settlement";

// Server Component — 결정 3: 목록 조회는 API_BASE_URL을 직접 부른다(BFF route
// handler를 안 거친다). 부수효과 없는 GET이라 서버 컴포넌트 렌더 중에 바로
// fetch하는 게 왕복을 하나 줄인다. /api/settlements(기존 BFF route)는 안
// 건드리고 그대로 둔다 — 클라이언트 쪽에서 필요해질 때를 위해 남겨둔다.
async function getSettlements(): Promise<SettlementRunListItem[]> {
  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) return [];

  const res = await fetch(`${apiBase}/settlements`, {
    cache: "no-store",
    headers: await authHeaders(),
  });
  if (!res.ok) return [];
  const body = await res.json();
  const runs: SettlementRunListItem[] = body.settlement_runs ?? [];
  // 백엔드가 정렬 없이 반환하므로 여기서 최신순으로 정렬한다.
  return runs.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

// 왼쪽 파트 — 아직 정산 실행에 안 들어간 확정 청구. GET /settlements/runs와
// 같은 이유로 API_BASE_URL을 직접 부른다. 이 엔드포인트도 세션 인증을 요구한다
// (org 스코핑) — authHeaders() 없이 부르면 401로 빈 배열만 받는다.
async function getUnsettledClaims(): Promise<ClaimSummary[]> {
  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) return [];

  const res = await fetch(`${apiBase}/settlements/unsettled-claims`, {
    cache: "no-store",
    headers: await authHeaders(),
  });
  if (!res.ok) return [];
  const body = await res.json();
  return body.claims ?? [];
}

// 로그인한 executor/org 표시용. 실패해도(세션 만료 등) 대시보드 자체는 뜨게
// null만 반환한다 — proxy.ts가 이미 세션 없는 요청은 /login으로 걸러낸다.
async function getMe(): Promise<{ org_name: string | null; email: string } | null> {
  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) return null;

  const res = await fetch(`${apiBase}/auth/me`, {
    cache: "no-store",
    headers: await authHeaders(),
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function Home() {
  const [runs, unsettledClaims, me, locale] = await Promise.all([
    getSettlements(),
    getUnsettledClaims(),
    getMe(),
    getLocale(),
  ]);
  const s = t(locale);

  return (
    <main className="page page-wide">
      {me && (
        <p style={{ textAlign: "right" }}>
          <span className="card-muted">{s.loggedInAs(me.org_name ?? "—", me.email)}</span>{" "}
          · <a href="/api/auth/logout">{s.logout}</a>
        </p>
      )}
      <div className="page-header">
        <h1>Payflow</h1>
        <span className="card-muted">{s.subtitle}</span>
      </div>

      <div className="dashboard-layout">
        <section>
          <h2>{s.unsettledClaimsTitle}</h2>
          <UnsettledClaimsList claims={unsettledClaims} locale={locale} />
        </section>

        <aside className="dashboard-sidebar">
          <section>
            <h2>{s.runListTitle}</h2>
            {runs.length === 0 ? (
              <p className="card card-muted">{s.noRuns}</p>
            ) : (
              <RunsTable runs={runs} locale={locale} />
            )}
          </section>

          <section>
            <NewRunForm locale={locale} />
          </section>

          <section>
            <h2>{s.slackConnectTitle}</h2>
            <a href="/api/auth/slack/install">
              <button type="button">{s.slackConnectButton}</button>
            </a>
          </section>
        </aside>
      </div>
    </main>
  );
}
