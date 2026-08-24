import type { Metadata } from "next";
import { getLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Support & Help Center · Payflow",
  description: "Support portal, documentation, and contact information for Payflow Slack app.",
};

export default async function SupportPage() {
  const locale = await getLocale();
  const isKo = locale === "ko";

  return (
    <main className="page" style={{ maxWidth: 760 }}>
      <a href="/" className="back-link">
        {isKo ? "← 홈으로 돌아가기" : "← Back to Home"}
      </a>

      <div className="page-header">
        <div>
          <h1>{isKo ? "고객지원 및 도움말 센터" : "Help & Support Center"}</h1>
          <p className="hint">
            {isKo
              ? "Payflow 사용 중 도움이 필요하신가요? 자주 묻는 질문과 지원 창구를 확인하세요."
              : "Need help using Payflow? Check our FAQs or reach out to our team."}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Quick Contact Card */}
        <div className="card" style={{ borderLeft: "4px solid var(--accent)" }}>
          <h2>{isKo ? "📬 지원팀 문의하기" : "📬 Contact Support"}</h2>
          <p style={{ marginTop: "6px" }}>
            {isKo
              ? "기술 지원, 계정 연동 오류, 기능 제안 등 궁금한 점이 있으시면 언제든지 문의해 주세요. 영업일 기준 24시간 이내에 답변드립니다."
              : "Have questions about integration, billing, or feature requests? Contact our support engineering team. We typically respond within 24 business hours."}
          </p>
          <div className="meta-row" style={{ marginTop: "12px" }}>
            <div>
              <span className="card-muted">{isKo ? "이메일 문의: " : "Email: "}</span>
              <a href="mailto:sjh030504@gmail.com" style={{ fontWeight: 600 }}>
                sjh030504@gmail.com
              </a>
            </div>
            <div>
              <span className="card-muted">{isKo ? "운영 시간: " : "Hours: "}</span>
              <span className="value">Mon–Fri 09:00 – 18:00 KST</span>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <section>
          <h2>{isKo ? "자주 묻는 질문 (FAQ)" : "Frequently Asked Questions"}</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
            <div className="card">
              <h3>{isKo ? "Q. Slack에서 영수증을 어떻게 청구하나요?" : "Q. How do I submit receipts in Slack?"}</h3>
              <p style={{ marginTop: "6px", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                {isKo
                  ? "Payflow 봇과의 1:1 DM 창에 영수증 사진(PNG/JPG)이나 인보이스 PDF를 드래그 앤 드롭으로 업로드하기만 하면 됩니다. AI가 3초 이내에 분석하여 확인 메시지를 드립니다."
                  : "Simply drop your receipt image (PNG, JPG) or PDF invoice directly into a direct message with the Payflow bot. Our AI will acknowledge and parse the details within seconds."}
              </p>
            </div>

            <div className="card">
              <h3>{isKo ? "Q. PayPal 계정은 어떻게 등록하나요?" : "Q. How do I register my PayPal payout email?"}</h3>
              <p style={{ marginTop: "6px", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                {isKo
                  ? "Slack DM에서 Payflow 봇이 최초 영수증 업로드 시 PayPal 이메일 입력을 안내합니다. 등록된 이메일은 관리자 승인 시 자동 송금에 사용됩니다."
                  : "The Payflow bot will prompt you in Slack DM to set your PayPal email on your first receipt submission, or your workspace admin can register it on the admin dashboard."}
              </p>
            </div>

            <div className="card">
              <h3>{isKo ? "Q. AI가 금액이나 항목을 잘못 인식했을 때는 어떻게 하나요?" : "Q. What if the AI misinterprets the receipt amount or vendor?"}</h3>
              <p style={{ marginTop: "6px", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                {isKo
                  ? "인식 신뢰도가 낮거나 금액이 불분명할 경우, 청구자 에이전트가 DM으로 재요청 버튼을 보냅니다. 또한 관리자 승인 화면에서 최종 검토 및 정정이 가능합니다."
                  : "If confidence is low or fields are ambiguous, our Claimant Agent will ask you for a clearer image or clarification in Slack DM. Approvers can also review and override line items in the web dashboard."}
              </p>
            </div>

            <div className="card">
              <h3>{isKo ? "Q. 송금 실패(FAILED / UNCLAIMED)가 발생하면 어떻게 처리되나요?" : "Q. How are failed or unclaimed payouts handled?"}</h3>
              <p style={{ marginTop: "6px", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                {isKo
                  ? "PayPal 미등록 이메일 등으로 송금이 실패할 경우, 자금은 손실되지 않고 관리자 대시보드에 실패 사유와 함께 알림이 표시되며, 이메일 수정 후 원클릭 재송금이 가능합니다."
                  : "If a recipient's PayPal account is unregistered or invalid, the transaction safely transitions to FAILED without data loss. The admin can update the email address and trigger a safe retry batch."}
              </p>
            </div>
          </div>
        </section>

        {/* Getting Started Guide */}
        <section>
          <h2>{isKo ? "시작하기 가이드" : "Getting Started"}</h2>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p>
              {isKo
                ? "Slack 워크스페이스에 Payflow 앱을 추가하고 조직 전체의 경비 정산을 5분 만에 자동화해 보세요."
                : "Install Payflow to your workspace and automate your organization's entire expense lifecycle in minutes."}
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <a href="/slack">
                <button type="button">{isKo ? "Slack에 앱 설치하기" : "Install to Slack"}</button>
              </a>
              <a href="/privacy" className="btn-outline" style={{ display: "inline-flex", alignItems: "center" }}>
                {isKo ? "개인정보처리방침" : "Privacy Policy"}
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
