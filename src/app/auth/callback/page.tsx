// src/app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiClient } from "@/shared/api";

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      router.replace("/login");
      return;
    }

    apiClient
      .post<{ data: { accessToken: string; tokenType: string } }>(`/api/auth/kakao/token`, null, {
        params: { code },
        withCredentials: true, // ← refresh_token 쿠키 수신에 필수
      })
      .then(({ data }) => {
        localStorage.setItem("accessToken", data.data.accessToken);
        router.replace("/");
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [searchParams, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="font-paperlogy text-text-primary">로그인 중...</p>
    </div>
  );
}
