"use client";

import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import type { BaseStop } from "@/features/itinerary/utils/scheduleUtils";
import { useItineraryYDoc } from "./useItineraryYDoc";
import {
  addStop as yAddStop,
  deleteStop as yDeleteStop,
  observeYjsDays,
  pushOptimizedOrder as yPushOptimizedOrder,
  readStopsFromYjs,
  replaceStop as yReplaceStop,
  resolveTempId,
  seedYjsDays,
  updateStopStatus as yUpdateStopStatus,
  updateStopTime as yUpdateStopTime,
  updateStopTransport as yUpdateStopTransport,
} from "./itineraryYjsSchema";
import { flushDayToRest, snapshotFromStops, type DaySnapshot } from "./flushItineraryToRest";

// useItineraryYDoc(연결 생명주기)을 감싸 실제 화면이 쓰는 형태로 데이터를 노출한다:
// Yjs 상태를 BaseStop[][]로 파생시키고, 초기 시딩·이탈시/합류시 DB 반영을 처리한다.
export function useCollaborativeItinerary(
  itineraryId: string,
  dayIds: string[],
  initialDays: BaseStop[][],
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
  const stopsPerDayRef = useRef(stopsPerDay);
  const snapshotsRef = useRef<DaySnapshot[]>(initialDays.map(snapshotFromStops));

  useEffect(() => {
    dayIdsRef.current = dayIds;
    stopsPerDayRef.current = stopsPerDay;
  });

  const flushAll = () => {
    dayIdsRef.current.forEach((dayId, dayIdx) => {
      if (!dayId) return;
      const snapshot = (snapshotsRef.current[dayIdx] ??= new Map());
      flushDayToRest(
        itineraryId,
        dayId,
        stopsPerDayRef.current[dayIdx] ?? [],
        snapshot,
        (tempId, realId) => resolveTempId(doc, dayIdx, tempId, realId),
      );
    });
  };

  const { status, getProvider } = useItineraryYDoc(itineraryId, doc, flushAll);

  // Yjs 상태 변화를 로컬 state로 반영한다 (렌더링은 이 state만 본다). 새로 만든 Y.Doc은
  // 항상 빈 상태로 시작해서 — 처음 마운트 시점에 즉시 읽어버리면 아직 시딩/동기화가
  // 안 된 빈 문서로 REST에서 받아온 initialDays를 덮어써 버린다. 그래서 "실제 변화가
  // 생겼을 때"(시딩 완료, 원격 피어의 수정, 내 mutation)만 반영하고, 마운트 시점엔
  // initialDays를 그대로 보여준다 — WS가 아예 연결 안 돼도 화면이 비지 않게 하기 위함.
  useEffect(() => {
    return observeYjsDays(doc, () => setStopsPerDay(readStopsFromYjs(doc)));
  }, [doc]);

  // 새 인원 합류(awareness에 피어 추가) 시에도 한 번 DB에 반영
  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;

    const handleAwarenessChange = ({ added }: { added: number[] }) => {
      if (added.length > 0) flushAll();
    };
    provider.awareness.on("change", handleAwarenessChange);
    return () => provider.awareness.off("change", handleAwarenessChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, getProvider]);

  return {
    stopsPerDay,
    status,
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
