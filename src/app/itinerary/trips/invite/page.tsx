"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Toast } from "@/components";
import { ParticipantAvatarGrid } from "@/features/itinerary/components";
import { groupApi } from "@/shared/api/domains";

export default function TripInvitePage() {
  return (
    <Suspense fallback={null}>
      <TripInviteContent />
    </Suspense>
  );
}

function TripInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalSlots = Math.min(6, Math.max(2, Number(searchParams.get("count")) || 6));
  const days = searchParams.get("days") ?? "1";
  const groupId = searchParams.get("groupId") ?? "";
  const inviteCode = searchParams.get("inviteCode") ?? "";
  const [copied, setCopied] = useState(false);

  const { data: members } = useQuery({
    queryKey: groupApi.keys.members(groupId),
    queryFn: () => groupApi.getGroupMembers(groupId),
    enabled: !!groupId,
    refetchInterval: 3000,
  });
  const joinedCount = Math.max(1, members?.length ?? 1);

  useEffect(() => {
    if (joinedCount < totalSlots) return;
    const timer = setTimeout(() => {
      router.push(`/itinerary/trips/personality?count=${totalSlots}&days=${days}`);
    }, 1000);
    return () => clearTimeout(timer);
  }, [days, joinedCount, totalSlots, router]);

  const handleInvite = async () => {
    // 초대 코드를 받는 페이지(/join/{code})는 아직 없어서, 만들어지면 이 경로에 맞춰야 함
    const inviteUrl = `${window.location.origin}/join/${inviteCode}`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 pb-16">
      <div className="w-full rounded-[30px] border border-white/40 bg-gradient-to-b from-system-glassfrom to-system-glassto px-6 py-[40px] backdrop-blur-[15px] flex flex-col items-center">
        {/* 안내 문구 */}
        <p
          className="font-paperlogy font-medium text-xl text-text-heading text-center"
          style={{ lineHeight: "23px" }}
        >
          친구들이 모두 모이면
          <br />
          일정을 짜러 갈 수 있어요 🥰
        </p>

        {/* 참여 카운트 */}
        <p className="mt-[27px] font-paperlogy font-bold text-md text-sub-deepblue text-center">
          ( {joinedCount} / {totalSlots} )
        </p>

        {/* 친구 아바타 - 친구 수별 행 배치 */}
        <ParticipantAvatarGrid total={totalSlots} activeCount={joinedCount} className="mt-5" />

        {/* 친구 초대 링크 */}
        <button
          type="button"
          onClick={handleInvite}
          className="mt-[27px] font-paperlogy font-normal text-sm text-text-primary underline decoration-solid underline-offset-2"
        >
          친구 초대하기
        </button>

        <Toast isVisible={copied} message="링크가 복사되었어요 !" onHide={() => setCopied(false)} />
      </div>
    </div>
  );
}
