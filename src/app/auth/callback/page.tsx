// src/app/auth/callback/page.tsx
"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiClient } from "@/shared/api";

// useSearchParams 사용 시 Suspense로 감싸야 해서 컴포넌트 분리
function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      router.replace("/login");
      return;
    }

    // 카카오 인가 코드를 백엔드에 전달해 토큰 발급
    apiClient
      .post<{ data: { accessToken: string; tokenType: string } }>(`/api/auth/kakao/token`, null, {
        params: { code },
        withCredentials: true, // refresh_token 쿠키 수신에 필수
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

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <p className="font-paperlogy text-text-primary">로그인 중...</p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
