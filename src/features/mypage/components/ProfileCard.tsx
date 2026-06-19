import Image from "next/image";
import { cn } from "@/shared/utils";
import { CategoryChip } from "@/components";
import type { Category } from "@/components";

interface ProfileCardProps {
  avatarUrl?: string;
  nickname: string;
  isVerified?: boolean;
  categories?: Category[];
  collectedCount: number;
  totalCount: number;
  className?: string;
}

export function ProfileCard({
  avatarUrl,
  nickname,
  isVerified,
  categories = [],
  collectedCount,
  totalCount,
  className,
}: ProfileCardProps) {
  return (
    <div className={cn("flex items-center gap-4 bg-white/60 rounded-[24px] px-5 py-4", className)}>
      <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden bg-sub-lightblue shrink-0">
        {avatarUrl && <Image src={avatarUrl} alt={nickname} fill className="object-cover" />}
      </div>

      <div className="flex flex-col gap-1.5 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-paperlogy font-bold text-lg text-text-heading">{nickname}</span>
          {isVerified && (
            <span className="w-[16px] h-[16px] rounded-full bg-sub-deepblue flex items-center justify-center text-xs text-white font-bold">
              ✓
            </span>
          )}
        </div>

        {categories.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {categories.map((cat) => (
              <CategoryChip key={cat} category={cat} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
