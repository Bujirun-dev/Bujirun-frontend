"use client";

import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import type { BaseStop } from "@/features/itinerary/utils/scheduleUtils";
import { useItineraryYDoc } from "./useItineraryYDoc";
import {
  addStop as yAddStop,
  deleteStop as yDeleteStop,
  logActivity as yLogActivity,
  observeActivityLog,
  observeYjsDays,
  pushOptimizedOrder as yPushOptimizedOrder,
  readActivityLog,
  readStopsFromYjs,
  replaceStop as yReplaceStop,
  resolveTempId,
  seedYjsDays,
  updateStopStatus as yUpdateStopStatus,
  updateStopTime as yUpdateStopTime,
  updateStopTransport as yUpdateStopTransport,
  type ActivityAction,
  type ActivityLogEntry,
} from "./itineraryYjsSchema";
import { flushDayToRest, snapshotFromStops, type DaySnapshot } from "./flushItineraryToRest";
import { getParticipantColorClass } from "./participantColor";

export interface CollaboratorInfo {
  name: string;
  colorClass: string;
  avatarUrl?: string;
}

interface CursorState {
  dayIdx: number;
  itemId: string;
}

interface CurrentUser {
  id: string;
  nickname: string;
  profileImageUrl?: string;
}

// useItineraryYDoc(연결 생명주기)을 감싸 실제 화면이 쓰는 형태로 데이터를 노출한다:
// Yjs 상태를 BaseStop[][]로 파생시키고, 초기 시딩·이탈시/합류시 DB 반영을 처리한다.
export function useCollaborativeItinerary(
  itineraryId: string,
  dayIds: string[],
  initialDays: BaseStop[][],
  currentUser?: CurrentUser,
  onRemoteActivity?: (entry: ActivityLogEntry) => void,
) {
  // 문서를 만드는 시점에 곧바로(=WS 연결 여부와 무관하게) REST 초기값으로 시딩한다.
  // 실시간 협업 서버가 아직 연결이 안 됐거나 아예 없어도 로컬 CRUD(추가/삭제/시간변경)가
  // 항상 동작해야 하기 때문 — Yjs는 어디까지나 "연결되면 실시간으로 더 보이는" 보너스
  // 레이어여야지, 기본 편집 기능의 전제조건이 되면 안 된다. seedYjsDays는 이미 비어있는
  // 문서에만 쓰므로 멱등적이다.
  // 주의: 같은 방을 두 클라이언트가 완전히 동시에 처음 여는 극히 드문 경우, 서버 동기화를
  // 기다리지 않고 각자 시딩하기 때문에 항목이 중복될 수 있다 — 실제 협업 서버가 붙기
  // 전까지는 발생하지 않는 시나리오라 지금은 감수한다.
  const [doc] = useState(() => {
    const newDoc = new Y.Doc();
    seedYjsDays(newDoc, dayIds, initialDays);
    return newDoc;
  });
  const [stopsPerDay, setStopsPerDay] = useState<BaseStop[][]>(initialDays);

  // effect/콜백 안에서 최신 값을 읽기 위한 ref (stale closure 방지). 렌더 중 값을 그대로
  // 대입하면 안 되므로(react-hooks/refs) effect에서 매 렌더 최신값으로 갱신한다.
  const dayIdsRef = useRef(dayIds);
  const snapshotsRef = useRef<DaySnapshot[]>(initialDays.map(snapshotFromStops));

  useEffect(() => {
    dayIdsRef.current = dayIds;
  });

  // stopsPerDay(React state)가 아니라 doc에서 매번 직접 읽는다 — Yjs observer가
  // setStopsPerDay를 부른 직후에도 React가 아직 리렌더를 커밋하기 전이면 stopsPerDay는
  // 옛 값 그대로라서, "mutate 하자마자 바로 flush" 같은 흐름(예: 로그 불러오기 직후
  // flushNow)에서 방금 반영한 변경이 아니라 그 이전 상태를 저장해버리는 문제가 있었다.
  const flushAll = () => {
    const currentStops = readStopsFromYjs(doc);
    dayIdsRef.current.forEach((dayId, dayIdx) => {
      if (!dayId) return;
      const snapshot = (snapshotsRef.current[dayIdx] ??= new Map());
      flushDayToRest(
        itineraryId,
        dayId,
        currentStops[dayIdx] ?? [],
        snapshot,
        (tempId, realId) => resolveTempId(doc, dayIdx, tempId, realId),
      );
    });
  };

  // 편집하고 몇 초 지나면 자동으로 DB에 반영한다("저장 버튼 없음" 전제). 이탈 시/합류 시
  // 트리거만으로는, 페이지를 나가지 않고 계속 머무는 사용자의 편집이(특히 아직 실시간
  // 협업 서버가 없어서 이탈 트리거 자체가 잘 안 걸리는 지금 같은 상황엔 더더욱) 전혀
  // 저장되지 않는 문제가 있었다.
  useEffect(() => {
    const timer = window.setTimeout(() => flushAll(), 2000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopsPerDay]);

  const { status, getProvider } = useItineraryYDoc(itineraryId, doc, flushAll);

  // Yjs 상태 변화를 로컬 state로 반영한다 (렌더링은 이 state만 본다). 새로 만든 Y.Doc은
  // 항상 빈 상태로 시작해서 — 처음 마운트 시점에 즉시 읽어버리면 아직 시딩/동기화가
  // 안 된 빈 문서로 REST에서 받아온 initialDays를 덮어써 버린다. 그래서 "실제 변화가
  // 생겼을 때"(시딩 완료, 원격 피어의 수정, 내 mutation)만 반영하고, 마운트 시점엔
  // initialDays를 그대로 보여준다 — WS가 아예 연결 안 돼도 화면이 비지 않게 하기 위함.
  useEffect(() => {
    return observeYjsDays(doc, () => setStopsPerDay(readStopsFromYjs(doc)));
  }, [doc]);

  // 내 프레즌스(이름/색/아바타)를 알린다. currentUser가 나중에 로드되거나 provider가
  // status 변화(connecting→connected)로 뒤늦게 생겨도 다시 타도록 status를 deps에 둔다.
  useEffect(() => {
    const provider = getProvider();
    if (!provider || !currentUser) return;
    provider.awareness.setLocalStateField("user", {
      name: currentUser.nickname,
      colorClass: getParticipantColorClass(currentUser.id),
      avatarUrl: currentUser.profileImageUrl,
    });
  }, [doc, getProvider, status, currentUser]);

  const [collaboratorsByStop, setCollaboratorsByStop] = useState<Map<string, CollaboratorInfo[]>>(
    new Map(),
  );

  // 새 인원 합류(awareness에 피어 추가) 시 DB에 한 번 반영하고, 매 변화마다 "누가 어떤
  // 항목을 보고 있는지" 맵도 다시 계산한다.
  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;

    const recomputeCollaborators = () => {
      const map = new Map<string, CollaboratorInfo[]>();
      provider.awareness.getStates().forEach((state, clientId) => {
        if (clientId === provider.awareness.clientID) return;
        const user = state.user as CollaboratorInfo | undefined;
        const cursor = state.cursor as CursorState | null | undefined;
        if (!user || !cursor) return;
        const key = `${cursor.dayIdx}:${cursor.itemId}`;
        map.set(key, [...(map.get(key) ?? []), user]);
      });
      setCollaboratorsByStop(map);
    };

    const handleAwarenessChange = ({ added }: { added: number[] }) => {
      if (added.length > 0) flushAll();
      recomputeCollaborators();
    };
    provider.awareness.on("change", handleAwarenessChange);
    recomputeCollaborators();
    return () => provider.awareness.off("change", handleAwarenessChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, getProvider, status]);

  const setFocusedStop = (dayIdx: number, itemId: string | null) => {
    getProvider()?.awareness.setLocalStateField(
      "cursor",
      itemId ? ({ dayIdx, itemId } satisfies CursorState) : null,
    );
  };

  // 항상 최신 콜백을 참조하기 위한 ref (stale closure 방지, effect는 [doc]에만 반응).
  const onRemoteActivityRef = useRef(onRemoteActivity);
  useEffect(() => {
    onRemoteActivityRef.current = onRemoteActivity;
  });

  // 다른 피어가 만든 변경(추가/삭제/시간변경/교체/최적화/로그 불러오기)만 골라서 알려준다.
  // 내가 만든 변경은 transaction.local === true라서 여기서 걸러진다(내가 한 행동에
  // 내가 알림을 받는 걸 방지).
  useEffect(() => {
    // 마운트 이전 과거 기록까지 다시 알림으로 재생하지 않도록, 지금 길이를 기준점으로 삼는다.
    const lastSeenLenRef = { current: readActivityLog(doc).length };
    return observeActivityLog(doc, (transaction) => {
      if (transaction.local) return;
      const entries = readActivityLog(doc);
      const newEntries = entries.slice(lastSeenLenRef.current);
      lastSeenLenRef.current = entries.length;
      newEntries.forEach((entry) => onRemoteActivityRef.current?.(entry));
    });
  }, [doc]);

  const logActivity = (action: ActivityAction, placeName: string) => {
    yLogActivity(doc, currentUser?.nickname ?? "누군가", action, placeName);
  };

  return {
    stopsPerDay,
    status,
    collaboratorsByStop,
    setFocusedStop,
    logActivity,
    // 로그 불러오기처럼 "한 번에 크게 바뀌는" 확정적인 액션 직후엔, 2초 디바운스를
    // 기다리지 않고 바로 저장한다 — 사용자가 결과를 보자마자 새로고침해보면 디바운스
    // 타이머가 끝나기 전에 페이지가 죽어서 저장 기회를 잃을 수 있다.
    flushNow: flushAll,
    addStop: (dayIdx: number, stop: BaseStop) => yAddStop(doc, dayIdx, stop),
    deleteStop: (dayIdx: number, itemId: string) => yDeleteStop(doc, dayIdx, itemId),
    updateStopTime: (dayIdx: number, itemId: string, time: string) =>
      yUpdateStopTime(doc, dayIdx, itemId, time),
    replaceStop: (dayIdx: number, itemId: string, newStop: BaseStop) =>
      yReplaceStop(doc, dayIdx, itemId, newStop),
    updateStopTransport: (dayIdx: number, itemId: string, transport: BaseStop["transport"]) =>
      yUpdateStopTransport(doc, dayIdx, itemId, transport),
    updateStopStatus: (dayIdx: number, itemId: string, status: BaseStop["status"]) =>
      yUpdateStopStatus(doc, dayIdx, itemId, status),
    pushOptimizedOrder: (dayIdx: number, stops: BaseStop[]) =>
      yPushOptimizedOrder(doc, dayIdx, stops),
  };
}
