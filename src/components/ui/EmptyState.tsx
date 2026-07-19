"use client";

import Image, { type StaticImageData } from "next/image";
import { motion } from "framer-motion";
import travelCharacter from "@/assets/character/travel.png";
import { Button } from "./Button";
import { cn } from "@/shared/utils";

type EmptyStateSize = "sm" | "lg";

interface EmptyStateProps {
  image?: StaticImageData;
  imageAlt?: string;
  title: string;
  description?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  // 홈 카드처럼 좁은 영역에 넣을 땐 "sm"으로 이미지/여백을 줄인다. 기본은 "lg".
  size?: EmptyStateSize;
  className?: string;
}

const SIZE_STYLES: Record<EmptyStateSize, { image: number; glow: string; padding: string }> = {
  lg: { image: 140, glow: "size-[120px]", padding: "px-5 py-10" },
  sm: { image: 96, glow: "size-[80px]", padding: "px-4 py-6" },
};

// 목록/데이터가 하나도 없을 때 쓰는 공통 컴포넌트. 화면마다 title/description/
// actionLabel만 바꿔서 재사용한다 (image 기본값은 여행 캐릭터).
export function EmptyState({
  image = travelCharacter,
  imageAlt = "",
  title,
  description,
  actionLabel,
  onAction,
  size = "lg",
  className,
}: EmptyStateProps) {
  const { image: imageSize, glow, padding } = SIZE_STYLES[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-3 text-center",
        padding,
        className,
      )}
    >
      <div className="relative flex items-center justify-center">
        <div className={cn("absolute rounded-full bg-sub-lightblue/50 blur-2xl", glow)} />
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src={image}
            alt={imageAlt}
            width={imageSize}
            height={imageSize}
            className="relative"
          />
        </motion.div>
      </div>
      <div className={cn("flex flex-col items-center", size === "sm" ? "mt-2 gap-1.5" : "mt-4 gap-3")}>
        <p
          className={cn(
            "font-ssurround font-bold text-text-heading",
            size === "sm" ? "text-lg" : "text-xl",
          )}
        >
          {title}
        </p>
        {description && <p className="text-sm leading-relaxed text-sub-gray">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button
          variant="primary"
          onClick={onAction}
          className={size === "sm" ? "mt-2 w-auto px-6" : "mt-3"}
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
