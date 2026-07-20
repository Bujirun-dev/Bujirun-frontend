"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { WithdrawModal } from "./WithdrawModal";
import { userApi } from "@/shared/api/domains";
import { useAuthStore } from "@/shared/stores/useAuthStore";

export function AccountFooter() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

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
      <div className="flex items-center justify-center pb-2">
        <button
          type="button"
          onClick={() => setIsWithdrawOpen(true)}
          className="text-3xs text-sub-gray underline underline-offset-2 active:opacity-60"
        >
          회원 탈퇴
        </button>
      </div>

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onConfirm={handleWithdraw}
      />
    </>
  );
}
