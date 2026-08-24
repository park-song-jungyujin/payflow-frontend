import type { Metadata } from "next";
import { getLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Privacy Policy · Payflow",
  description: "Privacy Policy for Payflow Slack app and expense management services.",
};

export default async function PrivacyPage() {
  const locale = await getLocale();
  const isKo = locale === "ko";

  return (
    <main className="page" style={{ maxWidth: 760 }}>
      <a href="/" className="back-link">
        {isKo ? "← 홈으로 돌아가기" : "← Back to Home"}
      </a>

      <div className="page-header">
        <div>
          <h1>{isKo ? "개인정보 처리방침" : "Privacy Policy"}</h1>
          <p className="hint">
            {isKo
              ? "최종 수정일: 2026년 8월 25일"
              : "Last updated: August 25, 2026"}
          </p>
        </div>
      </div>

      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "24px", lineHeight: 1.7 }}>
        <section>
          <h2>{isKo ? "1. 개요" : "1. Overview"}</h2>
          <p>
            {isKo
              ? "Payflow(이하 '서비스')는 이용자의 개인정보를 소중히 다루며, 관련 법령을 준수합니다. 본 방침은 Slack 워크스페이스 연동 및 지출 정산 서비스 이용 시 수집되는 정보와 그 이용 목적, 보관 기간 및 안전한 보호 조치에 대해 설명합니다."
              : "Payflow ('we', 'us', or 'the Service') is committed to protecting your privacy. This Privacy Policy outlines what information we collect, how it is processed and protected, and your rights when using our Slack application and automated expense management platform."}
          </p>
        </section>

        <section>
          <h2>{isKo ? "2. 수집하는 개인정보 항목" : "2. Information We Collect"}</h2>
          <ul style={{ paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "8px" }}>
            <li>
              <strong>{isKo ? "Slack 계정 정보: " : "Slack Workspace & User Data: "}</strong>
              {isKo
                ? "Slack User ID, Team ID, 이메일 주소, 표시 이름 (사용자 식별 및 정산 매핑용)"
                : "Slack User ID, Team ID, email address, and display name for user identification and disbursement routing."}
            </li>
            <li>
              <strong>{isKo ? "영수증 및 지출 증빙: " : "Receipt & Expense Artifacts: "}</strong>
              {isKo
                ? "Slack을 통해 업로드된 영수증 이미지, 인보이스 파일, 거래일자, 금액, 가맹점 정보"
                : "Receipt photos, PDF invoices, merchant details, dates, transaction amounts, and currencies."}
            </li>
            <li>
              <strong>{isKo ? "송금 수취 정보: " : "Payout Information: "}</strong>
              {isKo
                ? "PayPal 수취인 이메일 계정 (일괄 송금 처리용)"
                : "Recipient PayPal email address for executing approved reimbursements."}
            </li>
          </ul>
        </section>

        <section>
          <h2>{isKo ? "3. AI 모델 처리 및 PII 보호 정책" : "3. AI Processing & PII Protection"}</h2>
          <p>
            {isKo
              ? "Payflow는 영수증 구조화 파싱 및 이상 지출 분석을 위해 Google Cloud Vertex AI (Gemini)를 사용합니다. 서비스는 철저한 개인정보 보호 원칙을 준수합니다:"
              : "Payflow utilizes Google Cloud Vertex AI (Gemini VLM) to parse receipt artifacts and detect expense anomalies with strict privacy controls:"}
          </p>
          <ul style={{ paddingLeft: "1.2rem", marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <li>
              <strong>{isKo ? "사전 PII 마스킹: " : "Pre-storage PII Masking: "}</strong>
              {isKo
                ? "주민등록번호, 카드 번호 등 민감한 개인정보는 데이터베이스에 저장되기 전 자동으로 마스킹 처리됩니다."
                : "Sensitive personal data (e.g., full credit card numbers, government IDs) is masked prior to database storage."}
            </li>
            <li>
              <strong>{isKo ? "모델 학습 미사용: " : "No Model Training: "}</strong>
              {isKo
                ? "고객의 영수증 이미지 및 지출 데이터는 AI 파운데이션 모델의 학습 데이터로 일체 사용되지 않습니다."
                : "Customer receipts and expense data are never used to train public or foundation AI models."}
            </li>
          </ul>
        </section>

        <section>
          <h2>{isKo ? "4. 정보의 보관 및 파기" : "4. Data Retention & Deletion"}</h2>
          <p>
            {isKo
              ? "수집된 정보는 회계 및 세무 증빙 법정 보관 기준에 따라 보관되며, 워크스페이스 연결 해제 또는 계정 삭제 요청 시 지체 없이 복구 불가능한 방법으로 안전하게 파기됩니다."
              : "Expense records are retained in compliance with applicable tax and accounting requirements. Upon workspace disconnection or a data deletion request, associated data is securely and permanently purged."}
          </p>
        </section>

        <section>
          <h2>{isKo ? "5. 제3자 제공 및 보안" : "5. Third-Party Services & Security"}</h2>
          <p>
            {isKo
              ? "송금 실행을 위해 PayPal API로 최소한의 필요 정보(수취인 이메일 및 금액)가 전송되며, Google Cloud Platform의 암호화된 인프라(Cloud Run, Firestore)를 통해 모든 통신이 HTTPS로 보호됩니다."
              : "To process approved payouts, minimal required details (recipient PayPal email and amount) are securely transmitted via the PayPal Payouts API. All data at rest and in transit is encrypted using Google Cloud Platform infrastructure."}
          </p>
        </section>

        <section>
          <h2>{isKo ? "6. 문의처" : "6. Contact Us"}</h2>
          <p>
            {isKo
              ? "개인정보 보호 관련 문의 또는 데이터 삭제 요청은 아래 지원팀으로 연락주시기 바랍니다."
              : "For any privacy-related inquiries or data deletion requests, please contact our team at:"}
          </p>
          <p style={{ marginTop: "6px", fontWeight: 600 }}>
            Email: <a href="mailto:sjh030504@gmail.com">sjh030504@gmail.com</a>
          </p>
        </section>
      </div>
    </main>
  );
}
