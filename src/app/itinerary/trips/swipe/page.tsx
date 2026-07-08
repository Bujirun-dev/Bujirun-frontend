"use client";

import Image from "next/image";
import { Suspense, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import pawIcon from "@/assets/icons/itinerary/paw-print.png";
import { spotApi, itineraryApi } from "@/shared/api/domains";
import { FALLBACK_IMAGE } from "@/features/itinerary/utils/scheduleUtils";

const SWIPE_THRESHOLD = 80;
const MAX_CARDS = 15;

export default function TripSwipePage() {
  return (
    <Suspense fallback={null}>
      <TripSwipeContent />
    </Suspense>
  );
}

function TripSwipeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const count = searchParams.get("count") ?? "6";
  const days = searchParams.get("days") ?? "1";
  const groupId = searchParams.get("groupId") ?? "";
  const name = searchParams.get("name") ?? "";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";
  const forwardParams = new URLSearchParams({
    count,
    days,
    groupId,
    name,
    startDate,
    endDate,
  }).toString();

  const { data: spotsData } = useQuery({
    queryKey: spotApi.keys.search(),
    queryFn: () => spotApi.searchSpots(),
  });
  const places = useMemo(
    () =>
      (spotsData ?? []).slice(0, MAX_CARDS).map((spot) => ({
        id: spot.spotId ?? "",
        name: spot.name ?? "",
        image: spot.thumbnailUrl || FALLBACK_IMAGE,
      })),
    [spotsData],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState<"left" | "right" | null>(null);
  const startXRef = useRef(0);
  const swipesRef = useRef<{ contentId: string; liked: boolean }[]>([]);
  const total = places.length;
  const place = places[currentIndex];
  const progress = total > 0 ? (currentIndex + 1) / total : 0;

  const handleSwipe = (direction: "left" | "right") => {
    if (!place) return;
    swipesRef.current.push({ contentId: place.id, liked: direction === "right" });

    setIsAnimatingOut(direction);
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= total) {
        // 개인 스와이프 결과 등록 (그룹 일정 자동생성이 참고할 세션을 서버에 남기기 위한 호출)
        if (startDate && endDate) {
          itineraryApi
            .generateItinerary({ swipes: swipesRef.current, startDate, endDate })
            .catch(() => {});
        }
        router.push(`/itinerary/trips/waiting?${forwardParams}`);
        return;
      }
      setCurrentIndex(nextIndex);
      setDragX(0);
      setIsAnimatingOut(null);
    }, 250);
  };

  const onDragStart = (clientX: number) => {
    if (isAnimatingOut) return;
    startXRef.current = clientX;
    setIsDragging(true);
  };
  const onDragMove = (clientX: number) => {
    if (!isDragging) return;
    setDragX(clientX - startXRef.current);
  };
  const onDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragX > SWIPE_THRESHOLD) handleSwipe("right");
    else if (dragX < -SWIPE_THRESHOLD) handleSwipe("left");
    else setDragX(0);
  };

  const cardRotate = dragX * 0.06;
  const likeOpacity = Math.min(1, Math.max(0, dragX / SWIPE_THRESHOLD));
  const nopeOpacity = Math.min(1, Math.max(0, -dragX / SWIPE_THRESHOLD));

  const cardStyle = isAnimatingOut
    ? {
        transform: `translateX(${isAnimatingOut === "right" ? 400 : -400}px) rotate(${isAnimatingOut === "right" ? 20 : -20}deg)`,
        transition: "transform 0.25s ease-out",
        opacity: 0,
      }
    : {
        transform: `translateX(${dragX}px) rotate(${cardRotate}deg)`,
        transition: isDragging ? "none" : "transform 0.3s ease-out",
      };

  if (!place) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6">
        <p className="font-paperlogy font-medium text-md text-text-heading">
          관광지를 불러오고 있어요...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center px-6 pt-4 pb-[40px]">
      {/* 취향 분석 중 pill */}
      <div className="w-full rounded-[10px] border border-white/40 bg-gradient-to-b from-system-glassfrom to-system-glassto px-6 py-2 text-center backdrop-blur-[15px]">
        <span className="font-ssurround font-bold text-lg text-text-heading">취향 분석 중...</span>
      </div>

      {/* 프로그레스 바 */}
      <div className="mt-5 flex w-full items-center gap-0">
        <div
          className="h-[3px] rounded-full bg-text-heading transition-all duration-300"
          style={{ width: `calc(${progress * 100}% - 10px)` }}
        />
        <div className="shrink-0 transition-all duration-300">
          <Image src={pawIcon} alt="" width={20} height={20} aria-hidden />
        </div>
        <div className="h-[3px] flex-1 rounded-full bg-sub-lightblue" />
      </div>

      {/* 카운터 */}
      <p className="mt-3 font-paperlogy font-bold text-md text-text-heading">
        {currentIndex + 1}/{total}
      </p>

      {/* 스와이프 카드 */}
      <div className="relative mt-5 flex w-full flex-1 items-center justify-center">
        {/* 카드 */}
        <div
          className="relative h-full w-full cursor-grab rounded-[30px] overflow-hidden shadow-lg select-none active:cursor-grabbing"
          style={cardStyle}
          onMouseDown={(e) => onDragStart(e.clientX)}
          onMouseMove={(e) => onDragMove(e.clientX)}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
          onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
          onTouchEnd={onDragEnd}
        >
          <Image
            src={place.image}
            alt={place.name}
            fill
            className="object-cover pointer-events-none"
            draggable={false}
          />
          <p className="absolute bottom-4 left-4 right-4 font-ssurround font-bold text-lg text-white drop-shadow">
            {place.name}
          </p>
        </div>

        {/* 별로에요 힌트 - 고정, 왼쪽 드래그 시 강조 / 오른쪽 드래그 시 흐려짐 */}
        <div
          className="pointer-events-none absolute left-0 top-1/2 z-20 flex size-[26px] items-center justify-center rounded-[10px] bg-white/80 transition-opacity duration-150"
          style={{
            opacity: Math.max(0.3, 0.8 - likeOpacity * 0.5) + nopeOpacity * 0.2,
            transform: "translate(-50%, -50%)",
          }}
        >
          <span className="text-lg leading-none">☹️</span>
        </div>

        {/* 좋아요 힌트 - 고정, 오른쪽 드래그 시 강조 / 왼쪽 드래그 시 흐려짐 */}
        <div
          className="pointer-events-none absolute right-0 top-1/2 z-20 flex size-[26px] items-center justify-center rounded-[10px] bg-white/80 transition-opacity duration-150"
          style={{
            opacity: Math.max(0.3, 0.8 - nopeOpacity * 0.5) + likeOpacity * 0.2,
            transform: "translate(50%, -50%)",
          }}
        >
          <span className="text-lg leading-none">❣️</span>
        </div>
      </div>
    </div>
  );
}
