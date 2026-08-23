"use client";

import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";

// 국기는 이모지 대신 인라인 SVG로 그린다 — 국기 이모지는 OS/브라우저 폰트에
// 따라 빈 원이나 2글자 코드로 깨질 수 있다(특히 Windows 헤드리스 환경에서
// 확인됨). SVG는 어떤 환경에서도 동일하게 렌더링된다.
function UkFlag() {
  return (
    <svg viewBox="0 0 60 30" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="60" height="30" fill="#00247d" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#cf142b" strokeWidth="4" />
      <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 V30 M0,15 H60" stroke="#cf142b" strokeWidth="6" />
    </svg>
  );
}

// 태극 모양만 남긴다(4괘 제외, 사용자 요청). path는 위키미디어 공용의 공식
// 태극기 SVG(Flag_of_South_Korea.svg)에서 그대로 가져온 좌표다 — 손으로 근사한
// 이전 버전은 실제 모양과 달랐다. 반지름 24 기준 원본 좌표를 중심(15,15)·
// 반지름 13으로 옮기려고 scale(13/24)만 걸었고, 33.69006752598° 회전은
// 원본 그대로다(atan(2/3) — 태극 축이 수직이 아니라 대각선인 이유).
function KrFlag() {
  return (
    <svg viewBox="0 0 30 30" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="30" height="30" fill="#fff" />
      <g transform="translate(15,15) scale(0.541666667) rotate(33.69006752598)">
        <path fill="#cd2e3a" d="M12 0a18 18 0 11-36 0 24 24 0 1148 0" />
        <path fill="#0047a0" d="M-24 0a24 24 0 1048 0A12 12 0 100 0a12 12 0 11-24 0" />
      </g>
    </svg>
  );
}

// 오른쪽 위 고정 언어 전환 버튼. 쿠키에 locale을 쓰고 router.refresh()로
// 서버 컴포넌트를 다시 그린다 — 별도 라우팅(/en, /ko)을 두지 않는 최소 구현.
export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();

  function select(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000`;
    router.refresh();
  }

  return (
    <div className="lang-switcher">
      <button
        type="button"
        className={`lang-flag${locale === "en" ? " active" : ""}`}
        aria-label="English"
        aria-pressed={locale === "en"}
        onClick={() => select("en")}
      >
        <UkFlag />
      </button>
      <button
        type="button"
        className={`lang-flag${locale === "ko" ? " active" : ""}`}
        aria-label="한국어"
        aria-pressed={locale === "ko"}
        onClick={() => select("ko")}
      >
        <KrFlag />
      </button>
    </div>
  );
}
