"use client";

import { useState } from "react";
import { cn } from "@/shared/utils";
import { TextInput, Button } from "@/components";

const MAX_LENGTH = 10;
const MIN_LENGTH = 2;

interface NicknameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNickname: string;
  onConfirm: (nickname: string) => void;
}

export function NicknameModal({ isOpen, onClose, currentNickname, onConfirm }: NicknameModalProps) {
  const [value, setValue] = useState(currentNickname);

  if (!isOpen) return null;

  const isValid = value.length >= MIN_LENGTH && value.length <= MAX_LENGTH;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center px-6"
      style={{ backgroundColor: "var(--color-system-blackbg)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[300px] bg-white rounded-[24px] px-6 py-5 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-paperlogy font-bold text-[16px] text-text-heading">닉네임 변경</h3>
          <button onClick={onClose} className="text-sub-gray text-[18px] leading-none">✕</button>
        </div>

        <p className="font-paperlogy text-[13px] text-sub-gray">{currentNickname}</p>

        <div className="flex flex-col gap-1">
          <div className="relative">
            <TextInput
              value={value}
              onChange={(e) => setValue(e.target.value.slice(0, MAX_LENGTH))}
              placeholder="닉네임을 입력해주세요"
            />
            <span className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 font-paperlogy text-[11px]",
              isValid ? "text-sub-deepblue" : "text-sub-gray"
            )}>
              {value.length}/{MAX_LENGTH}
            </span>
          </div>
          <p className="font-paperlogy text-[11px] text-sub-gray">
            * 닉네임은 {MIN_LENGTH}~{MAX_LENGTH}자 이내로 입력해주세요
          </p>
        </div>

        <Button variant="primary" disabled={!isValid} onClick={() => { onConfirm(value); onClose(); }}>
          완료
        </Button>
      </div>
    </div>
  );
}
