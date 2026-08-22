"use client";

import Image from "next/image";
import { Suspense, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import pawIcon from "@/assets/icons/itinerary/paw-print.png";
import { collectionApi, swipeApi } from "@/shared/api/domains";
import { getFallbackImage } from "@/features/itinerary/utils/scheduleUtils";
import { LoadingState } from "@/components";

const SWIPE_THRESHOLD = 80;

function PageLoadingFallback() {
  return (
    <div className="flex h-full flex-col">
      <LoadingState />
    </div>
  );
}

export default function TripSwipePage() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
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
  const startTime = searchParams.get("startTime") ?? "";
  const endTime = searchParams.get("endTime") ?? "";
  const accommodation = searchParams.get("accommodation") ?? "";
  const accommodationAddress = searchParams.get("accommodationAddress") ?? "";
  const forwardParams = new URLSearchParams({
    count,
    days,
    groupId,
    name,
    startDate,
    endDate,
    startTime,
    endTime,
    ...(accommodation ? { accommodation } : {}),
    ...(accommodationAddress ? { accommodationAddress } : {}),
  }).toString();

  const { data: spotsData } = useQuery({
    queryKey: collectionApi.keys.swipeDeck(),
    queryFn: () => collectionApi.getSwipeDeck(),
  });
  const places = useMemo(
    () =>
      (spotsData ?? []).map((spot) => ({
        id: spot.contentId ?? "",
        name: spot.name ?? "",
        image: spot.swipeImageUrl || getFallbackImage(spot.spotId ?? spot.contentId),
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
  // 다음 카드 이미지를 미리 받아둔다 — 안 그러면 스와이프하는 순간에야 fetch가 시작돼서,
  // 느린 네트워크/기기에서 새 카드로 넘어간 뒤에도 한동안 직전 사진이 그대로 보이는(이름은
  // 바뀌었는데 사진만 안 바뀌어서 "이미지가 중복된다"로 보이는) 현상이 있었다.
  const nextPlace = places[currentIndex + 1];
  const progress = total > 0 ? (currentIndex + 1) / total : 0;

  const handleSwipe = (direction: "left" | "right") => {
    // 렉/빠른 연속 제스처로 같은 카드가 애니메이션 도중 다시 스와이프되면(onDragEnd가 재진입),
    // currentIndex가 아직 안 바뀐 상태라 같은 스팟이 swipesRef에 중복으로 쌓이고 결과 제출 시
    // 같은 spot이 두 번 좋아요/싫어요로 잡히는 문제가 있었다 — 애니메이션 중엔 무시.
    if (isAnimatingOut) return;
    if (!place) return;
    swipesRef.current.push({ contentId: place.id, liked: direction === "right" });

    setIsAnimatingOut(direction);
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= total) {
        // 스와이프 결과 등록 — groupId를 함께 보내야 그룹 일정 자동생성의 취합 대상이 됨
        swipeApi
          .submitSwipes({ swipes: swipesRef.current, groupId: groupId || undefined })
          .catch(() => {});
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
      <div className="flex h-full flex-col">
        <LoadingState message="관광지를 불러오는 중이에요" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center px-6 pb-[40px]">
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
        {/* 카드 — key로 카드(스팟)가 바뀔 때마다 강제 리마운트한다. key 없이 src만 바꾸면
            새 이미지가 다 받아지기 전까지 화면엔 직전 카드 사진이 남아있는 채로 이름(텍스트,
            즉시 반영됨)만 새 걸로 바뀌는 구간이 생겨서, 느린 네트워크에서 "사진이 중복된다"로
            보이는 원인이었다. */}
        <div
          key={place.id}
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
            sizes="390px"
            className="object-cover pointer-events-none"
            draggable={false}
            priority
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

        {/* 다음 카드 이미지 프리로드용(화면엔 안 보임) — 미리 fetch만 시작해두기 위함 */}
        {nextPlace ? (
          // next/image 최적화 파이프라인 없이 브라우저 캐시에 원본을 그대로 미리 받아두려는 용도라 일반 img를 씀
          // eslint-disable-next-line @next/next/no-img-element
          <img src={nextPlace.image} alt="" width={1} height={1} className="hidden" aria-hidden />
        ) : null}
      </div>
    </div>
  );
}
