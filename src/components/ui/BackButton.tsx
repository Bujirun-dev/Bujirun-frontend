"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import angleLeftIcon from "@/assets/icons/itinerary/angle-left.svg";
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
      <Image src={angleLeftIcon} alt="뒤로" width={16} height={16} />
    </button>
  );
}
