"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";

interface KakaoMapSheetProps {
  isOpen: boolean;
  onClose: () => void;
  from: string;
  to: string;
}

function initKakaoMap(container: HTMLDivElement, from: string, to: string) {
  const kakao = window.kakao!;
  console.log("[KakaoMap] container size:", container.offsetWidth, "x", container.offsetHeight);

  const defaultCenter = new kakao.maps.LatLng(35.1796, 129.0756);
  const map = new kakao.maps.Map(container, { center: defaultCenter, level: 5 });
  const bounds = new kakao.maps.LatLngBounds();
  const ps = new kakao.maps.services.Places();

  const searchAndMark = (keyword: string, label: string) =>
    new Promise<void>((resolve) => {
      ps.keywordSearch(keyword, (result, status) => {
        console.log(`[KakaoMap] search "${keyword}":`, status, result?.[0]);
        if (status === kakao.maps.services.Status.OK && result.length > 0) {
          const latlng = new kakao.maps.LatLng(Number(result[0].y), Number(result[0].x));
          const marker = new kakao.maps.Marker({ map, position: latlng, title: label });
          const infoWindow = new kakao.maps.InfoWindow({
            content: `<div style="padding:4px 8px;font-size:12px;font-weight:600;white-space:nowrap">${label}</div>`,
          });
          infoWindow.open(map, marker);
          bounds.extend(latlng);
        }
        resolve();
      });
    });

  Promise.all([searchAndMark(from, "출발"), searchAndMark(to, "도착")]).then(() => {
    map.setBounds(bounds);
  });
}

export function KakaoMapSheet({ isOpen, onClose, from, to }: KakaoMapSheetProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const tryInit = () => {
      const container = mapRef.current;
      if (!container) {
        console.log("[KakaoMap] container not ready yet");
        return;
      }
      if (!window.kakao?.maps) {
        console.log("[KakaoMap] waiting for SDK...");
        return;
      }
      window.kakao.maps.load(() => {
        console.log("[KakaoMap] load callback fired");
        initKakaoMap(container, from, to);
      });
    };

    const id = setInterval(() => {
      if (mapRef.current && window.kakao?.maps) {
        clearInterval(id);
        tryInit();
      }
    }, 100);

    // 이미 로드되어 있으면 바로 실행
    setTimeout(tryInit, 50);

    return () => clearInterval(id);
  }, [isOpen, from, to]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-sub-lightgray shrink-0">
        <button onClick={onClose} className="p-1 -ml-1">
          <ChevronLeft size={20} className="text-text-heading" />
        </button>
        <span className="font-paperlogy font-semibold text-sm text-text-heading truncate">
          {from} → {to}
        </span>
      </div>
      <div ref={mapRef} className="flex-1 w-full" />
    </div>
  );
}
