"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, LogOut, UserX } from "lucide-react";
import { MenuItem } from "./MenuItem";
import { LogoutModal } from "./LogoutModal";

export function MypageMenuList() {
  const router = useRouter();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleBookmark = () => {
    router.push("/mypage/bookmarks");
  };

  const handleLogout = () => {
    // TODO: API 연결 시 로그아웃 처리 (세션/토큰 삭제 후 리다이렉트)
    console.log("로그아웃");
    setIsLogoutOpen(false);
  };

  const handleWithdraw = () => {
    console.log("회원탈퇴");
  };

  return (
    <>
      <div className="flex flex-col gap-[9px]">
        <MenuItem icon={Bookmark} label="북마크 목록" onClick={handleBookmark} />
        <MenuItem icon={LogOut} label="로그아웃" onClick={() => setIsLogoutOpen(true)} />
        <MenuItem icon={UserX} label="회원 탈퇴" isDanger onClick={handleWithdraw} />
      </div>

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
