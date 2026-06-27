"use client";

import { useState } from "react";

import { Button } from "@/components";
import { TripReceiptModal } from "@/features/collection/components/TripReceiptModal";

export default function ReceiptPage() {
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const openReceiptModal = () => {
    setIsReceiptOpen(true);
  };

  const closeReceiptModal = () => {
    setIsReceiptOpen(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-main-white px-[24px]">
      <Button type="button" variant="primary" onClick={openReceiptModal}>
        여행 영수증 보기
      </Button>

      <TripReceiptModal isOpen={isReceiptOpen} onClose={closeReceiptModal} />
    </main>
  );
}
