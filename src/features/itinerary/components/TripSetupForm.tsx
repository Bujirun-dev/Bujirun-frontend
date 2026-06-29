"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import calendarIcon from "@/assets/icons/itinerary/calendar.svg?url";
import friendsIcon from "@/assets/icons/itinerary/friends.svg?url";
import titleIcon from "@/assets/icons/itinerary/title.svg?url";
import noIcon from "@/assets/icons/login-register/no.svg?url";
import yesIcon from "@/assets/icons/login-register/yes.svg?url";
import { Counter } from "@/components";
import { TripDateTimePicker, formatTripDateTime } from "./TripDateTimePicker";
import { cn } from "@/shared/utils";

const pad = (n: number) => String(n).padStart(2, "0");

function getDefaultDates() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 17, 0);
  return { start: formatTripDateTime(start), end: formatTripDateTime(end) };
}

const DEFAULTS = getDefaultDates();

export function TripSetupForm() {
  const router = useRouter();
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState(DEFAULTS.start);
  const [endDate, setEndDate] = useState(DEFAULTS.end);
  const [friendCount, setFriendCount] = useState(2);

  const nameLength = tripName.length;
  const isNameValid = nameLength >= 2 && nameLength <= 15;
  const hasName = nameLength > 0;

  const handleInvite = () => {
    if (!isNameValid) return;
    // TODO: API 연동 - trip 생성 후 친구 초대 페이지로 이동
    router.push("/itinerary/trips/invite");
  };

  return (
    <div className="-mx-6 bg-white rounded-tl-[40px] rounded-tr-[40px] px-8 pt-9 pb-4 flex flex-col gap-5">
      {/* 여행명 */}
      <section>
        <div className="flex items-center gap-1.5 mb-[10px]">
          <Image src={titleIcon} alt="" width={16} height={16} className="-translate-y-[2px]" aria-hidden />
          <span className="font-ssurround font-bold text-lg text-text-heading">여행명</span>
        </div>
        <div className="relative">
          <input
            type="text"
            value={tripName}
            onChange={(e) => setTripName(e.target.value.slice(0, 15))}
            placeholder="2-15글자 입력 가능"
            className={cn(
              "w-full py-[10px] pl-[15px] pr-14 rounded-[10px] border",
              "font-paperlogy font-medium text-xs text-sub-gray",
              "placeholder:font-paperlogy placeholder:font-medium placeholder:text-xs placeholder:text-sub-gray",
              "outline-none transition-colors",
              hasName ? "border-main-blue" : "border-sub-gray",
            )}
          />
          {hasName && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {isNameValid ? (
                <Image src={yesIcon} alt="유효" width={14} height={14} className="icon-deepblue" aria-hidden />
              ) : (
                <button type="button" onClick={() => setTripName("")} aria-label="지우기">
                  <Image src={noIcon} alt="" width={14} height={14} className="icon-coral" aria-hidden />
                </button>
              )}
            </div>
          )}
        </div>
        {hasName && (
          <p className="text-right font-paperlogy font-semibold text-sm text-sub-gray mt-[4px] pr-1">
            {nameLength}/15
          </p>
        )}
      </section>

      {/* 여행기간 */}
      <section>
        <div className="flex items-center gap-1.5 mb-[10px]">
          <Image src={calendarIcon} alt="" width={16} height={16} aria-hidden />
          <span className="font-ssurround font-bold text-lg text-text-heading">여행기간</span>
        </div>
        <div className="rounded-[20px] border border-main-blue/20 bg-gradient-to-b from-white/50 to-[#EAF4FF]/40 px-6 py-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">⏰</span>
              <span className="text-xs font-semibold text-text-primary tracking-[0.36px]">
                시작 시간
              </span>
            </div>
            <TripDateTimePicker value={startDate} onChange={setStartDate} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">⏰</span>
              <span className="text-xs font-semibold text-text-primary tracking-[0.36px]">
                종료 시간
              </span>
            </div>
            <TripDateTimePicker value={endDate} onChange={setEndDate} minValue={startDate} />
          </div>
        </div>
      </section>

      {/* 친구 수 */}
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Image src={friendsIcon} alt="" width={16} height={16} aria-hidden />
          <span className="font-ssurround font-bold text-lg text-text-heading">친구 수</span>
        </div>
        <Counter value={friendCount} onChange={setFriendCount} min={2} max={6} />
      </section>

      {/* 친구 초대하기 버튼 */}
      <button
        type="button"
        onClick={handleInvite}
        disabled={!isNameValid}
        className={cn(
          "w-full h-[40px] rounded-[10px] font-ssurround font-bold text-sm transition-colors",
          isNameValid
            ? "bg-main-blue text-white active:opacity-80"
            : "border-2 border-main-blue text-main-blue bg-transparent",
        )}
      >
        친구 초대하기
      </button>
    </div>
  );
}
