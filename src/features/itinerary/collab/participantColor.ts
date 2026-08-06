// Tailwind는 `bg-${color}`처럼 런타임에 조립한 클래스명은 스캔하지 못한다(빌드 시 정적
// 문자열만 인식) — 색상별 완성된 클래스명을 리터럴로 나열해두고 그대로 반환한다.
const PARTICIPANT_COLOR_CLASSES = [
  "bg-sub-deepblue",
  "bg-sub-lightblue",
  "bg-sub-pink",
  "bg-sub-green",
  "bg-sub-violet",
  "bg-sub-coral",
] as const;

function hashToIndex(userId: string): number {
  let hash = 0;
  for (const ch of userId) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return hash % PARTICIPANT_COLOR_CLASSES.length;
}

// 그룹 최대 인원(6명)이 팔레트 색상 수와 같아서, 이미 접속해있는 다른 사람들이 쓰는
// 색은 피해서 배정하면 동시 접속자끼리는 겹치지 않는다. 선호 순서는 해시값에서 시작해
// 같은 유저는 계속 비슷한 색을 유지하려 하되, 이미 사용 중이면 다음 색으로 넘어간다.
export function pickAvailableParticipantColorClass(
  userId: string,
  takenClasses: Iterable<string>,
): string {
  const taken = new Set(takenClasses);
  const start = hashToIndex(userId);
  for (let i = 0; i < PARTICIPANT_COLOR_CLASSES.length; i++) {
    const candidate = PARTICIPANT_COLOR_CLASSES[(start + i) % PARTICIPANT_COLOR_CLASSES.length];
    if (!taken.has(candidate)) return candidate;
  }
  return PARTICIPANT_COLOR_CLASSES[start];
}
