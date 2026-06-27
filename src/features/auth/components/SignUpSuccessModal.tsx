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
    onClose();
    router.push("/");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={<Image src={congsImg} alt="회원가입 성공" width={120} height={80} />}
      iconClassName="bg-transparent w-auto h-auto"
      className="h-[435px]"
      title="회원가입 성공"
      description={`회원가입이 완료되었어요.\n같이 여행을 떠나볼까요?`}
      hideActions
      footer={
        <div className="w-full flex flex-col items-center">
          <Card
            variant="glass-sm"
            className="w-[275px] h-[31px] flex items-center justify-center py-0 px-3 rounded-lg"
          >
            <p className="text-sm text-sub-gray font-semibold">
              친구들과 여행의 추억을 기록해보세요!
            </p>
          </Card>
          <div className="mt-[45px] w-full flex justify-center">
            <Button variant="primary" className="w-[275px] h-[31px]" onClick={handleStart}>
              여행 시작하기
            </Button>
          </div>
        </div>
      }
    />
  );
}
