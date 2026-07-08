"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CalendarIcon from "@/assets/icons/itinerary/calendar.svg?svgr";
import ClockIcon from "@/assets/icons/itinerary/clock.svg?svgr";
import FriendsIcon from "@/assets/icons/itinerary/friends.svg?svgr";
import TitleIcon from "@/assets/icons/itinerary/title.svg?svgr";
import NoIcon from "@/assets/icons/login-register/no.svg?svgr";
import YesIcon from "@/assets/icons/login-register/yes.svg?svgr";
import { Counter } from "@/components";
import { TripDateTimePicker, formatTripDateTime, parseTripDateTime } from "./TripDateTimePicker";
import { cn } from "@/shared/utils";
import { groupApi } from "@/shared/api/domains";

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
  const [isCreating, setIsCreating] = useState(false);

  const nameLength = tripName.length;
  const isNameValid = nameLength >= 2 && nameLength <= 15;
  const hasName = nameLength > 0;

  const getMaxEndDate = () => {
    const start = parseTripDateTime(startDate);
    const max = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 3, 23, 50);
    return formatTripDateTime(max);
  };

  const getTotalDays = () => {
    const start = parseTripDateTime(startDate);
    const end = parseTripDateTime(endDate);
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const nights = Math.max(0, Math.round((endDay.getTime() - startDay.getTime()) / 86400000));
    return nights + 1;
  };

  const handleInvite = async () => {
    if (!isNameValid || isCreating) return;
    setIsCreating(true);
    try {
      const group = await groupApi.createGroup({ name: tripName });
      const params = new URLSearchParams({
        count: String(friendCount),
        days: String(getTotalDays()),
        groupId: group.id ?? "",
        inviteCode: group.inviteCode ?? "",
      });
      router.push(`/itinerary/trips/invite?${params.toString()}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="-mx-6 flex flex-col gap-5 rounded-tl-[40px] rounded-tr-[40px] bg-white px-8 pt-9 pb-6">
      {/* 여행명 */}
      <section>
        <div className="flex items-center gap-1.5 mb-[10px]">
          <TitleIcon width={16} height={16} className="-translate-y-[1px]" aria-hidden />
          <span className="font-ssurround font-bold text-lg text-text-heading">여행명</span>
        </div>
        <div className="relative">
          <input
            type="text"
            value={tripName}
            onChange={(e) => setTripName(e.target.value.slice(0, 15))}
            placeholder="2-15글자 입력 가능"
            className={cn(
              "w-full rounded-[10px] border py-[10px] pl-[15px] pr-10",
              "font-paperlogy font-medium text-xs text-sub-gray",
              "placeholder:font-paperlogy placeholder:font-medium placeholder:text-xs placeholder:text-sub-gray",
              "outline-none transition-colors",
              hasName ? "border-main-blue" : "border-sub-gray",
            )}
          />
          {hasName && (
            <div className="absolute right-[10px] top-1/2 -translate-y-1/2 flex items-center justify-center">
              {isNameValid ? (
                <YesIcon width={14} height={14} className="fill-sub-deepblue" aria-hidden />
              ) : (
                <button
                  type="button"
                  onClick={() => setTripName("")}
                  aria-label="지우기"
                  className="flex items-center justify-center p-0 leading-none"
                >
                  <NoIcon width={14} height={14} className="fill-sub-coral" aria-hidden />
                </button>
              )}
            </div>
          )}
        </div>
        <p
          className={cn(
            "mt-[6px] h-[17px] pr-[8px] text-right font-paperlogy text-sm font-semibold text-sub-gray",
            !hasName && "opacity-0",
          )}
        >
          {nameLength}/15
        </p>
      </section>

      {/* 여행기간 */}
      <section className="-mt-1">
        <div className="flex items-center gap-1.5 mb-[10px]">
          <CalendarIcon width={16} height={16} aria-hidden />
          <span className="font-ssurround font-bold text-lg text-text-heading">여행기간</span>
        </div>
        <div className="flex flex-col gap-3 rounded-[20px] border border-main-blue/20 bg-gradient-to-b from-system-glassfrom to-system-glassto px-[28px] py-[16px]">
          <div className="flex items-center gap-[14px]">
            <div className="flex items-center gap-[4px]">
              <ClockIcon width={12} height={12} aria-hidden />
              <span className="font-paperlogy font-semibold text-sm text-text-primary">
                시작 시간
              </span>
            </div>
            <TripDateTimePicker value={startDate} onChange={setStartDate} className="flex-1" />
          </div>
          <div className="flex items-center gap-[14px]">
            <div className="flex items-center gap-[4px]">
              <ClockIcon width={12} height={12} aria-hidden />
              <span className="font-paperlogy font-semibold text-sm text-text-primary">
                종료 시간
              </span>
            </div>
            <TripDateTimePicker
              value={endDate}
              onChange={setEndDate}
              minValue={startDate}
              maxValue={getMaxEndDate()}
              className="flex-1"
            />
          </div>
        </div>
      </section>

      {/* 친구 수 */}
      <section className="mt-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FriendsIcon width={16} height={16} aria-hidden />
          <span className="font-ssurround font-bold text-lg text-text-heading">친구 수</span>
        </div>
        <Counter value={friendCount} onChange={setFriendCount} min={2} max={6} />
      </section>

      {/* 친구 초대하기 버튼 */}
      <button
        type="button"
        onClick={handleInvite}
        disabled={!isNameValid || isCreating}
        className={cn(
          "mt-1 h-[40px] w-full rounded-[10px] font-ssurround font-bold text-sm transition-colors",
          isNameValid
            ? "bg-main-blue text-white active:opacity-80"
            : "border-2 border-main-blue text-main-blue bg-transparent",
        )}
      >
        {isCreating ? "생성 중..." : "친구 초대하기"}
      </button>
    </div>
  );
}
