"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton, PageCard } from "@/components";
import { PlaceDetailContent } from "@/components/place/PlaceDetailContent";
import { PLACES } from "@/features/home/data/places";
import { SAMPLE_LOGS } from "@/features/home/data/sampleLogs";

export default function RecommendedPlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const place = PLACES.find((p) => String(p.id) === id);
  const [isBookmarked, setIsBookmarked] = useState(place?.isBookmarked ?? false);

  if (!place) {
    return (
      <PageCard>
        <div className="flex flex-1 items-center justify-center text-sub-gray text-sm">
          관광지를 찾을 수 없습니다.
        </div>
      </PageCard>
    );
  }

  const relatedLogs = SAMPLE_LOGS.filter((log) =>
    log.days.some((day) => day.stops.some((stop) => stop.place === place.name)),
  ).slice(0, 2);

  return (
    <PageCard>
      <div className="flex items-center gap-3 pb-4 shrink-0">
        <BackButton className="bg-transparent" onClick={() => router.back()} />
        <h1 className="font-ssurround font-bold text-lg text-text-heading">여기는 어때요?</h1>
      </div>

      <PlaceDetailContent
        place={{
          imageUrl: place.imageUrl,
          name: place.name,
          category: place.category,
          description: `${place.name}은(는) 부산 여행에서 방문하기 좋은 명소입니다. 주변 관광지와 함께 둘러보기 좋아요.`,
          address: "주소 정보가 없습니다.",
          isBookmarked,
          infoItems: [
            { type: "clock", label: "운영시간", value: "운영 정보가 없습니다." },
            { type: "fee", label: "입장료", value: "정보가 없습니다." },
            { type: "parking", label: "주차", value: "정보가 없습니다." },
            { type: "call", label: "문의", value: "문의처 정보가 없습니다." },
          ],
        }}
        onBookmark={() => setIsBookmarked((prev) => !prev)}
        relatedLogs={relatedLogs}
        onViewMoreLogs={() => router.push(`/home/recommend/${place.id}/related-logs`)}
        onLogClick={(logId) => router.push(`/home/logs/${logId}`)}
      />
    </PageCard>
  );
}
