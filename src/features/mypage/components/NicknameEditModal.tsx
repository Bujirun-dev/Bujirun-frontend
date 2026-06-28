"use client";

import { useState } from "react";
import { cn } from "@/shared/utils";
import { Modal } from "@/components";

interface NicknameEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNickname: string;
  onConfirm: (nickname: string) => void;
}

export function NicknameEditModal({
  isOpen,
  onClose,
  currentNickname,
  onConfirm,
}: NicknameEditModalProps) {
  const [value, setValue] = useState(currentNickname);

  const isValid = value.length >= 2 && value.length <= 10;

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(value);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="닉네임 변경"
      hideActions
      childrenVariant="plain"
      className="relative px-[18px] pt-[20px] pb-[20px] max-w-[240px]"
    >
      <div className="flex flex-col gap-5 w-full mt-2">
        {/* input */}
        <div className="flex items-center justify-between border-b border-sub-lightgray pb-1">
          <input
            value={value}
            maxLength={10}
            placeholder="닉네임을 입력해주세요"
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 text-md text-text-primary placeholder:text-sub-gray outline-none bg-transparent"
          />
          <span className="text-xs text-sub-gray shrink-0 ml-1">{value.length}/10</span>
        </div>

        {/* 안내 문구 */}
        <p className="text-xs text-sub-gray text-center leading-relaxed">
          {"* 닉네임은 2~10자 이내로\n입력해주세요."}
        </p>

        {/* 완료 버튼 */}
        <button
          type="button"
          disabled={!isValid}
          onClick={handleConfirm}
          className={cn(
            "w-full h-[32px] rounded-lg font-ssurround text-md font-bold text-white transition-opacity",
            isValid ? "bg-main-blue active:opacity-70" : "bg-sub-gray cursor-not-allowed",
          )}
        >
          완료
        </button>
      </div>
    </Modal>
  );
}
