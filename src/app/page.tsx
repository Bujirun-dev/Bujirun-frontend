"use client";

import { useEffect, useState } from "react";
import { FeaturePlaceholder } from "@/components";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

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
