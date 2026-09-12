import { itineraryApi } from "@/shared/api/domains";
import { getErrorMessage } from "@/shared/utils";
import type { BaseStop } from "@/features/itinerary/utils/scheduleUtils";

type DaySnapshotEntry = { spotId?: string; time: string; orderIndex: number };
export type DaySnapshot = Map<string, DaySnapshotEntry>;

export type AddedItem = Awaited<ReturnType<typeof itineraryApi.addItem>>;

export type FlushFailureKind = "add" | "update" | "reorder" | "delete";

// flush 중 끝까지 실패한 요청 하나. 예전엔 모든 실패를 catch에서 조용히 삼켰는데, 그러면
// 화면(Yjs)은 바뀐 값, DB는 옛 값으로 갈린 채 사용자에게 아무 표시도 없었고 새로고침하면
// 변경이 되돌아갔다. 호출부가 알림/재시도를 판단할 수 있게 실패를 그대로 돌려준다.
export interface FlushFailure {
  kind: FlushFailureKind;
  dayId: string;
  // reorder는 day 전체를 한 번에 보내므로 항목 정보가 없다.
  stopId?: string;
  placeName?: string;
  // 사용자에게 그대로 보여줄 수 있는 문구(백엔드 message가 있으면 그걸 우선).
  message: string;
  error: unknown;
}

const FAILURE_FALLBACK_MESSAGE: Record<FlushFailureKind, string> = {
  add: "일정 항목을 저장하지 못했어요.",
  update: "변경한 시각을 저장하지 못했어요.",
  reorder: "변경한 순서를 저장하지 못했어요.",
  delete: "삭제한 항목을 저장하지 못했어요.",
};

export function snapshotFromStops(stops: BaseStop[]): DaySnapshot {
  const snapshot: DaySnapshot = new Map();
  stops.forEach((stop, index) =>
    snapshot.set(stop.id, { spotId: stop.spotId, time: stop.time, orderIndex: index }),
  );
  return snapshot;
}

// Yjs의 현재 상태와 마지막으로 REST에 반영된 상태(snapshot)를 비교해 add/update/delete만
// 골라 호출한다. "저장 버튼 없음" 모델이라 매 액션마다가 아니라 이탈 시/합류 시 같은 정해진
// 시점에만 호출된다 — 액션마다 PATCH하면 동시편집 중 orderIndex가 서로 경합할 수 있어서,
// 병합된 최종 상태를 한 번에 반영하는 쪽이 안전하다.
//
// 순서(orderIndex)는 항목별 updateItem PATCH에 실어 보내지 않는다 — 그룹 일정에서 여러
// 클라이언트가 거의 동시에 flush하면, 항목별로 나뉜 PATCH들이 서로 뒤섞여 완료되면서 같은
// day에 order_index가 중복 저장되는 사고가 실제 프로덕션에서 발생했다(2026-08-12 확인).
// 대신 시간 등 필드만 항목별로 PATCH하고, 순서는 day의 최종 전체 순서를 reorderItems 한 번의
// 원자적 요청으로 반영한다.
//
// upsert는 항목을 앞에서부터 "순차로" 처리한다 — 새 항목 추가(addItem)를 병렬로 쏘면
// 백엔드가 "직전 스팟"을 저장 순서(먼저 커밋된 항목)로 잡아버려서, 실시간 편집으로 여러
// 곳을 빠르게 추가할 때 앞 항목의 교통수단 구간이 엉뚱하게 계산되고 배너가 안 뜨는
// 문제가 있었다. 순차로 처리하면 각 새 항목의 직전 스팟이 이미 저장돼 있어 구간이 맞다.
//
// 실패한 요청은 snapshot을 갱신하지 않는다(= 다음 flush에서 다시 대상이 된다). 그게 재시도의
// 유일한 근거이므로 절대 "성공한 것처럼" 갱신하지 말 것. 그리고 끝까지 실패한 요청은
// 반환값(FlushFailure[])으로 알린다 — 조용히 삼키면 호출부가 재시도도, 안내도 할 수 없다.
export async function flushDayToRest(
  itineraryId: string,
  dayId: string,
  currentStops: BaseStop[],
  snapshot: DaySnapshot,
  onIdResolved: (tempId: string, realId: string) => void,
  // 새 항목이 저장되면서 백엔드가 계산해준 (직전 스팟 → 새 항목) 구간 정보를 넘긴다.
  // 호출부가 직전 스팟의 교통수단 배너를 바로 채우는 데 쓴다.
  onLegComputed?: (prevStopId: string, addedItem: AddedItem) => void,
): Promise<FlushFailure[]> {
  const failures: FlushFailure[] = [];
  const recordFailure = (
    kind: FlushFailureKind,
    error: unknown,
    stopId?: string,
    placeName?: string,
  ) => {
    failures.push({
      kind,
      dayId,
      stopId,
      placeName,
      message: getErrorMessage(error, FAILURE_FALLBACK_MESSAGE[kind]),
      error,
    });
  };

  const currentIds = new Set(currentStops.map((stop) => stop.id));
  const idsToDelete = [...snapshot.keys()].filter((id) => !currentIds.has(id));

  const deletions = idsToDelete.map((id) =>
    itineraryApi
      .deleteItem(itineraryId, dayId, id)
      .then(() => snapshot.delete(id))
      .catch((error: unknown) => recordFailure("delete", error, id)),
  );
  await Promise.allSettled(deletions);

  // currentStops와 같은 길이로 위치별 실제(real) id를 채워나간다. 새 항목은 추가 API가
  // 끝나야 real id를 알 수 있고, 실패하면 해당 위치는 null로 남아 이번 flush의 순서
  // 반영에서 빠진다(다음 flush 때 temp- id 그대로 재시도됨).
  const resolvedIds: (string | null)[] = new Array(currentStops.length).fill(null);
  // 삭제/추가처럼 order_index에 "구멍"을 만드는 구조 변경이 있었는지 — 있었다면 순서가
  // 겉보기엔(상대 순서 기준) 안 바뀌었어도 reorder를 반드시 호출해야 한다. 그렇지 않으면
  // 다음에 추가되는 항목이 삭제로 비어버린 order_index 값을 다시 사용하게 되면서 기존
  // 항목과 order_index가 충돌한다(실제로 로컬 브라우저 테스트에서 재현 확인, 2026-08-13).
  let hasStructuralChange = idsToDelete.length > 0;
  // 시각 PATCH가 실패한 항목들. 이번 pass가 다 끝난 뒤 딱 한 번 더 시도한다 — 백엔드가
  // "같은 날 같은 시각"을 거부하기 때문에(ItineraryService.validateArrivalTimeAvailable),
  // A(10:00)→12:00 / B(12:00)→14:00처럼 서로 자리를 밀어내는 변경은 앞 항목의 PATCH가
  // 먼저 400을 맞는다. B까지 반영된 뒤 다시 보내면 그대로 성공하므로, 이 한 번의 추가
  // pass로 대부분이 해결된다(그래도 실패하면 snapshot을 그대로 둔 채 호출부에 알린다).
  const timeRetryTargets: { stop: BaseStop; index: number }[] = [];

  for (let index = 0; index < currentStops.length; index += 1) {
    const stop = currentStops[index];

    if (stop.id.startsWith("temp-")) {
      if (!stop.spotId) continue;
      try {
        const newItem = await itineraryApi.addItem(itineraryId, dayId, {
          spotId: stop.spotId,
          arrivalTime: stop.time,
          orderIndex: index,
        });
        if (newItem?.id) {
          onIdResolved(stop.id, newItem.id);
          resolvedIds[index] = newItem.id;
          snapshot.set(newItem.id, { spotId: stop.spotId, time: stop.time, orderIndex: index });
          hasStructuralChange = true;
          const prevStopId = index > 0 ? resolvedIds[index - 1] : null;
          if (prevStopId) onLegComputed?.(prevStopId, newItem);
        }
      } catch (error) {
        // 다음 flush 시점에 temp- id 그대로 재시도됨
        recordFailure("add", error, stop.id, stop.placeName);
      }
      continue;
    }

    resolvedIds[index] = stop.id;
    const prev = snapshot.get(stop.id);
    if (prev && prev.time === stop.time) continue;

    try {
      await itineraryApi.updateItem(itineraryId, dayId, stop.id, { arrivalTime: stop.time });
      snapshot.set(stop.id, {
        spotId: stop.spotId,
        time: stop.time,
        orderIndex: prev?.orderIndex ?? index,
      });
    } catch {
      // 바로 실패로 확정하지 않고 아래 재시도 pass로 넘긴다(중복 시각 400이 대부분이라,
      // 나머지 항목이 반영된 뒤엔 성공한다). snapshot은 일부러 손대지 않는다.
      timeRetryTargets.push({ stop, index });
    }
  }

  // 재시도는 딱 이 한 pass로 끝낸다 — 더 돌리면 재시도해도 절대 성공하지 않는 실패(잘못된
  // 값으로 인한 400 등)에 대해 같은 요청을 무한히 두드리게 된다.
  for (const { stop, index } of timeRetryTargets) {
    const prev = snapshot.get(stop.id);
    try {
      await itineraryApi.updateItem(itineraryId, dayId, stop.id, { arrivalTime: stop.time });
      snapshot.set(stop.id, {
        spotId: stop.spotId,
        time: stop.time,
        orderIndex: prev?.orderIndex ?? index,
      });
    } catch (error) {
      recordFailure("update", error, stop.id, stop.placeName);
    }
  }

  const orderedRealIds = resolvedIds.filter((id): id is string => id !== null);
  if (orderedRealIds.length === 0) return failures;

  const prevOrder = [...snapshot.entries()]
    .filter(([id]) => orderedRealIds.includes(id))
    .sort((a, b) => a[1].orderIndex - b[1].orderIndex)
    .map(([id]) => id);
  const orderChanged =
    orderedRealIds.length !== prevOrder.length ||
    orderedRealIds.some((id, i) => id !== prevOrder[i]);

  if (!orderChanged && !hasStructuralChange) return failures;

  try {
    await itineraryApi.reorderItems(itineraryId, dayId, orderedRealIds);
    orderedRealIds.forEach((id, index) => {
      const entry = snapshot.get(id);
      if (entry) entry.orderIndex = index;
    });
  } catch (error) {
    // snapshot의 orderIndex를 갱신하지 않으므로 다음 flush 시점에 다시 reorder 대상이 된다.
    recordFailure("reorder", error, undefined, undefined);
  }

  return failures;
}
