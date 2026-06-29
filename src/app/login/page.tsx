import Image from "next/image";
import { KakaoLoginButton } from "@/components/ui/KakaoLoginButton";
import characterImg from "@/assets/character/primary.png";
import { StaircaseGlassCard } from "@/components";

export default function LoginPage() {
  return (
    <main className="relative flex flex-col items-center w-full h-full">
      <div className="flex flex-col items-center w-full h-full">
        {/* 말풍선 영역 */}
        <div className="mt-[120px] w-full pl-[24px]">
          <StaircaseGlassCard line1="반가워요!" line2="부산 여행을 떠나볼까요?" />
        </div>

        {/* 캐릭터 */}
        <div className="w-full flex justify-center">
          <Image
            src={characterImg}
            alt="부지런 캐릭터"
            width={360}
            height={360}
            className="object-contain"
          />
        </div>

        {/* 하단 버튼 영역 */}
        <div className="mt-auto w-full ">
          <KakaoLoginButton />
          <p className="mt-3 text-center text-sm text-sub-darkgray font-medium pb-[150px]">
            * 로그인하면 서비스 이용약관 및 개인정보 처리방침에
            <br />
            동의한 것으로 간주합니다.
          </p>
        </div>
      </div>
    </main>
  );
}
