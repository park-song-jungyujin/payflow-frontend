import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./login-form";
import { getLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Sign in · Payflow",
  description: "Sign in to Payflow Settlement Admin Dashboard",
};

export default async function LoginPage() {
  const locale = await getLocale();

  return (
    <Suspense
      fallback={
        <main className="auth-page">
          <div className="auth-container">
            <div className="auth-card" style={{ textAlign: "center", padding: "48px 24px" }}>
              <span className="card-muted">Loading...</span>
            </div>
          </div>
        </main>
      }
    >
      <LoginForm locale={locale} />
    </Suspense>
  );
}
