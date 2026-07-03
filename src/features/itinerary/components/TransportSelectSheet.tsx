"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import kakaoMapLogo from "@/assets/icons/itinerary/kakaomap_horizontal_ko.png";
import { TransportCard } from "./TransportCard";
import type { TransportLeg } from "./TransportCard";

export interface RouteOption {
  id: string;
  legs: TransportLeg[];
  durationMin: number;
  cost: number;
  isRecommended?: boolean;
}

interface TransportSelectSheetProps {
  isOpen: boolean;
  onClose: () => void;
  from: string;
  to: string;
  options: RouteOption[];
  selectedOptionId?: string;
  onSelect: (option: RouteOption) => void;
}

export function openKakaoMapRoute(from: string, to: string) {
  const openWithCoords = (fx: string, fy: string, tx: string, ty: string) => {
    // 앱 딥링크 (sp/ep = 위도,경도 순)
    window.location.href = `kakaomap://route?sp=${fy},${fx}&ep=${ty},${tx}&by=PUBLIC`;
    // 앱 미설치 시 1.5초 후 웹 fallback — link/to 형식은 좌표로 목적지 지정
    setTimeout(() => {
      window.open(`https://map.kakao.com/link/to/${encodeURIComponent(to)},${ty},${tx}`, "_blank");
    }, 1500);
  };

  const geocodeAndOpen = () => {
    const kakao = window.kakao!;
    kakao.maps.load(() => {
      const ps = new kakao.maps.services.Places();
      const coords: ({ x: string; y: string } | null)[] = [null, null];
      let done = 0;

      const tryOpen = () => {
        done++;
        if (done < 2) return;
        const f = coords[0];
        const t = coords[1];
        if (f && t) {
          openWithCoords(f.x, f.y, t.x, t.y);
        } else {
          // 검색 실패 시 목적지만 웹으로
          window.open(`https://map.kakao.com/link/search/${encodeURIComponent(to)}`, "_blank");
        }
      };

      ps.keywordSearch(from, (res, status) => {
        if (status === kakao.maps.services.Status.OK) coords[0] = res[0];
        tryOpen();
      });
      ps.keywordSearch(to, (res, status) => {
        if (status === kakao.maps.services.Status.OK) coords[1] = res[0];
        tryOpen();
      });
    });
  };

  if (window.kakao?.maps) {
    geocodeAndOpen();
    return;
  }

  // SDK 아직 미로드 — 최대 5초 대기
  const start = Date.now();
  const id = setInterval(() => {
    if (window.kakao?.maps) {
      clearInterval(id);
      geocodeAndOpen();
    } else if (Date.now() - start > 5000) {
      clearInterval(id);
      window.open(`https://map.kakao.com/link/search/${encodeURIComponent(to)}`, "_blank");
    }
  }, 200);
}

export function TransportSelectSheet({
  isOpen,
  onClose,
  from,
  to,
  options,
  selectedOptionId,
  onSelect,
}: TransportSelectSheetProps) {
  if (!isOpen) return null;

  if (typeof document === "undefined") return null;

  const appRoot = document.getElementById("app-root");
  if (!appRoot) return null;

  return createPortal(
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-system-blackbg px-5 py-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[330px] max-h-[80dvh] bg-main-white rounded-2xl px-5 py-6 flex flex-col gap-3 overflow-y-auto overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="닫기"
          className="absolute right-5 top-5 flex h-5 w-5 cursor-pointer items-center justify-center text-main-blue active:opacity-70"
          onClick={onClose}
        >
          <svg
            viewBox="0 0 512.021 512.021"
            className="h-4 w-4"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M301.258,256.01L502.645,54.645c12.501-12.501,12.501-32.769,0-45.269c-12.501-12.501-32.769-12.501-45.269,0l0,0L256.01,210.762L54.645,9.376c-12.501-12.501-32.769-12.501-45.269,0s-12.501,32.769,0,45.269L210.762,256.01L9.376,457.376c-12.501,12.501-12.501,32.769,0,45.269s32.769,12.501,45.269,0L256.01,301.258l201.365,201.387c12.501,12.501,32.769,12.501,45.269,0c12.501-12.501,12.501-32.769,0-45.269L301.258,256.01z"
              stroke="currentColor"
              strokeWidth="18"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="flex items-center justify-start pr-8">
          <button
            className="rounded-lg bg-main-blue p-1 active:opacity-80"
            onClick={() => openKakaoMapRoute(from, to)}
          >
            <Image src={kakaoMapLogo} alt="카카오맵" width={55} height={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {options.map((option) => (
            <button
              key={option.id}
              className="text-left active:opacity-80"
              onClick={() => onSelect(option)}
            >
              <TransportCard
                from={from}
                to={to}
                durationMin={option.durationMin}
                cost={option.cost}
                legs={option.legs}
                isRecommended={option.isRecommended}
                selected={selectedOptionId === undefined || option.id === selectedOptionId}
              />
            </button>
          ))}
        </div>
      </div>
    </div>,
    appRoot,
  );
}
