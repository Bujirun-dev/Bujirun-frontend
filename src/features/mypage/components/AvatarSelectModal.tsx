"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/shared/utils";
import { Button } from "@/components";

interface AvatarSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatars: string[];
  currentAvatar?: string;
  onConfirm: (avatarUrl: string) => void;
}

export function AvatarSelectModal({
  isOpen,
  onClose,
  avatars,
  currentAvatar,
  onConfirm,
}: AvatarSelectModalProps) {
  const [selected, setSelected] = useState(currentAvatar ?? avatars[0]);

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center px-6"
      style={{ backgroundColor: "var(--color-system-blackbg)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[320px] bg-white rounded-[30px] px-6 py-7 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-paperlogy font-bold text-[16px] text-text-heading text-center">
          프로필 사진 선택
        </h3>

        <div className="grid grid-cols-3 gap-3 justify-items-center">
          {avatars.map((url, i) => (
            <button
              key={i}
              onClick={() => setSelected(url)}
              className={cn(
                "w-[72px] h-[72px] rounded-full overflow-hidden border-2 transition-all",
                selected === url ? "border-main-blue" : "border-transparent"
              )}
            >
              <div className="relative w-full h-full">
                <Image src={url} alt={`avatar-${i}`} fill className="object-cover" />
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>취소</Button>
          <Button variant="primary" className="flex-1" onClick={() => { onConfirm(selected); onClose(); }}>완료</Button>
        </div>
      </div>
    </div>
  );
}
