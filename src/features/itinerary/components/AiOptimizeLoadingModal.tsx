"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import FreepassIcon from "@/assets/icons/itinerary/freepass.svg?svgr";
import magicWandIcon from "@/assets/icons/itinerary/magic-wand.svg?url";
import seaCharacter from "@/assets/character/sea.png";
import { Modal } from "@/components";

interface AiOptimizeLoadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * API 연결 후: 최적화 API 호출 완료 시 이 값을 true로 넘기면
   * 프로그레스바가 100%로 완성되고 자동으로 onClose가 호출됩니다.
   * 현재는 임시 타이머(MOCK_DURATION_MS)로 동작합니다.
   */
  isDone?: boolean;
  // TODO: API 연결 시 최적화된 일정 데이터를 받아 stopsPerDay 업데이트
  onComplete?: () => void;
}

// TODO: API 연결 후 제거 — 실제 응답 완료 시점에 isDone=true로 제어
const MOCK_DURATION_MS = 3000;

export function AiOptimizeLoadingModal({
  isOpen,
  onClose,
  isDone,
  onComplete,
}: AiOptimizeLoadingModalProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProgress(0);
      return;
    }

    // API 연결 전: 타이머로 시뮬레이션
    if (isDone === undefined) {
      const startTimer = setTimeout(() => setProgress(100), 50);
      const doneTimer = setTimeout(() => {
        onComplete?.();
        onClose();
      }, MOCK_DURATION_MS + 100);
      return () => {
        clearTimeout(startTimer);
        clearTimeout(doneTimer);
      };
    }

    // API 연결 후: isDone=true가 되면 100%로 완성 후 닫기
    if (isDone) {
      setProgress(100);
      const doneTimer = setTimeout(() => {
        onComplete?.();
        onClose();
      }, 400);
      return () => clearTimeout(doneTimer);
    } else {
      // API 호출 중: 90%까지만 채우고 대기
      const startTimer = setTimeout(() => setProgress(90), 50);
      return () => clearTimeout(startTimer);
    }
  }, [isOpen, isDone, onClose, onComplete]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={
        <Image
          src={magicWandIcon}
          alt=""
          width={25}
          height={25}
          className="block icon-coral"
          aria-hidden
        />
      }
      iconClassName="bg-sub-coral/10"
      title="AI가 최적 경로를 찾고 있어요"
      hideActions
      childrenVariant="card"
      footer={
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="w-[248px] h-[8px] rounded-lg bg-system-scroll overflow-hidden">
            <div
              className="h-full bg-sub-deepblue rounded-lg transition-all duration-[3000ms] ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <Image
            src={seaCharacter}
            alt="캐릭터"
            width={250}
            height={187}
            className="object-contain"
          />
        </div>
      }
    >
      <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-sub-darkgray">
        <FreepassIcon width={12} height={12} className="fill-sub-deepblue" aria-hidden />
        여행 동선을 계산하는 중...
      </p>
    </Modal>
  );
}
