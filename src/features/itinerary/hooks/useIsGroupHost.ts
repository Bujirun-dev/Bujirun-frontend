"use client";

import { useQuery } from "@tanstack/react-query";
import { groupApi, userApi } from "@/shared/api/domains";

// 방장 전용 액션(확정/타이브레이크) 노출 여부 판단용.
// 방 생성자(createdBy)와 내 계정 id가 같으면 방장이다.
export function useIsGroupHost(groupId: string) {
  const { data: profile } = useQuery({
    queryKey: userApi.keys.me(),
    queryFn: userApi.getMyProfile,
  });

  const { data: groups } = useQuery({
    queryKey: groupApi.keys.mine(),
    queryFn: groupApi.getMyGroups,
    enabled: !!groupId,
  });

  const group = groups?.find((g) => g.id === groupId);
  return !!profile?.id && !!group?.createdBy && profile.id === group.createdBy;
}
