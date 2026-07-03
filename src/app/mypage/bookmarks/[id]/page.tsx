"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton, PageCard } from "@/components";
import { PlaceDetailContent } from "@/components/place/PlaceDetailContent";
import { PLACES } from "@/features/collection/data/places";
import { getRelatedLogs } from "@/features/mypage/data/relatedLogs";

// TODO: API 연결 시 useQuery로 교체
const MOCK_PLACE = {
  id: "1",
  name: "송도 해수욕장",
  category: "sea" as const,
  description:
    "부산의 대표적인 해수욕장 중 하나로, 아름다운 백사장과 맑은 바다가 펼쳐지는 곳입니다. 케이블카와 다양한 해양 액티비티를 즐길 수 있으며, 주변에 맛집과 카페가 즐비합니다.",
  address: "부산 서구 송도해변로 100 일대 (암남동)",
  hours: "09:00 - 18:00",
  fee: "무료",
  parking: "공영 주차장",
  phone: "051-240-4000",
  isBookmarked: true,
};

export default function BookmarkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // TODO: API 연결 시 id로 관광지 상세 fetch
  const placeInfo = PLACES.find((p) => p.id === Number(id));
  const place = {
    ...MOCK_PLACE,
    name: placeInfo?.name ?? MOCK_PLACE.name,
    category: (placeInfo?.category ?? MOCK_PLACE.category) as typeof MOCK_PLACE.category,
  };

  const [isBookmarked, setIsBookmarked] = useState(place.isBookmarked);

  // TODO: API 연결 시 GET /tour-spots/:id/logs 로 교체
  const relatedLogs = getRelatedLogs(Number(id));

  return (
    <PageCard>
      {/* 헤더 */}
      <div className="flex items-center gap-3 pb-4 shrink-0">
        <BackButton className="bg-transparent" onClick={() => router.back()} />
        <h1 className="font-ssurround font-bold text-lg text-text-heading">관광지 상세보기</h1>
      </div>

      {/* 공통 관광지 상세 콘텐츠 */}
      <PlaceDetailContent
        place={{
          imageUrl: `https://picsum.photos/seed/${id}/400/300`,
          name: place.name,
          category: place.category,
          description: place.description,
          address: place.address,
          isBookmarked,
          infoItems: [
            { type: "clock", label: "운영시간", value: place.hours },
            { type: "fee", label: "입장료", value: place.fee },
            { type: "parking", label: "주차", value: place.parking },
            { type: "call", label: "문의", value: place.phone },
          ],
        }}
        onBookmark={() => {
          setIsBookmarked((prev) => !prev);
          // TODO: 북마크 on/off API 연결
        }}
        relatedLogs={relatedLogs}
        onViewMoreLogs={() => router.push(`/mypage/bookmarks/${id}/related-logs`)}
        getRelatedLogHref={(logId) => `/mypage/logs/${logId}`} // 변경
        onLogClick={(logId) => router.push(`/mypage/logs/${logId}`)} // 변경
      />
    </PageCard>
  );
}
