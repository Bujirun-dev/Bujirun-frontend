"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { Card } from "@/components/ui/Card";
import { ProfileImageSelector } from "@/components/profile/ProfileImageSelector";
import { SignUpSuccessModal } from "@/features/auth/components/SignUpSuccessModal";
import { PROFILE_IMAGES } from "@/components/profile/profileImages";
import { apiClient, unwrap } from "@/shared/api";
import type { OpBody, OpResponse } from "@/shared/api/types";

import YesIcon from "@/assets/icons/login-register/yes.svg?svgr";
import NoIcon from "@/assets/icons/login-register/no.svg?svgr";

export default function SignUpPage() {
  const [nickname, setNickname] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const trimmedNickname = nickname.trim();
  const isNicknameValid =
    trimmedNickname.length >= 2 && trimmedNickname.length <= 6 && !isDuplicate;
  const isFormValid = isNicknameValid && selectedProfile !== null;

  // PATCH /api/users/me — 닉네임 + 프로필 이미지 저장
  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: (body: OpBody<"updateMyProfile">) =>
      apiClient.patch<OpResponse<"updateMyProfile">>("/api/users/me", body).then(unwrap),
    onSuccess: () => {
      setIsSuccessModalOpen(true);
    },
    onError: (error: unknown) => {
      // 닉네임 중복 등 서버 에러 처리
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setIsDuplicate(true);
      }
    },
  });

  const handleSignUp = () => {
    if (!isFormValid || isPending) return;

    // 선택한 프로필 이미지 id → 추후 URL로 교체 예정
    const selectedImage = PROFILE_IMAGES.find((img) => img.id === selectedProfile);

    updateProfile({
      nickname: trimmedNickname,
      // TODO: 프로필 이미지 URL 확정 후 실제 URL로 교체
      profileImageUrl: selectedImage ? String(selectedImage.id) : undefined,
    });
  };

  // 닉네임 변경 시 중복 플래그 초기화
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 6) return;
    setNickname(value);
    setIsDuplicate(false);
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
          <section className="flex flex-col gap-[8px]">
            <label className="font-semibold text-lg text-text-primary">닉네임</label>
            <div className="relative">
              <TextInput
                placeholder="2 - 6자 이내"
                value={nickname}
                onChange={handleNicknameChange}
              />
              {isNicknameValid && (
                <div className="absolute right-3 top-[12px]">
                  <YesIcon width={16} height={16} aria-hidden className="fill-main-blue" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-1 pr-1">
              {isDuplicate ? (
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
            disabled={!isFormValid || isPending}
            onClick={handleSignUp}
            className={cn((!isFormValid || isPending) && "bg-sub-gray cursor-not-allowed")}
          >
            {isPending ? "처리 중..." : "회원가입 완료"}
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
