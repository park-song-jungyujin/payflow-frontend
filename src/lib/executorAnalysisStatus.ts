// backend/src/settlements/routes.py _executor_analysis payload.status와 값을 맞춘다.
// payload에 status가 없는 옛 draft는 backend가 이미 "DONE"으로 기본값 처리해
// 내려주므로, 여기서는 세 값만 다루면 된다.

import type { Locale } from "./i18n";

export const EXECUTOR_ANALYSIS_STATUSES = ["PROCESSING", "DONE", "FAILED"] as const;

export type ExecutorAnalysisStatus = (typeof EXECUTOR_ANALYSIS_STATUSES)[number];

export const EXECUTOR_ANALYSIS_STATUS_LABEL: Record<Locale, Record<ExecutorAnalysisStatus, string>> = {
  en: {
    PROCESSING: "Analyzing…",
    DONE: "Analysis complete",
    FAILED: "Analysis failed to start",
  },
  ko: {
    PROCESSING: "분석 중…",
    DONE: "분석 완료",
    FAILED: "분석 시작 실패",
  },
};

export const EXECUTOR_ANALYSIS_STATUS_COLOR: Record<ExecutorAnalysisStatus, string> = {
  PROCESSING: "#d97706",
  DONE: "#16a34a",
  FAILED: "#dc2626",
};
