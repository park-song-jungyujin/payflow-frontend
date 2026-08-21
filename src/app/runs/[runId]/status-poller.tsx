"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { SettlementRunStatus } from "@/lib/settlementStatus";

// 결정 7 — EXECUTING일 때만 5초마다 서버 컴포넌트를 다시 그린다. 새 fetch 로직을
// 여기 따로 두지 않는다 — router.refresh()가 페이지(서버 컴포넌트)를 재실행해
// 최신 run을 다시 받아오고, 그 결과 status가 EXECUTING이 아니게 되면(이
// 컴포넌트가 새 status prop으로 다시 렌더되며) 폴링이 자연히 멈춘다.
export default function StatusPoller({ status }: { status: SettlementRunStatus }) {
  const router = useRouter();

  useEffect(() => {
    if (status !== "EXECUTING") return;
    const id = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(id);
  }, [status, router]);

  return null;
}
