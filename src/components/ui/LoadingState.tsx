"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import sitCharacter from "@/assets/character/sit.png";
import { cn } from "@/shared/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

const DOT_DELAYS = [0, 0.15, 0.3];

// 화면 전체/섹션 로딩 공통 컴포넌트. PageCard, Card 등 어디에 넣어도
// 부모의 flex-1로 중앙 정렬되도록 만들어짐.
export function LoadingState({ message = "불러오는 중이에요", className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10",
        className,
      )}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute size-[130px] rounded-full bg-main-blue/25 blur-2xl" />
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image src={sitCharacter} alt="" width={160} height={160} className="relative" />
        </motion.div>
      </div>
      <div className="flex items-center gap-2">
        <p className="font-paperlogy text-md text-sub-gray">{message}</p>
        <span className="flex gap-0.5">
          {DOT_DELAYS.map((delay, i) => (
            <motion.span
              key={i}
              className="size-1 rounded-full bg-sub-gray"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay, ease: "easeInOut" }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
