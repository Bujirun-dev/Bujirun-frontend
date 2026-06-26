import Image from "next/image";

import bookIcon from "@/assets/icons/collection/book.png";
import { Card, PageCard } from "@/components";
import { TravelRecordItem } from "@/features/collection/components/TravelRecordItem";
import { TRAVEL_RECORDS } from "@/features/collection/data/travelRecords";

export default function CollectionRecordsPage() {
  return (
    <section className="flex h-full flex-col gap-6">
      <Card variant="white" className="rounded-[25px]">
        <div className="px-5 py-2">
          {/* 상단 */}
          <div className="flex items-center gap-2">
            <Image src={bookIcon} alt="여행 기록" width={55} height={55} />
            <div className="flex flex-col gap-1">
              <h1 className="font-ssurround text-lg text-text-heading">여행 기록</h1>
              <p className="text-md text-text-primary">부산에서 남긴 추억들을 모아봤어요.</p>
            </div>
          </div>

          {/* 구분선 */}
          <div className="my-5 border-t border-dashed border-sub-gray" />

          {/* 하단 */}
          <div className="grid grid-cols-3 text-center">
            <div className="flex flex-col items-center gap-1 border-r border-dashed border-sub-gray">
              <p className="text-sm font-bold text-text-primary">총 여행 기록</p>
              <p className="text-2xl font-bold text-main-blue">
                4<span className="ml-1 text-sm text-text-primary">회</span>
              </p>
            </div>
            <div className="flex flex-col items-center gap-1 border-r border-dashed border-sub-gray">
              <p className="text-sm font-bold text-text-primary">수집 관광지</p>
              <p className="text-2xl font-bold text-main-blue">
                30<span className="ml-1 text-sm text-text-primary">곳</span>
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-bold text-text-primary">최애 카테고리</p>
              <span className="rounded-full bg-sub-lightblue px-3 py-1  text-sm text-text-primary">
                #바다
              </span>
            </div>
          </div>
        </div>
      </Card>

      <PageCard className="px-6 pt-8 pb-4">
        <div className="flex flex-col gap-5">
          {TRAVEL_RECORDS.map((record) => (
            <TravelRecordItem key={record.id} title={record.title} period={record.period} />
          ))}
        </div>
      </PageCard>
    </section>
  );
}
