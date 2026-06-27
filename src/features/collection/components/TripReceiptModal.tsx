import { ReceiptButtons } from "@/features/collection/components/ReceiptButtons";
import { TripReceipt } from "@/features/collection/components/TripReceipt";

type TripReceiptModalProps = {
  isOpen: boolean;
  tripId: number;
  onDetail?: () => void;
  onDownload?: () => void;
  onClose: () => void;
};

export function TripReceiptModal({
  isOpen,
  tripId,
  onDetail,
  onDownload,
  onClose,
}: TripReceiptModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed left-1/2 top-0 z-50 h-[844px] max-h-dvh w-full max-w-[390px] -translate-x-1/2 overflow-hidden bg-system-blackbg">
      <div className="h-full overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full justify-center px-5 py-13">
          <div className="relative w-full max-w-[343px]">
            <TripReceipt tripId={tripId} />

            <div className="absolute right-3 top-5 z-20">
              <ReceiptButtons onDetail={onDetail} onDownload={onDownload} onClose={onClose} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
