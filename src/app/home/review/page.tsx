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

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
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
