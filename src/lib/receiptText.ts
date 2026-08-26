import type { Locale } from "@/lib/i18n";
import type { ReceiptItem } from "@/types/settlement";

/** 화면에 보여줄 품목명 하나를 고른다.
 *
 * 영수증 품목명은 원문이 한국어다(OCR이 읽은 그대로). 집행자 서술·Slack 발송
 * 문구를 영어로 통일한 뒤에도 여기만 "G)콜드브루" 같은 한국어로 남아 있었다 —
 * api/src/parsing/pipeline.py._translate_receipt_names가 파싱 시점에 Gemma로
 * 번역해 name_en을 함께 저장하고, en 로케일에서 그 값을 쓴다.
 *
 * name_en이 없는 경우가 정상 경로로 존재한다: 번역 실패(조언성 부가 기능이라
 * 조용히 흡수된다)와 이 필드가 생기기 전에 파싱된 영수증. 그땐 한국어 원문으로
 * 폴백한다 — 빈 칸보다 낫다.
 *
 * 품목은 표에서 한 줄로 촘촘히 그려서 가맹점명과 달리 원문을 함께 적지
 * 않는다(merchantDisplay 참조).
 */
export function itemDisplayName(item: ReceiptItem, locale: Locale): string {
  if (locale === "en" && item.name_en) {
    return item.name_en;
  }
  return item.name;
}

/** 가맹점명을 "번역명 + 그 아래 회색 원문" 두 줄로 그리기 위한 값을 만든다.
 *
 * 가맹점명은 품목명과 달리 원문을 함께 보여준다 — 영수증·카드 명세와 대조하는
 * 사람이 실제로 찍힌 상호를 봐야 하고, 상호 번역은 음차라 원문 없이는
 * 어느 가게인지 특정이 안 되는 경우가 많다.
 *
 * `original`이 null이면 괄호 줄 자체를 그리지 않는다. 그런 경우는 셋이다:
 * ko 로케일(원문이 곧 표시명), 번역이 없는 경우(실패했거나 이 필드가 생기기
 * 전에 파싱된 영수증 — 원문으로 폴백한다), 번역이 원문과 같은 경우(원래
 * 영어 상호. 같은 이름을 괄호로 한 번 더 적으면 잡음이다).
 *
 * `primary`가 null이면 가맹점명 자체를 못 읽은 영수증이다
 * (receipts.merchant_name은 nullable) — 호출부가 "-"로 그린다.
 */
export function merchantDisplay(
  merchantName: string | null,
  merchantNameEn: string | null | undefined,
  locale: Locale
): { primary: string | null; original: string | null } {
  if (!merchantName) {
    return { primary: null, original: null };
  }
  if (locale !== "en" || !merchantNameEn || merchantNameEn.trim() === merchantName.trim()) {
    return { primary: merchantName, original: null };
  }
  return { primary: merchantNameEn, original: merchantName };
}
