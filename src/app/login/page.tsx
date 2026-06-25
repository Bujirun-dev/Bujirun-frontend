import Image from "next/image";
import { SpeechBubble } from "@/components/ui/SpeechBubble";
import { KakaoLoginButton } from "@/components/ui/KakaoLoginButton";
import characterImg from "@/assets/character/primary.png";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  return (
    <main className="relative flex flex-col items-center w-full h-full">
      <div className="flex flex-col items-center w-full h-full">
        {/* 말풍선 영역 */}
        <div className="mt-[120px] w-full flex flex-col gap-0">
          {/* 첫 번째 말풍선*/}
          <Card
            variant="glass-sm"
            className="ml-[24px] w-[130px] h-[44px] flex items-center justify-center rounded-[24px] !border-none shadow-none"
          >
            <span className="font-proup text-text-heading text-lg">반가워요!</span>
          </Card>

          {/* 두 번째 말풍선 */}
          <Card
            variant="glass-sm"
            className="ml-[55px] w-[261px] h-[44px] flex items-center justify-center rounded-[24px] -mt-[3px] !border-none shadow-none"
          >
            <span className="font-proup text-text-heading text-lg">부산 여행을 떠나볼까요?</span>
          </Card>
        </div>
        {/* 캐릭터 */}
        <div className="mt-[29px] px-[45px] w-full flex justify-center">
          <Image
            src={characterImg}
            alt="부지런 캐릭터"
            width={360}
            height={360}
            className="object-contain"
          />
        </div>

        {/* 하단 버튼 영역 */}
        <div className="mt-auto w-full px-[32px]">
          <KakaoLoginButton />
          <p className="mt-3 text-center text-sm text-sub-darkgray font-paperlogy font-medium pb-[150px]">
            * 로그인하면 서비스 이용약관 및 개인정보 처리방침에
            <br />
            동의한 것으로 간주합니다.
          </p>
        </div>
      </div>
    </main>
  );
}
