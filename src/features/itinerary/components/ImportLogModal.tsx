"use client";

import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import calendarPlusIcon from "@/assets/icons/itinerary/calendar-plus.svg?url";

interface ImportLogModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  authorNickname?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function ImportLogModal({
  isOpen,
  isLoading = false,
  authorNickname,
  onClose,
  onConfirm,
}: ImportLogModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={<Image src={calendarPlusIcon} alt="" width={25} height={25} aria-hidden />}
      title="내 일정에 추가"
      titleClassName="tracking-[0.5px] text-[18px] text-text-primary"
      childrenVariant="plain"
      hideActions
      footer={
        <div className="flex w-full justify-center gap-[25px]">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="w-[125px] h-[40px] disabled:opacity-60"
          >
            취소
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-[125px] h-[40px] disabled:opacity-60"
          >
            {isLoading ? "추가 중" : "추가하기"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-4">
        <p className="text-lg font-semibold text-text-primary text-center leading-relaxed whitespace-pre-line">
          {authorNickname
            ? `'${authorNickname}'님의 여행 일정을\n내 일정에 추가하시겠어요?`
            : `이 여행 일정을\n내 일정에 추가하시겠어요?`}
        </p>
        <Card
          variant="glass-sm"
          className="w-full flex items-center justify-center px-[10px] py-[8px]"
        >
          <p className="text-center text-sm font-medium text-sub-darkgray">
            * 다른 사람의 일정을 불러오면 현재 일정은 사라져요.
          </p>
        </Card>
      </div>
    </Modal>
  );
}
