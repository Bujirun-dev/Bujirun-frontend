import { apiClient } from "@/shared/api/client";
import { unwrap } from "@/shared/api/response";
import type { OpBody, OpResponse } from "@/shared/api/types";

export function getMyProfile() {
  return apiClient.get<OpResponse<"getMyProfile">>("/api/users/me").then((res) => unwrap(res));
}

export function updateMyProfile(body: OpBody<"updateMyProfile">) {
  return apiClient
    .patch<OpResponse<"updateMyProfile">>("/api/users/me", body)
    .then((res) => unwrap(res));
}
