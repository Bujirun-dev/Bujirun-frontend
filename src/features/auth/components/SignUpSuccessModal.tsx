"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import congsImg from "@/assets/character/congs.png";

interface SignUpSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 회원가입 완료 후 노출되는 성공 모달
export function SignUpSuccessModal({ isOpen, onClose }: SignUpSuccessModalProps) {
  const router = useRouter();

  const handleStart = () => {
    // TODO: API 연결 시 실제 토큰으로 교체
    localStorage.setItem("accessToken", "dummy_token");
    onClose();
    router.push("/");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideCloseButton
      hideActions
      className="h-[435px]"
      childrenVariant="plain"
      footer={
        <div className="w-full flex flex-col items-center">
          <Card
            variant="glass-sm"
            className="mt-[30px] w-[275px] h-[31px] flex items-center justify-center py-0 px-3 rounded-[10px]"
          >
            <p className="font-medium text-sm text-sub-darkgray text-center">
              친구들과 여행의 추억을 기록해보세요!
            </p>
          </Card>
          <div className="mt-[45px] w-full flex justify-center">
            <Button
              variant="primary"
              className="w-[278px] h-[40px] rounded-[10px] font-ssurround font-bold text-md"
              onClick={handleStart}
            >
              여행 시작하기
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-[10px] text-center">
        <Image src={congsImg} alt="회원가입 성공" width={120} height={80} />
        <div className="flex flex-col items-center gap-[36px]">
          <h2 className="font-ssurround text-xl font-bold tracking-[0.5px] text-text-heading">
            회원가입 성공
          </h2>
          <p className="text-lg font-semibold text-text-primary leading-relaxed whitespace-pre-line">
            {`회원가입이 완료되었어요.\n같이 여행을 떠나볼까요?`}
          </p>
        </div>
      </div>
    </Modal>
  );
}
