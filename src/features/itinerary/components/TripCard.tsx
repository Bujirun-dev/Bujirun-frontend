import Image from "next/image";
import bagIcon from "@/assets/icons/itinerary/bag.svg";
import pencilWhiteIcon from "@/assets/icons/itinerary/pencil-white.png";
import removeWhiteIcon from "@/assets/icons/itinerary/remove-white.png";
import { Card } from "@/components";

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface TripCardProps {
  trip: Trip;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const getDateOnly = (date: string) => date.split(" ")[0];

export function TripCard({ trip, onSelect, onEdit, onDelete }: TripCardProps) {
  const { id, name, startDate, endDate } = trip;

  return (
    <Card variant="glass-sm" className="relative flex items-center gap-3 px-[24px] py-[16px]">
      <button
        className="flex items-start gap-[14px] flex-1 text-left active:opacity-70"
        onClick={() => onSelect(id)}
      >
        <Image src={bagIcon} alt="여행" width={18} height={18} />
        <div className="flex flex-col gap-[5px]">
          <span className="font-paperlogy font-bold text-[14px] text-text-heading leading-none">
            {name}
          </span>
          <span className="font-paperlogy font-medium text-[11px] text-sub-gray leading-none">
            {getDateOnly(startDate)} - {getDateOnly(endDate)}
          </span>
        </div>
      </button>

      <div className="absolute top-[16px] right-[24px] flex items-center gap-2">
        <button
          className="size-[20px] rounded-[6px] bg-main-blue flex items-center justify-center active:opacity-70"
          onClick={() => onEdit(id)}
        >
          <Image src={pencilWhiteIcon} alt="수정" width={12} height={12} />
        </button>
        <button
          className="size-[20px] rounded-[6px] bg-sub-coral flex items-center justify-center active:opacity-70"
          onClick={() => onDelete(id)}
        >
          <Image src={removeWhiteIcon} alt="삭제" width={12} height={12} />
        </button>
      </div>
    </Card>
  );
}
