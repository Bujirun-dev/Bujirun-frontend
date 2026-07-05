import { apiClient } from "@/shared/api/client";
import { unwrap } from "@/shared/api/response";
import type { OpBody, OpResponse } from "@/shared/api/types";

export function createGroup(body: OpBody<"create_2">) {
  return apiClient.post<OpResponse<"create_2">>("/api/groups", body).then((res) => unwrap(res));
}

export function joinGroup(body: OpBody<"join">) {
  return apiClient.post<OpResponse<"join">>("/api/groups/join", body).then((res) => unwrap(res));
}

export function getMyGroups() {
  return apiClient.get<OpResponse<"myGroups">>("/api/groups/me").then((res) => unwrap(res));
}

export function getGroupMembers(groupId: string) {
  return apiClient
    .get<OpResponse<"members">>(`/api/groups/${groupId}/members`)
    .then((res) => unwrap(res));
}
