"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CategoryChip, PageCard } from "@/components";
import { BackButton } from "@/components/ui/BackButton";
import { BookmarkIcon } from "@/features/home/components/BookmarkIcon";
import { RECOMMENDED_PLACE } from "@/features/home/data/recommendedPlace";
import { getCategoryFromEN } from "@/shared/constants/category";
import { SAMPLE_LOGS } from "@/features/home/data/sampleLogs";

export default function RecommendedPlaceDetailPage() {
  const [bookmark, setBookmark] = useState(RECOMMENDED_PLACE);
  const router = useRouter();
  const relatedLogs = SAMPLE_LOGS.filter((log) => log.id === String(bookmark.id)).slice(0, 2);

  const toggleBookmark = () => {
    setBookmark((prev) => ({
      ...prev,
      isBookmarked: !prev.isBookmarked,
    }));
  };

  return (
    <PageCard className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0">
        <div className="mb-6 flex items-center gap-3">
          <BackButton className="bg-transparent" />
          <h1 className="font-ssurround text-xl text-text-heading leading-none">여기는 어때요?</h1>
          <div className="flex-1" />
          <button
            aria-label={bookmark.isBookmarked ? "북마크 해제" : "북마크 추가"}
            onClick={toggleBookmark}
            className="shrink-0 active:opacity-70"
          >
            <BookmarkIcon filled={bookmark.isBookmarked} className="size-5 fill-main-blue" />
          </button>
        </div>
        <Image
          src={bookmark.imageUrl}
          alt={bookmark.name}
          className="mb-5 h-auto w-full rounded-3xl"
          priority
        />
        <div className="mb-4 border-b border-sub-lightgray/50 pb-4">
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              className={`size-5 shrink-0 ${bookmark.isCollected ? "fill-main-blue" : "fill-sub-pink"}`}
              aria-hidden="true"
            >
              <path d="M12,.042a9.992,9.992,0,0,0-9.981,9.98c0,2.57,1.99,6.592,5.915,11.954a5.034,5.034,0,0,0,8.132,0c3.925-5.362,5.915-9.384,5.915-11.954A9.992,9.992,0,0,0,12,.042ZM12,14a4,4,0,1,1,4-4A4,4,0,0,1,12,14Z" />
            </svg>

            <div className="flex min-w-0 flex-1 items-center gap-3">
              <h2 className="truncate text-xl font-bold text-text-heading">{bookmark.name}</h2>
              <CategoryChip category={getCategoryFromEN(bookmark.category)} />
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <section className="border-b border-sub-lightgray/50 pb-4">
          <h3 className="mb-2 text-xl font-bold text-text-heading">소개</h3>
          <p className="leading-7 text-lg text-text-primary">{bookmark.introduction}</p>
        </section>

        <section className="border-b border-sub-lightgray/50 py-4">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-xl font-bold text-text-heading">위치</h3>
          </div>
          <p className="leading-7 text-lg text-text-primary">{bookmark.address ?? "-"}</p>
        </section>

        <section className="border-b border-sub-lightgray/50 py-6">
          <h3 className="mb-2 text-xl font-bold text-text-heading">정보</h3>
          <Card variant="glass-sm" className="p-5">
            <div className="space-y-4 text-lg">
              {[
                {
                  label: "운영시간",
                  value: bookmark.operatingHours ?? "-",
                  path: "M12,24C5.383,24,0,18.617,0,12S5.383,0,12,0s12,5.383,12,12-5.383,12-12,12Zm0-22C6.486,2,2,6.486,2,12s4.486,10,10,10,10-4.486,10-10S17.514,2,12,2Zm2.5,14.33c.479-.276,.643-.888,.366-1.366l-1.866-3.232V6c0-.552-.447-1-1-1s-1,.448-1,1v6c0,.176,.046,.348,.134,.5l2,3.464c.186,.321,.521,.5,.867,.5,.17,0,.342-.043,.499-.134Z",
                },
                {
                  label: "입장료",
                  value: bookmark.fee ?? "-",
                  path: "M13.053,5.079c.971-.909,2.344-2.36,2.894-3.744,.255-.641-.257-1.335-.947-1.335h-6c-.69,0-1.202,.693-.947,1.335,.55,1.384,1.923,2.835,2.894,3.744C5.569,5.878,1,12.618,1,18c0,3.309,2.691,6,6,6h10c3.309,0,6-2.691,6-6,0-5.382-4.569-12.122-9.947-12.921Zm-2.409,8.682l3.042,.507c1.341,.223,2.315,1.373,2.315,2.733,0,1.654-1.346,3-3,3v1c0,.552-.448,1-1,1s-1-.448-1-1v-1h-.268c-1.068,0-2.063-.574-2.598-1.499-.276-.478-.113-1.089,.365-1.366,.476-.277,1.089-.114,1.366,.365,.178,.308,.511,.5,.867,.5h2.268c.551,0,1-.449,1-1,0-.378-.271-.698-.644-.76l-3.042-.507c-1.341-.223-2.315-1.373-2.315-2.733,0-1.654,1.346-3,3-3v-1c0-.552,.448-1,1-1s1,.448,1,1v1h.268c1.067,0,2.063,.575,2.598,1.5,.276,.478,.113,1.089-.365,1.366-.477,.277-1.089,.114-1.366-.365-.179-.309-.511-.5-.867-.5h-2.268c-.551,0-1,.449-1,1,0,.378,.271,.698,.644,.76Z",
                },
                {
                  label: "주차",
                  value: bookmark.parking ?? "-",
                  path: "M15.9,16.093A2.99,2.99,0,0,0,13.036,14H10.964A2.99,2.99,0,0,0,8.1,16.093l-.672,2.119C7.205,19.31,6.256,21.814,8,22v1a1,1,0,0,0,2,0V22h4v1a1,1,0,0,0,2,0V22c1.744-.188.8-2.688.568-3.789ZM10.964,16h2.072a1,1,0,0,1,.953.7L14.4,18H9.6l.414-1.3A1,1,0,0,1,10.964,16ZM24,9.762v9.365a5.009,5.009,0,0,1-3.748,4.841A1,1,0,0,1,19,22.994V13a3,3,0,0,0-3-3H8a3,3,0,0,0-3,3v9.994a1,1,0,0,1-1.252.974A5.009,5.009,0,0,1,0,19.127V9.762A5,5,0,0,1,2.2,5.618L9.2.894a5,5,0,0,1,5.594,0l7,4.724A5,5,0,0,1,24,9.762Z",
                },
                {
                  label: "문의",
                  value: bookmark.phone ?? "-",
                  path: "M23,11a1,1,0,0,1-1-1,8.008,8.008,0,0,0-8-8,1,1,0,0,1,0-2A10.011,10.011,0,0,1,24,10,1,1,0,0,1,23,11Zm-3-1a6,6,0,0,0-6-6,1,1,0,1,0,0,2,4,4,0,0,1,4,4,1,1,0,0,0,2,0Zm2.183,12.164.91-1.049a3.1,3.1,0,0,0,0-4.377c-.031-.031-2.437-1.882-2.437-1.882a3.1,3.1,0,0,0-4.281.006l-1.906,1.606A12.784,12.784,0,0,1,7.537,9.524l1.6-1.9a3.1,3.1,0,0,0,.007-4.282S7.291.939,7.26.908A3.082,3.082,0,0,0,2.934.862l-1.15,1C-5.01,9.744,9.62,24.261,17.762,24A6.155,6.155,0,0,0,22.183,22.164Z",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="flex size-9.5 shrink-0 items-center justify-center rounded-xl border border-main-blue/20 bg-system-navbg">
                      <svg
                        viewBox="0 0 24 24"
                        className="size-5 fill-sub-deepblue"
                        aria-hidden="true"
                      >
                        <path d={item.path} />
                      </svg>
                    </span>
                    <span className="font-semibold text-text-primary">{item.label}</span>
                  </div>
                  <span className="text-right font-medium text-text-primary">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="pt-6 pb-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-text-heading">관련 로그</h3>
            {relatedLogs.length > 0 && (
              <button
                type="button"
                className="flex items-center text-sm font-semibold text-sub-darkgray"
                onClick={() => router.push(`/home/recommend/${bookmark.id}/related-logs`)}
              >
                더보기
                <svg viewBox="0 0 24 24" className="size-5 fill-sub-darkgray" aria-hidden="true">
                  <path d="M15.4,9.88,10.81,5.29a1,1,0,0,0-1.41,0,1,1,0,0,0,0,1.42L14,11.29a1,1,0,0,1,0,1.42L9.4,17.29a1,1,0,0,0,1.41,1.42l4.59-4.59A3,3,0,0,0,15.4,9.88Z" />
                </svg>
              </button>
            )}
          </div>

          {relatedLogs.length === 0 ? (
            <p className="text-sm font-medium text-sub-gray">아직 관련 로그가 없어요</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-1">
              {relatedLogs.slice(0, 2).map((log) => (
                <button
                  key={log.id}
                  type="button"
                  onClick={() => router.push(`/home/logs/${log.id}`)}
                  className="relative h-[95px] w-[150px] shrink-0 overflow-hidden rounded-2xl active:opacity-70"
                >
                  <Image src={log.imageUrl} alt={log.title} fill className="object-cover" />
                  <div className="absolute bottom-2 left-2 rounded-lg bg-system-blackbg px-2 py-1">
                    <span className="text-xs font-medium text-main-white">{log.author}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageCard>
  );
}
