// src/schemas/enums.py SettlementRunStatus와 값을 맞춘다.

import type { Locale } from "./i18n";

export const SETTLEMENT_RUN_STATUSES = [
  "DRAFT",
  "APPROVED",
  "EXECUTING",
  "SETTLED",
  "FAILED",
] as const;

export type SettlementRunStatus = (typeof SETTLEMENT_RUN_STATUSES)[number];

export const SETTLEMENT_STATUS_LABEL: Record<Locale, Record<SettlementRunStatus, string>> = {
  en: {
    DRAFT: "Pending Approval",
    APPROVED: "Approved",
    EXECUTING: "Processing Payout",
    SETTLED: "Settled",
    FAILED: "Failed",
  },
  ko: {
    DRAFT: "승인 대기",
    APPROVED: "승인됨",
    EXECUTING: "송금 처리 중",
    SETTLED: "정산 완료",
    FAILED: "실패",
  },
};

// 화면에서 상태를 구분하는 용도. 디자인 시스템이 없어 최소한의 시맨틱 색만 둔다.
export const SETTLEMENT_STATUS_COLOR: Record<SettlementRunStatus, string> = {
  DRAFT: "#6b7280",
  APPROVED: "#2563eb",
  EXECUTING: "#d97706",
  SETTLED: "#16a34a",
  FAILED: "#dc2626",
};
