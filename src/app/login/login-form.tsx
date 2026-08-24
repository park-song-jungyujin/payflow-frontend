"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { t, type Locale } from "@/lib/i18n";

const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";

export default function LoginForm({ locale }: { locale: Locale }) {
  const s = t(locale);
  const isKo = locale === "ko";
  const [orgName, setOrgName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  function getErrorMessage(err: string) {
    if (err === "missing_code") {
      return isKo
        ? "Google 인증 코드를 수신하지 못했습니다. 다시 시도해주세요."
        : "Missing Google authorization code. Please try again.";
    }
    if (err === "missing_session_token") {
      return isKo
        ? "세션 생성에 실패했습니다. 관리자에게 문의해주세요."
        : "Failed to establish session. Please contact support.";
    }
    if (err === "login_failed") {
      return isKo ? "로그인에 실패했습니다. 다시 시도해주세요." : "Sign-in failed. Please try again.";
    }
    try {
      return decodeURIComponent(err);
    } catch {
      return err;
    }
  }

  function handleLogin() {
    if (!clientId || typeof window === "undefined" || isSubmitting) return;
    setIsSubmitting(true);

    const redirectUri = `${window.location.origin}/api/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state: orgName.trim(),
    });

    window.location.href = `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
  }

  return (
    <main className="auth-page">
      <div className="auth-container">
        {/* Brand Header */}
        <div className="auth-brand">
          <h1>Payflow</h1>
          <p className="auth-subtitle">{s.loginSubtitle}</p>
        </div>

        {/* Card */}
        <div className="auth-card">
          {errorParam && (
            <div className="auth-error-box" role="alert">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <strong>{s.loginErrorTitle}</strong>
                <p style={{ marginTop: "2px", fontSize: "0.85rem" }}>
                  {getErrorMessage(errorParam)}
                </p>
              </div>
            </div>
          )}

          {!clientId ? (
            <div className="auth-error-box" role="alert">
              <div>
                <strong>{s.missingClientId}</strong>
              </div>
            </div>
          ) : (
            <>
              {/* Org Name Input */}
              <div className="field" style={{ marginBottom: "22px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <label
                    htmlFor="org-name"
                    style={{
                      fontWeight: 600,
                      color: "var(--text)",
                      fontSize: "0.88rem",
                      margin: 0,
                    }}
                  >
                    {s.orgNameLabel}
                  </label>
                  <span
                    className="badge"
                    style={{
                      fontSize: "0.72rem",
                      padding: "1px 8px",
                    }}
                  >
                    {s.orgNameBadge}
                  </span>
                </div>

                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                      <path d="M9 22v-4h6v4" />
                      <path d="M8 6h.01" />
                      <path d="M16 6h.01" />
                      <path d="M8 10h.01" />
                      <path d="M16 10h.01" />
                      <path d="M8 14h.01" />
                      <path d="M16 14h.01" />
                    </svg>
                  </span>
                  <input
                    id="org-name"
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder={s.orgNamePlaceholder}
                    style={{ paddingLeft: "36px" }}
                    autoComplete="organization"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleLogin();
                      }
                    }}
                  />
                </div>
                <p className="hint" style={{ marginTop: "8px", lineHeight: 1.45 }}>
                  {s.orgNameHint}
                </p>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleLogin}
                className="auth-google-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span>{isKo ? "로그인 중..." : "Signing in..."}</span>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>{s.continueWithGoogle}</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="auth-footer">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.82rem",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>{s.securityNotice}</span>
          </div>
          <div style={{ display: "flex", gap: "14px", marginTop: "2px" }}>
            <Link href="/privacy">{s.privacyPolicy}</Link>
            <span>·</span>
            <Link href="/support">{s.support}</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
