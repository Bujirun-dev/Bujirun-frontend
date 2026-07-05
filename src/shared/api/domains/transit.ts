import { apiClient } from "@/shared/api/client";
import { unwrap } from "@/shared/api/response";
import type { OpQuery, OpResponse } from "@/shared/api/types";

export function getBusArrival(query: OpQuery<"getBusArrival">) {
  return apiClient
    .get<OpResponse<"getBusArrival">>("/api/transit/arrival/bus", { params: query })
    .then((res) => unwrap(res));
}
