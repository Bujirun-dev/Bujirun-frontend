"use client";

import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import leaveIcon from "@/assets/icons/mypage/leave-coral.png";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const WITHDRAW_ITEMS = [
  "회원 정보 및 기록이 모두 삭제됩니다.",
  "삭제된 데이터는 복구할 수 없습니다.",
  "탈퇴 후 동일 아이디로 재가입이 불가능할 수 있습니다.",
  "위 내용들을 모두 확인하였으며, 회원탈퇴에 동의합니다.",
];

export function WithdrawModal({ isOpen, onClose, onConfirm }: WithdrawModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={<Image src={leaveIcon} alt="회원탈퇴" width={25} height={25} />}
      iconClassName="!bg-system-coralbg"
      title="회원 탈퇴"
      titleClassName="tracking-[0.5px]"
      confirmVariant="warning"
      className="gap-0 pt-[48px] pb-[40px]"
      childrenVariant="plain"
      childrenClassName="mt-[1px]"
      hideActions
      footer={
        <div className="flex w-full justify-center gap-[25px] mt-[24px]">
          <Button
            variant="secondary"
            onClick={onClose}
            className="w-[125px] h-[40px] !border-sub-coral !text-sub-coral"
          >
            취소
          </Button>
          <Button variant="warning" onClick={onConfirm} className="w-[125px] h-[40px]">
            회원 탈퇴
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-[8px] w-full">
        {/* 안내문구 */}
        <p className="text-center text-sm font-medium text-sub-darkgray">
          * 회원 탈퇴 시 아래 내용이 동의된 것으로 간주합니다.
        </p>

        {/* 체크리스트 */}
        <Card
          variant="glass-sm"
          className="w-[275px] h-[114px] flex flex-col justify-center gap-2 rounded-lg !p-[11px_18px] mt-[16px]"
        >
          {WITHDRAW_ITEMS.map((item) => (
            <div key={item} className="flex items-start gap-1 -ml-[13px]">
              <span className="text-[11px] text-sub-coral shrink-0">✅</span>
              <p className="text-xs font-medium text-text-primary tracking-[-0.3px] leading-tight">
                {item}
              </p>
            </div>
          ))}
        </Card>
      </div>
    </Modal>
  );
}
