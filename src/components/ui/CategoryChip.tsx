import { cn } from "@/shared/utils";

export type Category = "sea" | "nature" | "culture" | "experience";

interface CategoryChipProps {
  category: Category;
  size?: "sm" | "md";
  className?: string;
}

const CATEGORY_CONFIG: Record<Category, { label: string; bg: string }> = {
  sea:        { label: "#바다", bg: "bg-category-sea" },
  nature:     { label: "#자연", bg: "bg-category-nature" },
  culture:    { label: "#문화", bg: "bg-category-culture" },
  experience: { label: "#체험", bg: "bg-category-experience" },
};

const SIZE_CONFIG = {
  sm: "py-[3px] px-[5px] rounded-[7px] text-[8px]",
  md: "py-[3px] px-[5px] rounded-[10px] text-[11px]",
};

export function CategoryChip({ category, size = "md", className }: CategoryChipProps) {
  const { label, bg } = CATEGORY_CONFIG[category];

  return (
    <div className={cn("inline-flex items-center justify-center", SIZE_CONFIG[size], bg, className)}>
      <span className="font-paperlogy text-text-primary tracking-[0.16px]">{label}</span>
    </div>
  );
}
