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
  reconcileTransportFromRest,
  replaceStop as yReplaceStop,
  replaceStopsWithImportedLog as yReplaceStopsWithImportedLog,
  resolveTempId,
  seedYjsDays,
  shiftFollowingStopTimes as yShiftFollowingStopTimes,
  updateStopTime as yUpdateStopTime,
  updateStopTransport as yUpdateStopTransport,
  type ActivityAction,
  type ActivityLogEntry,
  type ShiftTimesResult,
} from "./itineraryYjsSchema";
import { flushDayToRest, snapshotFromStops, type DaySnapshot } from "./flushItineraryToRest";
import { pickAvailableParticipantColorClass } from "./participantColor";

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

// WS sync가 이 시간 안에 안 끝나면(연결 자체가 안 되거나, 오프라인 등) REST 값으로
// 그냥 시딩해서 로컬 편집만이라도 항상 가능하게 한다.
const SEED_FALLBACK_MS = 4000;

// useItineraryYDoc(연결 생명주기)을 감싸 실제 화면이 쓰는 형태로 데이터를 노출한다:
// Yjs 상태를 BaseStop[][]로 파생시키고, 초기 시딩·이탈시/합류시 DB 반영을 처리한다.
export function useCollaborativeItinerary(
  itineraryId: string,
  dayIds: string[],
  initialDays: BaseStop[][],
  currentUser?: CurrentUser,
  onRemoteActivity?: (entry: ActivityLogEntry) => void,
) {
  // 문서는 빈 채로 만든다. 시딩은 아래 useEffect에서, WS 동기화가 끝나 원격(Redis)에
  // 이미 있던 days가 doc에 먼저 반영된 뒤에 한다 — 그래야 seedYjsDays의 "로컬 문서가
  // 비어있으면 시딩" 가드가 "진짜 처음 여는 일정인지"를 정확히 판단할 수 있다.
  // (이전엔 useState 초기화 시점에 곧바로 시딩했는데, 매 마운트마다 새 빈 문서를 만들다
  // 보니 이 가드가 사실상 항상 통과해버려서, 같은 일정을 재오픈할 때마다 REST에서 받은
  // days가 서버에 이미 있던 days와 합쳐져 개수가 배로 늘어나는 버그가 있었다.)
  const [doc] = useState(() => new Y.Doc());
  const [stopsPerDay, setStopsPerDay] = useState<BaseStop[][]>(initialDays);

  // 방문인증 완료(status==="completed") 여부는 "나"만의 상태라 Yjs 공유 문서에는 아예
  // 안 싣는다(itineraryYjsSchema의 LOCAL_ONLY_FIELDS 참고) — 대신 이 컴포넌트 로컬
  // state로만 들고 있다가 stopsPerDay를 노출할 때 덧씌운다. 그래야 같은 일정을 보고
  // 있는 다른 그룹원이 인증해도 내 화면엔 반영되지 않고, 내가 직접 인증했을 때만 내
  // 화면에서 바로 "완료"로 바뀐다(REST로 재조회해도 백엔드가 개인별로 계산해주므로
  // 동일한 값으로 수렴함).
  const [completedStopIds, setCompletedStopIds] = useState<Set<string>>(
    () =>
      new Set(
        initialDays
          .flat()
          .filter((stop) => stop.status === "completed")
          .map((stop) => stop.id),
      ),
  );

  // effect/콜백 안에서 최신 값을 읽기 위한 ref (stale closure 방지). 렌더 중 값을 그대로
  // 대입하면 안 되므로(react-hooks/refs) effect에서 매 렌더 최신값으로 갱신한다.
  const dayIdsRef = useRef(dayIds);
  const snapshotsRef = useRef<DaySnapshot[]>(initialDays.map(snapshotFromStops));
  // 시딩용 초기값은 마운트 시점 값 그대로 고정한다 — props가 그 사이 바뀌어도
  // 시딩 로직이 재실행되며 엉뚱한 값을 시딩하면 안 되기 때문.
  const initialDaysRef = useRef(initialDays);
  // 시딩(원격 상태 병합 포함)이 실제로 끝나기 전엔 doc이 빈 상태라, 이 시점에 flushAll이
  // 돌면 그 빈 상태를 REST에 그대로 PATCH해서 서버에 이미 있던 데이터를 지워버린다.
  // (React StrictMode가 개발 모드에서 연결 effect를 마운트 직후 한 번 cleanup했다가
  // 다시 마운트하는데, 그 cleanup이 onBeforeDisconnect=flushAll을 호출하는 경로가 있어서
  // 시딩 전에 flushAll이 불릴 수 있다 — 실제로 이걸로 로컬 테스트 중 데이터가 날아갔다.)
  //
  // ref와 별개로 state(seeded)로도 노출한다 — 로그 불러오기처럼 마운트 직후 곧바로
  // doc에 쓰기(day 배열이 아직 없으면 조용히 무시됨)를 시도하는 호출부가 "지금 써도
  // 안전한지"를 알 수 있어야 한다(ref는 effect 밖 렌더에서 못 읽어서 이 용도로는 못 씀).
  const hasSeededRef = useRef(false);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    dayIdsRef.current = dayIds;
  });

  // stopsPerDay(React state)가 아니라 doc에서 매번 직접 읽는다 — Yjs observer가
  // setStopsPerDay를 부른 직후에도 React가 아직 리렌더를 커밋하기 전이면 stopsPerDay는
  // 옛 값 그대로라서, "mutate 하자마자 바로 flush" 같은 흐름(예: 로그 불러오기 직후
  // flushNow)에서 방금 반영한 변경이 아니라 그 이전 상태를 저장해버리는 문제가 있었다.
  const flushAll = () => {
    if (!hasSeededRef.current) return;
    const currentStops = readStopsFromYjs(doc);
    dayIdsRef.current.forEach((dayId, dayIdx) => {
      if (!dayId) return;
      const snapshot = (snapshotsRef.current[dayIdx] ??= new Map());
      flushDayToRest(itineraryId, dayId, currentStops[dayIdx] ?? [], snapshot, (tempId, realId) =>
        resolveTempId(doc, dayIdx, tempId, realId),
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

  const { status, synced, getProvider } = useItineraryYDoc(itineraryId, doc, flushAll);

  // WS 동기화가 끝난 뒤에만 시딩한다 — synced=true가 되는 시점엔 원격(Redis)에 이미
  // 있던 days가 doc에 먼저 반영된 후라, seedYjsDays의 "로컬 문서 비어있으면 시딩" 가드가
  // 방금 합쳐진 원격 상태까지 포함해서 "진짜 처음 여는 일정인지"를 정확히 판단한다.
  // 동기화가 SEED_FALLBACK_MS 안에 안 끝나면(연결 실패, 오프라인 등) 그냥 REST 값으로
  // 시딩해서 로컬 편집만이라도 항상 가능하게 한다.
  useEffect(() => {
    if (synced) {
      seedYjsDays(doc, dayIdsRef.current, initialDaysRef.current);
      // 이미 시딩된 방을 재오픈한 경우, 그 사이 백엔드에서 새로 계산된 이동수단 정보를
      // 이번 REST 응답 기준으로 채워 넣는다 (없으면 새로고침할 때마다 잠깐 떴다가
      // 사라지는 버그가 있었음 — Yjs 쪽 항목엔 이동수단이 비어있는 채로 굳어있어서).
      reconcileTransportFromRest(doc, dayIdsRef.current, initialDaysRef.current);
      hasSeededRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSeeded(true);
      return;
    }
    const timer = window.setTimeout(() => {
      seedYjsDays(doc, dayIdsRef.current, initialDaysRef.current);
      reconcileTransportFromRest(doc, dayIdsRef.current, initialDaysRef.current);
      hasSeededRef.current = true;
      setSeeded(true);
    }, SEED_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [doc, synced]);

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
  // 그룹 최대 인원(6명)이 색상 팔레트 수와 같아서, 접속 중인 다른 사람들의 색을 피해
  // 배정하면 동시 접속자끼리는 겹치지 않는다 — 누가 새로 들어오거나 나갈 때마다
  // awareness "change"로 다시 확인해서 겹치면 그때만 재배정한다.
  useEffect(() => {
    const provider = getProvider();
    if (!provider || !currentUser) return;

    const broadcastPresence = () => {
      const peerColorClasses = new Set<string>();
      provider.awareness.getStates().forEach((state, clientId) => {
        if (clientId === provider.awareness.clientID) return;
        const peerUser = state.user as CollaboratorInfo | undefined;
        if (peerUser?.colorClass) peerColorClasses.add(peerUser.colorClass);
      });

      const localUser = provider.awareness.getLocalState()?.user as CollaboratorInfo | undefined;
      const colorClass =
        localUser?.colorClass && !peerColorClasses.has(localUser.colorClass)
          ? localUser.colorClass
          : pickAvailableParticipantColorClass(peerColorClasses);

      // 실제로 바뀐 게 없으면 재브로드캐스트하지 않는다 — setLocalStateField는 내용이
      // 같아도 awareness "change"를 다시 쏴서, 그대로 두면 무한 루프에 빠진다.
      if (
        localUser?.name === currentUser.nickname &&
        localUser?.colorClass === colorClass &&
        localUser?.avatarUrl === currentUser.profileImageUrl
      ) {
        return;
      }

      provider.awareness.setLocalStateField("user", {
        name: currentUser.nickname,
        colorClass,
        avatarUrl: currentUser.profileImageUrl,
      });
    };

    broadcastPresence();
    provider.awareness.on("change", broadcastPresence);
    return () => provider.awareness.off("change", broadcastPresence);
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
  //
  // 기준점(lastSeenLen)은 WS 동기화가 끝난 뒤(원격 Redis에 있던 과거 활동 로그가 doc에
  // 이미 반영된 시점)에 잡아야 한다 — 시딩과 똑같은 이유로, 동기화 전(빈 문서 상태)에
  // 기준점을 0으로 잡으면 새로고침할 때마다 Redis에 쌓여있던 과거 로그 전체가 "새
  // 이벤트"로 재생되어 예전에 지운 일정의 "삭제됐어요" 토스트 같은 게 계속 다시 뜬다.
  useEffect(() => {
    let started = false;
    let lastSeenLen = 0;

    const establishBaseline = () => {
      if (started) return;
      started = true;
      lastSeenLen = readActivityLog(doc).length;
    };

    if (synced) establishBaseline();
    const timer = window.setTimeout(establishBaseline, SEED_FALLBACK_MS);

    const unobserve = observeActivityLog(doc, (transaction) => {
      if (!started || transaction.local) return;
      const entries = readActivityLog(doc);
      const newEntries = entries.slice(lastSeenLen);
      lastSeenLen = entries.length;
      newEntries.forEach((entry) => onRemoteActivityRef.current?.(entry));
    });

    return () => {
      window.clearTimeout(timer);
      unobserve();
    };
  }, [doc, synced]);

  const logActivity = (action: ActivityAction, placeName: string) => {
    yLogActivity(doc, currentUser?.nickname ?? "누군가", action, placeName);
  };

  // stopsPerDay(Yjs 유래, 그룹 공유)엔 status가 없으므로(itineraryYjsSchema 참고), 여기서
  // 로컬 전용 completedStopIds를 덧씌워 화면에 넘긴다.
  const stopsPerDayWithStatus = stopsPerDay.map((day) =>
    day.map((stop) => ({
      ...stop,
      status: (completedStopIds.has(stop.id) ? "completed" : "verify") as BaseStop["status"],
    })),
  );

  return {
    stopsPerDay: stopsPerDayWithStatus,
    status,
    seeded,
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
    // 인증완료 표시는 "나"만의 로컬 상태다 — Yjs로 보내지 않고 이 클라이언트의 state만
    // 바꾼다(status===undefined면 되돌리기, 지금은 완료 표시 전용으로만 호출됨).
    updateStopStatus: (_dayIdx: number, itemId: string, status: BaseStop["status"]) =>
      setCompletedStopIds((prev) => {
        const next = new Set(prev);
        if (status === "completed") next.add(itemId);
        else next.delete(itemId);
        return next;
      }),
    pushOptimizedOrder: (dayIdx: number, stops: BaseStop[]) =>
      yPushOptimizedOrder(doc, dayIdx, stops),
    replaceStopsWithImportedLog: (dayIdx: number, stops: BaseStop[]) =>
      yReplaceStopsWithImportedLog(doc, dayIdx, stops),
    shiftFollowingStopTimes: (
      dayIdx: number,
      fromItemId: string,
      deltaMinutes: number,
      boundaryMinutes?: number,
    ): ShiftTimesResult =>
      yShiftFollowingStopTimes(doc, dayIdx, fromItemId, deltaMinutes, boundaryMinutes),
  };
}
