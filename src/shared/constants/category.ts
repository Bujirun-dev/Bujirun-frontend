import type { Category } from "@/components";

export const CATEGORY_LABEL: Record<Category, string> = {
  sea: "#바다",
  nature: "#자연",
  culture: "#문화",
  experience: "#체험",
};

export const CATEGORY_LABEL_KO: Record<string, Category> = {
  바다: "sea",
  자연: "nature",
  문화: "culture",
  체험: "experience",
};

export function getCategoryLabel(category: Category): string {
  return CATEGORY_LABEL[category];
}

export function getCategoryFromKo(ko: string): Category {
  if (ko.includes("바다")) return "sea";
  if (ko.includes("자연") || ko.includes("공원")) return "nature";
  if (ko.includes("문화") || ko.includes("역사")) return "culture";
  if (ko.includes("체험") || ko.includes("레저")) return "experience";
  return CATEGORY_LABEL_KO[ko] ?? "nature";
}
