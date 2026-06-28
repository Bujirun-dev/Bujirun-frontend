import { BackButton } from "@/components";
import { BookmarkList } from "@/features/mypage/components";
import { PageCard } from "@/components/layout/PageCard";

export default function BookmarksPage() {
  return (
    <PageCard>
      <div className="flex flex-col gap-5 h-full">
        {/* 헤더 */}
        <div className="flex items-center gap-3 shrink-0">
          <BackButton />
          <h1 className="font-ssurround font-bold text-lg text-text-heading">북마크 목록</h1>
        </div>

        {/* 목록 - 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto">
          <BookmarkList />
        </div>
      </div>
    </PageCard>
  );
}
