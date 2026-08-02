"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { itineraryApi } from "@/shared/api/domains";

// 방장이 확정하면 투표현황(vote-status) 조회는 이후 계속 실패해서(백엔드 이슈)
// 참여자는 폴링으로 확정 여부를 알 수 없다. 대신 그룹 멤버라면 볼 수 있는
// 내 일정 목록에서 "이 화면에 들어온 뒤 새로 생긴, 같은 이름의 confirmed 일정"을
// 찾아 우회 감지한다. 목록 응답에 groupId가 없어 완벽한 매칭은 아니지만
// (동명의 다른 그룹 여행이 같은 시점에 확정되면 오탐 가능), 지금 규모에선 충분하다.
export function useConfirmedItineraryWatcher(tripName: string, enabled: boolean) {
  const [since] = useState(() => Date.now());

  const { data: itineraries } = useQuery({
    queryKey: itineraryApi.keys.lists(),
    queryFn: itineraryApi.getItineraries,
    enabled,
    refetchInterval: 2000,
  });

  return itineraries?.find(
    (it) =>
      it.title === tripName &&
      it.status === "confirmed" &&
      !!it.createdAt &&
      new Date(it.createdAt).getTime() >= since,
  );
}
