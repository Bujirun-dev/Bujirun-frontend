"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import closeIcon from "@/assets/icons/mypage/close.png";
import { cn } from "@/shared/utils";
import noIcon from "@/assets/icons/mypage/no.png";

interface NicknameEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNickname: string;
  onConfirm: (nickname: string) => void;
  anchorRef: React.RefObject<HTMLSpanElement | null>;
}

// TODO: API 연결 시 중복 확인 API로 교체
const TAKEN_NICKNAMES = ["유리", "성빈", "은진"];

export function NicknameEditModal({
  isOpen,
  onClose,
  currentNickname,
  onConfirm,
  anchorRef,
}: NicknameEditModalProps) {
  const [value, setValue] = useState(currentNickname);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const isTaken = TAKEN_NICKNAMES.includes(value.trim());
  const isValid = value.length >= 2 && value.length <= 10 && !isTaken;

  useEffect(() => {
    if (isOpen) setValue(currentNickname);
  }, [isOpen, currentNickname]);

  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const appRoot = document.getElementById("app-root");
      const rootRect = appRoot?.getBoundingClientRect();

      setPosition({
        top: rect.bottom - (rootRect?.top ?? 0) + 8,
        left: rect.left - (rootRect?.left ?? 0),
      });
    }
  }, [isOpen, anchorRef]);

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(value);
    onClose();
  };

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  const appRoot = document.getElementById("app-root");
  if (!appRoot) return null;

  return createPortal(
    <>
      {/* 배경 딤 */}
      <div
        className="absolute inset-0 z-40"
        style={{ backgroundColor: "var(--color-system-blackbg)" }}
        onClick={onClose}
      />

      {/* 모달 */}
      <div
        className="absolute z-50 bg-white flex flex-col gap-4 px-[18px] pt-[20px] pb-[18px]"
        style={{
          top: position.top,
          left: position.left,
          width: 163,
          borderRadius: 13,
          boxShadow: "0px 0px 6px rgba(0, 0, 0, 0.4)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* X 버튼 */}
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute top-2 right-2 active:opacity-60"
        >
          <Image src={closeIcon} alt="닫기" width={20} height={20} />
        </button>

        {/* 제목 */}
        <h3 className="font-ssurround font-bold text-md text-text-heading text-center tracking-[0.5px]">
          닉네임 변경
        </h3>

        {/* input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between pb-1 border-b border-sub-lightgray">
            <input
              value={value}
              maxLength={10}
              placeholder="닉네임 입력"
              autoFocus
              onChange={(e) => setValue(e.target.value)}
              className="flex-1 text-xs text-text-primary placeholder:text-sub-gray outline-none bg-transparent"
            />
            <span className="text-[9px] text-sub-gray shrink-0 ml-1">{value.length}/10</span>
          </div>
          {isTaken && (
            <div className="flex items-center gap-1">
              <Image src={noIcon} alt="" width={10} height={10} aria-hidden />
              <span className="text-[9px] text-sub-coral font-semibold">
                이미 사용중인 닉네임이에요.
              </span>
            </div>
          )}
        </div>

        {/* 안내 문구 */}
        <p className="text-[9px] text-sub-gray text-center leading-relaxed whitespace-pre-line">
          {"* 닉네임은 2~10자 이내로\n입력해주세요."}
        </p>

        {/* 완료 버튼 */}
        <button
          type="button"
          disabled={!isValid}
          onClick={handleConfirm}
          className={cn(
            "w-full h-[27px] rounded-[7px] font-ssurround text-sm font-bold text-white transition-opacity",
            isValid ? "bg-main-blue active:opacity-70" : "bg-sub-gray cursor-not-allowed",
          )}
        >
          완료
        </button>
      </div>
    </>,
    appRoot,
  );
}
