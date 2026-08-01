"use client";

import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { Check, X, XCircle } from "lucide-react";
import Image from "next/image";
import { cn } from "@/shared/utils";
import pencilIcon from "@/assets/icons/mypage/pencil.svg?url";

export interface NicknameInlineEditRef {
  closeEdit: () => void;
}

interface NicknameInlineEditProps {
  nickname: string;
  /** 부모(MypageProfile)에서 API 에러 응답 기반으로 중복 여부를 내려줌 */
  isDuplicate?: boolean;
  onConfirm: (nickname: string) => void;
  /** 입력값이 바뀌면 부모의 isDuplicate 상태를 초기화하기 위해 호출 */
  onValueChange?: () => void;
}

const MAX_NICKNAME_LENGTH = 6;

export const NicknameInlineEdit = forwardRef<NicknameInlineEditRef, NicknameInlineEditProps>(
  ({ nickname, isDuplicate = false, onConfirm, onValueChange }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // isDuplicate이 true면 저장 버튼 비활성화
    const isValid =
      value.trim().length >= 2 && value.trim().length <= MAX_NICKNAME_LENGTH && !isDuplicate;

    useEffect(() => {
      if (isEditing) inputRef.current?.focus();
    }, [isEditing]);

    const openEdit = () => {
      setValue("");
      setIsEditing(true);
    };

    const closeEdit = () => {
      setValue("");
      setIsEditing(false);
      onValueChange?.(); // 편집 취소 시 중복 에러 초기화
    };

    // 부모에서 ref.current.closeEdit() 호출로 편집 모드 종료 가능
    useImperativeHandle(ref, () => ({ closeEdit }));

    const handleConfirm = () => {
      if (!isValid) return;
      onConfirm(value.trim());
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") handleConfirm();
      if (e.key === "Escape") closeEdit();
    };

    // 한글 IME 조합 특성상 maxLength만으로는 6자 제한이 우회될 수 있어 직접 슬라이싱
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = e.target.value;
      setValue(
        nextValue.length <= MAX_NICKNAME_LENGTH
          ? nextValue
          : nextValue.slice(0, MAX_NICKNAME_LENGTH),
      );
      // 입력값이 바뀌면 이전 중복 에러 상태 초기화
      onValueChange?.();
    };

    return (
      <div className="inline-flex flex-col items-center gap-1">
        {!isEditing ? (
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold text-text-heading leading-none py-0.5">
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
              isDuplicate ? "border-sub-coral" : "border-main-blue",
            )}
          >
            <input
              ref={inputRef}
              value={value}
              maxLength={MAX_NICKNAME_LENGTH}
              placeholder="6자 이내로 입력해주세요"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="w-[140px] bg-transparent text-left text-lg font-bold text-text-heading leading-none py-0.5 outline-none placeholder:text-xs placeholder:font-normal placeholder:text-sub-gray"
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

        {/* 중복 안내 - 표시 여부와 무관하게 자리는 항상 확보 (레이아웃 흔들림 방지) */}
        <div className={cn("flex items-center gap-1", !isDuplicate && "invisible")}>
          <XCircle size={12} className="text-sub-coral shrink-0" />
          <span className="text-2xs font-semibold text-sub-coral">이미 사용중인 닉네임이에요.</span>
        </div>
      </div>
    );
  },
);

NicknameInlineEdit.displayName = "NicknameInlineEdit";
