const SKIPPED_REVIEW_KEY = "bujirun_skipped_review_itinerary_ids";

// 완료된 여행 일정에 대한 영수증 발행 팝업(/home/review)을 "취소"로 닫으면 여기 기록해서,
// 로그가 아직 없다는 이유로 다음 홈 진입 때 같은 팝업으로 다시 튕겨 들어오지 않게 한다
// (TodayItinerary.tsx의 자동 리다이렉트 useEffect가 이 목록을 참고). 아직 이 화면 말고는
// 영수증 발행을 다시 시작할 수동 진입로가 없어서, 한 번 스킵한 일정은 로그를 만들기 전까지
// 계속 이 목록에 남는다 — 수동 발급 버튼이 추가되면 그쪽에서 다시 시도할 수 있다.
function readSkippedIds(): string[] {
  const raw = window.localStorage.getItem(SKIPPED_REVIEW_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function isReviewSkipped(itineraryId: string): boolean {
  return readSkippedIds().includes(itineraryId);
}

export function skipReview(itineraryId: string): void {
  const ids = readSkippedIds();
  if (ids.includes(itineraryId)) return;
  window.localStorage.setItem(SKIPPED_REVIEW_KEY, JSON.stringify([...ids, itineraryId]));
}
