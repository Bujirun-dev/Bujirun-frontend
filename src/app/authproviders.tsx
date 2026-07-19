"use client";

import { useEffect, useState, type ReactNode } from "react";
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

export function AuthProvider({ children }: AuthProviderProps) {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    apiClient
      .post<{ data?: ReissueData }>("/api/auth/reissue")
      .then((res) => {
        const data = unwrap<ReissueData>(res);
        if (data?.accessToken) {
          setAccessToken(data.accessToken);
        }
      })
      .catch(() => {
        // refresh_token이 없거나 만료된 경우 → 비로그인 상태로 진행
      })
      .finally(() => setIsReady(true));
  }, [setAccessToken]);

  if (!isReady) {
    return (
      <div className="flex h-screen flex-col">
        <LoadingState message="부지런히 준비하고 있어요" />
      </div>
    );
  }

  return <>{children}</>;
}
