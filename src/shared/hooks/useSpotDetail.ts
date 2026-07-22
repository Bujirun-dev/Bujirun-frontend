"use client";

import { useQuery } from "@tanstack/react-query";
import { spotApi } from "@/shared/api/domains";
import { useAuthStore } from "@/shared/stores/useAuthStore";

// 관광지 상세 정보(소개글/운영시간/문의처 등)를 spotId로 조회하는 공용 훅.
// home/recommend, mypage/bookmarks에 중복돼 있던 조회 로직을 하나로 모은 것.
export function useSpotDetail(spotId: string | undefined) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: spotApi.keys.detail(spotId ?? ""),
    queryFn: () => spotApi.getSpot(spotId as string),
    enabled: Boolean(accessToken && spotId),
  });
}
