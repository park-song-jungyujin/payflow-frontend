// schema-contract.md §5 — web은 OpenAPI 생성 타입으로 코드값을 받고 자체 매핑
// 상수로 렌더한다. 7개 고정 enum이라 API로 받아올 필요가 없다(GET /recipients
// 같은 조회가 없는 것과 별개로, 이건 애초에 조회할 이유가 없는 값이다).
// 백엔드 src/schemas/enums.py의 CATEGORY_DISPLAY와 값을 맞춘다.

import type { Locale } from "./i18n";

export const ACCOUNT_CATEGORIES = [
  "PAYMENT_FEE",
  "EMPLOYEE_BENEFIT",
  "TRAVEL",
  "SUPPLIES",
  "ADVERTISING",
  "RENT",
  "UNCLASSIFIED",
] as const;

export type AccountCategoryCode = (typeof ACCOUNT_CATEGORIES)[number];

export const ACCOUNT_CATEGORY_LABEL: Record<Locale, Record<AccountCategoryCode, string>> = {
  en: {
    PAYMENT_FEE: "Payment Fee",
    EMPLOYEE_BENEFIT: "Employee Benefit",
    TRAVEL: "Travel",
    SUPPLIES: "Supplies",
    ADVERTISING: "Advertising",
    RENT: "Rent",
    UNCLASSIFIED: "Unclassified",
  },
  ko: {
    PAYMENT_FEE: "지급수수료",
    EMPLOYEE_BENEFIT: "복리후생비",
    TRAVEL: "여비교통비",
    SUPPLIES: "소모품비",
    ADVERTISING: "광고선전비",
    RENT: "지급임차료",
    UNCLASSIFIED: "미분류",
  },
};
