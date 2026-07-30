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
const PUBLIC_PATHS = ["/login", "/auth/kakao/callback"];

export function AuthProvider({ children }: AuthProviderProps) {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
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

    apiClient
      .post<{ data?: ReissueData }>("/api/auth/reissue")
      .then((res) => {
        const data = unwrap<ReissueData>(res);
        if (data?.accessToken) {
          setAccessToken(data.accessToken);
        }
      })
      .catch(() => {
        clear();
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      })
      .finally(() => setIsReady(true));
  }, [setAccessToken, clear, router, pathname, isPublicPath]);

  if (!isReady) {
    return (
      <div className="flex h-screen flex-col">
        <LoadingState message="부지런히 준비하고 있어요" />
      </div>
    );
  }

  return <>{children}</>;
}
