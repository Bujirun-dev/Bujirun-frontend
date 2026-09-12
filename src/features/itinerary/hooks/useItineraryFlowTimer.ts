"use client";

import { useEffect, useState } from "react";
import {
  getItineraryFlowRemainingMs,
  ITINERARY_FLOW_SKIP_AFTER_MS,
  useItineraryFlowStore,
} from "@/shared/stores";

// 지금 단계(대기 화면)에 들어온 뒤 남은 제한 시간(5분)을 1초마다 갱신해서 돌려준다.
// 제한 시간이 지나면 방장은 아직 안 끝낸 사람을 기다리지 않고 다음 단계로 넘어갈 수 있다.
export function useItineraryFlowTimer(): { remainingMs: number; isOver: boolean } {
  const flow = useItineraryFlowStore((state) => state.flow);
  const startedAt = flow?.stepStartedAt;
  const [remainingMs, setRemainingMs] = useState(() =>
    flow ? getItineraryFlowRemainingMs(flow) : ITINERARY_FLOW_SKIP_AFTER_MS,
  );

  useEffect(() => {
    if (!startedAt) return;
    const update = () =>
      setRemainingMs(Math.max(0, startedAt + ITINERARY_FLOW_SKIP_AFTER_MS - Date.now()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  // 시작 시각을 아직 모르면(스토어 복원 전) 제한이 지난 것으로 보지 않는다.
  return { remainingMs, isOver: startedAt !== undefined && remainingMs === 0 };
}

// 남은 시간을 "9:07" 형태로 보여준다.
export function formatRemainingTime(remainingMs: number): string {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
