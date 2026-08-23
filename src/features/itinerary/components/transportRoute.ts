"use client";

import type { TransportLeg } from "./TransportCard";

export interface RouteOption {
  id: string;
  legs: TransportLeg[];
  durationMin: number;
  cost: number;
  isRecommended?: boolean;
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
