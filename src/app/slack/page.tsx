import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Install Payflow for Slack · Autonomous AI Expense Agent",
  description: "Add Payflow to your Slack workspace to automate receipt collection, policy matching, anomaly detection, and PayPal batch payouts.",
};

export default async function SlackInstallLandingPage() {
  const locale = await getLocale();
  const isKo = locale === "ko";

  return (
    <main className="page" style={{ maxWidth: 840 }}>
      <Link href="/" className="back-link">
        {isKo ? "← 관리자 대시보드" : "← Admin Dashboard"}
      </Link>

      {/* Hero Section */}
      <section style={{ textAlign: "center", padding: "32px 0 24px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "color-mix(in srgb, var(--accent) 12%, transparent)",
            color: "var(--accent)",
            padding: "6px 14px",
            borderRadius: "999px",
            fontSize: "0.88rem",
            fontWeight: 600,
            marginBottom: "16px",
          }}
        >
          <span>⚡</span>
          <span>{isKo ? "Slack 공금 정산 AI 에이전트" : "Autonomous AI Expense Agent for Slack"}</span>
        </div>

        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.25 }}>
          {isKo
            ? "영수증 한 장부터 송금 완료까지,\nSlack에서 끝내는 공금 정산"
            : "From Receipt Drop to Batch Payout,\nFully Automated in Slack"}
        </h1>

        <p
          style={{
            fontSize: "1.1rem",
            color: "var(--text-muted)",
            maxWidth: 620,
            margin: "16px auto 28px",
            lineHeight: 1.6,
          }}
        >
          {isKo
            ? "팀원은 Slack에 영수증만 올리고, 관리자는 최종 승인 버튼 하나만 누르세요. Gemini VLM 기반 파싱, 결제 원장 대조, 이상 탐지, PayPal 일괄 송금을 하나로 연결합니다."
            : "Drop receipts directly into Slack. PayFlow extracts details, matches ledgers, flags anomalies, and executes one-click PayPal batch payouts."}
        </p>

        {/* Add to Slack CTA */}
        <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
          <a href="/api/auth/slack/install">
            <button
              type="button"
              style={{
                fontSize: "1.05rem",
                padding: "12px 28px",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.528 2.528 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.528 2.528 0 0 1 2.52-2.52h6.313A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"
                  fill="currentColor"
                />
              </svg>
              <span>{isKo ? "Slack에 앱 추가하기" : "Add to Slack"}</span>
            </button>
          </a>
          <a href="/support" className="btn-outline" style={{ display: "inline-flex", alignItems: "center" }}>
            {isKo ? "도움말 센터" : "Help & Docs"}
          </a>
        </div>
      </section>

      {/* How it works 3 steps */}
      <section style={{ marginTop: "40px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px", fontSize: "1.3rem" }}>
          {isKo ? "3단계로 끝나는 자율 정산 플로우" : "How Payflow Works"}
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          <div className="card">
            <span className="badge" style={{ marginBottom: "8px" }}>
              STEP 1
            </span>
            <h3 style={{ fontSize: "1.05rem", marginTop: "4px" }}>
              {isKo ? "1. 영수증 업로드" : "1. Drop Receipts in Slack"}
            </h3>
            <p style={{ marginTop: "8px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              {isKo
                ? "Slack DM이나 채널에 영수증 사진을 올리면 3초 내 즉시 인식되어 청구 항목이 자동 생성됩니다."
                : "Upload receipt photos or invoices to Slack. Payflow parses vendor, amount, date, and category in seconds."}
            </p>
          </div>

          <div className="card">
            <span className="badge" style={{ marginBottom: "8px" }}>
              STEP 2
            </span>
            <h3 style={{ fontSize: "1.05rem", marginTop: "4px" }}>
              {isKo ? "2. AI 대조 & 이상 탐지" : "2. AI Matching & Audit"}
            </h3>
            <p style={{ marginTop: "8px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              {isKo
                ? "결제 원장과 청구를 엄격히 대조하고, 중복 청구나 누락 영수증은 AI가 스스로 찾아내 리마인드합니다."
                : "Reconciles against payment ledgers. Autonomous agents flag duplicate claims and request missing receipts."}
            </p>
          </div>

          <div className="card">
            <span className="badge" style={{ marginBottom: "8px" }}>
              STEP 3
            </span>
            <h3 style={{ fontSize: "1.05rem", marginTop: "4px" }}>
              {isKo ? "3. 최종 승인 & 일괄 송금" : "3. 1-Click Batch Payout"}
            </h3>
            <p style={{ marginTop: "8px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              {isKo
                ? "관리자가 승인 버튼을 누르면 PayPal로 팀원들에게 일괄 송금되며 세무용 XLSX 리포트가 완성됩니다."
                : "Admin reviews the summary and clicks Approve. PayPal batch payouts execute instantly with tax-ready reports."}
            </p>
          </div>
        </div>
      </section>

      {/* Security Banner */}
      <section style={{ marginTop: "40px" }}>
        <div className="card" style={{ background: "color-mix(in srgb, var(--surface) 90%, var(--accent) 10%)" }}>
          <h2>{isKo ? "🛡️ 금융 안전 및 보안 설계" : "🛡️ Enterprise Financial Safety by Design"}</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginTop: "12px",
            }}
          >
            <div>
              <strong>{isKo ? "에이전트 권한 격리" : "Agent IAM Isolation"}</strong>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "4px" }}>
                {isKo
                  ? "AI는 정산안 문서만 작성할 뿐, 송금 실행 권한이 없습니다."
                  : "AI agents only prepare draft proposals and cannot directly trigger payouts."}
              </p>
            </div>
            <div>
              <strong>{isKo ? "승인 토큰 게이트" : "Cryptographic Gate"}</strong>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "4px" }}>
                {isKo
                  ? "관리자의 서명 토큰 없이 송금 API는 절대 실행되지 않습니다."
                  : "Payouts require a 10-minute expiring token signed by human administrators."}
              </p>
            </div>
            <div>
              <strong>{isKo ? "PII 마스킹 & 격리" : "PII Redaction"}</strong>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "4px" }}>
                {isKo
                  ? "영수증 내 개인식별정보는 저장 전 자동 마스킹 처리됩니다."
                  : "Sensitive personal data is masked before storage; receipts are isolated."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Links */}
      <footer
        style={{
          marginTop: "48px",
          paddingTop: "24px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          color: "var(--text-muted)",
          fontSize: "0.88rem",
        }}
      >
        <span>© 2026 Payflow. All rights reserved.</span>
        <div style={{ display: "flex", gap: "16px" }}>
          <a href="/privacy">{isKo ? "개인정보처리방침" : "Privacy Policy"}</a>
          <a href="/support">{isKo ? "고객지원" : "Support"}</a>
          <Link href="/">{isKo ? "대시보드" : "Dashboard"}</Link>
        </div>
      </footer>
    </main>
  );
}
