"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiClient, unwrap } from "@/shared/api";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { LoadingState } from "@/components";

type AuthProviderProps = {
  children: ReactNode;
};

interface ReissueData {
  accessToken: string;
  tokenType: string;
}

// 로그인 없이 접근 가능한 경로
const PUBLIC_PATHS = ["/login", "/auth/kakao/callback", "/signup"];

export function AuthProvider({ children }: AuthProviderProps) {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const accessToken = useAuthStore((s) => s.accessToken);
  const clear = useAuthStore((s) => s.clear);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    // public 경로는 reissue 시도 없이 바로 렌더
    if (isPublicPath) {
      setIsReady(true);
      return;
    }

    // 이미 accessToken이 있으면 reissue 불필요 (탭 이동 시 중복 호출 방지)
    if (accessToken) {
      setIsReady(true);
      return;
    }

    apiClient
      .post<{ data?: ReissueData }>("/api/auth/reissue")
      .then((res) => {
        const data = unwrap<ReissueData>(res);
        if (data?.accessToken) {
          setAccessToken(data.accessToken);
        }
      })
      .catch(() => {
        // reissue 실패 = refresh_token 없거나 만료 → 로그인 페이지로 이동
        // 미들웨어가 1차로 막지만, 혹시 뚫렸을 때 2차 방어선
        clear();
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      })
      .finally(() => setIsReady(true));
    // accessToken, isPublicPath 변경 시에만 재실행 (pathname은 catch 내부에서만 사용)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, isPublicPath, setAccessToken, clear, router]);

  if (!isReady) {
    return (
      <div className="flex h-screen flex-col">
        <LoadingState message="부지런히 준비하고 있어요" />
      </div>
    );
  }

  return <>{children}</>;
}
