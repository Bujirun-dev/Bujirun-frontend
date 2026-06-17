import { cn } from "@/shared/utils";
import { CategoryChip } from "@/components";
import type { Category } from "@/components";

interface CategoryStatCardProps {
  category: Category;
  collectedCount: number;
  totalCount: number;
  icon?: string;
  className?: string;
}

const CATEGORY_ICON: Record<Category, string> = {
  sea: "🌊",
  nature: "🌿",
  culture: "🏛",
  experience: "🎭",
};

export function CategoryStatCard({
  category,
  collectedCount,
  totalCount,
  icon,
  className,
}: CategoryStatCardProps) {
  return (
    <div className={cn("bg-white rounded-[16px] flex flex-col items-center gap-2 px-3 py-3", className)}>
      <span className="text-[24px]">{icon ?? CATEGORY_ICON[category]}</span>
      <CategoryChip category={category} />
      <span className="font-paperlogy font-bold text-[13px] text-text-heading">
        {collectedCount}/{totalCount}
      </span>
    </div>
  );
}
