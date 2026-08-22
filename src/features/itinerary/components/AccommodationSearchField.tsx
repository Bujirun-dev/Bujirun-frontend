"use client";

import { useEffect, useState } from "react";
import CloseIcon from "@/assets/icons/mypage/close.svg?svgr";
import { Modal, SearchBar, LoadingState, EmptyState } from "@/components";
import type { KakaoPlaceResult } from "@/shared/types/kakao-map";

export interface AccommodationPlace {
  name: string;
  address: string;
}

interface AccommodationSearchFieldProps {
  value: AccommodationPlace | null;
  onChange: (place: AccommodationPlace | null) => void;
  // 기본 트리거(입력창/칩) 대신 다른 화면에 맞는 트리거를 직접 그리고 싶을 때 사용.
  // 검색 모달을 여는 함수만 넘겨주고, 모달 자체는 이 컴포넌트가 계속 관리한다.
  renderTrigger?: (args: {
    value: AccommodationPlace | null;
    onOpen: () => void;
  }) => React.ReactNode;
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

export function AccommodationSearchField({
  value,
  onChange,
  renderTrigger,
}: AccommodationSearchFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KakaoPlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    // 모달이 닫혀 있을 땐 검색할 필요가 없다.
    if (!isOpen) return;
    const keyword = debouncedQuery.trim();
    if (!keyword) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    let cancelled = false;
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
  }, [debouncedQuery, isOpen]);

  const handleOpen = () => {
    setQuery("");
    setResults([]);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  const handleSelect = (place: KakaoPlaceResult) => {
    onChange({
      name: place.place_name,
      address: place.road_address_name || place.address_name,
    });
    handleClose();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <>
      {renderTrigger ? (
        renderTrigger({ value, onOpen: handleOpen })
      ) : value ? (
        <div
          role="button"
          tabIndex={0}
          onClick={handleOpen}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleOpen();
          }}
          className="flex w-full items-start gap-2 rounded-[10px] border border-main-blue py-[10px] pl-[15px] pr-3 text-left"
        >
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
            <CloseIcon width={14} height={14} className="text-main-blue" aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className="w-full rounded-[10px] border border-sub-gray py-[10px] pl-[15px] pr-10 text-left font-paperlogy font-medium text-xs text-sub-gray transition-colors"
        >
          숙소명이나 주소로 검색해보세요
        </button>
      )}

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="숙소 검색"
        hideActions
        childrenVariant="plain"
      >
        <div className="flex w-full flex-col gap-3">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="숙소명이나 주소로 검색해보세요"
            className="!w-full"
            iconSize={11}
          />
          <div
            className={`w-full overflow-y-auto transition-[height] duration-200 ${
              query.trim() ? "h-[276px]" : "h-0"
            }`}
          >
            {isSearching ? (
              <LoadingState message="검색하는 중이에요" />
            ) : !query.trim() ? null : results.length === 0 ? (
              <EmptyState title="검색 결과가 없어요" size="sm" />
            ) : (
              <ul className="flex flex-col gap-1">
                {results.map((place) => (
                  <li key={place.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(place)}
                      className="flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 text-left active:bg-system-navbg"
                    >
                      <span className="font-paperlogy font-semibold text-xs text-text-primary">
                        {place.place_name}
                      </span>
                      <span className="font-paperlogy font-medium text-2xs text-sub-gray">
                        {place.road_address_name || place.address_name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
