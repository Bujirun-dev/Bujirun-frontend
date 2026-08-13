import { apiClient } from "@/shared/api/client";
import { unwrap } from "@/shared/api/response";
import type { OpBody, OpResponse } from "@/shared/api/types";

export const keys = {
  all: ["groups"] as const,
  mine: () => [...keys.all, "me"] as const,
  members: (groupId: string) => [...keys.all, groupId, "members"] as const,
  invitePreview: (inviteCode: string) => [...keys.all, "invites", inviteCode, "preview"] as const,
};

// 백엔드 develop에만 있고 아직 main(배포)엔 없는 API — schema.d.ts에 타입이 아직 없어 수동 정의.
// npm run api:types로 재생성되면 OpResponse<"previewInvite"> 등으로 교체.
export interface GroupInvitePreview {
  groupName?: string;
  inviterNickname?: string;
  memberCount?: number;
}

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

export function previewInvite(inviteCode: string) {
  return apiClient
    .get<{ data?: GroupInvitePreview }>(
      `/api/groups/invites/${encodeURIComponent(inviteCode)}/preview`,
    )
    .then((res) => unwrap(res));
}
