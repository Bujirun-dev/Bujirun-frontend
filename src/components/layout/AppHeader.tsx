"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 헤더를 숨길 경로 목록
const HIDDEN_HEADER_PATHS = ["/login"];

export function AppHeader() {
  const pathname = usePathname();

  // 로그인페이지에서는 헤더 미노출
  if (HIDDEN_HEADER_PATHS.includes(pathname)) return null;

  return (
    <header className="sticky top-0 z-30 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-[56px] w-full max-w-[390px] items-center justify-center px-4">
        <Link href="/" className="font-giants text-3xl tracking-[-0.02em] text-text-heading">
          BUJIRUN
        </Link>
      </div>
    </header>
  );
}
