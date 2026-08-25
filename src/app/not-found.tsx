"use client";

import { useRouter } from "next/navigation";

import { ErrorState } from "@/components";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col">
      <ErrorState
        code={404}
        primaryAction={{
          label: "홈으로 돌아가기",
          onClick: () => router.push("/home"),
        }}
      />
    </div>
  );
}
