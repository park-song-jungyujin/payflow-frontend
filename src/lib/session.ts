import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

// architecture.md "org 스코핑과 로그인" — web은 세션 토큰을 httpOnly 쿠키로만
// 들고 있는다. org_id는 안에 안 담는다(토큰 자체는 불투명한 값), api가
// 세션을 검증해 org_id를 뽑는다.
export const SESSION_COOKIE_NAME = "payflow_session";

// Server Component 전용 — next/headers는 Next 요청 스코프 밖(직접 함수 호출,
// 유닛 테스트)에서 예외를 던진다. route handler는 아래 fromRequest()를 쓴다.
export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE_NAME)?.value ?? null;
}

// api 호출에 그대로 붙이는 헤더. 토큰이 없으면 빈 객체 — api가 401로 거부한다.
export async function authHeaders(): Promise<Record<string, string>> {
  const token = await getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// route handler 전용 — NextRequest가 이미 있으므로 next/headers를 거치지
// 않는다. 유닛 테스트에서 요청 객체를 직접 만들어 부를 수 있다.
export function authHeadersFromRequest(req: NextRequest): Record<string, string> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
