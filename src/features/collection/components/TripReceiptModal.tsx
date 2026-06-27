import { TripReceipt } from "@/features/collection/components/TripReceipt";
type TripReceiptModalProps = {
  isOpen: boolean;
};

export function TripReceiptModal({ isOpen }: TripReceiptModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: "var(--color-system-blackbg)" }}
    >
      <div className="mx-auto flex min-h-full w-full justify-center px-5 py-10">
        <div className="w-full max-w-[343px]">
          <TripReceipt />
        </div>
      </div>
    </div>
  );
}
