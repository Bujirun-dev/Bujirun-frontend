"use client";

import { forwardRef, useRef, useEffect } from "react";
import CloseIcon from "@/assets/icons/mypage/close.svg?svgr";
import { cn } from "@/shared/utils";

const ITEM_H = 24;
const VISIBLE = 5;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 6 }, (_, i) => i * 10);

function ScrollColumn({
  items,
  selected,
  onSelect,
}: {
  items: number[];
  selected: number;
  onSelect: (v: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isProgrammatic = useRef(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!ref.current) return;
    isProgrammatic.current = true;
    const behavior = isFirstRender.current ? "instant" : "smooth";
    isFirstRender.current = false;
    const closestIndex = items.reduce(
      (closest, v, i) =>
        Math.abs(v - selected) < Math.abs(items[closest] - selected) ? i : closest,
      0,
    );
    ref.current.scrollTo({ top: closestIndex * ITEM_H, behavior });
    const t = setTimeout(() => {
      isProgrammatic.current = false;
    }, 400);
    return () => clearTimeout(t);
  }, [selected, items]);

  const handleScroll = () => {
    if (isProgrammatic.current) return;
    if (!ref.current) return;
    const idx = Math.round(ref.current.scrollTop / ITEM_H);
    onSelect(items[Math.min(idx, items.length - 1)]);
  };

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="relative z-10 w-10 overflow-y-scroll"
      style={{
        height: ITEM_H * VISIBLE,
        scrollSnapType: "y mandatory",
      }}
    >
      <div style={{ paddingTop: ITEM_H * 2, paddingBottom: ITEM_H * 2 }}>
        {items.map((v) => {
          const dist = Math.abs(v - selected);
          return (
            <div
              key={v}
              onClick={() => onSelect(v)}
              style={{ height: ITEM_H, scrollSnapAlign: "center" }}
              className={cn(
                "flex items-center justify-center cursor-pointer select-none font-semibold transition-all duration-150",
                dist === 0
                  ? "text-md text-text-primary"
                  : dist === 1
                    ? "text-sm text-sub-gray/70"
                    : "text-xs text-sub-gray/30",
              )}
            >
              {String(v).padStart(2, "0")}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TimelineTimePickerProps {
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
  onConfirm: () => void;
  onClose: () => void;
}

// 다른 타임라인 팝업(검색/상세)과 동일하게 해당 행 안에서 absolute로 띄운다.
// 예전엔 createPortal + getBoundingClientRect로 픽셀 좌표를 한 번만 계산해서
// app-root에 붙였는데, 그 뒤에 타임라인을 스크롤하면 팝업이 원래 시간 위치에서
// 떨어져 보이는 문제가 있었다. 행 안에 두면 스크롤에 자연히 같이 따라온다.
export const TimelineTimePicker = forwardRef<HTMLDivElement, TimelineTimePickerProps>(
  function TimelineTimePicker({ hour, minute, onChange, onConfirm, onClose }, ref) {
    return (
      <div
        ref={ref}
        className="absolute left-[52px] top-0 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative flex flex-col gap-2 rounded-2xl bg-main-white shadow-[2px_2px_10px_0px_var(--color-system-glassborder)]"
          style={{ width: 163, padding: "20px 16px" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center text-main-blue active:opacity-70"
          >
            <CloseIcon width={20} height={20} className="text-main-blue" aria-hidden />
          </button>
          <p className="text-center font-ssurround font-bold text-md text-text-heading">
            시간 변경
          </p>

          <div
            className="relative flex items-center justify-center gap-1.5"
            style={{ height: ITEM_H * VISIBLE }}
          >
            <div
              className="absolute left-0 right-0 z-0 rounded-[6px] border-[0.3px] border-main-blue"
              style={{
                top: ITEM_H * 2,
                height: ITEM_H,
                backgroundColor: "var(--color-system-scroll)",
                opacity: 0.5,
              }}
            />
            <ScrollColumn items={HOURS} selected={hour} onSelect={(h) => onChange(h, minute)} />
            <span className="relative z-10 text-md font-semibold text-text-heading leading-none">
              :
            </span>
            <ScrollColumn items={MINUTES} selected={minute} onSelect={(m) => onChange(hour, m)} />
          </div>

          <button
            type="button"
            onClick={onConfirm}
            className="w-full h-7 rounded-[7px] bg-main-blue px-[34px] font-ssurround font-bold text-sm text-main-white active:opacity-80"
          >
            완료
          </button>
        </div>
      </div>
    );
  },
);
