"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import failCharacter from "@/assets/character/fail.png";
import { Button } from "./Button";
import { cn } from "@/shared/utils";

// 자주 만나는 HTTP 상태코드별 프리셋. 없는 코드는 500(서버 오류) 프리셋으로 대체된다.
export type ErrorStateCode = 400 | 401 | 403 | 404 | 500 | 503;

type DefaultAction = "retry" | "home" | "login";

interface ErrorPreset {
  title: string;
  description: ReactNode;
  action: DefaultAction;
}

const PRESETS: Record<ErrorStateCode, ErrorPreset> = {
  400: {
    title: "요청이 올바르지 않아요",
    description: (
      <>
        입력한 정보를 다시 확인하고
        <br />
        시도해주세요.
      </>
    ),
    action: "retry",
  },
  401: {
    title: "로그인이 필요해요",
    description: (
      <>
        세션이 만료됐거나
        <br />
        로그인 정보가 없어요.
      </>
    ),
    action: "login",
  },
  403: {
    title: "접근 권한이 없어요",
    description: (
      <>
        이 페이지를 볼 수 있는
        <br />
        권한이 없어요.
      </>
    ),
    action: "home",
  },
  404: {
    title: "페이지를 찾을 수 없어요",
    description: (
      <>
        주소가 바뀌었거나
        <br />
        존재하지 않는 페이지예요.
      </>
    ),
    action: "home",
  },
  500: {
    title: "앗, 문제가 생겼어요",
    description: (
      <>
        서버에 일시적인 오류가 있어요.
        <br />
        잠시 후 다시 시도해주세요.
      </>
    ),
    action: "retry",
  },
  503: {
    title: "잠시 점검 중이에요",
    description: (
      <>
        지금은 서비스가 원활하지 않아요.
        <br />
        조금 있다가 다시 시도해주세요.
      </>
    ),
    action: "retry",
  },
};

interface ErrorStateProps {
  // 404·401·403처럼 상태코드가 정해진 에러. 기본값은 500(서버 오류).
  code?: ErrorStateCode;
  title?: string;
  description?: ReactNode;
  actionLabel?: string;
  // action이 "retry"일 때만 씀 — 있을 때만 다시 시도 버튼이 뜬다.
  onRetry?: () => void;
  // action이 "home"/"login"일 때 이동할 경로.
  href?: string;
  className?: string;
}

// API 실패/404/401 등 상태코드별 에러 화면 공통 컴포넌트.
// code 프리셋의 action(retry/home/login)에 따라 버튼 동작이 자동으로 정해진다.
export function ErrorState({
  code = 500,
  title,
  description,
  actionLabel,
  onRetry,
  href,
  className,
}: ErrorStateProps) {
  const preset = PRESETS[code];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "flex flex-1 flex-col items-center justify-center px-6 py-10 text-center",
        className,
      )}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute size-[160px] rounded-full bg-sub-coral/10 blur-2xl" />
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, -4, 4, -2, 0] }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeInOut" }}
        >
          <Image src={failCharacter} alt="" width={200} height={200} className="relative" />
        </motion.div>
      </div>
      <div className="mt-1.5 flex flex-col items-center gap-2">
        <p className="font-ssurround text-xl font-bold text-text-heading">
          {title ?? preset.title}
        </p>
        <p className="text-sm leading-relaxed text-sub-gray">{description ?? preset.description}</p>
      </div>
      {preset.action === "retry" ? (
        onRetry && (
          <Button variant="primary" onClick={onRetry} className="mt-6">
            {actionLabel ?? "다시 시도하기"}
          </Button>
        )
      ) : (
        <Link href={href ?? (preset.action === "login" ? "/login" : "/")} className="mt-6 w-full">
          <Button variant="primary">
            {actionLabel ?? (preset.action === "login" ? "로그인하러 가기" : "홈으로 돌아가기")}
          </Button>
        </Link>
      )}
    </motion.div>
  );
}
