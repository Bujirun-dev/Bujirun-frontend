import { isAxiosError } from "axios";

// 백엔드 message에 내부 식별자가 붙어 오는 경우가 있다
// (예: "항목을 찾을 수 없습니다. id=5201d714-de75-4f11-9791-d009b41301b6").
// UUID는 사용자에게 아무 의미가 없고 토스트만 길어지므로 문구에서 떼고 보여준다.
const LABELED_ID_PATTERN = /[,.]?\s*\(?\bid\s*[:=]\s*[0-9a-f-]{8,}\)?/gi;
const BARE_UUID_PATTERN =
  /[,.]?\s*\(?\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b\)?/gi;

// 백엔드 공통 응답 envelope({ success, message, data })의 message를 최대한 살려서 보여준다.
// 서버가 구체적인 사유(예: "그룹당 일정은 하나만 만들 수 있습니다")를 내려줄 때
// 화면이 고정 문구로 덮어버리지 않도록 공용으로 뽑아 쓴다.
export function getErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) return fallback;

  const raw = error.response?.data?.message;
  if (typeof raw !== "string") return fallback;

  const cleaned = raw.replace(LABELED_ID_PATTERN, "").replace(BARE_UUID_PATTERN, "").trim();
  // 서버가 message를 빈 문자열로 내려줄 때가 있다. 그대로 통과시키면 화면에 아무 글자도
  // 없는 토스트가 떠서 "왜 떴는지 알 수 없는 빨간 줄"만 남는다 — 그럴 땐 fallback을 쓴다.
  return cleaned || fallback;
}
