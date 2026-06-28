"use client";

import { useRouter } from "next/navigation";
import { Bookmark, LogOut, UserX } from "lucide-react";
import { MenuItem } from "./MenuItem";

export function MypageMenuList() {
  const router = useRouter();

  const handleBookmark = () => {
    router.push("/mypage/bookmarks");
  };

  const handleLogout = () => {
    console.log("로그아웃");
  };

  const handleWithdraw = () => {
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
