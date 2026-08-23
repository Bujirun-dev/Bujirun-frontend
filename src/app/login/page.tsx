"use client";

import { useState } from "react";
import Image from "next/image";
import { KakaoLoginButton } from "@/components/ui/KakaoLoginButton";
import characterImg from "@/assets/character/primary.png";
import { StaircaseGlassCard, PrivacyPolicyModal } from "@/components";

export default function LoginPage() {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <main className="relative flex flex-col items-center w-full h-full">
      <div className="flex flex-col items-center w-full h-full">
        {/* 말풍선 영역 */}
        <div className="mt-[120px] w-full pl-[24px]">
          <StaircaseGlassCard line1="반가워요!" line2="부산 여행을 떠나볼까요?" />
        </div>

        {/* 캐릭터 */}
        <div className="w-full flex justify-center mt-[30px]">
          <Image
            src={characterImg}
            alt="부지런 캐릭터"
            width={320}
            height={320}
            className="object-contain"
            priority
          />
        </div>

        {/* 하단 버튼 영역 */}
        <div className="mt-auto w-full ">
          <KakaoLoginButton />
          <p className="mt-3 text-center text-sm text-sub-darkgray font-medium pb-[150px]">
            * 로그인하면{" "}
            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="underline underline-offset-2 text-sub-deepblue active:opacity-70"
            >
              서비스 이용약관 및 개인정보 처리방침
            </button>
            에
            <br />
            동의한 것으로 간주합니다.
          </p>
        </div>
      </div>

      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </main>
  );
}
