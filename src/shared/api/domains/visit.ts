import { apiClient } from "@/shared/api/client";
import { unwrap } from "@/shared/api/response";
import type { OpBody, OpResponse } from "@/shared/api/types";

export function verifyVisit(body: OpBody<"verify">) {
  return apiClient.post<OpResponse<"verify">>("/api/visits", body).then((res) => unwrap(res));
}
