"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import markerIcon from "@/assets/icons/itinerary/marker-blue.png";
import { Button } from "@/components";

interface ArrivalVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeName: string;
  userAvatarUrl?: string;
  characterImageUrl?: string;
  onVerify: () => void;
  onLater: () => void;
}

export function ArrivalVerifyModal({
  isOpen,
  onClose,
  placeName,
  userAvatarUrl,
  characterImageUrl,
  onVerify,
  onLater,
}: ArrivalVerifyModalProps) {
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
        className="relative w-full max-w-[320px] max-h-[80dvh] overflow-y-auto overflow-x-hidden bg-white rounded-3xl px-5 pt-10 pb-6 flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {userAvatarUrl && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-[56px] h-[56px] rounded-full border-4 border-white overflow-hidden shadow-md">
            <Image src={userAvatarUrl} alt="avatar" fill className="object-cover" />
          </div>
        )}

        {characterImageUrl && (
          <div className="w-[120px] h-[120px] relative">
            <Image src={characterImageUrl} alt="character" fill className="object-contain" />
          </div>
        )}

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-1 bg-sub-lightblue px-3 py-1 rounded-full">
            <Image src={markerIcon} alt="위치" width={14} height={14} />
            <span className="font-paperlogy font-semibold text-md text-sub-deepblue">
              {placeName}
            </span>
          </div>
          <h2 className="font-paperlogy font-bold text-xl text-text-heading">
            이곳에 도착하셨나요?
          </h2>
        </div>

        <div className="w-full backdrop-blur-[15px] bg-gradient-to-b from-system-glassfrom to-system-glassto border border-system-glassborder rounded-lg px-4 py-3 text-center">
          <span className="font-paperlogy text-sm text-sub-gray">
            * GPS 위치 확인 후 관광지를 수집해주세요.
          </span>
        </div>

        <div className="w-full flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              onLater();
              onClose();
            }}
          >
            나중에 하기
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => {
              onVerify();
              onClose();
            }}
          >
            인증하기
          </Button>
        </div>
      </div>
    </div>,
    appRoot,
  );
}
