import { useState } from "react";
import Image from "next/image";
import calendarIcon from "@/assets/icons/itinerary/calendar.svg?url";
import clockIcon from "@/assets/icons/itinerary/clock.svg?url";
import PencilIcon from "@/assets/icons/itinerary/pencil.svg?svgr";
import titleIcon from "@/assets/icons/itinerary/title.svg?url";
import { Card, Modal, TextInput, Toast } from "@/components";
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
  // 처음 생성한 여행의 숙박 수만 고정한다. 시작/종료 시간은 각각 독립적으로 바꿀 수 있고,
  // 날짜를 옮길 때만 반대쪽 날짜가 같은 숙박 수만큼 따라간다.
  const [originalNights] = useState(() => {
    const initialStart = parseTripDateTime(trip.startDate);
    const initialEnd = parseTripDateTime(trip.endDate);
    const startDay = new Date(
      initialStart.getFullYear(),
      initialStart.getMonth(),
      initialStart.getDate(),
    );
    const endDay = new Date(initialEnd.getFullYear(), initialEnd.getMonth(), initialEnd.getDate());
    return Math.max(0, Math.round((endDay.getTime() - startDay.getTime()) / 86_400_000));
  });
  const minStartDate = formatTripDateTime(new Date());
  const minEnd = parseTripDateTime(startDate);
  minEnd.setDate(minEnd.getDate() + originalNights);
  if (originalNights > 0) minEnd.setHours(0, 0, 0, 0);
  const minEndDate = formatTripDateTime(minEnd);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartDateChange = (nextStartDate: string) => {
    const nextStart = parseTripDateTime(nextStartDate);
    const currentEnd = parseTripDateTime(endDate);
    const nextEnd = new Date(
      nextStart.getFullYear(),
      nextStart.getMonth(),
      nextStart.getDate() + originalNights,
      currentEnd.getHours(),
      currentEnd.getMinutes(),
    );

    setStartDate(nextStartDate);
    setEndDate(formatTripDateTime(nextEnd));
  };

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
          className="!h-[34px] w-full !rounded-lg !px-2.5 !text-xs !font-medium !text-text-primary"
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
              onChange={handleStartDateChange}
              minValue={minStartDate}
              onInvalidSelect={() => setToastMessage("지난 날짜/시간은 선택할 수 없어요.")}
              className="flex-1 w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <DateTimeLabel label="종료 시간" />
            <TripDateTimePicker
              value={endDate}
              onChange={setEndDate}
              minValue={minEndDate}
              lockDate
              onInvalidSelect={() => setToastMessage("지난 날짜/시간은 선택할 수 없어요.")}
              className="flex-1 w-auto"
            />
          </div>
        </div>

        <Card variant="glass-sm" className="mt-5 w-full rounded-lg px-3 py-2">
          <p className="text-center text-sm font-medium text-sub-darkgray break-keep">
            * 처음 정한 여행 일수는 그대로 유지돼요. 시작 날짜를 옮기면 종료 날짜가 자동으로
            변경되고, 시간은 각각 바꿀 수 있어요.
          </p>
        </Card>
      </div>

      <Toast
        isVisible={toastMessage !== null}
        onHide={() => setToastMessage(null)}
        message={toastMessage ?? ""}
        variant="warning"
      />
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
