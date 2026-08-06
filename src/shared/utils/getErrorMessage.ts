import { isAxiosError } from "axios";

// 백엔드 공통 응답 envelope({ success, message, data })의 message를 최대한 살려서 보여준다.
// 서버가 구체적인 사유(예: "그룹당 일정은 하나만 만들 수 있습니다")를 내려줄 때
// 화면이 고정 문구로 덮어버리지 않도록 공용으로 뽑아 쓴다.
export function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error) && typeof error.response?.data?.message === "string") {
    return error.response.data.message;
  }
  return fallback;
}
