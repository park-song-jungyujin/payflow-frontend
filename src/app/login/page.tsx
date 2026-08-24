"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

// 결정: redirect_uri는 window.location.origin에서 조립한다 — 환경별로
// NEXT_PUBLIC_ 값을 하나 더 관리할 이유가 없다. client_id만 공개 env로 받는다
// (OAuth client id는 비밀이 아니다 — 브라우저 리다이렉트 URL에 그대로 노출된다).
const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";

export default function LoginPage() {
  const [orgName, setOrgName] = useState("");
  // google/callback/route.ts가 실패 시 여기로 ?error=...를 붙여 리다이렉트한다 —
  // 표시 안 하면 "로그인 버튼 눌렀는데 그냥 같은 페이지로 돌아온다"로만 보인다.
  const error = useSearchParams().get("error");

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  function handleLogin() {
    if (!clientId || typeof window === "undefined") return;
    const redirectUri = `${window.location.origin}/api/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      // 신규 가입일 때만 쓰인다 — 이미 계정이 있으면 백엔드가 org_name을 무시한다.
      state: orgName,
    });
    // 외부(Google) 절대 URL이라 Next 라우터가 아니라 location을 직접 쓴다.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
  }

  if (!clientId) {
    return (
      <main>
        <h1>Payflow</h1>
        <p>NEXT_PUBLIC_GOOGLE_CLIENT_ID가 설정되지 않았습니다.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Payflow 로그인</h1>
      <p>
        처음 로그인하면 새 기관이 만들어집니다. 이미 소속된 기관이 있으면
        아래 입력은 무시됩니다.
      </p>
      {error && <p role="alert">{error}</p>}
      <label>
        기관명(최초 가입 시){" "}
        <input
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="예: Acme Inc"
        />
      </label>
      <p>
        <button onClick={handleLogin}>Google로 로그인</button>
      </p>
    </main>
  );
}
