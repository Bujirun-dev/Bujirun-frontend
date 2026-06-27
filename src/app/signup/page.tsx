"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { Card } from "@/components/ui/Card";
import { ProfileImageSelector } from "@/components/profile/ProfileImageSelector";
import { SignUpSuccessModal } from "@/features/auth/components/SignUpSuccessModal";

import yesIcon from "@/assets/icons/login-register/yes.png";
import noIcon from "@/assets/icons/login-register/no.png";
import profileHat from "@/assets/character/profile/profile-hat.png"; //프로필 이미지

//TODO: 실제 프로필 이미지 9개로 교체 예정
const PROFILE_IMAGES = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  src: profileHat,
}));

// 닉네임 중복 확인용 — TODO: API 연결 시 제거
const TAKEN_NICKNAMES = ["유리", "성빈", "은진"];

export default function SignUpPage() {
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
        <p className="text-center font-ssurround font-bold text-[20px] text-text-heading mt-[20px]">
          회원가입
        </p>
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
              {isNicknameValid && (
                <div className="absolute right-3 top-[12px]">
                  <Image src={yesIcon} alt="사용 가능" width={16} height={16} />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pr-2.5">
              {nicknameState.isTaken ? (
                <div className="flex items-center gap-[4px]">
                  <Image src={noIcon} alt="사용 불가" width={12} height={12} />
                  <span className="font-paperlogy font-semibold text-sm text-sub-coral">
                    이미 사용중인 닉네임이에요.
                  </span>
                </div>
              ) : (
                <span />
              )}
              <span className="font-paperlogy font-semibold text-sm text-sub-gray">
                {nicknameState.value.length} /10
              </span>
            </div>
          </section>

          {/* 프로필 사진 선택 */}
          <section className="flex flex-col gap-[10px]">
            <label className="font-paperlogy font-semibold text-md text-text-primary">
              프로필 사진
            </label>
            <ProfileImageSelector
              images={PROFILE_IMAGES}
              selectedId={selectedProfile}
              onSelect={setSelectedProfile}
            />
          </section>
        </div>

        {/* 버튼 영역 */}
        <div className="px-[24px] pb-[36px] mt-[57px]">
          <Button
            variant="primary"
            disabled={!isFormValid}
            onClick={handleSignUp}
            className={cn(!isFormValid && "bg-sub-darkgray cursor-not-allowed")}
          >
            회원가입 완료
          </Button>
        </div>
      </Card>

      <SignUpSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </>
  );
}
