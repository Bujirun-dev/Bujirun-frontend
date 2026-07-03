"use client";
import { useState } from "react";

import { Button, Modal } from "@/components";
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
  onKakaoMapClick?: () => void;
}

export function TransportDetailModal({
  isOpen,
  transportGroup,
  selectedOptionId,
  onClose,
  onChange,
  onKakaoMapClick,
}: TransportDetailModalProps) {
  const [mode, setMode] = useState<"detail" | "select">("detail");
  const [hasChanged, setHasChanged] = useState(false);
  const [localSelectedOptionId, setLocalSelectedOptionId] = useState(
    selectedOptionId ?? transportGroup.selectedOptionId,
  );

  const selectedOption = getSelectedTransportOption(transportGroup, localSelectedOptionId);

  const handleClose = () => {
    setMode("detail");
    setHasChanged(false);
    onClose();
  };

  const handleConfirm = () => {
    if (hasChanged) {
      handleClose();
      return;
    }

    setMode("select");
  };

  const handleSelect = (option: TransportOption) => {
    setLocalSelectedOptionId(option.id);
    onChange?.(option);
    setHasChanged(true);
    setMode("detail");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="!gap-3"
      childrenVariant="plain"
      hideActions
      footer={
        mode === "detail" ? (
          <div className="mt-1 flex w-full justify-center gap-6">
            <Button
              type="button"
              variant="secondary"
              className="min-w-[100px] w-auto px-5"
              onClick={handleClose}
            >
              닫기
            </Button>
            <Button
              type="button"
              variant="primary"
              className="min-w-[100px] w-auto px-5"
              onClick={handleConfirm}
            >
              {hasChanged ? "확인" : "변경"}
            </Button>
          </div>
        ) : undefined
      }
    >
      {mode === "detail" ? (
        <TransportDetail
          transportGroup={transportGroup}
          selectedOption={selectedOption}
          onKakaoMapClick={onKakaoMapClick}
        />
      ) : (
        <TransportSelectContent
          transportGroup={transportGroup}
          selectedOptionId={selectedOption.id}
          onSelect={handleSelect}
          onKakaoMapClick={onKakaoMapClick}
        />
      )}
    </Modal>
  );
}
