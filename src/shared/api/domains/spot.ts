import { apiClient } from "@/shared/api/client";
import type { OpQuery, OpResponse } from "@/shared/api/types";

export const keys = {
  all: ["spots"] as const,
  search: (query?: OpQuery<"search">) => [...keys.all, "search", query ?? {}] as const,
  detail: (spotId: string) => [...keys.all, "detail", spotId] as const,
};

// 공통 envelope 없이 배열을 그대로 내려준다 (백엔드 스펙 확인됨)
export function searchSpots(query?: OpQuery<"search">) {
  return apiClient
    .get<OpResponse<"search">>("/api/spots/search", { params: query })
    .then((res) => res.data);
}

// 관광지 단건 조회 - envelope 없이 SpotDetailResponse 직접 반환
export function getSpot(spotId: string) {
  return apiClient.get<OpResponse<"getDetail_1">>(`/api/spots/${spotId}`).then((res) => res.data);
}
