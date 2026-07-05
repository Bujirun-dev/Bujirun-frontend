import { apiClient } from "@/shared/api/client";
import type { OpResponse } from "@/shared/api/types";

export const keys = {
  all: ["collections"] as const,
  board: () => [...keys.all, "board"] as const,
  detail: (spotId: string) => [...keys.all, "detail", spotId] as const,
};

// 주의: 이 두 엔드포인트는 다른 API와 달리 공통 { success, message, data } envelope 없이
// 응답 바디를 그대로 내려준다 (백엔드 스펙 확인됨). unwrap하지 않는다.
export function getCollectionBoard() {
  return apiClient.get<OpResponse<"getBoard">>("/api/collections").then((res) => res.data);
}

export function getCollectionDetail(spotId: string) {
  return apiClient
    .get<OpResponse<"getDetail_1">>(`/api/collections/${spotId}`)
    .then((res) => res.data);
}

export function cancelCollection(spotId: string) {
  return apiClient.delete(`/api/collections/${spotId}`);
}
