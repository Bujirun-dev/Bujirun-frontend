"use client";

import { useRouter } from "next/navigation";

import { EmptyState } from "@/components/ui/EmptyState";

export default function DevPage() {
  const router = useRouter();

  const handleStart = () => {
    router.push("/home");
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <section className="flex min-h-full items-center justify-center">
      <EmptyState
        title="아직 여행 기록이 없어요"
        description="여행을 시작하고 나만의 기록을 남겨보세요."
        secondaryAction={{
          label: "뒤로가기",
          onClick: handleBack,
        }}
        primaryAction={{
          label: "여행 시작하기",
          onClick: handleStart,
        }}
      />
    </section>
  );
}
