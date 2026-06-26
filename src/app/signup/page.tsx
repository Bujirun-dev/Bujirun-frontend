"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import faceImg from "@/assets/character/face.png";
import congsImg from "@/assets/character/congs.png";
import yesIcon from "@/assets/icons/login-register/yes.png";
import noIcon from "@/assets/icons/login-register/no.png";
import { useRouter } from "next/navigation";

const PROFILE_IMAGES = Array.from({ length: 9 }, (_, i) => ({ id: i + 1 }));

// 닉네임 중복 확인용 — TODO: API 연결 시 제거
const TAKEN_NICKNAMES = ["유리", "성빈", "은진"];

export default function SignUpPage() {
  const router = useRouter();
  // 닉네임 값과 중복 여부를 하나의 객체로 관리 — 단일 setState로 렌더 보장
  const [nicknameState, setNicknameState] = useState({ value: "", isTaken: false });
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const isNicknameValid = nicknameState.value.trim().length >= 2 && !nicknameState.isTaken;
  const isFormValid = isNicknameValid && selectedProfile !== null;

  // 회원가입 완료 버튼 클릭 — TODO: API 연결 시 서버 요청으로 교체
  const handleSignUp = () => {
    if (!isFormValid) return;
    setIsSuccessModalOpen(true);
  };

  return (
    <>
      <Card
        variant="white"
        className="absolute bottom-0 left-0 right-0 h-[722px] rounded-t-[28px] rounded-b-none shadow-none p-0 flex flex-col"
      >
        {/* 타이틀 */}
        <p className="text-center font-bold text-2xl text-text-heading mt-[35px]">회원가입</p>

        {/* flex-1 제거 — 콘텐츠 높이만큼만 차지하도록 */}
        <div className="px-[24px] mt-[28px] flex flex-col gap-[20px]">
          {/* 닉네임 입력 */}
          <section className="flex flex-col gap-[6px]">
            <label className="font-semibold text-md text-text-primary">닉네임</label>
            <div className="relative">
              <TextInput
                placeholder="2 - 10자 이내"
                value={nicknameState.value}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length > 10) return;
                  setNicknameState({
                    value,
                    isTaken: TAKEN_NICKNAMES.includes(value.trim()),
                  });
                }}
              />
              {/* 사용 가능 아이콘 */}
              {isNicknameValid && (
                <div className="absolute right-3 top-[12px]">
                  <Image src={yesIcon} alt="사용 가능" width={16} height={16} />
                </div>
              )}
            </div>

            {/* 에러 메시지 + 글자 수 — 항상 같은 행에 표시해 높이 고정 */}
            <div className="flex items-center justify-between pr-2.5">
              {nicknameState.isTaken ? (
                <div className="flex items-center gap-[4px]">
                  <Image src={noIcon} alt="사용 불가" width={12} height={12} />
                  <span className="font-semibold text-sm text-sub-coral">
                    이미 사용중인 닉네임이에요.
                  </span>
                </div>
              ) : (
                <span />
              )}
              <span className="font-semibold text-sm text-sub-gray">
                {nicknameState.value.length}/10
              </span>
            </div>
          </section>

          {/* 프로필 사진 선택 — 프로필 이미지 변경 예정 */}
          <section className="flex flex-col gap-[10px]">
            <label className="font-semibold text-md text-text-primary">프로필 사진</label>
            <div
              className="rounded-2xl p-[16px]"
              style={{
                backgroundColor: "color-mix(in srgb, var(--color-system-navbg) 65%, transparent)",
              }}
            >
              <div className="grid grid-cols-3 gap-[10px]">
                {PROFILE_IMAGES.map(({ id }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedProfile(id)}
                    className={cn(
                      "relative aspect-square rounded-full overflow-hidden transition-all active:scale-97",
                      selectedProfile === id
                        ? "bg-main-blue outline outline-[2.5px] outline-main-blue"
                        : "bg-system-navbg outline outline-[2.5px] outline-transparent",
                    )}
                  >
                    <Image src={faceImg} alt={`프로필 ${id}`} fill className="object-contain p-2" />
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* 프로필 영역과 57px 간격 고정 */}
        <div className="px-[24px] pb-[36px] mt-[57px]">
          <Button
            variant="primary"
            disabled={!isFormValid}
            onClick={handleSignUp}
            className={!isFormValid ? "bg-sub-darkgray cursor-not-allowed" : ""}
          >
            회원가입 완료
          </Button>
        </div>
      </Card>

      {/* 회원가입 성공 모달 */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
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
              <Button
                variant="primary"
                className="w-[275px] h-[31px]"
                onClick={() => router.push("/")}
              >
                여행 시작하기
              </Button>
            </div>
          </div>
        }
      />
    </>
  );
}
