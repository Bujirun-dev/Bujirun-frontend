"use client";

import { useRouter } from "next/navigation";

import { ErrorState } from "@/components/ui/ErrorState";

export default function DevPage() {
  const router = useRouter();

  const handleRetry = () => {
    router.refresh();
  };

  return (
    <section className="flex min-h-full items-center justify-center bg-main-white">
      <ErrorState
        code={503}
        title="일정 생성에 실패했어요"
        description="잠시 후 다시 시도해주세요."
        primaryAction={{
          label: "다시 시도",
          onClick: () => refetchGenerate(),
        }}
        secondaryAction={{
          label: "홈으로 돌아가기",
          onClick: () => router.push("/home"),
        }}
      />
    </section>
  );
}
