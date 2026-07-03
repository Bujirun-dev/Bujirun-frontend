"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReviewPromptModal } from "@/features/home/components/ReviewPromptModal";
import { TripReceiptModal } from "@/features/receipt/components/TripReceiptModal";
import { tripReceipts } from "@/features/receipt/data/tripReceipts";
import type { ReceiptData, ReviewPromptSubmitData } from "@/features/receipt/types/receipt";

export default function HomeReceiptPage() {
  const baseReceipt = tripReceipts[0];
  const router = useRouter();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<ReceiptData | undefined>();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsReviewModalOpen(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
  };

  const closeReceiptModal = () => {
    setIsReceiptModalOpen(false);
  };

  const handleCreateReceipt = ({ mood, theme }: ReviewPromptSubmitData) => {
    if (!baseReceipt) return;

    setGeneratedReceipt({
      ...baseReceipt,
      mood,
      theme,
    });
    setIsReviewModalOpen(false);
    setIsReceiptModalOpen(true);
  };

  return (
    <main className="relative flex h-full flex-col">
      {baseReceipt && (
        <ReviewPromptModal
          isOpen={isReviewModalOpen}
          tripTitle={baseReceipt.title}
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
