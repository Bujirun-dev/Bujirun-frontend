import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// 일정 생성 플로우에서 "지금 어디까지 왔는지"를 기기에 남겨둔다. 생성 중에 앱이 튕기거나
// 새로고침되면 화면 상태(groupId/날짜/숙소/voteSessionId)가 URL 쿼리에만 있어서 전부 날아가고,
// 다시 들어갈 입구가 없어서 그 사람만 영구히 플로우 밖으로 떨어지는 문제가 있었다.
// 그래서 sessionStorage(탭 단위)가 아니라 localStorage에 저장한다 — 앱을 완전히 닫고
// 다시 열어도 "이어하기"로 돌아올 수 있어야 한다.
export type ItineraryFlowStep =
  | "invite"
  | "personality"
  | "swipe"
  | "waiting"
  | "result"
  | "vote-waiting";

const FLOW_STEP_PATHS: Record<ItineraryFlowStep, string> = {
  invite: "/itinerary/trips/invite",
  personality: "/itinerary/trips/personality",
  swipe: "/itinerary/trips/swipe",
  waiting: "/itinerary/trips/waiting",
  result: "/itinerary/trips/result",
  "vote-waiting": "/itinerary/trips/vote-waiting",
};

// 하루가 지난 기록은 이미 남이 확정했거나 그냥 버려진 방일 가능성이 높아서 더 권하지 않는다.
export const ITINERARY_FLOW_TTL_MS = 24 * 60 * 60 * 1000;

// 대기 화면(취향분석 대기 / 투표 대기)에 들어온 뒤 이 시간이 지나면, 방장은 아직 안 끝낸
// 사람을 기다리지 않고 진행할 수 있다 — 중간에 튕겨서 안 돌아오는 사람이 한 명만 있어도
// 그룹 전체가 대기 화면에 영구히 갇히던 문제 때문에 둔 제한.
// 전체 플로우 합산이 아니라 단계마다 따로 센다: 스와이프 10장(~1분), 투표(1~2분)라
// 정상 흐름에서는 이 버튼이 뜨지 않고, 한 단계에서 3분을 넘기면 그때는 누가 자리를
// 비운 상황으로 본다. 자동 진행이 아니라 "방장이 넘길 수 있게 되는" 시점이라,
// 더 짧게 잡으면 아직 하고 있는 사람을 성급하게 잘라내게 된다.
export const ITINERARY_FLOW_SKIP_AFTER_MS = 3 * 60 * 1000;

export type ItineraryFlowProgress = {
  step: ItineraryFlowStep;
  // 해당 단계 페이지가 그대로 쓰던 쿼리스트링(count/days/groupId/name/날짜/숙소/sessionId…)
  query: string;
  groupId: string;
  tripName?: string;
  // 투표 세션이 만들어진 뒤(result 이후)에만 있다. 이어하기 전에 이미 확정됐는지 확인하는 데 쓴다.
  sessionId?: string;
  // 지금 단계에 들어온 시각. 같은 단계에 머무는 동안에는 갱신되지 않는다(제한 시간 기준).
  stepStartedAt: number;
  updatedAt: number;
};

type ItineraryFlowState = {
  flow: ItineraryFlowProgress | null;
  saveFlow: (progress: Omit<ItineraryFlowProgress, "stepStartedAt" | "updatedAt">) => void;
  clearFlow: () => void;
};

export const useItineraryFlowStore = create<ItineraryFlowState>()(
  persist(
    (set) => ({
      flow: null,
      // stepStartedAt은 같은 그룹의 같은 단계에 머무는 동안에는 갱신하지 않는다 —
      // 화면이 리렌더/재진입될 때마다 새로 찍으면 제한 시간이 계속 미뤄져서
      // 방장이 영영 건너뛸 수 없다.
      saveFlow: (progress) =>
        set((state) => {
          const isSameStep =
            state.flow?.groupId === progress.groupId && state.flow?.step === progress.step;
          return {
            flow: {
              ...progress,
              stepStartedAt: isSameStep ? state.flow!.stepStartedAt : Date.now(),
              updatedAt: Date.now(),
            },
          };
        }),
      clearFlow: () => set({ flow: null }),
    }),
    {
      name: "bujirun-itinerary-flow-progress",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function getItineraryFlowHref(flow: ItineraryFlowProgress): string {
  const path = FLOW_STEP_PATHS[flow.step];
  return flow.query ? `${path}?${flow.query}` : path;
}

export function isItineraryFlowExpired(flow: ItineraryFlowProgress): boolean {
  return Date.now() - flow.updatedAt > ITINERARY_FLOW_TTL_MS;
}

export function getItineraryFlowRemainingMs(flow: ItineraryFlowProgress): number {
  return Math.max(0, flow.stepStartedAt + ITINERARY_FLOW_SKIP_AFTER_MS - Date.now());
}
