"use client";

import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import logoutIcon from "@/assets/icons/mypage/logout-blue.png";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={<Image src={logoutIcon} alt="로그아웃" width={25} height={25} />}
      title="로그아웃"
      titleClassName="tracking-[0.5px]"
      className="h-[435px] gap-3 pt-[48px] pb-[48px]"
      childrenVariant="plain"
      confirmVariant="warning"
      childrenClassName="mt-[20px]"
      hideActions
      footer={
        <div className="flex w-full justify-center gap-[25px] mt-auto mb-[1px]">
          <Button variant="secondary" onClick={onClose} className="w-[125px] h-[40px]">
            취소
          </Button>
          <Button variant="primary" onClick={onConfirm} className="w-[125px] h-[40px]">
            로그아웃
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-4">
        <p className="text-lg font-semibold text-text-primary text-center leading-relaxed whitespace-pre-line">
          {`정말 로그아웃 하시겠어요?\n다음 여행도 함께 할게요!`}
        </p>
        <Card
          variant="glass-sm"
          className="w-[275px] h-[31px] flex items-center justify-center rounded-lg p-0 mt-[35px]"
        >
          <p className="text-center text-sm font-medium text-sub-darkgray">
            * 언제든 다시 로그인할 수 있어요.
          </p>
        </Card>
      </div>
    </Modal>
  );
}
