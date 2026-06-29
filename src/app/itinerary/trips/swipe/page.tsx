"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import pawIcon from "@/assets/icons/itinerary/paw-print.png";

// TODO: API 연동 후 실제 관광지 데이터로 교체
const MOCK_PLACES = [
  { id: 1, name: "광안리 해수욕장", image: "https://picsum.photos/seed/place1/600/800" },
  { id: 2, name: "해운대 해수욕장", image: "https://picsum.photos/seed/place2/600/800" },
  { id: 3, name: "감천 문화마을", image: "https://picsum.photos/seed/place3/600/800" },
  { id: 4, name: "국제시장", image: "https://picsum.photos/seed/place4/600/800" },
  { id: 5, name: "태종대", image: "https://picsum.photos/seed/place5/600/800" },
  { id: 6, name: "용두산공원", image: "https://picsum.photos/seed/place6/600/800" },
  { id: 7, name: "송도 해수욕장", image: "https://picsum.photos/seed/place7/600/800" },
  { id: 8, name: "BIFF 광장", image: "https://picsum.photos/seed/place8/600/800" },
  { id: 9, name: "흰여울 문화마을", image: "https://picsum.photos/seed/place9/600/800" },
  { id: 10, name: "영도대교", image: "https://picsum.photos/seed/place10/600/800" },
];

const SWIPE_THRESHOLD = 80;

export default function TripSwipePage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState<"left" | "right" | null>(null);
  const startXRef = useRef(0);
  const total = MOCK_PLACES.length;
  const place = MOCK_PLACES[currentIndex];
  const progress = currentIndex / total;

  const handleSwipe = (direction: "left" | "right") => {
    setIsAnimatingOut(direction);
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= total) {
        router.push("/itinerary/trips/waiting");
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

  return (
    <div className="flex h-full flex-col items-center px-6 pt-4 pb-[40px]">
      {/* 취향 분석 중 pill */}
      <div className="w-full rounded-[10px] border border-white/40 bg-gradient-to-b from-system-glassfrom to-system-glassto px-6 py-2 text-center backdrop-blur-[15px]">
        <span className="font-ssurround font-bold text-lg text-text-heading">취향 분석 중...</span>
      </div>

      {/* 프로그레스 바 */}
      <div className="relative mt-[18px] w-full">
        <div className="h-[3px] w-full rounded-full bg-sub-lightblue">
          <div
            className="h-[3px] rounded-full bg-text-heading transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div
          className="absolute -top-[8.5px] transition-all duration-300"
          style={{ left: `calc(${progress * 100}% - 10px)` }}
        >
          <Image src={pawIcon} alt="" width={20} height={20} aria-hidden />
        </div>
      </div>

      {/* 카운터 */}
      <p className="mt-4 font-paperlogy font-bold text-md text-text-heading">
        {currentIndex + 1}/{total}
      </p>

      {/* 스와이프 카드 */}
      <div className="relative mt-4 flex w-full flex-1 items-center justify-center">
        {/* 별로에요 힌트 */}
        <span
          className="absolute left-0 z-10 text-3xl transition-opacity duration-150"
          style={{ opacity: nopeOpacity }}
        >
          😢
        </span>

        {/* 좋아요 힌트 */}
        <span
          className="absolute right-0 z-10 text-3xl transition-opacity duration-150"
          style={{ opacity: likeOpacity }}
        >
          ❤️
        </span>

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
        </div>
      </div>
    </div>
  );
}
