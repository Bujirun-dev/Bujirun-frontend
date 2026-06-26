"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 헤더를 숨길 경로 목록
const HIDDEN_HEADER_PATHS = ["/login", "/signup"];

export function AppHeader() {
  const pathname = usePathname();

  // 로그인 & 회원가입 페이지에서는 헤더 미노출
  if (HIDDEN_HEADER_PATHS.includes(pathname)) return null;

  return (
    <header className="sticky top-0 z-30 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex w-full max-w-[390px] items-center justify-center px-4 py-3">
        <Link
          href="/"
          className="text-text-heading text-2xl font-giants tracking-[-0.02em] text-foreground"
        >
          BUJIRUN
        </Link>
      </div>
    </header>
  );
}
