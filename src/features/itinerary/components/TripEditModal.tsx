import { useState } from "react";
import Image from "next/image";
import calendarIcon from "@/assets/icons/itinerary/calendar.svg?url";
import clockIcon from "@/assets/icons/itinerary/clock.svg?url";
import PencilIcon from "@/assets/icons/itinerary/pencil.svg?svgr";
import titleIcon from "@/assets/icons/itinerary/title.svg?url";
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
  // 처음 생성 시 정한 여행 기간(밤 수)은 수정 화면에서도 그대로 고정한다 —
  // 줄이는 것도 늘리는 것도 허용하지 않고, 시작일을 옮기면 종료일이 같은 기간만큼 따라 움직인다.
  const [originalDurationMs] = useState(
    () => parseTripDateTime(trip.endDate).getTime() - parseTripDateTime(trip.startDate).getTime(),
  );
  const endDate = formatTripDateTime(
    new Date(parseTripDateTime(startDate).getTime() + originalDurationMs),
  );

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({ ...trip, name, startDate, endDate });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={<PencilIcon width={25} height={25} className="icon-deepblue" aria-hidden />}
      title="일정 정보 수정"
      titleClassName="font-bold text-xl text-text-heading"
      childrenVariant="plain"
      childrenClassName="flex flex-col gap-6 items-start"
      cancelText="취소"
      confirmText="수정하기"
      onConfirm={handleConfirm}
    >
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center gap-1.5">
          <Image src={titleIcon} alt="" width={14} height={14} aria-hidden />
          <span className="text-md font-semibold text-text-heading">여행명</span>
        </div>
        <TextInput
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="여행 이름을 입력하세요"
          className="h-[34px] w-full rounded-lg border border-main-blue px-3 text-xs font-medium text-text-primary"
        />
      </div>

      <div className="flex w-full flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <Image src={calendarIcon} alt="" width={14} height={14} aria-hidden />
          <span className="text-md font-semibold text-text-heading">여행 기간</span>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <DateTimeLabel label="시작 시간" />
            <TripDateTimePicker
              value={startDate}
              onChange={setStartDate}
              className="flex-1 w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <DateTimeLabel label="종료 시간" />
            <div className="flex h-9 flex-1 items-center rounded-lg border border-main-blue/30 bg-system-navbg px-3 text-xs font-medium text-sub-darkgray">
              {endDate}
            </div>
          </div>
        </div>

        <Card variant="glass-sm" className="mt-5 w-full rounded-lg px-3 py-2">
          <p className="text-center text-sm font-medium text-sub-darkgray break-keep">
            * 처음 정한 여행 기간은 그대로 유지돼요. 시작일을 옮기면 종료일도 같이 이동해요.
          </p>
        </Card>
      </div>
    </Modal>
  );
}

function DateTimeLabel({ label }: { label: string }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Image src={clockIcon} alt="" width={11} height={11} aria-hidden />
      <span className="text-xs font-semibold text-text-primary">{label}</span>
    </div>
  );
}
