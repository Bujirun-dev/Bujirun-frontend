"use client";

import { useCallback, useRef } from "react";
import { toPng } from "html-to-image";
import { ReceiptButtons } from "@/features/collection/components/ReceiptButtons";
import { TripReceipt } from "@/features/collection/components/TripReceipt";

type TripReceiptModalProps = {
  isOpen: boolean;
  tripId: number;
  onDetail?: () => void;
  onClose: () => void;
  onDownloadComplete?: () => void;
  onDownloadError?: () => void;
};

export function TripReceiptModal({
  isOpen,
  tripId,
  onDetail,
  onClose,
  onDownloadComplete,
  onDownloadError,
}: TripReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  // 영수증.png 다운로드
  const handleDownload = useCallback(async () => {
    if (!receiptRef.current) return;

    try {
      await document.fonts.ready;

      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `bujirun-receipt-${tripId}.png`;
      link.href = dataUrl;
      link.click();
      onDownloadComplete?.();
    } catch (error) {
      console.error("영수증 다운로드에 실패했어요.", error);
      onDownloadError?.();
    }
  }, [tripId, onDownloadComplete, onDownloadError]);

  if (!isOpen) return null;

  return (
    <div className="fixed left-1/2 top-0 z-50 h-[844px] max-h-dvh w-full max-w-[390px] -translate-x-1/2 overflow-hidden bg-system-blackbg">
      <div className="h-full overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full justify-center px-5 py-13">
          <div className="relative w-full max-w-[343px]">
            {/* 다운로드되는 영수증 */}
            <div ref={receiptRef}>
              <TripReceipt tripId={tripId} />
            </div>

            <div className="absolute right-3 top-5 z-20">
              <ReceiptButtons onDetail={onDetail} onDownload={handleDownload} onClose={onClose} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
