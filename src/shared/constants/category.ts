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
 * itinerary/mypage 로그 데이터는 stop.tags[0]에 "#카테고리" 라벨이 섞여 저장되어 있음.
 * 이를 분리해서 category + 나머지 태그로 변환한다.
 */
export function splitLegacyStopTags(tags: string[]): { category: Category; tags: string[] } {
  const [categoryTag, ...rest] = tags;
  return {
    category: getCategoryFromKo((categoryTag ?? "").replace(/^#/, "")),
    tags: rest,
  };
}
