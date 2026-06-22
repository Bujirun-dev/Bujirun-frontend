"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import mapMagnifierIcon from "@/assets/icons/itinerary/map-magnifier.png";
import magicWandIcon from "@/assets/icons/itinerary/magic-wand.png";
import listIcon from "@/assets/icons/itinerary/list.png";
import busIcon from "@/assets/icons/home/bus.png";
import subwayIcon from "@/assets/icons/home/subway.png";
import walkIcon from "@/assets/icons/home/walk.png";
import taxiIcon from "@/assets/icons/home/taxi.png";
import characterImg from "@/assets/character/face.png";
import { Modal, TimePicker } from "@/components";
import { ItineraryTimeline, ArrivalVerifyModal } from "@/features/itinerary";
import type { ItineraryStop } from "@/features/itinerary";
import type { StaticImageData } from "next/image";

type BaseStop = Omit<
  ItineraryStop,
  "onDelete" | "onClick" | "onTimeClick" | "onTransportClick" | "onVerify"
>;

const DAYS: BaseStop[][] = [
  [
    {
      id: "d1-1",
      time: "12:00",
      placeName: "송도 해수욕장",
      imageUrl: "https://picsum.photos/seed/beach1/300/200",
      category: "sea",
      status: "completed",
      transport: { type: "버스", routeName: "2012", from: "송도 해수욕장", to: "해운대", durationMin: 20, cost: 1500 },
    },
    {
      id: "d1-2",
      time: "14:30",
      placeName: "해운대 해수욕장",
      imageUrl: "https://picsum.photos/seed/beach2/300/200",
      category: "culture",
      status: "verify",
      transport: { type: "버스", routeName: "2012", from: "해운대", to: "광안리", durationMin: 20, cost: 1500 },
    },
    {
      id: "d1-3",
      time: "18:30",
      placeName: "광안리 해수욕장",
      imageUrl: "https://picsum.photos/seed/beach3/300/200",
      category: "experience",
      status: "verify",
    },
  ],
  [
    {
      id: "d2-1",
      time: "10:00",
      placeName: "경복궁",
      imageUrl: "https://picsum.photos/seed/palace/300/200",
      category: "culture",
      status: "verify",
      transport: { type: "지하철", routeName: "3호선", from: "경복궁역", to: "인사동역", durationMin: 5 },
    },
    {
      id: "d2-2",
      time: "13:00",
      placeName: "인사동",
      imageUrl: "https://picsum.photos/seed/insadong/300/200",
      category: "experience",
      status: "verify",
    },
  ],
  [
    {
      id: "d3-1",
      time: "09:00",
      placeName: "한라산",
      imageUrl: "https://picsum.photos/seed/mountain/300/200",
      category: "nature",
      status: "verify",
      transport: { type: "도보", routeName: "등산로", from: "한라산 입구", to: "정상", durationMin: 180 },
    },
    {
      id: "d3-2",
      time: "15:00",
      placeName: "제주 해변",
      imageUrl: "https://picsum.photos/seed/jejubeach/300/200",
      category: "sea",
      status: "verify",
    },
  ],
];

const TRIP_DATES = ["2026.05.18", "2026.05.19", "2026.05.20"];

const TRANSPORT_ICONS: Record<string, StaticImageData> = {
  버스: busIcon,
  지하철: subwayIcon,
  도보: walkIcon,
  택시: taxiIcon,
};

type ModalType = "optimize" | "delete" | "time" | "transport" | "verify";

export default function ItineraryPage() {
  const router = useRouter();

  const [currentDay, setCurrentDay] = useState(0);
  const [stopsPerDay, setStopsPerDay] = useState<BaseStop[][]>(DAYS);
  const [modal, setModal] = useState<ModalType | null>(null);
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [timeValue, setTimeValue] = useState({ hour: 12, minute: 0 });

  const touchStartX = useRef(0);

  const activeStop = stopsPerDay[activeDayIdx].find((s) => s.id === activeStopId);

  // ── 핸들러 ──────────────────────────────────────────────────────────────────
  const openDelete = (dayIdx: number, id: string) => {
    setActiveDayIdx(dayIdx);
    setActiveStopId(id);
    setModal("delete");
  };
  const openTime = (dayIdx: number, id: string, time: string) => {
    const [h, m] = time.split(":").map(Number);
    setTimeValue({ hour: h, minute: m });
    setActiveDayIdx(dayIdx);
    setActiveStopId(id);
    setModal("time");
  };
  const openTransport = (dayIdx: number, id: string) => {
    setActiveDayIdx(dayIdx);
    setActiveStopId(id);
    setModal("transport");
  };
  const openVerify = (dayIdx: number, id: string) => {
    setActiveDayIdx(dayIdx);
    setActiveStopId(id);
    setModal("verify");
  };
  const closeModal = () => setModal(null);

  const confirmDelete = () => {
    setStopsPerDay((prev) => {
      const next = [...prev];
      next[activeDayIdx] = next[activeDayIdx].filter((s) => s.id !== activeStopId);
      return next;
    });
    closeModal();
  };

  const confirmTime = () => {
    const timeStr = `${String(timeValue.hour).padStart(2, "0")}:${String(timeValue.minute).padStart(2, "0")}`;
    setStopsPerDay((prev) => {
      const next = [...prev];
      next[activeDayIdx] = [...next[activeDayIdx]]
        .map((s) => (s.id === activeStopId ? { ...s, time: timeStr } : s))
        .sort((a, b) => a.time.localeCompare(b.time));
      return next;
    });
    closeModal();
  };

  const confirmTransport = (type: string) => {
    setStopsPerDay((prev) => {
      const next = [...prev];
      next[activeDayIdx] = next[activeDayIdx].map((s) =>
        s.id === activeStopId && s.transport
          ? { ...s, transport: { ...s.transport, type: type as "버스" | "지하철" | "도보" | "택시" } }
          : s
      );
      return next;
    });
    closeModal();
  };

  const confirmVerify = () => {
    setStopsPerDay((prev) => {
      const next = [...prev];
      next[activeDayIdx] = next[activeDayIdx].map((s) =>
        s.id === activeStopId ? { ...s, status: "completed" as const } : s
      );
      return next;
    });
    closeModal();
  };

  // ── 스와이프 ─────────────────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 50) return;
    if (diff > 0 && currentDay < DAYS.length - 1) setCurrentDay((d) => d + 1);
    if (diff < 0 && currentDay > 0) setCurrentDay((d) => d - 1);
  };

  // ── 날별 stops (핸들러 주입) ──────────────────────────────────────────────────
  const allDayStops: ItineraryStop[][] = stopsPerDay.map((dayStops, dayIdx) =>
    dayStops.map((stop) => ({
      ...stop,
      onClick: () => router.push(`/itinerary/place/${stop.id}`),
      onDelete: () => openDelete(dayIdx, stop.id),
      onTimeClick: () => openTime(dayIdx, stop.id, stop.time),
      onTransportClick: stop.transport ? () => openTransport(dayIdx, stop.id) : undefined,
      onVerify: stop.status === "verify" ? () => openVerify(dayIdx, stop.id) : undefined,
    }))
  );

  return (
    <div className="flex h-full flex-col relative">
      <div className="flex flex-1 flex-col overflow-hidden rounded-tl-[40px] rounded-tr-[40px] bg-white">
        {/* ── 여행 헤더 ── */}
        <div className="flex items-center gap-[10px] px-[30px] pt-[30px] pb-[15px]">
          <div className="flex items-center rounded-[10px] bg-main-blue px-[10px] py-[5px] shrink-0">
            <span className="font-ssurround text-[14px] font-bold text-white tracking-[0.5px]">
              day {currentDay + 1}
            </span>
          </div>
          <span className="flex-1 font-paperlogy text-[16px] font-bold text-sub-deepblue">
            부지렁즈
          </span>
          <div className="flex items-center gap-[5px]">
            <button
              className="size-[28px] rounded-[10px] bg-[#d5e6ff] border border-main-blue/30 flex items-center justify-center"
              onClick={() => router.push("/itinerary/logs")}
            >
              <Image src={mapMagnifierIcon} alt="로그" width={20} height={20} className="object-contain" />
            </button>
            <button
              className="size-[28px] rounded-[10px] bg-[#d5e6ff] border border-main-blue/30 flex items-center justify-center"
              onClick={() => setModal("optimize")}
            >
              <Image src={magicWandIcon} alt="최적화" width={20} height={20} className="object-contain" />
            </button>
            <button
              className="size-[28px] rounded-[10px] bg-[#d5e6ff] border border-main-blue/30 flex items-center justify-center"
              onClick={() => router.push("/itinerary/trips")}
            >
              <Image src={listIcon} alt="목록" width={20} height={20} className="object-contain" />
            </button>
          </div>
        </div>
        {/* ── 날짜 + 일정 추가 버튼 ── */}
        <div className="flex items-center gap-[10px] px-[24px] pb-4">
          <button
            className="flex size-[18px] items-center justify-center rounded-[6px] bg-sub-coral shrink-0"
            onClick={() => router.push("/itinerary/search")}
          >
            <span className="text-white text-xs font-bold leading-none">+</span>
          </button>
          <span className="font-paperlogy text-xs font-semibold text-sub-gray">
            {TRIP_DATES[currentDay]}
          </span>
        </div>

        {/* ── 슬라이딩 타임라인 ── */}
        <div className="flex-1 overflow-hidden">
          <div
            className="flex h-full transition-transform duration-300 ease-in-out will-change-transform"
            style={{ transform: `translateX(-${currentDay * 100}%)` }}
          >
            {allDayStops.map((dayStops, dayIdx) => (
              <div
                key={dayIdx}
                className="w-full h-full shrink-0 overflow-y-auto px-[24px] pb-6"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <ItineraryTimeline stops={dayStops} />
              </div>
            ))}
          </div>
        </div>

        {/* ── 날짜 페이지 도트 ── */}
        <div className="flex items-center justify-center gap-[20px] pt-3 pb-[10px]">
          {DAYS.map((_, i) =>
            i === currentDay ? (
              <button
                key={i}
                className="flex size-[22px] items-center justify-center rounded-full bg-main-blue"
                onClick={() => setCurrentDay(i)}
              >
                <span className="font-proup text-[12px] font-normal text-white">{i + 1}</span>
              </button>
            ) : (
              <button
                key={i}
                className="size-[9px] rounded-full bg-main-blue/30"
                onClick={() => setCurrentDay(i)}
              />
            )
          )}
        </div>
      </div>

      {/* ════════════════ 모달들 ════════════════ */}
      <Modal
        isOpen={modal === "optimize"}
        onClose={closeModal}
        title="일정 최적화"
        description={`AI가 현재 일정의 이동 동선을\n최적화해드립니다.`}
        confirmText="최적화 시작"
        cancelText="취소"
        confirmVariant="primary"
        onConfirm={closeModal}
        onCancel={closeModal}
      />

      <Modal
        isOpen={modal === "delete"}
        onClose={closeModal}
        title="일정 삭제"
        description={`해당 관광지를 일정에서\n삭제하시겠어요?`}
        confirmText="삭제하기"
        cancelText="취소"
        confirmVariant="warning"
        onConfirm={confirmDelete}
        onCancel={closeModal}
      />

      <TimePicker
        isOpen={modal === "time"}
        hour={timeValue.hour}
        minute={timeValue.minute}
        onChange={(h, m) => setTimeValue({ hour: h, minute: m })}
        onConfirm={confirmTime}
        onClose={closeModal}
      />

      {modal === "transport" && (
        <div
          className="absolute inset-0 z-50 flex items-end"
          style={{ backgroundColor: "var(--color-system-blackbg)" }}
          onClick={closeModal}
        >
          <div
            className="w-full bg-white rounded-t-[30px] px-6 pt-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-paperlogy font-bold text-lg text-text-heading mb-5 text-center">
              교통수단 선택
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {(["버스", "지하철", "도보", "택시"] as const).map((type) => (
                <button
                  key={type}
                  className="flex items-center gap-2 bg-sub-green rounded-[16px] px-4 py-3 active:opacity-80"
                  onClick={() => confirmTransport(type)}
                >
                  <Image src={TRANSPORT_ICONS[type]} alt={type} width={20} height={20} />
                  <span className="font-paperlogy font-bold text-md text-text-heading">{type}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <ArrivalVerifyModal
        isOpen={modal === "verify"}
        onClose={closeModal}
        placeName={activeStop?.placeName ?? ""}
        characterImageUrl={characterImg.src}
        onVerify={confirmVerify}
        onLater={closeModal}
      />
    </div>
  );
}
