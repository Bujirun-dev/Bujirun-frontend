"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WithdrawModal } from "./WithdrawModal";

export function AccountFooter() {
  const router = useRouter();
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const handleWithdraw = () => {
    // TODO: 회원탈퇴 API 연결
    setIsWithdrawOpen(false);
    router.replace("/login");
  };

  return (
    <>
      <div className="flex items-center justify-center pb-2">
        <button
          type="button"
          onClick={() => setIsWithdrawOpen(true)}
          className="text-3xs text-sub-lightgray underline underline-offset-2 active:opacity-60"
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
