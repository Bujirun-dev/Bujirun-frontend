import { apiClient } from "@/shared/api/client";
import { unwrap } from "@/shared/api/response";
import type { OpBody, OpResponse } from "@/shared/api/types";

// 스와이프(좋아요/싫어요) 결과를 세션 단위로 저장. groupId를 함께 보내야
// 그룹 일정 자동생성(/api/itineraries/group/{groupId}/generate)의 취합 대상이 된다.
export function submitSwipes(body: OpBody<"submit">) {
  return apiClient.post<OpResponse<"submit">>("/api/swipes", body).then((res) => unwrap(res));
}
