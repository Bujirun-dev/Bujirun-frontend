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

// userId를 해시해 팔레트 중 하나를 결정적으로 배정한다 — 같은 유저는 항상 같은 색.
export function getParticipantColorClass(userId: string): string {
  let hash = 0;
  for (const ch of userId) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return PARTICIPANT_COLOR_CLASSES[hash % PARTICIPANT_COLOR_CLASSES.length];
}
