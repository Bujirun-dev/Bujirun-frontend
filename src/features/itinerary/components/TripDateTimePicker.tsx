import { useState } from "react";

interface TripDateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  minValue?: string;
}

type TimeInputType = "hour" | "minute";

const pad = (value: number) => String(value).padStart(2, "0");

export const parseTripDateTime = (value: string) => {
  const [datePart, timePart = "00:00"] = value.split(" ");
  const [year, month, day] = datePart.split(".").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute);
};

export const formatTripDateTime = (date: Date) =>
  `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`;

const getCalendarDays = (monthDate: Date) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  return [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: lastDate }, (_, index) => index + 1),
  ];
};

const isBeforeMinute = (date: Date, target: Date) =>
  date.getTime() < new Date(target).setSeconds(0, 0);

export function TripDateTimePicker({ value, onChange, minValue }: TripDateTimePickerProps) {
  const selectedDate = parseTripDateTime(value);
  const minDate = minValue ? parseTripDateTime(minValue) : null;
  const [isOpen, setIsOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => parseTripDateTime(value));
  const [hourInput, setHourInput] = useState(() => pad(selectedDate.getHours()));
  const [minuteInput, setMinuteInput] = useState(() => pad(selectedDate.getMinutes()));
  const calendarDays = getCalendarDays(calendarMonth);

  const applyDate = (date: Date) => {
    if (minDate && isBeforeMinute(date, minDate)) {
      onChange(formatTripDateTime(minDate));
      setHourInput(pad(minDate.getHours()));
      setMinuteInput(pad(minDate.getMinutes()));
      return;
    }

    onChange(formatTripDateTime(date));
  };
  const openPicker = () => {
    const targetDate = parseTripDateTime(value);

    setIsOpen(true);
    setCalendarMonth(new Date(targetDate.getFullYear(), targetDate.getMonth(), 1));
    setHourInput(pad(targetDate.getHours()));
    setMinuteInput(pad(targetDate.getMinutes()));
  };
  const moveCalendarMonth = (amount: number) => {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };
  const handleDateSelect = (day: number) => {
    applyDate(
      new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth(),
        day,
        selectedDate.getHours(),
        selectedDate.getMinutes(),
      ),
    );
  };
  const isDisabledDate = (day: number) =>
    Boolean(
      minDate &&
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day, 23, 59).getTime() <
        minDate.getTime(),
    );
  const handleTimeInput = (type: TimeInputType, inputValue: string) => {
    const numericValue = inputValue.replace(/\D/g, "").slice(0, 2);
    const setInput = type === "hour" ? setHourInput : setMinuteInput;

    setInput(numericValue);

    if (!numericValue) return;

    const maxValue = type === "hour" ? 23 : 59;
    const nextValue = Math.min(maxValue, Number(numericValue));
    const nextDate = new Date(selectedDate);

    if (type === "hour") {
      nextDate.setHours(nextValue);
    } else {
      nextDate.setMinutes(nextValue);
    }

    applyDate(nextDate);
  };
  const handleTimeInputBlur = (type: TimeInputType) => {
    const inputValue = type === "hour" ? hourInput : minuteInput;
    const selectedValue = type === "hour" ? selectedDate.getHours() : selectedDate.getMinutes();
    const maxValue = type === "hour" ? 23 : 59;
    const nextValue = inputValue ? Math.min(maxValue, Number(inputValue)) : selectedValue;
    const nextInput = pad(nextValue);

    if (type === "hour") {
      setHourInput(nextInput);
      return;
    }

    setMinuteInput(nextInput);
  };

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        className="h-[27px] w-[197px] rounded-lg border-[0.5px] border-sub-lightblue bg-main-blue/20 px-3 text-left text-xs font-light text-text-primary outline-none"
      >
        {value}
      </button>

      {isOpen && (
        <div className="fixed left-1/2 top-1/2 z-10 w-[252px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-sub-lightblue bg-main-white p-[10px] shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              className="size-[22px] rounded-full bg-main-blue/20 text-sm text-text-primary active:opacity-70"
              onClick={() => moveCalendarMonth(-1)}
            >
              &lt;
            </button>
            <span className="text-sm font-semibold text-text-heading">
              {calendarMonth.getFullYear()}.{pad(calendarMonth.getMonth() + 1)}
            </span>
            <button
              type="button"
              className="size-[22px] rounded-full bg-main-blue/20 text-sm text-text-primary active:opacity-70"
              onClick={() => moveCalendarMonth(1)}
            >
              &gt;
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-sub-gray">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (!day) return <span key={`empty-${index}`} />;

              const isSelected =
                selectedDate.getFullYear() === calendarMonth.getFullYear() &&
                selectedDate.getMonth() === calendarMonth.getMonth() &&
                selectedDate.getDate() === day;
              const isDisabled = isDisabledDate(day);

              return (
                <button
                  type="button"
                  key={day}
                  disabled={isDisabled}
                  className={`h-[22px] rounded-md text-xs active:opacity-70 ${
                    isDisabled
                      ? "bg-system-searchbg text-sub-lightgray"
                      : isSelected
                        ? "bg-main-blue text-main-white"
                        : "bg-system-searchbg text-text-primary"
                  }`}
                  onClick={() => handleDateSelect(day)}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-center gap-1.5">
            <input
              type="text"
              inputMode="numeric"
              value={hourInput}
              onChange={(event) => handleTimeInput("hour", event.target.value)}
              onBlur={() => handleTimeInputBlur("hour")}
              onFocus={(event) => event.currentTarget.select()}
              className="h-[30px] w-[48px] rounded-lg border-[0.5px] border-sub-lightblue bg-main-blue/20 text-center text-xs text-text-primary outline-none"
            />
            <span className="text-sm font-semibold text-text-primary">:</span>
            <input
              type="text"
              inputMode="numeric"
              value={minuteInput}
              onChange={(event) => handleTimeInput("minute", event.target.value)}
              onBlur={() => handleTimeInputBlur("minute")}
              onFocus={(event) => event.currentTarget.select()}
              className="h-[30px] w-[48px] rounded-lg border-[0.5px] border-sub-lightblue bg-main-blue/20 text-center text-xs text-text-primary outline-none"
            />
            <button
              type="button"
              className="h-[30px] rounded-lg bg-main-blue px-3 text-xs font-semibold text-main-white active:opacity-70"
              onClick={() => setIsOpen(false)}
            >
              완료
            </button>
          </div>
        </div>
      )}
    </>
  );
}
