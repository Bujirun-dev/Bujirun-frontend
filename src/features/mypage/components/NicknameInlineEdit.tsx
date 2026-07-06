"use client";

import { useState, useRef, useEffect } from "react";
import { Check, X, XCircle } from "lucide-react";
import Image from "next/image";
import { cn } from "@/shared/utils";
import pencilIcon from "@/assets/icons/mypage/pencil.svg?url";

interface NicknameInlineEditProps {
  nickname: string;
  onConfirm: (nickname: string) => void;
}

// TODO: API 연결 시 중복 확인 API로 교체
const TAKEN_NICKNAMES = ["유리", "성빈", "은진"];
const MAX_NICKNAME_LENGTH = 6;

// 뷰 모드 닉네임 텍스트 최소 너비 - 3~6자 어떤 길이든 연필 버튼 위치가 고정되도록
const NICKNAME_MIN_WIDTH = 100;

export function NicknameInlineEdit({ nickname, onConfirm }: NicknameInlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isTaken = value.trim().length > 0 && TAKEN_NICKNAMES.includes(value.trim());
  const isValid =
    value.trim().length >= 2 && value.trim().length <= MAX_NICKNAME_LENGTH && !isTaken;

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  // 편집 시작 시 입력값을 비워 플레이스홀더가 보이도록 처리
  const openEdit = () => {
    setValue("");
    setIsEditing(true);
  };

  const closeEdit = () => {
    setValue("");
    setIsEditing(false);
  };

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(value.trim());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") closeEdit();
  };

  // 한글 IME 조합 특성상 maxLength만으로는 6자 제한이 안 먹힐 때가 있어 직접 슬라이싱
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setValue(
      nextValue.length <= MAX_NICKNAME_LENGTH ? nextValue : nextValue.slice(0, MAX_NICKNAME_LENGTH),
    );
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      {!isEditing ? (
        <div className="flex items-center gap-1.5 border-b border-transparent">
          {/* min-width 고정: 닉네임이 3자든 6자든 연필 버튼 위치가 흔들리지 않도록 */}
          <span
            className="text-lg font-bold text-text-heading leading-none py-0.5"
            style={{ minWidth: NICKNAME_MIN_WIDTH }}
          >
            {nickname}
          </span>
          <button
            type="button"
            aria-label="닉네임 편집"
            onClick={openEdit}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-system-navbg transition-opacity active:opacity-60"
          >
            <Image src={pencilIcon} alt="닉네임 편집" width={10} height={10} />
          </button>
        </div>
      ) : (
        <div
          className={cn(
            "flex items-center gap-1.5 border-b",
            isTaken ? "border-sub-coral" : "border-main-blue",
          )}
        >
          <input
            ref={inputRef}
            value={value}
            maxLength={MAX_NICKNAME_LENGTH}
            placeholder="6자 이내로 입력해주세요"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-[100px] bg-transparent text-left text-lg font-bold text-text-heading leading-none py-0.5 outline-none placeholder:text-xs placeholder:font-normal placeholder:text-sub-gray"
          />
          <button
            type="button"
            aria-label="닉네임 저장"
            onClick={handleConfirm}
            disabled={!isValid}
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-opacity",
              isValid ? "bg-main-blue active:opacity-70" : "bg-sub-lightgray",
            )}
          >
            <Check size={11} className="text-white" />
          </button>
          <button
            type="button"
            aria-label="닉네임 편집 취소"
            onClick={closeEdit}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-system-navbg active:opacity-60"
          >
            <X size={11} className="text-sub-gray" />
          </button>
        </div>
      )}

      {/* 경고문 자리를 항상 확보 - isTaken일 때만 보이게 하되 레이아웃 높이는 고정 */}
      <div className={cn("flex w-full items-center gap-1 text-left", !isTaken && "invisible")}>
        <XCircle size={12} className="text-sub-coral shrink-0" />
        <span className="text-2xs font-semibold text-sub-coral">이미 사용중인 닉네임이에요.</span>
      </div>
    </div>
  );
}
