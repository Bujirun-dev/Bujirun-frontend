"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/utils";
import { Modal } from "@/components";
import { TextInput } from "@/components";

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
      className="relative px-6 py-8 gap-4"
    >
      {/* X 버튼 */}
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute top-4 right-4 text-sub-gray active:opacity-60"
      >
        <X size={18} />
      </button>

      <TextInput
        value={value}
        maxLength={10}
        placeholder="닉네임을 입력해주세요"
        onChange={(e) => setValue(e.target.value)}
      />
      <p className="font-paperlogy text-xs text-sub-gray text-center whitespace-pre-line">
        * 닉네임은 2~10자 이내로{"\n"}입력해주세요.
      </p>
      <button
        type="button"
        disabled={!isValid}
        onClick={handleConfirm}
        className={cn(
          "w-full h-[48px] rounded-xl font-ssurround text-md font-bold text-white transition-opacity",
          isValid ? "bg-main-blue active:opacity-70" : "bg-sub-lightgray cursor-not-allowed",
        )}
      >
        완료
      </button>
    </Modal>
  );
}
