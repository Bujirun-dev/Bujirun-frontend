import Image from "next/image";
import bagIcon from "@/assets/icons/itinerary/bag.svg";
import pencilWhiteIcon from "@/assets/icons/itinerary/pencil.svg";
import removeWhiteIcon from "@/assets/icons/itinerary/remove.svg";
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
    <Card variant="glass-sm" className="relative flex items-center gap-3 px-6 py-4">
      <button
        className="flex items-start gap-3.5 flex-1 text-left active:opacity-70"
        onClick={() => onSelect(id)}
      >
        <Image src={bagIcon} alt="여행" width={18} height={18} />
        <div className="flex flex-col gap-1">
          <span className="font-bold text-md text-text-heading leading-none">{name}</span>
          <span className="font-medium text-xs text-sub-gray leading-none">
            {getDateOnly(startDate)} - {getDateOnly(endDate)}
          </span>
        </div>
      </button>

      <div className="absolute top-[16px] right-[24px] flex items-center gap-2">
        <button
          className="size-[20px] rounded-md bg-main-blue flex items-center justify-center active:opacity-70"
          onClick={() => onEdit(id)}
        >
          <Image
            src={pencilWhiteIcon}
            alt="수정"
            width={12}
            height={12}
            className="brightness-0 invert"
          />
        </button>
        <button
          className="size-[20px] rounded-md bg-sub-coral flex items-center justify-center active:opacity-70"
          onClick={() => onDelete(id)}
        >
          <Image
            src={removeWhiteIcon}
            alt="삭제"
            width={12}
            height={12}
            className="brightness-0 invert"
          />
        </button>
      </div>
    </Card>
  );
}
