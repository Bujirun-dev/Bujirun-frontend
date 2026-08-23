"use client";

import Image, { type StaticImageData } from "next/image";
import { motion } from "framer-motion";
import emptyCharacter from "@/assets/character/empty.png";
import { Button } from "./Button";
import { cn } from "@/shared/utils";
import blurBg from "@/assets/background/blurbg.png";

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
  // size 프리셋의 이미지 px을 개별 화면에서 미세 조정하고 싶을 때만 사용.
  imageSize?: number;
  // 기본 버튼 스타일(sm 기준 w-auto px-6)을 개별 화면에서 덮어쓰고 싶을 때만 사용.
  actionClassName?: string;
}

const SIZE_STYLES: Record<EmptyStateSize, { image: number; glow: string; padding: string }> = {
  lg: { image: 210, glow: "size-[160px]", padding: "px-5 py-10" },
  sm: { image: 124, glow: "size-[95px]", padding: "px-4 py-6" },
};

// 목록/데이터가 하나도 없을 때 쓰는 공통 컴포넌트. 화면마다 title/description/
// actionLabel만 바꿔서 재사용한다 (image 기본값은 여행 캐릭터).
export function EmptyState({
  image = emptyCharacter,
  imageAlt = "",
  title,
  description,
  actionLabel,
  onAction,
  size = "lg",
  className,
  imageSize,
  actionClassName,
}: EmptyStateProps) {
  const { image: presetImageSize, glow, padding } = SIZE_STYLES[size];
  const resolvedImageSize = imageSize ?? presetImageSize;
  // width만 지정하고 height는 원본 비율대로 계산한다 — 정사각형으로 강제하면
  // (travel.png는 1800x2124라 정사각형이 아님) 이미지가 찌그러지고 Next.js
  // Image 컴포넌트의 width/height 비율 불일치 경고도 뜬다.
  const resolvedImageHeight = Math.round((resolvedImageSize * image.height) / image.width);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "absolute inset-0 flex h-full w-full flex-col items-center justify-center overflow-hidden text-center",
        padding,
        className,
      )}
    >
      <Image
        src={blurBg}
        alt=""
        fill
        priority
        aria-hidden
        className="pointer-events-none object-cover"
      />

      {/* <div className="pointer-events-none absolute inset-0 bg-main-white/70 backdrop-blur-[8px]" />
      <div className="pointer-events-none absolute inset-0 bg-main-blue/5" /> */}

      <div className="relative z-10 flex w-full flex-col items-center gap-3">
        <div className="relative flex items-center justify-center">
          <div className={cn("absolute rounded-full bg-sub-lightblue/50 blur-2xl", glow)} />

          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src={image}
              alt={imageAlt}
              width={resolvedImageSize}
              height={resolvedImageHeight}
              className="relative"
            />
          </motion.div>
        </div>

        <div
          className={cn(
            "flex flex-col items-center",
            size === "sm" ? "mt-1 gap-1.5" : "mt-1 gap-3",
          )}
        >
          <p
            className={cn(
              "font-ssurround font-bold text-text-heading",
              size === "sm" ? "text-md" : "text-lg",
            )}
          >
            {title}
          </p>

          {description && (
            <p className="text-md leading-relaxed text-sub-darkgray">{description}</p>
          )}
        </div>

        {actionLabel && onAction && (
          <Button
            variant="primary"
            onClick={onAction}
            className={cn(
              size === "sm" ? "mt-2" : "mt-3",
              actionClassName ?? (size === "sm" ? "w-auto px-6" : undefined),
            )}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
