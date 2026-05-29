"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "@/shared/constants/navigation";

// Inline SVG path data (아이콘의 실제 모양 데이터)
const homeOffPath =
  "M19,24H5c-2.757,0-5-2.243-5-5V9.724c0-1.665,.824-3.215,2.204-4.145L9.203,.855c1.699-1.146,3.895-1.146,5.594,0l7,4.724c1.379,.93,2.203,2.479,2.203,4.145v9.276c0,2.757-2.243,5-5,5ZM12,1.997c-.584,0-1.168,.172-1.678,.517L3.322,7.237c-.828,.558-1.322,1.487-1.322,2.486v9.276c0,1.654,1.346,3,3,3h14c1.654,0,3-1.346,3-3V9.724c0-.999-.494-1.929-1.321-2.486L13.678,2.514c-.51-.345-1.094-.517-1.678-.517Z";

const homeOnPath =
  "M22,5.735V1.987c0-.553-.447-1-1-1s-1,.447-1,1v2.379L14.797,.855c-1.699-1.146-3.895-1.146-5.594,0L2.204,5.579c-1.38,.93-2.204,2.479-2.204,4.145v9.276c0,2.757,2.243,5,5,5h14c2.757,0,5-2.243,5-5V9.724c0-1.579-.748-3.047-2-3.989Z";

const itineraryOffPath =
  "M19,2h-1V1c0-.552-.447-1-1-1s-1,.448-1,1v1H8V1c0-.552-.447-1-1-1s-1,.448-1,1v1h-1C2.243,2,0,4.243,0,7v12c0,2.757,2.243,5,5,5h14c2.757,0,5-2.243,5-5V7c0-2.757-2.243-5-5-5ZM5,4h14c1.654,0,3,1.346,3,3v1H2v-1c0-1.654,1.346-3,3-3Zm14,18H5c-1.654,0-3-1.346-3-3V10H22v9c0,1.654-1.346,3-3,3Zm0-8c0,.552-.447,1-1,1H6c-.553,0-1-.448-1-1s.447-1,1-1h12c.553,0,1,.448,1,1Zm-7,4c0,.552-.447,1-1,1H6c-.553,0-1-.448-1-1s.447-1,1-1h5c.553,0,1,.448,1,1Z";

const itineraryOnPath =
  "M24,8H0v-1C0,4.243,2.243,2,5,2h1V1c0-.552,.447-1,1-1s1,.448,1,1v1h8V1c0-.552,.447-1,1-1s1,.448,1,1v1h1c2.757,0,5,2.243,5,5v1Zm-14,14.545c0-.892,.187-1.753,.535-2.545H6c-.553,0-1-.448-1-1s.447-1,1-1c0,0,4.022,0,5.92,.001l2.001-2.001H6c-.553,0-1-.448-1-1s.447-1,1-1H15.922l2.741-2.741c.812-.812,1.891-1.259,3.039-1.259H0v9c0,2.757,2.243,5,5,5h5v-1.455Zm10.077-9.872c.897-.897,2.353-.897,3.25,0,.897,.897,.897,2.353,0,3.25l-6.807,6.807c-.813,.813-1.915,1.27-3.065,1.27h-1.455v-1.455c0-1.15,.457-2.252,1.27-3.065l6.807-6.807Z";

const collectionOffPath =
  "M17,0H7C4.243,0,2,2.243,2,5v15c0,2.206,1.794,4,4,4h11c2.757,0,5-2.243,5-5V5c0-2.757-2.243-5-5-5Zm3,5v11H8V2h4V10.347c0,.623,.791,.89,1.169,.395l1.331-1.743,1.331,1.743c.378,.495,1.169,.228,1.169-.395V2c1.654,0,3,1.346,3,3ZM6,2.184v13.816c-.732,0-1.409,.212-2,.556V5c0-1.302,.839-2.402,2-2.816Zm11,19.816H6c-2.629-.047-2.627-3.954,0-4h14v1c0,1.654-1.346,3-3,3Z";

const collectionOnPath =
  "m22.2 2.163a5 5 0 0 0 -4.157-1.069l-1.764.432a4 4 0 0 0 -3.279 3.935v15.467a6.909 6.909 0 0 1 -2 0v-15.467a3.981 3.981 0 0 0 -3.226-3.923l-1.874-.456a5 5 0 0 0 -5.9 4.918v10.793a5 5 0 0 0 4.105 4.919l6.286 1.143a9 9 0 0 0 3.218 0l6.291-1.143a5 5 0 0 0 4.1-4.919v-10.793a4.983 4.983 0 0 0 -1.8-3.837z";

const myPageOffPath =
  "M10,12a1,1,0,0,1-1-1c0-1.054-.68-2-1-2s-1,.946-1,2a1,1,0,0,1-2,0C5,9.108,6.232,7,8,7s3,2.108,3,4A1,1,0,0,1,10,12Zm9-1c0-1.892-1.232-4-3-4s-3,2.108-3,4a1,1,0,0,0,2,0c0-1.054.68-2,1-2s1,.946,1,2a1,1,0,0,0,2,0Zm5,1A12.013,12.013,0,0,0,12,0C-3.9.6-3.893,23.4,12,24A12.013,12.013,0,0,0,24,12Zm-2,0A10.011,10.011,0,0,1,12,22C-1.249,21.5-1.244,2.5,12,2A10.011,10.011,0,0,1,22,12Zm-4.334,3.746a1,1,0,0,0-1.33-1.493,6.36,6.36,0,0,1-8.67,0,1,1,0,0,0-1.332,1.492A9.454,9.454,0,0,0,12,18,9.454,9.454,0,0,0,17.666,15.746Z";

const myPageOnPath =
  "M12,0A12.013,12.013,0,0,0,0,12c.6,15.9,23.4,15.893,24,0A12.013,12.013,0,0,0,12,0ZM6,12a1,1,0,0,1-1-1C5,9.108,6.232,7,8,7s3,2.108,3,4a1,1,0,0,1-2,0c0-1.054-.679-2-1-2s-1,.946-1,2A1,1,0,0,1,6,12Zm10.949,3.293a5.178,5.178,0,0,1-9.9.007A.994.994,0,0,1,8.009,14H15.99A.994.994,0,0,1,16.949,15.293ZM18,12a1,1,0,0,1-1-1c0-1.054-.679-2-1-2s-1,.946-1,2a1,1,0,0,1-2,0c0-1.892,1.232-4,3-4s3,2.108,3,4A1,1,0,0,1,18,12Z";

// 네비게이션 라벨 반환
function getNavLabel(href: string) {
  const labelMap = {
    "/": "홈",
    "/itinerary": "일정",
    "/collection": "도감",
    "/mypage": "마이페이지",
  };
  return labelMap[href as keyof typeof labelMap];
}

// href별 아이콘 경로 데이터 맵
const ICON_PATHS = {
  "/": { off: homeOffPath, on: homeOnPath },
  "/itinerary": { off: itineraryOffPath, on: itineraryOnPath },
  "/collection": { off: collectionOffPath, on: collectionOnPath },
  "/mypage": { off: myPageOffPath, on: myPageOnPath },
} as const;

type NavHref = keyof typeof ICON_PATHS;

function isNavHref(href: string): href is NavHref {
  return href in ICON_PATHS;
}

// 각 탭의 아이콘 렌더링 컴포넌트
function NavIcon({ href, isActive }: { href: string; isActive: boolean }) {
  if (!isNavHref(href)) return null;

  const { off, on } = ICON_PATHS[href];

  return (
    <div className="relative size-4.5">
      {/* 아이콘 */}
      {/* 비활성화 시 */}
      <svg
        viewBox="0 0 24 24"
        className={`absolute inset-0 size-4.5 text-text-primary transition-all duration-500 ease-out ${
          isActive ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <path d={off} fill="currentColor" />
      </svg>

      {/* 활성화 시 */}
      <svg
        viewBox="0 0 24 24"
        className={`absolute inset-0 size-4.5 text-sub-deepblue transition-all duration-500 ease-out ${
          isActive ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <path d={on} fill="currentColor" />
      </svg>
    </div>
  );
}

// 실제 페이지에서 사용하는 하단 네비게이션 컴포넌트
export function BottomNavigation() {
  // 현재 주소 가져오기
  const pathname = usePathname();

  return (
    // 하단 네비게이션 전체 디자인
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[402px] pb-[env(safe-area-inset-bottom)] bg-main-white backdrop-blur">
      <div className="grid h-17 grid-cols-4 p-2">
        {/* 메뉴 배열을 돌면서 탭을 하나씩 만들기 */}
        {navigationItems.map((item) => {
          // 현재 탭이 활성화 상태인지 판단
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            // 각 탭 클릭 -> 해당 경로로 이동
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className="relative flex min-w-0 flex-col items-center justify-center text-[11px] font-semibold transition-colors"
            >
              {/* 활성화 시 */}
              {/* 배경 - 활성화 상태일 때만 표시 */}
              <div
                className={`absolute size-14 rounded-2xl transition-all duration-500 ease-out ${
                  isActive ? "bg-main-blue/[0.18]" : "bg-transparent"
                }`}
              />

              {/* 아이콘 + 라벨 */}
              <div className="relative flex translate-y-0.5 flex-col items-center justify-center gap-1.5">
                <NavIcon href={item.href} isActive={isActive} />
                <span
                  className={`translate-y-0 rounded-lg px-0 py-0 font-paperlogy text-[10px] font-semibold leading-none transition-all duration-500 ease-out ${
                    isActive ? "text-sub-deepblue opacity-100" : "text-text-primary opacity-100"
                  }`}
                >
                  {getNavLabel(item.href)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
