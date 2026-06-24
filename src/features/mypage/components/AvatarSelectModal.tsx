"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { createPortal } from "react-dom";
import { cn } from "@/shared/utils";
import { Button } from "@/components";

type AvatarSource = string | StaticImageData;

interface AvatarSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatars: AvatarSource[];
  currentAvatar?: AvatarSource;
  onConfirm: (avatarUrl: AvatarSource) => void;
}

export function AvatarSelectModal({
  isOpen,
  onClose,
  avatars,
  currentAvatar,
  onConfirm,
}: AvatarSelectModalProps) {
  const [selected, setSelected] = useState<AvatarSource>(currentAvatar ?? avatars[0]);

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
        className="w-full max-w-[320px] max-h-[80dvh] overflow-y-auto overflow-x-hidden bg-white rounded-[30px] px-5 py-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-paperlogy font-bold text-lg text-text-heading text-center">
          프로필 사진 선택
        </h3>

        <div className="grid grid-cols-3 gap-3 justify-items-center">
          {avatars.map((url, i) => (
            <button
              key={i}
              onClick={() => setSelected(url)}
              className={cn(
                "w-[72px] h-[72px] rounded-full overflow-hidden border-2 transition-all",
                selected === url ? "border-main-blue" : "border-transparent",
              )}
            >
              <div className="relative w-full h-full">
                <Image src={url} alt={`avatar-${i}`} fill className="object-cover" />
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => {
              onConfirm(selected);
              onClose();
            }}
          >
            완료
          </Button>
        </div>
      </div>
    </div>,
    appRoot,
  );
}
