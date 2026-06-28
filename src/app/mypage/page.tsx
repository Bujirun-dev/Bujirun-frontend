// src/app/mypage/page.tsx
// 마이페이지 탭 - 서버 컴포넌트

import { ProfileCard } from "@/features/mypage/components/ProfileCard";
import { MenuList } from "@/features/mypage/components/MenuList";

// TODO: 실제 API 연결 시 TanStack Query로 교체
const MOCK_USER = {
  name: "은지미",
  isVerified: true,
  tags: ["#바다", "#문화"] as string[],
  collectedCount: 24,
  totalCount: 34,
  avatarUrl: undefined as string | undefined,
};

export default function MyPage() {
  return (
    <div className="flex flex-col gap-[9px] pt-[24px] px-[24px] pb-[24px]">
      <ProfileCard user={MOCK_USER} />
      <MenuList />
    </div>
  );
}
