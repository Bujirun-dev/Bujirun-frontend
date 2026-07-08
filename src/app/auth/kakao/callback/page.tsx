"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiClient, unwrap } from "@/shared/api";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { consumePendingInvite } from "@/shared/utils/pendingInvite";
import type { OpResponse, OpQuery } from "@/shared/api/types";

// useSearchParams 사용 시 Suspense로 감싸야 해서 컴포넌트 분리
function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      router.replace("/login");
      return;
    }

    // 카카오 인가 코드를 백엔드에 전달해 토큰 발급 (schema 생성 타입 사용)
    apiClient
      .post<OpResponse<"kakaoLogin">>(`/api/auth/kakao/token`, null, {
        params: { code } satisfies OpQuery<"kakaoLogin">,
      })
      .then((response) => {
        const data = unwrap(response);
        if (!data?.accessToken) {
          router.replace("/login");
          return;
        }

        setAccessToken(data.accessToken);

        // 신규 유저는 회원가입(추가정보) 화면으로 분기
        // (초대 링크를 통해 들어온 경우 pendingInvite는 회원가입 완료 시점에 소비됨)
        if (data.isNewUser) {
          router.replace("/signup");
          return;
        }

        const pendingInvite = consumePendingInvite();
        if (!pendingInvite) {
          router.replace("/");
          return;
        }
        const joinParams = new URLSearchParams();
        if (pendingInvite.count) joinParams.set("count", pendingInvite.count);
        if (pendingInvite.days) joinParams.set("days", pendingInvite.days);
        if (pendingInvite.startDate) joinParams.set("startDate", pendingInvite.startDate);
        if (pendingInvite.endDate) joinParams.set("endDate", pendingInvite.endDate);
        const query = joinParams.toString();
        router.replace(`/join/${pendingInvite.code}${query ? `?${query}` : ""}`);
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [searchParams, router, setAccessToken]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-text-primary">로그인 중...</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <p className="text-text-primary">로그인 중...</p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
