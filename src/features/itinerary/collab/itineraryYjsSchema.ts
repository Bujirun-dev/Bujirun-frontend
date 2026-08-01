import * as Y from "yjs";
import type { BaseStop } from "@/features/itinerary/utils/scheduleUtils";
import {
  minutesToTime,
  rebuildTransport,
  roundToNearest10,
  timeToMinutes,
} from "@/features/itinerary/utils/scheduleUtils";

const DAYS_KEY = "days";
const META_KEY = "meta";
const ACTIVITY_LOG_KEY = "activityLog";
const MAX_ACTIVITY_LOG = 50;

export type ActivityAction = "add" | "delete" | "time" | "replace" | "optimize" | "import";

export interface ActivityLogEntry {
  id: string;
  actorName: string;
  action: ActivityAction;
  placeName: string;
  at: number;
}

function getDaysArray(doc: Y.Doc): Y.Array<Y.Map<unknown>> {
  return doc.getArray(DAYS_KEY);
}

function getMeta(doc: Y.Doc): Y.Map<unknown> {
  return doc.getMap(META_KEY);
}

// transport는 그대로 저장하되, from/to 라벨은 읽을 때마다 rebuildTransport()로
// 인접 스톱의 현재 placeName 기준으로 다시 계산한다(가운데 스톱이 바뀌어도 라벨이
// 낡지 않게). type/durationMin/cost 같은 "선택값"만 저장된 값을 그대로 이어받는다.
function toItemMap(stop: BaseStop): Y.Map<unknown> {
  const map = new Y.Map<unknown>();
  Object.entries(stop).forEach(([key, value]) => {
    if (value !== undefined) map.set(key, value);
  });
  return map;
}

function fromItemMap(map: Y.Map<unknown>): BaseStop {
  return map.toJSON() as BaseStop;
}

function toDayMap(dayId: string, stops: BaseStop[]): Y.Map<unknown> {
  const dayMap = new Y.Map<unknown>();
  dayMap.set("dayId", dayId);
  const items = new Y.Array<Y.Map<unknown>>();
  items.push(stops.map(toItemMap));
  dayMap.set("items", items);
  return dayMap;
}

function getItemsArray(doc: Y.Doc, dayIdx: number): Y.Array<Y.Map<unknown>> | null {
  const dayMap = getDaysArray(doc).get(dayIdx) as Y.Map<unknown> | undefined;
  if (!dayMap) return null;
  return dayMap.get("items") as Y.Array<Y.Map<unknown>>;
}

// 항상 "현재 상태를 plain 객체로 읽기 → 배열 연산으로 수정 → 새 Y.Map으로 다시 쓰기" 방식을
// 쓴다. Yjs는 한 번 문서에 통합된 shared type(Y.Map)을 다른 위치로 재삽입할 수 없어서,
// 순서를 바꾸는 연산(시간순 재정렬 등)에서 기존 Y.Map 인스턴스를 재사용하면 에러가 난다.
function replaceItemsArray(
  doc: Y.Doc,
  dayIdx: number,
  mutate: (stops: BaseStop[]) => BaseStop[],
): void {
  doc.transact(() => {
    const items = getItemsArray(doc, dayIdx);
    if (!items) return;
    const next = mutate(items.toArray().map(fromItemMap));
    items.delete(0, items.length);
    items.push(next.map(toItemMap));
  });
}

export function isYjsDaysEmpty(doc: Y.Doc): boolean {
  return getDaysArray(doc).length === 0;
}

export function seedYjsDays(doc: Y.Doc, dayIds: string[], days: BaseStop[][]): void {
  doc.transact(() => {
    const daysArray = getDaysArray(doc);
    if (daysArray.length > 0) return;
    daysArray.push(dayIds.map((dayId, idx) => toDayMap(dayId, days[idx] ?? [])));
    getMeta(doc).set("seeded", true);
  });
}

// 이미 시딩된 방(재오픈)은 그 이후 백엔드에서 새로 계산된 이동수단(재정렬로 routeType이
// 채워지는 등)을 다시 받아오지 않는다 — REST로 새로 받아온 값 중 transport가 있는데
// Yjs 쪽 같은 id 항목엔 아직 비어있는 경우에 한해 채워 넣는다. 사용자가 직접 고른
// transport(updateStopTransport)는 이미 값이 있으므로 덮어쓰지 않는다. toStopId가 현재
// 순서와 안 맞으면 어차피 readStopsFromYjs가 매번 rebuildTransport()로 다시 비우므로
// 여기서 순서 검증까진 하지 않아도 안전하다.
export function reconcileTransportFromRest(
  doc: Y.Doc,
  dayIds: string[],
  restDays: BaseStop[][],
): void {
  doc.transact(() => {
    dayIds.forEach((_, dayIdx) => {
      const restStopsById = new Map((restDays[dayIdx] ?? []).map((stop) => [stop.id, stop]));
      if (restStopsById.size === 0) return;
      replaceItemsArray(doc, dayIdx, (stops) =>
        stops.map((stop) => {
          if (stop.transport !== undefined) return stop;
          const restStop = restStopsById.get(stop.id);
          if (!restStop?.transport) return stop;
          return {
            ...stop,
            transport: restStop.transport,
            recommendedTransport: restStop.recommendedTransport ?? stop.recommendedTransport,
          };
        }),
      );
    });
  });
}

// "days" 키를 이 모듈 밖으로 새어나가지 않게 감싼 observe 헬퍼.
export function observeYjsDays(doc: Y.Doc, callback: () => void): () => void {
  const daysArray = getDaysArray(doc);
  daysArray.observeDeep(callback);
  return () => daysArray.unobserveDeep(callback);
}

export function readStopsFromYjs(doc: Y.Doc): BaseStop[][] {
  return getDaysArray(doc)
    .toArray()
    .map((dayMap) => {
      const items = (dayMap.get("items") as Y.Array<Y.Map<unknown>>).toArray().map(fromItemMap);
      return rebuildTransport(items);
    });
}

export function addStop(doc: Y.Doc, dayIdx: number, stop: BaseStop): void {
  replaceItemsArray(doc, dayIdx, (stops) => [...stops, stop]);
}

export function deleteStop(doc: Y.Doc, dayIdx: number, itemId: string): void {
  replaceItemsArray(doc, dayIdx, (stops) => stops.filter((stop) => stop.id !== itemId));
}

export function updateStopTime(doc: Y.Doc, dayIdx: number, itemId: string, time: string): void {
  replaceItemsArray(doc, dayIdx, (stops) =>
    stops
      .map((stop) => (stop.id === itemId ? { ...stop, time, timeIsManual: true } : stop))
      .sort((a, b) => a.time.localeCompare(b.time)),
  );
}

export interface ShiftTimesResult {
  shiftedCount: number;
  cappedAtBoundary: boolean;
}

// 교통수단이 바뀌어서 소요시간이 달라지면, fromItemId 다음 스팟부터 그날 남은 스팟까지
// deltaMinutes만큼 시간을 민다. 사용자가 직접 시간을 정해둔 스팟(timeIsManual)을 만나거나
// boundaryMinutes(여행 종료 시간)를 넘기게 되면 그 지점에서 멈추고 이후는 건드리지 않는다.
export function shiftFollowingStopTimes(
  doc: Y.Doc,
  dayIdx: number,
  fromItemId: string,
  deltaMinutes: number,
  boundaryMinutes?: number,
): ShiftTimesResult {
  const result: ShiftTimesResult = { shiftedCount: 0, cappedAtBoundary: false };
  if (deltaMinutes === 0) return result;

  replaceItemsArray(doc, dayIdx, (stops) => {
    const fromIdx = stops.findIndex((stop) => stop.id === fromItemId);
    if (fromIdx === -1) return stops;

    let stillShifting = true;
    const next = stops.map((stop, idx) => {
      if (idx <= fromIdx || !stillShifting) return stop;
      if (stop.timeIsManual) {
        stillShifting = false;
        return stop;
      }

      const newMinutes = roundToNearest10(timeToMinutes(stop.time) + deltaMinutes);
      if (boundaryMinutes !== undefined && newMinutes > boundaryMinutes) {
        result.cappedAtBoundary = true;
        stillShifting = false;
        return stop;
      }

      result.shiftedCount += 1;
      return { ...stop, time: minutesToTime(newMinutes) };
    });

    return next.sort((a, b) => a.time.localeCompare(b.time));
  });

  return result;
}

// UpdateItemRequest엔 spotId가 없어 PATCH로 스팟 자체를 바꿀 수 없다 — 기존 REST 흐름과
// 동일하게 항목을 통째로 새 스팟으로 교체한다(같은 위치에서 삭제 후 재생성).
export function replaceStop(doc: Y.Doc, dayIdx: number, itemId: string, newStop: BaseStop): void {
  replaceItemsArray(doc, dayIdx, (stops) =>
    stops.map((stop) => (stop.id === itemId ? newStop : stop)),
  );
}

// REST에 반영되진 않는 로컬 전용 UI 상태(교통수단 선택, 인증완료 표시)지만, 같이 보고
// 있는 다른 피어에게도 실시간으로 보이도록 Yjs로는 반영한다.
export function updateStopTransport(
  doc: Y.Doc,
  dayIdx: number,
  itemId: string,
  transport: BaseStop["transport"],
): void {
  replaceItemsArray(doc, dayIdx, (stops) =>
    stops.map((stop) => (stop.id === itemId ? { ...stop, transport } : stop)),
  );
}

export function updateStopStatus(
  doc: Y.Doc,
  dayIdx: number,
  itemId: string,
  status: BaseStop["status"],
): void {
  replaceItemsArray(doc, dayIdx, (stops) =>
    stops.map((stop) => (stop.id === itemId ? { ...stop, status } : stop)),
  );
}

export function pushOptimizedOrder(doc: Y.Doc, dayIdx: number, stops: BaseStop[]): void {
  replaceItemsArray(doc, dayIdx, () => stops);
}

export function resolveTempId(doc: Y.Doc, dayIdx: number, tempId: string, realId: string): void {
  replaceItemsArray(doc, dayIdx, (stops) =>
    stops.map((stop) => (stop.id === tempId ? { ...stop, id: realId } : stop)),
  );
}

function getActivityLogArray(doc: Y.Doc): Y.Array<ActivityLogEntry> {
  return doc.getArray(ACTIVITY_LOG_KEY);
}

// "누가 뭘 했는지" 기록 — 데이터 mutation 함수와 분리해서 호출부(페이지)가 액션 종류를
// 직접 고르게 한다(같은 pushOptimizedOrder 호출도 AI 최적화/로그 불러오기처럼 문맥에 따라
// 다른 액션으로 기록해야 해서, mutation 함수 안에 액션을 못 박아두지 않는다).
export function logActivity(
  doc: Y.Doc,
  actorName: string,
  action: ActivityAction,
  placeName: string,
): void {
  doc.transact(() => {
    const log = getActivityLogArray(doc);
    log.push([{ id: crypto.randomUUID(), actorName, action, placeName, at: Date.now() }]);
    if (log.length > MAX_ACTIVITY_LOG) log.delete(0, log.length - MAX_ACTIVITY_LOG);
  });
}

export function readActivityLog(doc: Y.Doc): ActivityLogEntry[] {
  return getActivityLogArray(doc).toArray();
}

// transaction을 그대로 넘겨서(호출부가 transaction.local로 "내가 한 변경인지" 판단할 수
// 있게) — 로컬 변경까지 토스트로 띄우면 내가 한 행동에 내가 알림을 받는 꼴이 된다.
export function observeActivityLog(
  doc: Y.Doc,
  callback: (transaction: Y.Transaction) => void,
): () => void {
  const log = getActivityLogArray(doc);
  const wrapped = (_events: unknown, transaction: Y.Transaction) => callback(transaction);
  log.observe(wrapped);
  return () => log.unobserve(wrapped);
}
