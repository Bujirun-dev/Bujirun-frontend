"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, LogOut, UserX } from "lucide-react";
import { MenuItem } from "./MenuItem";
import { LogoutModal } from "./LogoutModal";
import { WithdrawModal } from "./WithdrawModal";

export function MypageMenuList() {
  const router = useRouter();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const handleBookmark = () => {
    router.push("/mypage/bookmarks");
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
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
    // TODO: 회원탈퇴 API 연결
    setIsWithdrawOpen(false);
  };

  return (
    <>
      <div className="flex flex-col gap-[9px]">
        <MenuItem icon={Bookmark} label="북마크 목록" onClick={handleBookmark} />
        <MenuItem icon={LogOut} label="로그아웃" onClick={() => setIsLogoutOpen(true)} />
        <MenuItem icon={UserX} label="회원 탈퇴" onClick={() => setIsWithdrawOpen(true)} />
      </div>

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogout}
      />
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onConfirm={handleWithdraw}
      />
    </>
  );
}
