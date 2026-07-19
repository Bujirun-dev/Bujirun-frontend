// visit.ts
import { apiClient } from "@/shared/api/client";
import { unwrap } from "@/shared/api/response";
import type { OpBody, OpResponse } from "@/shared/api/types";

export const keys = {
  all: ["visits"] as const,
  history: () => [...keys.all, "history"] as const,
};

// post
export function verifyVisit(body: OpBody<"verify">) {
  return apiClient.post<OpResponse<"verify">>("/api/visits", body).then((res) => unwrap(res));
}

//get
export function getHistory() {
  return apiClient.get<OpResponse<"getHistory">>("/api/visits").then((res) => unwrap(res));
}
