"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import angleLeftIcon from "@/assets/icons/itinerary/angle-left.svg?url";
import { cn } from "@/shared/utils";

interface BackButtonProps {
  className?: string;
  onClick?: () => void;
}

export function BackButton({ className, onClick }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={onClick ?? (() => router.back())}
      className={cn(
        "size-[28px] rounded-lg bg-system-scroll flex items-center justify-center shrink-0",
        className,
      )}
    >
      <Image src={angleLeftIcon} alt="" width={16} height={16} aria-hidden />
    </button>
  );
}
