import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, type Locale } from "./i18n";

// 서버 컴포넌트 전용 — next/headers는 클라이언트 컴포넌트에서 import할 수
// 없어 lib/i18n.ts(딕셔너리, 양쪽에서 씀)와 분리했다.
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return (LOCALES as readonly string[]).includes(value ?? "") ? (value as Locale) : DEFAULT_LOCALE;
}
