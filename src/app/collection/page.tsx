import Image from "next/image";

import turtleIcon from "@/assets/icons/collection/turtle.png";
import { Card, SpeechBubble } from "@/components";

// 임시 하드코딩 데이터: 전체 관광지 개수, 현재 수집한 관광지 개수
const TOTAL_COLLECTION_COUNT = 50;
const COLLECTED_COLLECTION_COUNT = 30;

export default function CollectionPage() {
  // 수집률
  const collectionProgress = Math.round(
    (COLLECTED_COLLECTION_COUNT / TOTAL_COLLECTION_COUNT) * 100,
  );

  // 말풍선 꼬리 위치 계산 (범위 제한)
  const TAIL_MIN = 16;
  const TAIL_MAX = 200;
  const speechBubbleTailPosition = Math.min(
    Math.max(Math.round((collectionProgress / 100) * 200), TAIL_MIN),
    TAIL_MAX,
  );

  return (
    <section className="pb-[24px]">
      <div className="flex items-end gap-[10px]">
        <h1 className="font-ssurround text-2xl text-text-heading">부산 도감</h1>
        <p className="pb-[2px] font-laundrygothic text-md">부산 곳곳에 남긴 나의 여행 발자국 🐾</p>
      </div>

      {/* TODO: CategoryMenu 컴포넌트 생성 후 연결 */}

      {/* 수집 현황 카드 -> 클릭 시 여행 기록 화면으로 이동 */}
      <Card variant="white" className="mt-5 rounded-[20px]">
        <div className="flex flex-col px-5 gap-2">
          {/* 수집 현황 */}
          <div className="flex items-center pt-3">
            <div className="relative flex-1">
              <div className="h-2.5 overflow-hidden rounded-full bg-system-navbg">
                <div
                  className="h-full rounded-full bg-main-blue"
                  style={{ width: `${collectionProgress}%` }}
                />
              </div>

              {/* 수집률이 100% 미만 -> 거북이 아이콘 표시 */}
              {collectionProgress < 100 && (
                <Image
                  src={turtleIcon}
                  alt="거북이 아이콘"
                  className="absolute size-10 w-auto -translate-x-1/2 -translate-y-[75%]"
                  style={{ left: `${collectionProgress}%` }}
                />
              )}
            </div>

            <div className="ml-2 flex items-baseline">
              <span className="text-xl font-bold leading-none text-sub-deepblue">
                {COLLECTED_COLLECTION_COUNT}
              </span>
              <span className="ml-1 text-sm font-medium leading-none text-sub-gray">
                / {TOTAL_COLLECTION_COUNT}
              </span>
            </div>
          </div>

          {/* 말풍선 */}
          <SpeechBubble variant="blue" tailPosition={speechBubbleTailPosition} className="w-fit">
            <p className="text-md text-text-primary">
              영차영차, 현재
              <span className="mx-1 font-bold text-sub-deepblue"> {collectionProgress} % </span>
              수집했어요!
            </p>
          </SpeechBubble>

          {/* 구분선 */}
          <div className="mt-2 h-[1px] bg-sub-lightgray" />

          {/* 여행 기록 보기 */}
          <div className="my-1 mx-auto flex items-center gap-1 leading-none">
            <span className="text-lg font-semibold leading-none text-sub-deepblue">
              여행 기록 보기
            </span>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-[22px] shrink-0 translate-y-[1px]"
              aria-hidden="true"
            >
              <path
                d="M15.4,9.88,10.81,5.29a1,1,0,0,0-1.41,0,1,1,0,0,0,0,1.42L14,11.29a1,1,0,0,1,0,1.42L9.4,17.29a1,1,0,0,0,1.41,1.42l4.59-4.59A3,3,0,0,0,15.4,9.88Z"
                fill="var(--color-sub-deepblue)"
              />
            </svg>
          </div>
        </div>
      </Card>
    </section>
  );
}
