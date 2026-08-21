// 화면 표시 전용. money-safety.md §4의 CURRENCY_EXPONENT 표와 값을 맞춘다.
// 실제 송금 금액 변환(문자열 소수 만들기)은 여전히 api/src/payouts/currency.py
// 단독 소관이다 — 여기는 사람이 읽을 숫자를 만들 뿐 어디에도 전송하지 않는다.

const CURRENCY_EXPONENT: Record<string, number> = {
  KRW: 0,
  JPY: 0,
  USD: 2,
  EUR: 2,
  GBP: 2,
  TND: 3,
};

export function formatMinor(amountMinor: number, currency: string): string {
  const exponent = CURRENCY_EXPONENT[currency] ?? 2;
  const major = amountMinor / 10 ** exponent;
  return `${major.toLocaleString("ko-KR", {
    minimumFractionDigits: exponent,
    maximumFractionDigits: exponent,
  })} ${currency}`;
}
