import * as Y from "yjs";
import type { BaseStop } from "@/features/itinerary/utils/scheduleUtils";
import { rebuildTransport } from "@/features/itinerary/utils/scheduleUtils";

const DAYS_KEY = "days";
const META_KEY = "meta";

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
      .map((stop) => (stop.id === itemId ? { ...stop, time } : stop))
      .sort((a, b) => a.time.localeCompare(b.time)),
  );
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
