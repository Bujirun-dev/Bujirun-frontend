import { itineraryApi } from "@/shared/api/domains";
import type { BaseStop } from "@/features/itinerary/utils/scheduleUtils";

type DaySnapshotEntry = { spotId?: string; time: string; orderIndex: number };
export type DaySnapshot = Map<string, DaySnapshotEntry>;

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
export async function flushDayToRest(
  itineraryId: string,
  dayId: string,
  currentStops: BaseStop[],
  snapshot: DaySnapshot,
  onIdResolved: (tempId: string, realId: string) => void,
): Promise<void> {
  const currentIds = new Set(currentStops.map((stop) => stop.id));

  const deletions = [...snapshot.keys()]
    .filter((id) => !currentIds.has(id))
    .map((id) =>
      itineraryApi
        .deleteItem(itineraryId, dayId, id)
        .then(() => snapshot.delete(id))
        .catch(() => {}),
    );

  const upserts = currentStops.map(async (stop, index) => {
    if (stop.id.startsWith("temp-")) {
      if (!stop.spotId) return;
      try {
        const newItem = await itineraryApi.addItem(itineraryId, dayId, {
          spotId: stop.spotId,
          arrivalTime: stop.time,
          orderIndex: index,
        });
        if (newItem?.id) {
          onIdResolved(stop.id, newItem.id);
          snapshot.set(newItem.id, { spotId: stop.spotId, time: stop.time, orderIndex: index });
        }
      } catch {
        // 다음 flush 시점에 temp- id 그대로 재시도됨
      }
      return;
    }

    const prev = snapshot.get(stop.id);
    if (prev && prev.time === stop.time && prev.orderIndex === index) return;

    try {
      await itineraryApi.updateItem(itineraryId, dayId, stop.id, {
        arrivalTime: stop.time,
        orderIndex: index,
      });
      snapshot.set(stop.id, { spotId: stop.spotId, time: stop.time, orderIndex: index });
    } catch {
      // 다음 flush 시점에 재시도됨
    }
  });

  await Promise.allSettled([...deletions, ...upserts]);
}
