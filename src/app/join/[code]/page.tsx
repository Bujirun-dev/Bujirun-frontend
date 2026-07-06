"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { groupApi } from "@/shared/api/domains";

type JoinStatus = "joining" | "success" | "error";

export default function JoinGroupPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [status, setStatus] = useState<JoinStatus>("joining");
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    let cancelled = false;

    groupApi
      .joinGroup({ inviteCode: code })
      .then((group) => {
        if (cancelled) return;
        setGroupName(group.name ?? "여행");
        setStatus("success");
        const timer = window.setTimeout(() => {
          router.replace(`/itinerary/trips/invite?groupId=${group.id ?? ""}`);
        }, 1200);
        return () => window.clearTimeout(timer);
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [code, router]);

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 pb-16">
      <div className="w-full rounded-[30px] border border-white/40 bg-gradient-to-b from-system-glassfrom to-system-glassto px-6 py-[40px] backdrop-blur-[15px] flex flex-col items-center">
        {status === "joining" && (
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
