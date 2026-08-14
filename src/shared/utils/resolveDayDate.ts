// day.date가 없을 때 startAt + dayIdx(0-based, dayNumber 정렬 기준)로 대체 날짜를 계산한다.
// 백엔드가 특정 day의 date 필드를 비워서 내려주는 경우가 있어(관측된 버그) 대비용.
// 일정 탭(scheduleUtils)과 홈 탭(useTodayItinerary) 양쪽에서 같은 기준으로 써야
// 홈의 "오늘의 일정"과 일정 탭의 날짜 표시가 어긋나지 않는다.
export function resolveDayDate(
  rawDate: string | undefined,
  dayIdx: number,
  startAt?: string,
): string {
  if (rawDate) return rawDate;
  if (!startAt) return "";

  const [year, month, dayNum] = startAt.split("-").map(Number);
  if (!year || !month || !dayNum) return "";

  const fallbackDate = new Date(year, month - 1, dayNum + dayIdx);
  return [
    fallbackDate.getFullYear(),
    String(fallbackDate.getMonth() + 1).padStart(2, "0"),
    String(fallbackDate.getDate()).padStart(2, "0"),
  ].join("-");
}
