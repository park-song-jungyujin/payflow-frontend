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

// KRW/USD 혼용 표시가 헷갈린다는 사용자 요청으로 화면은 전부 USD로 통일한다.
// run.fx_rates("{통화}/USD" 형식, guards/routes.py._lock_fx_and_total이 승인
// 시점에 실환율로 채운다)가 있으면 그 값을 쓰고, 없으면(승인 전 DRAFT라 아직
// 안 잠겼을 때) 이 근사치로 대체한다 — 어디까지나 화면 표시용 추정치이고
// 실제 송금 계산(api/src/payouts/currency.py)과는 무관하다.
const APPROX_RATE_TO_USD: Record<string, number> = {
  KRW: 1 / 1350,
};

export function toUsdMinor(
  amountMinor: number,
  currency: string,
  fxRates?: Record<string, string>,
): number {
  if (currency === "USD") return amountMinor;
  const exponent = CURRENCY_EXPONENT[currency] ?? 2;
  const major = amountMinor / 10 ** exponent;
  const locked = fxRates?.[`${currency}/USD`];
  const rate = locked !== undefined ? Number(locked) : APPROX_RATE_TO_USD[currency];
  if (rate === undefined) return amountMinor;
  return Math.round(major * rate * 100);
}

export function formatUsd(
  amountMinor: number,
  currency: string,
  fxRates?: Record<string, string>,
): string {
  return formatMinor(toUsdMinor(amountMinor, currency, fxRates), "USD");
}
