"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MOOD_VALUE } from "@/features/home/components/MoodOptions";
import { travelLogApi, userApi } from "@/shared/api/domains";
import { ReviewPromptModal } from "@/features/home/components/ReviewPromptModal";
import { TripReceiptModal } from "@/features/receipt/components/TripReceiptModal";
import type { ReceiptData, ReviewPromptSubmitData } from "@/features/receipt/types/receipt";
import { convertTripLogToReceipt } from "@/features/receipt/utils/convertTripLogToReceipt";
import { PROFILE_IMAGES } from "@/components/profile/profileImages";
import { skipReview } from "@/shared/utils/skippedReviews";

export default function HomeReceiptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 리뷰 페이지 진입 전에는 log가 없으므로 itineraryId를 받음
  const itineraryId = searchParams.get("itineraryId");

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(true);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<ReceiptData | undefined>();

  const { data: myProfile } = useQuery({
    queryKey: userApi.keys.me(),
    queryFn: userApi.getMyProfile,
  });

  const profileImage = (() => {
    const profileImageUrl = myProfile?.profileImageUrl;

    if (!profileImageUrl) return PROFILE_IMAGES[0].src;

    const profileImageId = Number(profileImageUrl);

    if (!Number.isNaN(profileImageId)) {
      return (
        PROFILE_IMAGES.find((image) => image.id === profileImageId)?.src ?? PROFILE_IMAGES[0].src
      );
    }

    return profileImageUrl;
  })();

  // "취소"/X로 이 팝업을 닫으면 이 페이지엔 모달 외엔 아무 것도 렌더링되는 게 없어서
  // (아래 return의 <main>에 이 두 모달뿐), 홈으로 돌려보내지 않으면 빈 화면에 그대로
  // 갇힌다 — 닫기 버튼이 안 먹는 것처럼 보이는 원인이었음. closeReceiptModal과 동일하게
  // /home으로 되돌려보낸다.
  //
  // 또한 취소해도 로그는 여전히 안 만들어져 있어서, skipReview 없이 그냥 홈으로만
  // 보내면 TodayItinerary의 자동 리다이렉트가 다음 홈 진입 때 바로 이 팝업을 다시
  // 띄워버려 사실상 못 빠져나가는 무한루프였다(로그 발행 외엔 이 팝업을 다시 열 수동
  // 진입로가 아직 없음 — 추가되면 그쪽에서 다시 시도 가능). itineraryId를 스킵 목록에
  // 남겨 같은 일정에 대해선 다시 자동으로 뜨지 않게 한다.
  const closeReviewModal = () => {
    if (itineraryId) skipReview(itineraryId);
    setIsReviewModalOpen(false);
    router.push("/home");
  };

  const closeReceiptModal = () => {
    setIsReceiptModalOpen(false);
    router.push("/home");
  };

  const handleCreateReceipt = async ({ mood, theme }: ReviewPromptSubmitData) => {
    if (!itineraryId) {
      console.error("itineraryId가 없습니다.");
      return;
    }

    try {
      // 영수증 발행 버튼을 누르는 시점에 로그 생성
      const createdLog = await travelLogApi.createLog({
        itineraryId,
        isPublic: true,
      });

      const createdLogId = createdLog.id;

      if (!createdLogId) {
        throw new Error("생성된 로그 ID가 없습니다.");
      }

      // 생성된 로그에 리뷰 정보 저장
      await travelLogApi.updateLog(createdLogId, {
        isPublic: true,
        mood: MOOD_VALUE[mood],
        theme,
      });

      // mood, theme가 반영된 최신 로그 조회
      const latestTravelLog = await travelLogApi.getLog(createdLogId);

      const receipt = convertTripLogToReceipt(
        latestTravelLog,
        myProfile?.id ?? "",
        myProfile?.nickname ?? "",
        profileImage,
      );

      setGeneratedReceipt(receipt);
      setIsReviewModalOpen(false);
      setIsReceiptModalOpen(true);
    } catch (error) {
      console.error("영수증 발행 실패: ", error);
    }
  };

  return (
    <main className="relative flex h-full flex-col">
      <ReviewPromptModal
        isOpen={isReviewModalOpen}
        tripTitle="여행 기록"
        onClose={closeReviewModal}
        onConfirm={handleCreateReceipt}
      />

      <TripReceiptModal
        isOpen={isReceiptModalOpen}
        receipt={generatedReceipt}
        onDetail={() => {
          if (!generatedReceipt) return;

          router.push(`/collection/records/log/${generatedReceipt.tripId}`);
        }}
        onClose={closeReceiptModal}
      />
    </main>
  );
}
