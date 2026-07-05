import { apiClient } from "@/shared/api/client";
import type { OpQuery, OpResponse } from "@/shared/api/types";

export const keys = {
  all: ["spots"] as const,
  search: (query?: OpQuery<"search">) => [...keys.all, "search", query ?? {}] as const,
};

// 주의: 공통 envelope 없이 배열을 그대로 내려준다 (백엔드 스펙 확인됨).
export function searchSpots(query?: OpQuery<"search">) {
  return apiClient
    .get<OpResponse<"search">>("/api/spots/search", { params: query })
    .then((res) => res.data);
}
