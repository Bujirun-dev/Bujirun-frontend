"use client";

import Image, { type StaticImageData } from "next/image";
import { motion } from "framer-motion";
import travelCharacter from "@/assets/character/travel.png";
import { Button } from "./Button";
import { cn } from "@/shared/utils";

interface EmptyStateProps {
  image?: StaticImageData;
  imageAlt?: string;
  title: string;
  description?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

// 목록/데이터가 하나도 없을 때 쓰는 공통 컴포넌트. 화면마다 title/description/
// actionLabel만 바꿔서 재사용한다 (image 기본값은 여행 캐릭터).
export function EmptyState({
  image = travelCharacter,
  imageAlt = "",
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-3 px-5 py-10 text-center",
        className,
      )}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute size-[120px] rounded-full bg-sub-lightblue/50 blur-2xl" />
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image src={image} alt={imageAlt} width={140} height={140} className="relative" />
        </motion.div>
      </div>
      <div className="mt-1 flex flex-col items-center gap-2">
        <p className="font-ssurround text-xl font-bold text-text-heading">{title}</p>
        {description && <p className="text-sm leading-relaxed text-sub-gray">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} className="mt-3">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
