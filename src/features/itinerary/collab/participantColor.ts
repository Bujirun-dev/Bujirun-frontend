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

// 그룹 최대 인원(6명)이 팔레트 색상 수와 같아서, 이미 접속해있는 다른 사람들이 쓰는
// 색을 뺀 나머지 중에서 랜덤으로 뽑으면 동시 접속자끼리는 겹치지 않는다.
export function pickAvailableParticipantColorClass(takenClasses: Iterable<string>): string {
  const taken = new Set(takenClasses);
  const available = PARTICIPANT_COLOR_CLASSES.filter((c) => !taken.has(c));
  const pool = available.length > 0 ? available : PARTICIPANT_COLOR_CLASSES;
  return pool[Math.floor(Math.random() * pool.length)];
}
