import { cn } from "@/shared/utils";

interface KakaoLoginButtonProps {
  onClick?: () => void;
  className?: string;
}

export function KakaoLoginButton({ onClick, className }: KakaoLoginButtonProps) {
  return (
    <button
      className={cn(
        "w-full h-[52px] rounded-[14px]",
        "flex items-center justify-center gap-2",
        "font-paperlogy font-bold text-[15px] text-[#3C1E1E]",
        "transition-opacity active:opacity-80",
        className
      )}
      style={{ backgroundColor: "#FEE500" }}
      onClick={onClick}
    >
      <span className="text-2xl">💬</span>
      카카오 로그인
    </button>
  );
}
