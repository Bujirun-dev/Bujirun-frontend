"use client";
import { useState } from "react";

import { Modal } from "@/components";
import { TransportDetail } from "@/features/home/components/TransportDetail";
import { TransportSelectContent } from "@/features/home/components/TransportSelectContent";
import { getSelectedTransportOption } from "@/features/home/data/sampleTransport";
import type { TransportGroup, TransportOption } from "@/features/home/types/transport";

interface TransportDetailModalProps {
  isOpen: boolean;
  transportGroup: TransportGroup;
  selectedOptionId?: string;
  onClose: () => void;
  onChange?: (option: TransportOption) => void;
}

export function TransportDetailModal({
  isOpen,
  transportGroup,
  selectedOptionId,
  onClose,
  onChange,
}: TransportDetailModalProps) {
  const [mode, setMode] = useState<"detail" | "select">("detail");
  const [localSelectedOptionId, setLocalSelectedOptionId] = useState(
    selectedOptionId ?? transportGroup.selectedOptionId,
  );

  const selectedOption = getSelectedTransportOption(transportGroup, localSelectedOptionId);

  const handleClose = () => {
    setMode("detail");
    onClose();
  };

  const handleConfirm = () => {
    if (mode === "detail") {
      setMode("select");
      return;
    }

    setMode("detail");
  };

  const handleSelect = (option: TransportOption) => {
    setLocalSelectedOptionId(option.id);
    onChange?.(option);
    setMode("detail");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      childrenVariant="plain"
      hideActions
      footer={
        mode === "detail" ? (
          <div className="mt-1 flex w-full justify-center gap-6">
            <button
              type="button"
              className="min-w-[100px] rounded-lg border border-main-blue px-5 py-2.5 font-ssurround text-md font-bold text-sub-deepblue transition-colors hover:bg-main-blue hover:text-main-white active:opacity-70"
              onClick={handleClose}
            >
              닫기
            </button>
            <button
              type="button"
              className="min-w-[100px] rounded-lg bg-main-blue px-5 py-2.5 font-ssurround text-md font-bold text-main-white active:opacity-70"
              onClick={handleConfirm}
            >
              변경
            </button>
          </div>
        ) : undefined
      }
    >
      {mode === "detail" ? (
        <TransportDetail transportGroup={transportGroup} selectedOption={selectedOption} />
      ) : (
        <TransportSelectContent
          transportGroup={transportGroup}
          selectedOptionId={selectedOption.id}
          onSelect={handleSelect}
        />
      )}
    </Modal>
  );
}
