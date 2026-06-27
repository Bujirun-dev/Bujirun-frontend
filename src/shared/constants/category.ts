import type { Category } from "@/components";

export const CATEGORY_LABEL: Record<Category, string> = {
  sea: "#바다",
  nature: "#자연",
  culture: "#문화",
  experience: "#체험",
};

export const CATEGORY_LABEL_KO: Record<string, Category> = {
  "자연·공원": "nature",
  "역사·문화": "culture",
  "체험·레저": "experience",
  "음식·카페": "experience",
};

export function getCategoryLabel(category: Category): string {
  return CATEGORY_LABEL[category];
}

export function getCategoryFromKo(ko: string): Category {
  return CATEGORY_LABEL_KO[ko] ?? "nature";
}
