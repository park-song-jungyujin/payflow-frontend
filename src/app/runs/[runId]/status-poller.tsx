"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ExecutorAnalysisStatus } from "@/lib/executorAnalysisStatus";
import type { SettlementRunStatus } from "@/lib/settlementStatus";

// 한국어 번역(anomalies_ko/summary_text_ko)은 백그라운드 Cloud Task가 채운다
// (guards/agent_drafts.py._enqueue_executor_translation) — Gemma 실패는
// 조용히 무시하는 게 이 앱의 원칙이라 영영 안 채워질 수도 있다. status/
// executorAnalysisStatus 폴링(반드시 언젠가 끝나는 상태 전이)과 달리 끝난다는
// 보장이 없으므로 최대 시도 횟수를 둔다 — 무한 폴링 방지.
const MAX_TRANSLATION_POLLS = 8;

// 결정 7 — EXECUTING이거나 집행자 에이전트 분석이 PROCESSING일 때, 또는 ko
// 로케일에서 한국어 번역을 기다리는 동안 5초마다 서버 컴포넌트를 다시 그린다.
// 새 fetch 로직을 여기 따로 두지 않는다 — router.refresh()가 페이지(서버
// 컴포넌트)를 재실행해 최신 run을 다시 받아오고, 그 결과 모든 조건을 벗어나면
// (이 컴포넌트가 새 props로 다시 렌더되며) 폴링이 자연히 멈춘다.
export default function StatusPoller({
  status,
  executorAnalysisStatus,
  waitingForKoreanTranslation,
}: {
  status: SettlementRunStatus;
  executorAnalysisStatus: ExecutorAnalysisStatus | null;
  waitingForKoreanTranslation: boolean;
}) {
  const router = useRouter();
  const isStatusPolling = status === "EXECUTING" || executorAnalysisStatus === "PROCESSING";

  useEffect(() => {
    if (!isStatusPolling && !waitingForKoreanTranslation) return;
    // 이 effect 인스턴스 안에서만 세는 지역 변수다 — waitingForKoreanTranslation이
    // 바뀌면(번역 도착·재분석) effect가 다시 실행되며 자연히 0으로 리셋된다.
    let translationPolls = 0;
    const id = setInterval(() => {
      if (waitingForKoreanTranslation) {
        translationPolls += 1;
        if (translationPolls >= MAX_TRANSLATION_POLLS && !isStatusPolling) {
          clearInterval(id);
          return;
        }
      }
      router.refresh();
    }, 5000);
    return () => clearInterval(id);
  }, [isStatusPolling, waitingForKoreanTranslation, router]);

  return null;
}
