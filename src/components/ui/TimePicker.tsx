"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/shared/utils";
import { Button } from "./Button";

interface TimePickerProps {
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
  onConfirm: () => void;
  onClose: () => void;
  isOpen: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const ITEM_H = 44;
const VISIBLE = 5;

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

  useEffect(() => {
    if (!ref.current) return;
    ref.current.scrollTo({ top: selected * ITEM_H, behavior: "smooth" });
  }, [selected]);

  const handleScroll = () => {
    if (!ref.current) return;
    const idx = Math.round(ref.current.scrollTop / ITEM_H);
    onSelect(items[Math.min(idx, items.length - 1)]);
  };

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="relative z-10 w-[64px] overflow-y-scroll"
      style={{
        height: ITEM_H * VISIBLE,
        scrollSnapType: "y mandatory",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div style={{ paddingTop: ITEM_H * 2, paddingBottom: ITEM_H * 2 }}>
        {items.map((v) => (
          <div
            key={v}
            onClick={() => onSelect(v)}
            style={{ height: ITEM_H, scrollSnapAlign: "center" }}
            className={cn(
              "flex items-center justify-center cursor-pointer font-paperlogy transition-all select-none",
              v === selected
                ? "text-[20px] font-bold text-text-heading"
                : "text-[16px] font-semibold text-sub-gray"
            )}
          >
            {String(v).padStart(2, "0")}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TimePicker({
  hour,
  minute,
  onChange,
  onConfirm,
  onClose,
  isOpen,
}: TimePickerProps) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center px-6"
      style={{ backgroundColor: "var(--color-system-blackbg)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[24px] px-8 py-6 flex flex-col items-center gap-4 w-[260px]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-paperlogy font-bold text-[20px] text-text-heading">시간 변경</h3>

        {/* 스크롤 영역 + 하이라이트 */}
        <div className="relative flex items-center gap-2" style={{ height: ITEM_H * VISIBLE }}>
          {/* 선택된 행 하이라이트 (두 컬럼 전체 너비) */}
          <div
            className="absolute -left-4 -right-4 rounded-[14px] z-0"
            style={{
              top: ITEM_H * 2,
              height: ITEM_H,
              backgroundColor: "var(--color-system-scroll)",
            }}
          />

          <ScrollColumn
            items={HOURS}
            selected={hour}
            onSelect={(h) => onChange(h, minute)}
          />

          <span
            className="relative z-10 font-paperlogy font-bold text-[22px] text-text-heading"
            style={{ lineHeight: 1 }}
          >
            :
          </span>

          <ScrollColumn
            items={MINUTES}
            selected={minute}
            onSelect={(m) => onChange(hour, m)}
          />
        </div>

        <Button variant="primary" onClick={onConfirm} className="w-full">
          완료
        </Button>
      </div>
    </div>
  );
}
