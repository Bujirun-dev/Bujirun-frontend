"use client";

import Image, { StaticImageData } from "next/image";
import { cn } from "@/shared/utils";
import { Card } from "@/components/ui/Card";

interface ProfileImage {
  id: number;
  src: StaticImageData | string;
}

interface ProfileImageSelectorProps {
  images: ProfileImage[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  className?: string;
}

/**
 * 프로필 사진 선택 그리드 컴포넌트
 * - 회원가입, 마이페이지 프로필 편집 등에서 공통으로 사용
 * - 피그마: 80px 원형, 3열 그리드, gap 21px, glass 컨테이너
 */
export function ProfileImageSelector({
  images,
  selectedId,
  onSelect,
  className,
}: ProfileImageSelectorProps) {
  return (
    <Card variant="glass-lg" className={cn("rounded-[20px] py-[16px] px-[8px]", className)}>
      <div className="grid grid-cols-3 gap-[12px]">
        {images.map(({ id, src }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={cn(
              "relative w-[74px] h-[74px] rounded-full overflow-hidden transition-all active:scale-97",
              selectedId === id
                ? "bg-main-blue outline outline-[2.5px] outline-main-blue"
                : "bg-system-navbg outline outline-[2.5px] outline-transparent",
            )}
          >
            <Image src={src} alt={`프로필 ${id}`} fill className="object-cover scale-120" />
          </button>
        ))}
      </div>
    </Card>
  );
}
