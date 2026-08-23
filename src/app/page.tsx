import NewRunForm from "./new-run-form";
import RunsTable from "./runs-table";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
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
  const [runs, locale] = await Promise.all([getSettlements(), getLocale()]);
  const s = t(locale);

  return (
    <main className="page">
      <div className="page-header">
        <h1>Payflow</h1>
        <span className="card-muted">{s.subtitle}</span>
      </div>

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
    </main>
  );
}
