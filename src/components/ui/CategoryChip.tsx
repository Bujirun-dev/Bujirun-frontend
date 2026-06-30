import { cn } from "@/shared/utils";

export type Category = "sea" | "nature" | "culture" | "experience";

interface CategoryChipProps {
  category: Category;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const CATEGORY_CONFIG: Record<Category, { label: string; bg: string }> = {
  sea: { label: "#바다", bg: "bg-category-sea" },
  nature: { label: "#자연", bg: "bg-category-nature" },
  culture: { label: "#문화", bg: "bg-category-culture" },
  experience: { label: "#체험", bg: "bg-category-experience" },
};

const SIZE_CLASS = {
  sm: "py-[3px] px-[5px] text-3xs",
  md: "py-[4px] px-[6px] text-xs",
  lg: "py-[6px] px-[10px] text-md",
};

export function CategoryChip({ category, size = "md", className }: CategoryChipProps) {
  const { label, bg } = CATEGORY_CONFIG[category];

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-lg",
        SIZE_CLASS[size],
        bg,
        className,
      )}
    >
      <span className="text-text-primary tracking-[0.16px]">{label}</span>
    </div>
  );
}
