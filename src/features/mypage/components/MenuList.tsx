"use client";

// src/features/mypage/components/MenuList.tsx
// 마이페이지 - 메뉴 리스트 (북마크 목록 / 로그아웃 / 회원탈퇴)

import { useRouter } from "next/navigation";
import { Bookmark, LogOut, UserX } from "lucide-react";
import { MenuItem } from "./MenuItem";

export function MenuList() {
  const router = useRouter();

  // TODO: 로그아웃 - useMutation으로 교체 + 토큰 삭제 처리
  const handleBookmark = () => {
    router.push("/mypage/bookmarks");
  };

  const handleLogout = () => {
    console.log("로그아웃");
  };

  const handleWithdraw = () => {
    // TODO: 회원탈퇴 확인 모달 → API 호출
    console.log("회원탈퇴");
  };

  return (
    <div className="flex flex-col gap-[9px]">
      <MenuItem icon={Bookmark} label="북마크 목록" onClick={handleBookmark} />
      <MenuItem icon={LogOut} label="로그아웃" onClick={handleLogout} />
      <MenuItem icon={UserX} label="회원 탈퇴" isDanger onClick={handleWithdraw} />
    </div>
  );
}
