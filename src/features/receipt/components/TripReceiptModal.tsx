"use client";

import { useCallback, useRef } from "react";
import { ReceiptButtons } from "@/features/receipt/components/ReceiptButtons";
import { TripReceipt } from "@/features/receipt/components/TripReceipt";
import { toPng } from "html-to-image";
import type { ReceiptData } from "@/features/receipt/types/receipt";

type TripReceiptModalProps = {
  isOpen: boolean;
  receipt?: ReceiptData;
  onDetail?: () => void;
  onClose: () => void;
  onDownloadComplete?: () => void;
  onDownloadError?: () => void;
};

const waitForImages = async (element: HTMLElement) => {
  const images = Array.from(element.querySelectorAll("img"));

  await Promise.all(
    images.map((image) => {
      if (image.complete) return Promise.resolve();

      return new Promise<void>((resolve) => {
        image.onload = () => resolve();
        image.onerror = () => resolve();
      });
    }),
  );
};

const sanitizeFileName = (fileName: string) => fileName.replace(/[\\/:*?"<>|]/g, "").trim();

const createReceiptFileName = (title: string, tripId: number) => {
  const safeTitle = sanitizeFileName(title);
  return safeTitle ? `[bujirun]${safeTitle}.png` : `[bujirun]receipt-${tripId}.png`;
};

export function TripReceiptModal({
  isOpen,
  receipt,
  onDetail,
  onClose,
  onDownloadComplete,
  onDownloadError,
}: TripReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const receiptFileName = receipt
    ? createReceiptFileName(receipt.title, receipt.tripId)
    : "[bujirun]receipt-unknown.png";

  // 영수증.png 다운로드
  const handleDownload = useCallback(async () => {
    if (!receiptRef.current || !receipt) return;

    try {
      await document.fonts.ready;
      await waitForImages(receiptRef.current);

      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "transparent",
      });

      const link = document.createElement("a");
      link.download = receiptFileName;
      link.href = dataUrl;
      link.click();

      onDownloadComplete?.();
    } catch (error) {
      console.error("영수증 다운로드에 실패했어요.", error);
      onDownloadError?.();
    }
  }, [receipt, receiptFileName, onDownloadComplete, onDownloadError]);

  if (!isOpen || !receipt) return null;

  return (
    <div className="fixed left-1/2 top-0 z-50 h-[844px] max-h-dvh w-full max-w-[390px] -translate-x-1/2 overflow-hidden bg-system-blackbg">
      <div className="h-full overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full justify-center px-5 py-13">
          <div className="relative w-full max-w-[320px]">
            {/* 다운로드되는 영수증 */}
            <div ref={receiptRef}>
              <TripReceipt receipt={receipt} />
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
