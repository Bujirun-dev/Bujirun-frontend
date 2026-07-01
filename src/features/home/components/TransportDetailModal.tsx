import { Modal } from "@/components";
import { TransportDetail } from "@/features/home/components/TransportDetail";
import type { Transport } from "@/features/home/data/sampleTransport";

interface TransportDetailModalProps {
  isOpen: boolean;
  transport: Transport;
  onClose: () => void;
  onChange?: () => void;
}

export function TransportDetailModal({
  isOpen,
  transport,
  onClose,
  onChange,
}: TransportDetailModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      cancelText="닫기"
      confirmText="변경"
      onCancel={onClose}
      onConfirm={onChange ?? onClose}
      childrenVariant="plain"
    >
      <TransportDetail transport={transport} />
    </Modal>
  );
}
