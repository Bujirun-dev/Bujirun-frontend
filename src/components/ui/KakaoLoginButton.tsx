import Image from "next/image";
import kakaoLoginImg from "@/assets/icons/login-register/kakao_login_large_wide.png";
import { cn } from "@/shared/utils";

interface KakaoLoginButtonProps {
  onClick?: () => void;
  className?: string;
}

export function KakaoLoginButton({ onClick, className }: KakaoLoginButtonProps) {
  return (
    <button
      className={cn("w-full transition-opacity active:opacity-80", className)}
      onClick={onClick}
    >
      <Image src={kakaoLoginImg} alt="카카오 로그인" className="w-full h-auto" />
    </button>
  );
}
