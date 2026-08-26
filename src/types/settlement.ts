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
import type { ExecutorAnalysisStatus } from "@/lib/executorAnalysisStatus";
import type { SettlementRunStatus } from "@/lib/settlementStatus";

export interface SettlementFilter {
  period_start?: string | null;
  period_end?: string | null;
  recipient_ids?: string[] | null;
  account_categories?: AccountCategoryCode[] | null;
  exclude_claim_ids?: string[] | null;
}

export interface ReceiptItem {
  // 영수증에서 읽은 원문(마스킹 후). 거의 항상 한국어다.
  name: string;
  // name의 영어 번역. 파싱 시점에 Gemma가 채운다(api parsing/pipeline.py
  // _build_items). 번역이 실패했거나 이 필드가 생기기 전에 파싱된 영수증에는
  // 없다 — 표시할 땐 lib/receiptItem.ts itemDisplayName으로 폴백을 태운다.
  name_en?: string;
  amount_minor: number | null;
  // 없으면 false 취급(기존 run의 items에는 이 필드가 없다).
  excluded?: boolean;
}

export interface ClaimSummary {
  claim_id: string;
  recipient_id: string;
  recipient_name: string;
  amount_minor: number;
  currency: string;
  account_category_code: AccountCategoryCode;
  merchant_name: string | null;
  // merchant_name의 영어 번역. 파싱 시점에 Gemma가 채운다(api parsing/pipeline.py
  // _translate_receipt_names). 번역 실패나 이 필드가 생기기 전에 파싱된 영수증엔
  // null — 표시할 땐 lib/receiptText.ts merchantDisplay로 폴백을 태운다.
  merchant_name_en: string | null;
  transaction_date: string | null;
  items: ReceiptItem[];
}

export interface ExecutorAnalysis {
  status: ExecutorAnalysisStatus;
  // 집행자 에이전트가 직접 쓰는 기본 필드 — 영어다(해커톤 제출 언어 요건).
  anomalies: string[];
  summary_text: string | null;
  // 한국어 사용자용 병행 필드. Gemma가 번역해 채운다(guards/agent_drafts.py).
  // anomalies_ko는 anomalies와 같은 개수·순서 — 번역 실패나 없는 draft엔
  // 빈 리스트/null로 기본값을 채운다(settlements/routes.py _executor_analysis).
  anomalies_ko: string[];
  summary_text_ko: string | null;
  // status가 FAILED일 때만 채워진다 — 분석 요청(Cloud Task) 생성이 왜 실패했는지.
  // 정상 분석 결과에는 없어서 null이다(settlements/routes.py _executor_analysis).
  reason: string | null;
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
  // 이 run에 링크된 claim들의 recipient.display_name 중복 제거 목록(정렬됨).
  recipient_names: string[];
}

// GET /settlements 목록 항목 — claims·executor_analysis 없이 run 문서 그대로.
export type SettlementRunListItem = Omit<SettlementRun, "executor_analysis" | "claims">;
