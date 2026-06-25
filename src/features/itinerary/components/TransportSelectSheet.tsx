"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import kakaoMapLogo from "@/assets/icons/itinerary/kakaomap_horizontal_ko.png";
import closeIcon from "@/assets/icons/itinerary/circle-xmark.png";
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

function openKakaoMapRoute(from: string, to: string) {
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
      className="absolute inset-0 z-50 flex items-center justify-center px-5 py-6"
      style={{ backgroundColor: "var(--color-system-blackbg)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[350px] max-h-[80dvh] bg-main-white rounded-2xl px-5 py-6 flex flex-col gap-3 overflow-y-auto overflow-x-hidden shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <button className="active:opacity-70" onClick={onClose}>
            <Image src={closeIcon} alt="닫기" width={22} height={22} />
          </button>
          <button
            className="rounded-lg border border-sub-lightgray p-1 active:opacity-80"
            onClick={() => openKakaoMapRoute(from, to)}
          >
            <Image src={kakaoMapLogo} alt="카카오맵" width={55} height={16} />
          </button>
        </div>

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
    </div>,
    appRoot,
  );
}
