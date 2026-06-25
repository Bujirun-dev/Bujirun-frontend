"use client";

import { useState } from "react"; // useEffect 삭제
import { FeaturePlaceholder } from "@/components";

export default function Home() {
  const [isLoggedIn] = useState(() => {
    if (typeof window === "undefined") return false; // SSR 환경 대비
    return !!localStorage.getItem("accessToken");
  });

  return (
    <div>
      {isLoggedIn ? (
        <FeaturePlaceholder title="홈 탭입니다. (로그인됨)" />
      ) : (
        <FeaturePlaceholder title="로그인이 필요합니다" />
      )}
    </div>
  );
}
