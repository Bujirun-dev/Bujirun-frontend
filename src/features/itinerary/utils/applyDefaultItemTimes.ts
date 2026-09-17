import * as itineraryApi from "@/shared/api/domains/itinerary";
import type { components } from "@/shared/api/schema";

import {
  getDefaultDayMinutes,
  minutesToTime,
  normalizeTime,
  timeToMinutes,
  toHourMinute,
} from "./scheduleUtils";

type ItineraryDetailResponse = components["schemas"]["ItineraryDetailResponse"];

const LAST_SLOT_OF_DAY = 23 * 60 + 50;

// 확정 직후 일정의 도착 시각을 우리 규칙(3시간 간격)으로 한 번 덮어쓴다.
//
// 백엔드는 확정 시 체류시간+이동시간을 누적해 시각을 채우는데(둘째 날부터는 09:00 시작),
// 간격이 촘촘해 일정이 오전에 몰려 보인다. 화면에서만 다시 계산하면 저장값과 계속 갈리고
// (사용자가 고친 시각까지 매번 덮어써야 해서) 편집한 값이 사라지므로, 확정 직후 딱 한 번
// 저장까지 해둔다 — 그 뒤로는 저장된 시각이 그대로 쓰이니 사용자의 편집이 유지된다.
export async function applyDefaultItemTimes(itineraryId: string): Promise<void> {
  const detail = (await itineraryApi.getItinerary(itineraryId)) as ItineraryDetailResponse;
  const bounds = {
    startTime: toHourMinute(detail.startTime) ?? "",
    endTime: toHourMinute(detail.endTime) ?? "",
  };

  const days = [...(detail.days ?? [])].sort((a, b) => (a.dayNumber ?? 0) - (b.dayNumber ?? 0));

  for (const [dayIdx, day] of days.entries()) {
    const dayId = day.id;
    if (!dayId) continue;
    const items = [...(day.items ?? [])].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    const target = getDefaultDayMinutes(dayIdx, days.length, items.length, bounds);

    // 같은 날 같은 시각은 백엔드가 400으로 막는다(ItineraryService.validateArrivalTimeAvailable).
    // 아직 안 고친 항목이 쓰고 있는 시각으로는 옮길 수 없으므로, 비어 있는 시각부터 차례로
    // 옮기고 서로 자리를 맞바꿔야 하는 경우에만 빈 슬롯에 잠깐 피신시킨다.
    const current = new Map<string, number | undefined>(
      items.map((item, idx) => [
        item.id ?? String(idx),
        item.arrivalTime ? timeToMinutes(normalizeTime(item.arrivalTime)) : undefined,
      ]),
    );
    const pending = items
      .map((item, idx) => ({ id: item.id ?? "", want: target[idx] }))
      .filter(
        (entry) => entry.id && entry.want !== undefined && current.get(entry.id) !== entry.want,
      );

    const isTaken = (minute: number, exceptId: string) =>
      [...current.entries()].some(([id, taken]) => id !== exceptId && taken === minute);

    const patch = async (id: string, minute: number) => {
      await itineraryApi.updateItem(itineraryId, dayId, id, { arrivalTime: minutesToTime(minute) });
      current.set(id, minute);
    };

    while (pending.length > 0) {
      const freeIdx = pending.findIndex((entry) => !isTaken(entry.want!, entry.id));
      if (freeIdx >= 0) {
        const [entry] = pending.splice(freeIdx, 1);
        await patch(entry.id, entry.want!);
        continue;
      }
      // 전부 서로의 자리를 원하는 상태 — 하나를 빈 슬롯으로 비켜 두면 사슬이 풀린다.
      const stuck = pending[0];
      let parking = LAST_SLOT_OF_DAY;
      while (parking > 0 && isTaken(parking, stuck.id)) parking -= 10;
      await patch(stuck.id, parking);
    }
  }
}
