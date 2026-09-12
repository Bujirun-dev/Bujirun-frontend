"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { WithdrawModal } from "./WithdrawModal";
import { userApi } from "@/shared/api/domains";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { LogoutModal } from "./LogoutModal";
import { logout } from "@/shared/api/domains/auth";

export function AccountFooter() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("로그아웃 실패:", e);
    } finally {
      useAuthStore.getState().clear();
      queryClient.clear();
      setIsLogoutOpen(false);
      router.replace("/login");
    }
  };

  const handleWithdraw = async () => {
    try {
      await userApi.deleteMyAccount();
    } catch (e) {
      console.error("회원탈퇴 실패:", e);
    } finally {
      useAuthStore.getState().clear();
      queryClient.clear();
      setIsWithdrawOpen(false);
      router.replace("/login");
    }
  };

  return (
    <>
      <div className="flex items-center justify-center mb-1 gap-3 text-sm font-medium text-sub-deepgray">
        <button
          type="button"
          onClick={() => setIsLogoutOpen(true)}
          className="underline underline-offset-2 transition-colors hover:text-sub-deepblue active:opacity-60"
        >
          로그아웃
        </button>

        <span aria-hidden className="h-3 w-[1.5px] translate-y-[1px] bg-sub-deepgray" />

        <button
          type="button"
          onClick={() => setIsWithdrawOpen(true)}
          className="underline underline-offset-2 transition-colors hover:text-sub-coral active:opacity-60"
        >
          회원 탈퇴
        </button>
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
