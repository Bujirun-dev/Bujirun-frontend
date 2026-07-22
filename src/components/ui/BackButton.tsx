"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import angleLeftIcon from "@/assets/icons/itinerary/angle-left.svg?url";
import { cn } from "@/shared/utils";

interface BackButtonProps {
  className?: string;
  onClick?: () => void;
  // 팝업 안에 쓰이는 작은 화살표만 있는 버전처럼, 박스 크기와 다른 아이콘 크기가
  // 필요한 화면에서만 넘긴다. 기본은 기존과 동일한 16px.
  iconSize?: number;
  iconClassName?: string;
}

export function BackButton({ className, onClick, iconSize = 16, iconClassName }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={onClick ?? (() => router.back())}
      className={cn(
        "size-[28px] rounded-lg bg-system-scroll flex items-center justify-center shrink-0",
        className,
      )}
    >
      <Image
        src={angleLeftIcon}
        alt=""
        width={iconSize}
        height={iconSize}
        className={iconClassName}
        aria-hidden
      />
    </button>
  );
}
