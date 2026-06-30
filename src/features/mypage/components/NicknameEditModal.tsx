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
const MAX_NICKNAME_LENGTH = 6;

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
  const isValid =
    value.trim().length >= 2 && value.trim().length <= MAX_NICKNAME_LENGTH && !isTaken;

  useEffect(() => {
    if (!isOpen || !anchorRef.current) return;

    const rect = anchorRef.current.getBoundingClientRect();
    const appRoot = document.getElementById("app-root");
    const rootRect = appRoot?.getBoundingClientRect();
    const modalWidth = 200;
    const rootLeft = rootRect?.left ?? 0;
    const rootTop = rootRect?.top ?? 0;
    const rootWidth = rootRect?.width ?? 390;
    const left = Math.min(rect.left - rootLeft, rootWidth - modalWidth - 18);

    setPosition({
      top: rect.bottom - rootTop + 12,
      left: Math.max(18, left),
    });
  }, [isOpen, anchorRef]);

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(value.trim());
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
        className="absolute z-50 flex w-[200px] flex-col gap-4 rounded-[18px] bg-main-white px-[18px] pb-5 pt-7 shadow-[0_0_8px_var(--color-system-blackbg)]"
        style={{
          top: position.top,
          left: position.left,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* X 버튼 */}
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute right-4 top-4 active:opacity-60"
        >
          <Image src={closeIcon} alt="닫기" width={20} height={20} />
        </button>

        {/* 제목 */}
        <h3 className="text-center font-ssurround text-md font-bold tracking-[0.5px] text-text-heading">
          닉네임 변경
        </h3>

        {/* input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-sub-lightgray pb-2">
            <input
              value={value}
              maxLength={MAX_NICKNAME_LENGTH}
              placeholder="닉네임 입력"
              autoFocus
              onChange={(e) => setValue(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-text-primary outline-none placeholder:text-sub-gray"
            />
            <span className="ml-2 shrink-0 text-[10px] text-sub-gray">
              {value.length}/{MAX_NICKNAME_LENGTH}
            </span>
          </div>
          {isTaken && (
            <div className="flex items-center gap-1">
              <Image src={noIcon} alt="" width={12} height={12} aria-hidden />
              <span className="text-[10px] font-semibold text-sub-coral">
                이미 사용중인 닉네임이에요.
              </span>
            </div>
          )}
        </div>

        {/* 안내 문구 */}
        <p className="whitespace-pre-line text-center text-xs font-medium leading-relaxed text-sub-gray">
          {`* 닉네임은 2~${MAX_NICKNAME_LENGTH}자 이내로\n입력해주세요.`}
        </p>

        {/* 완료 버튼 */}
        <button
          type="button"
          disabled={!isValid}
          onClick={handleConfirm}
          className={cn(
            "h-9 w-full rounded-lg font-ssurround text-sm font-bold text-white transition-opacity",
            isValid ? "bg-main-blue active:opacity-70" : "cursor-not-allowed bg-sub-gray",
          )}
        >
          완료
        </button>
      </div>
    </>,
    appRoot,
  );
}
