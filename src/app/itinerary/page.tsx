"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import characterImg from "@/assets/character/face.png";
import { Modal, TimePicker } from "@/components";
import {
  ItineraryTimeline,
  ItineraryHeader,
  DayNavigator,
  TransportSelectSheet,
  ArrivalVerifyModal,
} from "@/features/itinerary";
import type { ItineraryStop } from "@/features/itinerary";

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

  const openDelete = (dayIdx: number, id: string) => {
    setActiveDayIdx(dayIdx); setActiveStopId(id); setModal("delete");
  };
  const openTime = (dayIdx: number, id: string, time: string) => {
    const [h, m] = time.split(":").map(Number);
    setTimeValue({ hour: h, minute: m });
    setActiveDayIdx(dayIdx); setActiveStopId(id); setModal("time");
  };
  const openTransport = (dayIdx: number, id: string) => {
    setActiveDayIdx(dayIdx); setActiveStopId(id); setModal("transport");
  };
  const openVerify = (dayIdx: number, id: string) => {
    setActiveDayIdx(dayIdx); setActiveStopId(id); setModal("verify");
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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 50) return;
    if (diff > 0 && currentDay < DAYS.length - 1) setCurrentDay((d) => d + 1);
    if (diff < 0 && currentDay > 0) setCurrentDay((d) => d - 1);
  };

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
        <ItineraryHeader
          currentDay={currentDay}
          tripName="부지렁즈"
          onLogsClick={() => router.push("/itinerary/logs")}
          onOptimizeClick={() => setModal("optimize")}
          onTripsClick={() => router.push("/itinerary/trips")}
        />

        {/* 슬라이딩 타임라인 */}
        <div className="flex-1 overflow-hidden">
          <div
            className="flex h-full transition-transform duration-300 ease-in-out will-change-transform"
            style={{ transform: `translateX(-${currentDay * 100}%)` }}
          >
            {allDayStops.map((dayStops, dayIdx) => (
              <div
                key={dayIdx}
                className="w-full h-full shrink-0 overflow-y-auto pl-[12px] pr-[20px] pb-6"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <ItineraryTimeline
                  stops={dayStops}
                  date={TRIP_DATES[dayIdx]}
                  onAdd={() => router.push("/itinerary/search")}
                />
              </div>
            ))}
          </div>
        </div>

        <DayNavigator
          totalDays={DAYS.length}
          currentDay={currentDay}
          onDayChange={setCurrentDay}
        />
      </div>

      {/* 모달들 */}
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

      <TransportSelectSheet
        isOpen={modal === "transport"}
        onClose={closeModal}
        onSelect={confirmTransport}
      />

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
