"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, FileText, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { MenuItem } from "./MenuItem";
import { PrivacyPolicyModal } from "./PrivacyPolicyModal";
import { LogoutModal } from "./LogoutModal";
import { logout } from "@/shared/api/domains/auth";
import { useAuthStore } from "@/shared/stores/useAuthStore";

export function MypageMenuList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleBookmark = () => {
    router.push("/mypage/bookmarks");
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("로그아웃 실패:", e);
    } finally {
      useAuthStore.getState().clear(); // accessToken 초기화
      queryClient.clear(); // 이전 유저 캐시 전체 제거
      setIsLogoutOpen(false);
      router.replace("/login");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-[9px]">
        <MenuItem icon={Bookmark} label="북마크 목록" onClick={handleBookmark} />
        <MenuItem
          icon={FileText}
          label="약관 및 개인정보 활용"
          onClick={() => setIsPrivacyOpen(true)}
        />
        <MenuItem icon={LogOut} label="로그아웃" onClick={() => setIsLogoutOpen(true)} />
      </div>

      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
