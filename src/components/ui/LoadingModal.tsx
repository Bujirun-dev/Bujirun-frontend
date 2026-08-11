"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import loading1 from "@/assets/loading/loading1.png";
import loading2 from "@/assets/loading/loading2.png";
import loading3 from "@/assets/loading/loading3.png";
import loading4 from "@/assets/loading/loading4.png";
import loading5 from "@/assets/loading/loading5.png";
import loadingTurtle from "@/assets/loading/loading_turtle.png";
import { Modal } from "@/components/ui/Modal";
import { SpeechBubble } from "@/components/ui/SpeechBubble";
import { cn } from "@/shared/utils";

interface LoadingModalProps {
  className?: string;
}

const LOADING_IMAGES = [loading1, loading2, loading3, loading4, loading5] as const;
const LOADING_MESSAGES = [
  "부산으로 가는 중 ...",
  "관광지 사진도 찍고 🌄",
  "셀카도 찍고 📸",
  "쁘이 ✌️",
  "다 됐어요 ❣️",
] as const;

export function LoadingModal({ className }: LoadingModalProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((prev) => Math.min(prev + 1, 100));
    }, 50);

    return () => window.clearInterval(interval);
  }, []);

  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  const imageIndex = Math.min(
    Math.floor((normalizedProgress / 100) * LOADING_IMAGES.length),
    LOADING_IMAGES.length - 1,
  );

  return (
    <Modal
      isOpen
      onClose={() => {}}
      hideActions
      hideCloseButton
      childrenVariant="plain"
      childrenClassName="!gap-0"
      className={cn(
        "!h-[350px] !w-[270px] !max-w-[270px] flex-col items-center bg-gradient-to-b from-system-scroll from-0% via-main-white via-60% to-main-white to-100% px-10",
        className,
      )}
    >
      <SpeechBubble
        variant="white"
        tailDirection="bottom"
        tailCenter
        bubbleClassName="!w-[190px] !rounded-3xl mt-1 py-2 justify-center font-ssurround text-md text-heading"
      >
        {LOADING_MESSAGES[imageIndex]}
      </SpeechBubble>

      <div className="flex flex-col items-center mt-2">
        <div className="relative h-[160px] w-[160px]">
          {LOADING_IMAGES.map((image, index) => (
            <Image
              key={index}
              src={image}
              alt={index === imageIndex ? "로딩 중인 부지런 캐릭터" : ""}
              aria-hidden={index !== imageIndex}
              priority
              className={cn(
                "absolute inset-0 h-auto w-[160px] transition-opacity duration-500 ease-in-out",
                index === imageIndex ? "opacity-100" : "opacity-0",
              )}
            />
          ))}
        </div>

        <div className="h-3 w-15 -translate-x-[2px] rounded-[50%] bg-system-scroll blur-[1px]" />
      </div>

      <div className="mt-7 w-full">
        <div className="relative h-2 w-full rounded-full bg-system-navbg">
          <div
            className="h-full rounded-full bg-main-blue transition-[width] duration-100 ease-linear"
            style={{ width: `${normalizedProgress}%` }}
          />

          <Image
            src={loadingTurtle}
            alt="진행바 아이콘"
            aria-hidden="true"
            className="absolute top-1/2 h-auto w-12 -translate-x-1/2 -translate-y-[60%] transition-[left] duration-100 ease-linear"
            style={{ left: `${normalizedProgress}%` }}
          />
        </div>
      </div>

      <p className="mt-5 text-center text-sm text-primary">잠시만 기다려 주세요 😇</p>
    </Modal>
  );
}
