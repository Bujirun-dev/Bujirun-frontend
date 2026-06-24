import { useState } from "react";
import Image from "next/image";
import pencilBlueIcon from "@/assets/icons/itinerary/pencil-blue.png";
import titleIcon from "@/assets/icons/itinerary/title.png";
import calendarIcon from "@/assets/icons/itinerary/calendar.png";
import clockDarkIcon from "@/assets/icons/itinerary/clock-dark.png";
import { TextInput } from "@/components";
import type { Trip } from "./TripCard";

interface TripEditModalProps {
  isOpen: boolean;
  trip: Trip;
  onClose: () => void;
  onConfirm: (updated: Trip) => void;
}

export function TripEditModal({ isOpen, trip, onClose, onConfirm }: TripEditModalProps) {
  const [name, setName] = useState(trip.name);
  const [startDate, setStartDate] = useState(trip.startDate);
  const [endDate, setEndDate] = useState(trip.endDate);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({ ...trip, name, startDate, endDate });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
      <div className="w-full max-w-[320px] bg-white rounded-[30px] px-6 py-8 flex flex-col gap-[24px]">
        {/* 헤더 아이콘 + 타이틀 */}
        <div className="flex flex-col items-center gap-[20px]">
          <div className="size-[48px] rounded-full bg-system-navbg flex items-center justify-center">
            <Image src={pencilBlueIcon} alt="수정" width={25} height={25} />
          </div>
          <p className="font-ssurround font-bold text-[18px] text-text-heading text-center">일정 정보 수정</p>
        </div>

        {/* 여행명 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-[7px]">
            <Image src={titleIcon} alt="여행명" width={16} height={16} />
            <span className="font-paperlogy font-semibold text-[16px] text-text-heading">여행명</span>
          </div>
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="여행 이름을 입력하세요"
            className="w-[275px] h-[30px] rounded-[10px] border border-main-blue font-medium text-[11px] text-text-primary"
          />
        </div>

        {/* 여행 기간 */}
        <div className="flex flex-col gap-[8px]">
          <div className="flex items-center gap-[7px]">
            <Image src={calendarIcon} alt="여행 기간" width={16} height={16} />
            <span className="font-paperlogy font-semibold text-[16px] text-text-heading">여행 기간</span>
          </div>
          <div className="flex flex-col gap-[10px]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-[5px] w-[72px] shrink-0">
                <Image src={clockDarkIcon} alt="시작" width={11} height={11} />
                <span className="font-paperlogy font-semibold text-[12px] text-sub-gray">시작 시간</span>
              </div>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 h-[36px] px-3 rounded-[10px] bg-system-searchbg font-paperlogy text-[12px] text-text-primary outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-[5px] w-[72px] shrink-0">
                <Image src={clockDarkIcon} alt="종료" width={14} height={14} />
                <span className="font-paperlogy font-semibold text-[12px] text-sub-gray">종료 시간</span>
              </div>
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 h-[36px] px-3 rounded-[10px] bg-system-searchbg font-paperlogy text-[12px] text-text-primary outline-none"
              />
            </div>
          </div>

          {/* 안내 문구 */}
          <div className="w-full px-3 py-2 rounded-[10px] bg-system-searchbg">
            <p className="font-paperlogy text-[11px] text-sub-gray">
              * 변경된 여행 기간에 맞춰 일정이 자동으로 조정돼요.
            </p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            className="flex-1 h-[44px] rounded-[12px] border border-sub-lightblue font-paperlogy font-bold text-[14px] text-sub-deepblue active:opacity-70"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className="flex-1 h-[44px] rounded-[12px] bg-main-blue font-paperlogy font-bold text-[14px] text-white active:opacity-70"
            onClick={handleConfirm}
          >
            수정하기
          </button>
        </div>
      </div>
    </div>
  );
}
