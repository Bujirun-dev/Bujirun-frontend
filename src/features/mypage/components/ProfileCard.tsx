"use client";

// src/features/mypage/components/ProfileCard.tsx
// 마이페이지 - 프로필 카드 (아바타 / 이름 / 취향 태그 / 도감 진행률)

import Image from "next/image";

// 카테고리 태그별 배경색 매핑 (globals.css 카테고리 토큰 기반)
const TAG_COLOR_MAP: Record<string, string> = {
  "#바다": "bg-category-sea",
  "#자연": "bg-category-nature",
  "#문화": "bg-category-culture",
  "#체험": "bg-category-experience",
};

interface ProfileCardProps {
  user: {
    name: string;
    isVerified: boolean;
    tags: string[];
    collectedCount: number;
    totalCount: number;
    avatarUrl?: string;
  };
}

export function ProfileCard({ user }: ProfileCardProps) {
  const { name, isVerified, tags, collectedCount, totalCount, avatarUrl } = user;

  const progressPercent = totalCount > 0 ? Math.round((collectedCount / totalCount) * 100) : 0;

  return (
    <div
      className="
        w-full rounded-[20px] border-[0.5px] border-main-blue
        bg-main-white backdrop-blur-[15px]
        p-[20px] flex flex-row items-center gap-[24px]
      "
    >
      {/* 아바타 */}
      <div className="relative shrink-0 w-[80px] h-[80px]">
        <div className="w-[80px] h-[80px] rounded-full bg-main-blue overflow-hidden flex items-center justify-center">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`${name} 프로필 사진`}
              width={80}
              height={80}
              className="object-cover"
            />
          ) : (
            <span className="font-paperlogy font-semibold text-[28px] text-main-white select-none">
              {name.charAt(0)}
            </span>
          )}
        </div>

        {/* 인증 뱃지 */}
        {isVerified && (
          <div
            className="
              absolute bottom-0 right-0
              w-[18px] h-[18px] rounded-[7px]
              bg-main-blue
              flex items-center justify-center
            "
            aria-label="인증된 사용자"
          >
            <svg
              width="11"
              height="10"
              viewBox="0 0 11 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M2 5L4.5 7.5L9 2.5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* 정보 영역 */}
      <div className="flex flex-col gap-[7px] flex-1 min-w-0">
        {/* 이름 */}
        <p className="font-paperlogy font-semibold text-lg text-text-primary leading-none">
          {name}
        </p>

        {/* 취향 태그 */}
        <div className="flex flex-row gap-[8px] flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`
                inline-flex items-center justify-center
                px-[9px] py-[4px]
                rounded-[8px] text-sm font-paperlogy
                text-text-primary tracking-wide
                ${TAG_COLOR_MAP[tag] ?? "bg-category-sea"}
              `}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 도감 진행률 */}
        <div className="flex flex-col gap-[4px]">
          <div
            className="w-full h-[8px] rounded-[10px] bg-system-scroll overflow-hidden"
            role="progressbar"
            aria-valuenow={collectedCount}
            aria-valuemin={0}
            aria-valuemax={totalCount}
            aria-label="도감 수집 현황"
          >
            <div
              className="h-full rounded-[10px] bg-sub-deepblue transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex flex-row items-baseline gap-[2px] justify-end">
            <span className="font-paperlogy font-semibold text-md text-sub-deepblue tracking-wide">
              {collectedCount}
            </span>
            <span className="font-paperlogy font-medium text-xs text-sub-gray tracking-wide">
              / {totalCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
