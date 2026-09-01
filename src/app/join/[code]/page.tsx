"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { groupApi } from "@/shared/api/domains";
import { reissueAccessToken } from "@/shared/api";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { savePendingInvite } from "@/shared/utils/pendingInvite";
import { KakaoLoginButton } from "@/components/ui/KakaoLoginButton";
import { LoadingState } from "@/components";

type JoinStatus = "checking" | "unauthenticated" | "joining" | "success" | "error";

function PageLoadingFallback() {
  return <LoadingState />;
}

export default function JoinGroupPage({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <JoinGroupContent params={params} />
    </Suspense>
  );
}

function JoinGroupContent({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const count = searchParams.get("count") ?? undefined;
  const days = searchParams.get("days") ?? undefined;
  const startDate = searchParams.get("startDate") ?? undefined;
  const endDate = searchParams.get("endDate") ?? undefined;
  const [status, setStatus] = useState<JoinStatus>("checking");
  const [groupName, setGroupName] = useState("");

  // 로그인 전 초대 미리보기(그룹명/초대자/멤버수) — 백엔드 미배포 시 조용히 실패해도 무방하므로
  // 에러는 무시하고 없으면 기본 문구로 폴백한다.
  const { data: invitePreview } = useQuery({
    queryKey: groupApi.keys.invitePreview(code),
    queryFn: () => groupApi.previewInvite(code),
    enabled: status === "unauthenticated",
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    // accessToken은 메모리에만 있어서(useAuthStore) 새로고침이나 하드 네비게이션 후엔 항상 비어 있다.
    // /join은 AuthProvider의 public 경로라 자동 reissue도 타지 않으므로, 여기서 직접
    // refresh_token 쿠키로 재발급을 시도해야 "이미 로그인한 사람"이 로그인 화면을 다시 보지 않는다.
    // (이게 없으면 카카오 로그인 → 콜백이 /join으로 하드 이동 → 토큰 유실 → 다시 로그인 요구, 무한 반복)
    const ensureAuthenticated = async () => {
      if (useAuthStore.getState().accessToken) return true;
      return Boolean(await reissueAccessToken());
    };

    ensureAuthenticated().then((isAuthenticated) => {
      if (cancelled) return;

      if (!isAuthenticated) {
        savePendingInvite({ code, count, days, startDate, endDate });
        setStatus("unauthenticated");
        return;
      }

      setStatus("joining");

      groupApi
        .joinGroup({ inviteCode: code })
        .then((group) => {
          if (cancelled) return;
          setGroupName(group.name ?? "여행");
          setStatus("success");
          const inviteParams = new URLSearchParams({ groupId: group.id ?? "", role: "guest" });
          inviteParams.set("inviteCode", group.inviteCode ?? code);
          if (count) inviteParams.set("count", count);
          if (days) inviteParams.set("days", days);
          if (group.name) inviteParams.set("name", group.name);
          if (startDate) inviteParams.set("startDate", startDate);
          if (endDate) inviteParams.set("endDate", endDate);
          timer = window.setTimeout(() => {
            router.replace(`/itinerary/trips/invite?${inviteParams.toString()}`);
          }, 1200);
        })
        .catch(() => {
          if (!cancelled) setStatus("error");
        });
    });

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [code, count, days, startDate, endDate, router]);

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 pb-16">
      <div className="w-full rounded-[30px] border border-white/40 bg-gradient-to-b from-system-glassfrom to-system-glassto px-6 py-[40px] backdrop-blur-[15px] flex flex-col items-center">
        {status === "unauthenticated" && (
          <>
            <p
              className="font-paperlogy font-medium text-xl text-text-heading text-center"
              style={{ lineHeight: "23px" }}
            >
              {invitePreview?.groupName && invitePreview?.inviterNickname ? (
                <>
                  {invitePreview.inviterNickname}님이 ‘{invitePreview.groupName}’에 초대했어요 ✈️
                  <br />
                  로그인하고 참여해보세요
                </>
              ) : (
                <>
                  여행 초대를 받았어요! ✈️
                  <br />
                  로그인하고 참여해보세요
                </>
              )}
            </p>
            <div className="mt-[27px] w-full">
              <KakaoLoginButton />
            </div>
          </>
        )}
        {(status === "checking" || status === "joining") && (
          <p
            className="font-paperlogy font-medium text-xl text-text-heading text-center"
            style={{ lineHeight: "23px" }}
          >
            초대 코드를 확인하고 있어요...
          </p>
        )}
        {status === "success" && (
          <p
            className="font-paperlogy font-medium text-xl text-text-heading text-center"
            style={{ lineHeight: "23px" }}
          >
            {groupName}에 참여했어요! 🎉
            <br />
            잠시 후 이동할게요
          </p>
        )}
        {status === "error" && (
          <>
            <p
              className="font-paperlogy font-medium text-xl text-text-heading text-center"
              style={{ lineHeight: "23px" }}
            >
              유효하지 않은 초대 링크예요.
              <br />
              링크를 다시 확인해주세요.
            </p>
            <button
              type="button"
              onClick={() => router.replace("/")}
              className="mt-[27px] font-paperlogy font-normal text-sm text-text-primary underline decoration-solid underline-offset-2"
            >
              홈으로 돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
