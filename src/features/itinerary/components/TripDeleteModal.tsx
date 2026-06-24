import Image from "next/image";
import removeWhiteIcon from "@/assets/icons/itinerary/remove-white.png";

interface TripDeleteModalProps {
  isOpen: boolean;
  tripName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function TripDeleteModal({ isOpen, tripName, onClose, onConfirm }: TripDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
      <div className="w-full max-w-[320px] bg-white rounded-[30px] px-6 py-8 flex flex-col items-center gap-6">
        {/* 헤더 아이콘 */}
        <div className="size-[56px] rounded-full bg-sub-coral flex items-center justify-center">
          <Image src={removeWhiteIcon} alt="삭제" width={28} height={28} />
        </div>

        {/* 타이틀 */}
        <p className="font-paperlogy font-bold text-[18px] text-text-heading">여행 삭제</p>

        {/* 설명 */}
        <div className="flex flex-col items-center gap-3 w-full">
          <p className="font-paperlogy text-[14px] text-text-primary text-center leading-relaxed">
            '{tripName}' 여행을<br />삭제하시겠어요?
          </p>
          <div className="w-full px-3 py-2 rounded-[10px] bg-system-searchbg">
            <p className="font-paperlogy text-[11px] text-sub-gray text-center">
              * 삭제한 여행은 복구할 수 없어요.
            </p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 w-full">
          <button
            className="flex-1 h-[44px] rounded-[12px] border border-sub-coral font-paperlogy font-bold text-[14px] text-sub-coral active:opacity-70"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className="flex-1 h-[44px] rounded-[12px] bg-sub-coral font-paperlogy font-bold text-[14px] text-white active:opacity-70"
            onClick={onConfirm}
          >
            삭제하기
          </button>
        </div>
      </div>
    </div>
  );
}
