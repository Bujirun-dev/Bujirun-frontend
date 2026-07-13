// 백엔드 일정(itinerary)엔 날짜만 저장되고 시작/종료 "시간"은 저장되지 않아서,
// 확정 시점에 고른 시작/종료 시간을 이 브라우저에 잠깐 저장해뒀다가
// 메인 일정 화면에서 첫날/마지막날 시간 제약에 참고한다.
const KEY_PREFIX = "bujirun_trip_time_";

export interface TripTimeBounds {
  startTime: string;
  endTime: string;
}

export function saveTripTimeBounds(itineraryId: string, startTime: string, endTime: string) {
  if (!itineraryId || !startTime || !endTime) return;
  try {
    window.localStorage.setItem(
      `${KEY_PREFIX}${itineraryId}`,
      JSON.stringify({ startTime, endTime }),
    );
  } catch {
    // localStorage 사용 불가 환경이면 조용히 무시 (시간 제약 없이 동작)
  }
}

export function getTripTimeBounds(itineraryId: string): TripTimeBounds | null {
  if (!itineraryId) return null;
  try {
    const raw = window.localStorage.getItem(`${KEY_PREFIX}${itineraryId}`);
    if (!raw) return null;
    return JSON.parse(raw) as TripTimeBounds;
  } catch {
    return null;
  }
}
