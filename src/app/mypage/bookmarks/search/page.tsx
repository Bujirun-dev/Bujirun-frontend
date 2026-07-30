"use client";

import { useRouter } from "next/navigation";
import { BackButton, PageCard, PlaceSearchPanel } from "@/components";
import type { SearchPlace } from "@/components";

export default function BookmarkSearchPage() {
  const router = useRouter();

  const handlePlaceSelect = (place: SearchPlace) => {
    router.push(`/mypage/bookmarks/spot/${place.id}`);
  };

  return (
    <PageCard>
      <div className="flex flex-col h-full gap-4">
        {/* 헤더 */}
        <div className="flex items-center gap-3 shrink-0">
          <BackButton className="bg-transparent" onClick={() => router.back()} />
          <h1 className="font-ssurround font-bold text-lg text-text-heading">관광지 검색</h1>
        </div>

        {/* 검색 패널 */}
        <div className="flex-1 overflow-hidden">
          <PlaceSearchPanel onPlaceSelect={handlePlaceSelect} />
        </div>
      </div>
    </PageCard>
  );
}
