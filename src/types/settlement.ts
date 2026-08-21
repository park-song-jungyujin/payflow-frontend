// api.d.ts(openapi-typescript 생성물)는 이 값들의 실제 응답 구조를 못 담는다.
// 백엔드 settlements/routes.py의 라우트들이 response_model 없이 plain dict를
// 그대로 반환해서, openapi.json에는 "application/json": unknown으로만 나온다
// (components["schemas"]에도 SettlementRun·Claim이 없다 — HTTPValidationError뿐).
// CLAUDE.md "정산 모델 타입을 손으로 안 쓴다"는 생성기가 실제로 만들 수 있는
// 타입을 손으로 베끼지 말라는 규칙이다 — 여기는 생성기가 애초에 아무것도 못
// 주는 경우라 실제 관측된 JSON 구조를 옮겨 적는다. 백엔드가 response_model을
// 붙이면(schemas/models.py의 SettlementRun·Claim이 이미 있다) 이 파일은 지우고
// api.d.ts로 옮긴다.

import type { AccountCategoryCode } from "@/lib/accountCategory";
import type { SettlementRunStatus } from "@/lib/settlementStatus";

export interface SettlementFilter {
  period_start?: string | null;
  period_end?: string | null;
  recipient_ids?: string[] | null;
  account_categories?: AccountCategoryCode[] | null;
  exclude_claim_ids?: string[] | null;
}

export interface ClaimSummary {
  claim_id: string;
  recipient_id: string;
  amount_minor: number;
  currency: string;
  account_category_code: AccountCategoryCode;
  merchant_name: string | null;
  transaction_date: string | null;
}

export interface ExecutorAnalysis {
  anomalies: string[];
  summary_text: string | null;
  created_at: string;
}

// GET /settlements/runs/{run_id} 응답. approval_token_hash는 백엔드가 이미
// 벗겨서 안 내려준다(_public_run).
export interface SettlementRun {
  settlement_run_id: string;
  filter: SettlementFilter;
  base_currency: string;
  total_amount_minor: number;
  fx_rates: Record<string, string>;
  fx_locked_at: string | null;
  approval_amount_hash: string | null;
  approval_token_expires_at: string | null;
  approval_token_used_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  retry_seq: number;
  status: SettlementRunStatus;
  created_at: string;
  updated_at: string;
  executor_analysis: ExecutorAnalysis | null;
  claims: ClaimSummary[];
}

// GET /settlements 목록 항목 — claims·executor_analysis 없이 run 문서 그대로.
export type SettlementRunListItem = Omit<SettlementRun, "executor_analysis" | "claims">;
