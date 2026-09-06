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

// status(방문인증 완료 여부)는 일부러 여기서 빼고 저장한다 — 이건 "나"의 인증 여부라
// 개인마다 달라야 하는데, 다른 필드처럼 Y.Map에 넣으면 그룹 전원이 보는 하나의 값으로
// 합쳐져서 한 명만 인증해도 전원 화면에 "완료"로 보이는 문제가 있었다(2026-08-25).
// 그래서 status는 Yjs 문서(공유 상태)에 아예 안 실어 보내고, 각자 클라이언트가 로컬에서만
// 들고 있는다 — useCollaborativeItinerary의 completedStopIds 참고.
const LOCAL_ONLY_FIELDS = new Set(["status"]);

// transport는 그대로 저장하되, from/to 라벨은 읽을 때마다 rebuildTransport()로
// 인접 스톱의 현재 placeName 기준으로 다시 계산한다(가운데 스톱이 바뀌어도 라벨이
// 낡지 않게). type/durationMin/cost 같은 "선택값"만 저장된 값을 그대로 이어받는다.
function toItemMap(stop: BaseStop): Y.Map<unknown> {
  const map = new Y.Map<unknown>();
  Object.entries(stop).forEach(([key, value]) => {
    if (value !== undefined && !LOCAL_ONLY_FIELDS.has(key)) map.set(key, value);
  });
  return map;
}

function fromItemMap(map: Y.Map<unknown>): BaseStop {
  const stop = map.toJSON() as Omit<BaseStop, "status"> & { status?: unknown };
  // status는 로컬 전용 필드라 여기서도 무시한다 — 이 필드를 공유 문서에 실어보내던
  // 예전 버전이 만들어둔 room엔 아직 "status":"completed" 같은 값이 남아있을 수 있는데,
  // 그걸 그대로 읽어버리면 옛날 버그(팀 전체 공유)가 재발한다.
  delete stop.status;
  return stop as BaseStop;
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

function findItemIndex(items: Y.Array<Y.Map<unknown>>, itemId: string): number {
  return items.toArray().findIndex((map) => map.get("id") === itemId);
}

// a, b 공통으로 등장하는 id 중 "양쪽에서 같은 상대 순서를 유지하는" 가장 긴 부분수열을
// 구한다 — 재정렬 시 실제로 위치가 안 바뀐(=이 부분수열에 속한) 항목을 가려내기 위함.
function longestCommonSubsequenceIds(a: string[], b: string[]): Set<string> {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i += 1) {
    for (let j = 1; j <= m; j += 1) {
      dp[i][j] =
        a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const result = new Set<string>();
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result.add(a[i - 1]);
      i -= 1;
      j -= 1;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i -= 1;
    } else {
      j -= 1;
    }
  }
  return result;
}

// map의 필드를 stop 기준으로 다시 채운다(stop에 없는 키는 지움) — Y.Map 인스턴스는 그대로
// 유지한 채 필드만 갱신하므로, 같은 항목의 다른 필드를 동시에 건드리는 변경과 안전하게 병합된다.
function applyStopFields(map: Y.Map<unknown>, stop: BaseStop): void {
  const nextEntries = Object.entries(stop).filter(
    ([key, value]) => value !== undefined && !LOCAL_ONLY_FIELDS.has(key),
  );
  const nextKeys = new Set(nextEntries.map(([key]) => key));
  Array.from(map.keys()).forEach((key) => {
    if (!nextKeys.has(key) && !LOCAL_ONLY_FIELDS.has(key)) map.delete(key);
  });
  nextEntries.forEach(([key, value]) => map.set(key, value));
}

// 순서를 바꾸는 연산(시간순 재정렬 등) 전용. mutate가 돌려주는 "목표 배열"을 현재 배열과 id
// 기준 LCS로 비교해서, 실제로 위치가 바뀐 항목만 새 Y.Map으로 만들어 delete+insert하고
// 나머지는 건드리지 않는다(내용만 바뀐 항목은 Y.Map 인스턴스를 유지한 채 필드만 patch).
//
// Yjs는 한 번 문서에 통합된 shared type(Y.Map)을 삭제 후 재삽입할 수 없어서(실제로 에러 발생
// 확인함), 위치가 바뀌는 항목 자체는 새 인스턴스로 다시 만들 수밖에 없다. 하지만 "위치가 안
// 바뀐 나머지 항목"까지 전부 다시 만들 필요는 없다 — 예전엔 배열 전체를 delete(0,len)+
// push(전체)로 다시 써서, 두 피어가 동시에(서로의 변경을 아직 모른 채) 같은 day에서 이
// 함수를 호출하면 각자 계산한 "배열 전체"가 서로 모르는 별개의 삽입으로 병합되어 항목이
// 통째로 중복되는 버그가 있었다(재현 확인 후 이 방식으로 교체). 지금은 실제로 이동하는
// 항목의 개수만큼만 delete/insert가 일어나므로, 동시에 다른 항목을 건드리는 변경(추가/삭제/
// 필드수정)과 충돌 범위가 훨씬 좁아진다.
function replaceItemsArray(
  doc: Y.Doc,
  dayIdx: number,
  mutate: (stops: BaseStop[]) => BaseStop[],
  options: { allowNewIds?: boolean } = {},
): void {
  doc.transact(() => {
    const items = getItemsArray(doc, dayIdx);
    if (!items) return;
    const currentMaps = items.toArray();
    const currentIds = currentMaps.map((map) => map.get("id") as string);
    const nextStops = mutate(currentMaps.map(fromItemMap));
    const nextById = new Map(nextStops.map((stop) => [stop.id, stop]));
    // 동시에 다른 피어가 지운 항목은 currentIds에 이미 없으니 여기서 자동으로 걸러진다.
    // 단, mutate가 현재 배열의 부분집합/순열이 아니라 애초에 한 번도 존재한 적 없는 새
    // id의 항목들을 통째로 돌려주는 경우(로그 불러오기 등, allowNewIds:true)엔 이 필터를
    // 적용하면 안 된다 — 전부 "현재 배열에 없는 id"로 걸러져 day가 통째로 비어버린다.
    const nextIds = options.allowNewIds
      ? nextStops.map((stop) => stop.id)
      : nextStops.map((stop) => stop.id).filter((id) => currentIds.includes(id));

    const anchorIds = longestCommonSubsequenceIds(currentIds, nextIds);

    // 1) 위치가 그대로인 항목은 내용만 patch (Y.Map 인스턴스 유지, 배열 구조는 안 건드림)
    currentMaps.forEach((map) => {
      const id = map.get("id") as string;
      if (!anchorIds.has(id)) return;
      const nextStop = nextById.get(id);
      if (nextStop) applyStopFields(map, nextStop);
    });

    // 2) 위치가 바뀐 항목만 제거 (뒤에서부터 지워야 인덱스가 안 꼬임)
    for (let idx = currentMaps.length - 1; idx >= 0; idx -= 1) {
      const id = currentMaps[idx].get("id") as string;
      if (!anchorIds.has(id)) items.delete(idx, 1);
    }

    // 3) 목표 순서(nextIds)를 따라가며, 이동 대상만 새 Y.Map으로 제자리에 삽입
    let cursor = 0;
    nextIds.forEach((id) => {
      if (anchorIds.has(id)) {
        cursor += 1;
        return;
      }
      const nextStop = nextById.get(id);
      if (nextStop) {
        items.insert(cursor, [toItemMap(nextStop)]);
        cursor += 1;
      }
    });
  });
}

// 항목 하나만 찾아서 그 Y.Map을 직접 mutate한다(배열 전체를 건드리지 않음) — 동시에 다른
// 항목이 추가/삭제돼도 서로 간섭하지 않는다. 대상이 이미 지워졌으면(동시 삭제) 조용히 무시.
function mutateStopById(
  doc: Y.Doc,
  dayIdx: number,
  itemId: string,
  mutate: (map: Y.Map<unknown>) => void,
): void {
  doc.transact(() => {
    const items = getItemsArray(doc, dayIdx);
    if (!items) return;
    const idx = findItemIndex(items, itemId);
    if (idx === -1) return;
    mutate(items.get(idx));
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

// 완전히 새 일정(아무도 연 적 없는 room)에 두 명 이상이 정확히 동시에 처음 접속하면, 서로의
// 존재를 모른 채 둘 다 "문서가 비어있다"고 판단해 seedYjsDays를 각자 실행해서 day 전체가
// 통째로 중복될 수 있다(재현 확인함) — Yjs엔 "동시 생성" 자체를 막는 락이 없어서 이건 근본적
// 으로 못 막는다. 대신 병합된 뒤에 dayId 기준으로 중복을 찾아 지운다: 병합 후 배열의 순서는
// 모든 피어에서 동일하므로(Y.Array의 CRDT 전체 순서 보장), 각자 독립적으로 "처음 나온
// dayId만 남기고 이후 중복은 지운다"를 계산해도 모든 피어가 정확히 같은 결론을 내려서
// 안전하게 수렴한다(삭제 연산 자체도 멱등이라 여러 피어가 동시에 같은 중복을 지워도 안전).
function dedupeDaysById(doc: Y.Doc): void {
  const daysArray = getDaysArray(doc);
  const seenIds = new Set<string>();
  const duplicateIndexes: number[] = [];
  daysArray.toArray().forEach((dayMap, idx) => {
    const dayId = dayMap.get("dayId") as string;
    if (seenIds.has(dayId)) duplicateIndexes.push(idx);
    else seenIds.add(dayId);
  });
  if (duplicateIndexes.length === 0) return;
  doc.transact(() => {
    // 뒤에서부터 지워야 앞쪽 인덱스가 안 꼬인다.
    duplicateIndexes
      .slice()
      .reverse()
      .forEach((idx) => daysArray.delete(idx, 1));
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
      const items = getItemsArray(doc, dayIdx);
      if (!items) return;
      items.toArray().forEach((map) => {
        if (map.get("transport") !== undefined) return;
        const restStop = restStopsById.get(map.get("id") as string);
        if (!restStop?.transport) return;
        map.set("transport", restStop.transport);
        if (restStop.recommendedTransport !== undefined) {
          map.set("recommendedTransport", restStop.recommendedTransport);
        }
      });
    });
  });
}

// "days" 키를 이 모듈 밖으로 새어나가지 않게 감싼 observe 헬퍼. 매 변화마다 dayId 중복부터
// 정리한 뒤(동시 최초시딩 경합 대비, dedupeDaysById 주석 참고) 콜백을 부른다 — 정리할 게
// 있었다면 그 삭제 트랜잭션이 이 observer를 한 번 더 재귀 호출하지만, 두 번째 패스는 지울 게
// 없어 바로 종료되므로 무한루프로 이어지지 않는다.
export function observeYjsDays(doc: Y.Doc, callback: () => void): () => void {
  const daysArray = getDaysArray(doc);
  const handler = () => {
    dedupeDaysById(doc);
    callback();
  };
  daysArray.observeDeep(handler);
  return () => daysArray.unobserveDeep(handler);
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
  doc.transact(() => {
    const items = getItemsArray(doc, dayIdx);
    if (!items) return;
    items.push([toItemMap(stop)]);
  });
}

export function deleteStop(doc: Y.Doc, dayIdx: number, itemId: string): void {
  doc.transact(() => {
    const items = getItemsArray(doc, dayIdx);
    if (!items) return;
    const idx = findItemIndex(items, itemId);
    if (idx === -1) return;
    items.delete(idx, 1);
  });
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

    // 여기서 시간순으로 재정렬하면 안 된다 — 배열 순서(next)는 "방문 순서" 그 자체라
    // toStopId 기반 transport(rebuildTransport)와 이후 로직 전체가 이 순서를 전제로
    // 한다. 시간만 밀렸을 뿐인데(예: 중간에 timeIsManual 스팟이 있어 그 뒤는 안 밀리고
    // 앞쪽만 밀린 경우) 시간순 정렬을 하면 방문 순서 자체가 뒤바뀌어서, 바뀐 위치마다
    // toStopId가 실제 다음 스팟과 안 맞게 되고 그 구간의 transport가 연쇄로 비워지는
    // 버그가 있었다(2026-09-03). 방문 순서는 사용자가 명시적으로 재배치할 때만
    // (드래그 재정렬/최적화) 바뀌어야 한다.
    return next;
  });

  return result;
}

// UpdateItemRequest엔 spotId가 없어 PATCH로 스팟 자체를 바꿀 수 없다 — 기존 REST 흐름과
// 동일하게 항목을 통째로 새 스팟으로 교체한다(같은 위치에서 삭제 후 재생성).
export function replaceStop(doc: Y.Doc, dayIdx: number, itemId: string, newStop: BaseStop): void {
  mutateStopById(doc, dayIdx, itemId, (map) => applyStopFields(map, newStop));
}

// REST에 반영되진 않는 로컬 전용 UI 상태(교통수단 선택)지만, 같이 보고 있는 다른
// 피어에게도 실시간으로 보이도록 Yjs로는 반영한다. (인증완료 표시는 이제 여기 포함되지
// 않음 — 개인마다 달라야 해서 useCollaborativeItinerary의 로컬 state로만 관리한다.)
export function updateStopTransport(
  doc: Y.Doc,
  dayIdx: number,
  itemId: string,
  transport: BaseStop["transport"],
): void {
  mutateStopById(doc, dayIdx, itemId, (map) => {
    if (transport === undefined) map.delete("transport");
    else map.set("transport", transport);
  });
}

// 새로 추가된 항목의 백엔드 계산 교통정보(직전 스팟 → 새 항목 구간)를 그 직전 스톱의
// 배너로 바로 채운다. 실시간 편집으로 관광지를 추가하면 다음 리마운트 전까지는 REST
// 재조회/reconcile이 안 돌아서 배너가 안 뜨던 문제 대응.
// 사용자가 직접 고른 값(같은 다음-스팟 기준)은 덮어쓰지 않되, 그 사이 다른 스팟이 끼어들어
// 낡아버린 값(toStopId 불일치)은 새로 계산된 값으로 교체한다.
export function applyComputedTransport(
  doc: Y.Doc,
  prevStopId: string,
  nextStopId: string,
  transport: NonNullable<BaseStop["transport"]>,
): void {
  doc.transact(() => {
    getDaysArray(doc)
      .toArray()
      .forEach((dayMap) => {
        const items = dayMap.get("items") as Y.Array<Y.Map<unknown>> | undefined;
        if (!items) return;
        const idx = findItemIndex(items, prevStopId);
        if (idx === -1) return;
        const map = items.get(idx);
        const existing = map.get("transport") as BaseStop["transport"] | undefined;
        if (existing && existing.toStopId === nextStopId) return;
        map.set("transport", transport);
        map.set("recommendedTransport", transport);
      });
  });
}

export function pushOptimizedOrder(doc: Y.Doc, dayIdx: number, stops: BaseStop[]): void {
  replaceItemsArray(doc, dayIdx, () => stops);
}

// 로그 불러오기 전용. pushOptimizedOrder는 "현재 day의 기존 항목을 재정렬"하는 용도라
// nextStops의 id가 현재 배열에 이미 있어야 하는데(그래야 동시 삭제된 항목을 되살리지
// 않을 수 있음), 로그 불러오기는 애초에 한 번도 존재한 적 없는 새 id의 항목들로 day를
// 통째로 갈아끼우는 것이라 그 필터를 걸면 전부 걸러져서 day가 완전히 비어버린다
// (2026-08-23 실서버 테스트로 재현·확인됨). allowNewIds:true로 그 필터만 건너뛴다.
export function replaceStopsWithImportedLog(doc: Y.Doc, dayIdx: number, stops: BaseStop[]): void {
  replaceItemsArray(doc, dayIdx, () => stops, { allowNewIds: true });
}

export function resolveTempId(doc: Y.Doc, dayIdx: number, tempId: string, realId: string): void {
  mutateStopById(doc, dayIdx, tempId, (map) => map.set("id", realId));
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
