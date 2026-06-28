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

  //로그아웃
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include", // ← 쿠키 포함해서 전송
      });
    } catch (e) {
      console.error("로그아웃 실패:", e);
    } finally {
      localStorage.removeItem("accessToken");
      setIsLogoutOpen(false);
      router.replace("/login");
    }
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
