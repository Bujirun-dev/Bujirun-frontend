import Image from "next/image";
import { cn } from "@/shared/utils";

const COLORS = [
  "bg-sub-pink",
  "bg-sub-lightblue",
  "bg-sub-green",
  "bg-sub-violet",
  "bg-main-blue",
];

interface MemberAvatarProps {
  label?: string;
  imageUrl?: string;
  index?: number;
  size?: "sm" | "md";
  className?: string;
}

export function MemberAvatar({
  label,
  imageUrl,
  index = 0,
  size = "md",
  className,
}: MemberAvatarProps) {
  const sizeClass = size === "sm" ? "w-[28px] h-[28px] text-[11px]" : "w-[36px] h-[36px] text-[14px]";
  const color = COLORS[index % COLORS.length];

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center overflow-hidden shrink-0",
        sizeClass,
        !imageUrl && color,
        className
      )}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt={label ?? ""} fill className="object-cover" />
      ) : (
        <span className="font-paperlogy font-bold text-white">{label}</span>
      )}
    </div>
  );
}
