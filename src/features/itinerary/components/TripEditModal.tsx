import { useState } from "react";
import Image from "next/image";
import pencilBlueIcon from "@/assets/icons/itinerary/pencil-blue.png";
import titleIcon from "@/assets/icons/itinerary/title.png";
import calendarIcon from "@/assets/icons/itinerary/calendar.png";
import clockDarkIcon from "@/assets/icons/itinerary/clock-dark.png";
import { Card, Modal, TextInput } from "@/components";
import { formatTripDateTime, parseTripDateTime, TripDateTimePicker } from "./TripDateTimePicker";
import type { Trip } from "./TripCard";

interface TripEditModalProps {
  isOpen: boolean;
  trip: Trip;
  onClose: () => void;
  onConfirm: (updated: Trip) => void;
}

export function TripEditModal({ isOpen, trip, onClose, onConfirm }: TripEditModalProps) {
  const [name, setName] = useState(trip.name);
  const [startDate, setStartDate] = useState(() =>
    formatTripDateTime(parseTripDateTime(trip.startDate)),
  );
  const [endDate, setEndDate] = useState(() => formatTripDateTime(parseTripDateTime(trip.endDate)));

  if (!isOpen) return null;

  const handleStartDateChange = (nextStartDate: string) => {
    setStartDate(nextStartDate);

    if (parseTripDateTime(endDate).getTime() < parseTripDateTime(nextStartDate).getTime()) {
      setEndDate(nextStartDate);
    }
  };
  const handleConfirm = () => {
    onConfirm({ ...trip, name, startDate, endDate });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={<Image src={pencilBlueIcon} alt="수정" width={25} height={25} />}
      title="일정 정보 수정"
      titleClassName="font-bold text-xl text-text-heading"
      className="gap-6 px-8 py-10"
      childrenVariant="plain"
      childrenClassName="flex flex-col gap-6"
      cancelText="취소"
      confirmText="수정하기"
      onConfirm={handleConfirm}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5">
          <Image src={titleIcon} alt="여행명" width={16} height={16} />
          <span className="text-lg font-semibold text-text-heading">여행명</span>
        </div>
        <TextInput
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="여행 이름을 입력하세요"
          className="h-[30px] w-full rounded-lg border border-main-blue text-xs font-medium text-text-primary"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <Image src={calendarIcon} alt="여행 기간" width={16} height={16} />
          <span className="text-lg font-semibold text-text-heading">여행 기간</span>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3.5">
            <DateTimeLabel label="시작 시간" />
            <TripDateTimePicker value={startDate} onChange={handleStartDateChange} />
          </div>
          <div className="flex items-center gap-3.5">
            <DateTimeLabel label="종료 시간" />
            <TripDateTimePicker value={endDate} minValue={startDate} onChange={setEndDate} />
          </div>
        </div>

        <Card variant="glass-sm" className="mt-5 w-full rounded-lg px-3 py-2">
          <p className="text-center text-sm font-medium text-sub-darkgray">
            * 변경된 여행 기간에 맞춰 일정이 자동으로 조정돼요.
          </p>
        </Card>
      </div>
    </Modal>
  );
}

function DateTimeLabel({ label }: { label: string }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Image src={clockDarkIcon} alt="" width={11} height={11} />
      <span className="text-sm font-semibold text-text-primary">{label}</span>
    </div>
  );
}
