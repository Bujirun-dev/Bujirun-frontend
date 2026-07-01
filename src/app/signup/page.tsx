"use client";

import { useState } from "react";
import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { Card } from "@/components/ui/Card";
import { ProfileImageSelector } from "@/components/profile/ProfileImageSelector";
import { SignUpSuccessModal } from "@/features/auth/components/SignUpSuccessModal";
import { PROFILE_IMAGES } from "@/components/profile/profileImages";

import YesIcon from "@/assets/icons/login-register/yes.svg?svgr";
import NoIcon from "@/assets/icons/login-register/no.svg?svgr";

// 닉네임 중복 확인용 — TODO: API 연결 시 제거
const TAKEN_NICKNAMES = ["유리", "성빈", "은진"];

export default function SignUpPage() {
  const [nickname, setNickname] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const trimmedNickname = nickname.trim();
  const isNicknameTaken = TAKEN_NICKNAMES.includes(trimmedNickname);
  const isNicknameValid =
    trimmedNickname.length >= 2 && trimmedNickname.length <= 6 && !isNicknameTaken;
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
        className="absolute bottom-0 left-0 right-0 h-[722px] rounded-t-[40px] rounded-b-none shadow-none p-0 flex flex-col"
      >
        {/* 타이틀 */}
        <p className="text-center font-ssurround font-bold text-xl text-text-heading mt-[35px]">
          회원가입
        </p>
        <div className="px-[24px] mt-[40px] flex flex-col gap-[28px]">
          {/* 닉네임 입력 */}
          <section className="flex flex-col gap-[11px]">
            <label className="font-semibold text-lg text-text-primary">닉네임</label>
            <div className="relative">
              <TextInput
                placeholder="2 - 6자 이내"
                value={nickname}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length > 6) return;
                  setNickname(value);
                }}
              />
              {isNicknameValid && (
                <div className="absolute right-3 top-[12px]">
                  <YesIcon width={16} height={16} aria-hidden className="fill-main-blue" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pr-2.5">
              {isNicknameTaken ? (
                <div className="flex items-center gap-[4px]">
                  <NoIcon width={12} height={12} aria-hidden className="fill-sub-coral" />
                  <span className="font-semibold text-sm text-sub-coral">
                    이미 사용중인 닉네임이에요.
                  </span>
                </div>
              ) : (
                <span />
              )}
              <span className="font-semibold text-sm text-sub-gray">{nickname.length} / 6</span>
            </div>
          </section>

          {/* 프로필 사진 선택 */}
          <section className="flex flex-col gap-[10px]">
            <label className="font-semibold text-lg text-text-primary">프로필 사진</label>
            <ProfileImageSelector
              images={PROFILE_IMAGES}
              selectedId={selectedProfile}
              onSelect={setSelectedProfile}
              variant="signup"
            />
          </section>
        </div>

        {/* 버튼 영역 */}
        <div className="px-[24px] mt-auto mb-[36px]">
          <Button
            variant="primary"
            disabled={!isFormValid}
            onClick={handleSignUp}
            className={cn(!isFormValid && "bg-sub-gray cursor-not-allowed")}
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
