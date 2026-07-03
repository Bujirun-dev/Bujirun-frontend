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
  if (ko.includes("자연")) return "nature";
  if (ko.includes("문화")) return "culture";
  if (ko.includes("체험")) return "experience";
  return CATEGORY_LABEL_KO[ko] ?? "nature";
}

export function getCategoryFromEN(en: string): Category {
  if (en.includes("sea")) return "sea";
  if (en.includes("nature")) return "nature";
  if (en.includes("culture")) return "culture";
  if (en.includes("experience")) return "experience";

  return CATEGORY_LABEL_KO[en] ?? "nature";
}

/**
 * 태그 문자열이 4개 카테고리(바다/자연/문화/체험) 중 하나와 정확히 일치하는지 확인.
 * 일치하지 않으면 undefined — 일반 태그는 카테고리로 간주하지 않는다.
 */
export function matchCategoryTag(tag: string): Category | undefined {
  return CATEGORY_LABEL_KO[tag.replace(/^#/, "")];
}
