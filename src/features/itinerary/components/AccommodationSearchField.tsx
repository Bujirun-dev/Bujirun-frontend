"use client";

import { useEffect, useState } from "react";
import MarkerIcon from "@/assets/icons/itinerary/marker.svg?svgr";
import NoIcon from "@/assets/icons/login-register/no.svg?svgr";
import { cn } from "@/shared/utils";
import type { KakaoPlaceResult } from "@/shared/types/kakao-map";

export interface AccommodationPlace {
  name: string;
  address: string;
}

interface AccommodationSearchFieldProps {
  value: AccommodationPlace | null;
  onChange: (place: AccommodationPlace | null) => void;
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

// 카카오맵 SDK는 layout.tsx에서 autoload=false로 로드되므로, 최초 사용 시점에
// kakao.maps.load()로 한 번 초기화해줘야 한다 (TransportSelectSheet의 지오코딩과 동일한 패턴).
function loadKakaoMaps(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => resolve(true));
      return;
    }
    const start = Date.now();
    const id = window.setInterval(() => {
      if (window.kakao?.maps) {
        window.clearInterval(id);
        window.kakao.maps.load(() => resolve(true));
      } else if (Date.now() - start > 5000) {
        window.clearInterval(id);
        resolve(false);
      }
    }, 200);
  });
}

export function AccommodationSearchField({ value, onChange }: AccommodationSearchFieldProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KakaoPlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    const keyword = debouncedQuery.trim();
    // 검색어가 비어 있으면 드롭다운 자체를 렌더링하지 않으므로(query.trim() 가드),
    // 여기서 이전 결과를 지울 필요 없이 그냥 검색을 건너뛴다.
    if (!keyword) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSearching(true);
    loadKakaoMaps().then((loaded) => {
      if (cancelled) return;
      if (!loaded || !window.kakao?.maps) {
        setIsSearching(false);
        return;
      }
      const places = new window.kakao.maps.services.Places();
      places.keywordSearch(keyword, (res, status) => {
        if (cancelled) return;
        setIsSearching(false);
        setResults(status === window.kakao!.maps.services.Status.OK ? res : []);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handleSelect = (place: KakaoPlaceResult) => {
    onChange({
      name: place.place_name,
      address: place.road_address_name || place.address_name,
    });
    setQuery("");
    setResults([]);
  };

  const handleClear = () => {
    onChange(null);
    setQuery("");
    setResults([]);
  };

  if (value) {
    return (
      <div className="flex items-start gap-2 rounded-[10px] border border-main-blue bg-sub-lightblue/20 py-[10px] pl-[15px] pr-3">
        <MarkerIcon
          width={14}
          height={14}
          className="mt-[3px] shrink-0 fill-sub-deepblue"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-paperlogy font-semibold text-xs text-text-heading">
            {value.name}
          </p>
          <p className="truncate font-paperlogy font-medium text-2xs text-sub-gray">
            {value.address}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          aria-label="숙소 선택 지우기"
          className="mt-[2px] flex shrink-0 items-center justify-center p-0 leading-none"
        >
          <NoIcon width={14} height={14} className="fill-sub-coral" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="숙소명이나 주소로 검색해보세요"
        className={cn(
          "w-full rounded-[10px] border py-[10px] pl-[15px] pr-10",
          "font-paperlogy font-medium text-xs text-sub-gray",
          "placeholder:font-paperlogy placeholder:font-medium placeholder:text-xs placeholder:text-sub-gray",
          "outline-none transition-colors",
          query ? "border-main-blue" : "border-sub-gray",
        )}
      />

      {query.trim() && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 max-h-[220px] overflow-y-auto rounded-[10px] border border-sub-lightgray bg-white shadow-md">
          {isSearching ? (
            <p className="px-4 py-3 font-paperlogy text-xs text-sub-gray">검색하는 중이에요...</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 font-paperlogy text-xs text-sub-gray">검색 결과가 없어요.</p>
          ) : (
            results.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => handleSelect(place)}
                className="flex w-full flex-col items-start gap-0.5 border-b border-sub-lightgray/60 px-4 py-2.5 text-left last:border-b-0 active:bg-system-navbg"
              >
                <span className="font-paperlogy font-semibold text-xs text-text-primary">
                  {place.place_name}
                </span>
                <span className="font-paperlogy font-medium text-2xs text-sub-gray">
                  {place.road_address_name || place.address_name}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
