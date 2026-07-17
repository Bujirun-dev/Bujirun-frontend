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

export default function HomeReceiptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const logId = searchParams.get("logId");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(true);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<ReceiptData | undefined>();

  const { data: travelLog } = useQuery({
    queryKey: travelLogApi.keys.detail(logId ?? ""),
    queryFn: () => travelLogApi.getLog(logId as string),
    enabled: !!logId,
  });

  const { data: myProfile } = useQuery({
    queryKey: userApi.keys.me(),
    queryFn: userApi.getMyProfile,
  });

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
  };

  const closeReceiptModal = () => {
    setIsReceiptModalOpen(false);
  };

  const handleCreateReceipt = async ({ mood, theme }: ReviewPromptSubmitData) => {
    if (!logId || !travelLog) return;

    // mood, theme 저장
    await travelLogApi.updateLog(logId, {
      isPublic: true,
      mood: MOOD_VALUE[mood],
      theme,
    });

    // 저장된 최신 로그를 다시 조회
    const latestTravelLog = await travelLogApi.getLog(logId);

    const receipt = convertTripLogToReceipt(
      latestTravelLog,
      myProfile?.id ?? "",
      myProfile?.nickname ?? "",
    );

    setGeneratedReceipt(receipt);

    setIsReviewModalOpen(false);
    setIsReceiptModalOpen(true);
  };

  return (
    <main className="relative flex h-full flex-col">
      {travelLog && (
        <ReviewPromptModal
          isOpen={isReviewModalOpen}
          tripTitle={travelLog.title ?? "여행 기록"}
          onClose={closeReviewModal}
          onConfirm={handleCreateReceipt}
        />
      )}

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
