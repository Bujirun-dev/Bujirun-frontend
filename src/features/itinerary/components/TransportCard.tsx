import Image from "next/image";
import busIcon from "@/assets/icons/home/bus.png";
import subwayIcon from "@/assets/icons/home/subway.png";
import walkIcon from "@/assets/icons/home/walk.png";
import taxiIcon from "@/assets/icons/home/taxi.png";
import clockIcon from "@/assets/icons/itinerary/clock-dark.png";
import arrowIcon from "@/assets/icons/itinerary/arrow-small-right.png";
import { cn } from "@/shared/utils";

type TransportType = "버스" | "지하철" | "도보" | "택시";

const TRANSPORT_ICONS: Record<TransportType, typeof busIcon> = {
  버스: busIcon,
  지하철: subwayIcon,
  도보: walkIcon,
  택시: taxiIcon,
};

interface TransportCardProps {
  type: TransportType;
  routeName: string;
  from: string;
  to: string;
  durationMin: number;
  cost?: number;
  className?: string;
}

export function TransportCard({
  type,
  routeName,
  from,
  to,
  durationMin,
  cost,
  className,
}: TransportCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        "bg-sub-green rounded-[16px] px-4 py-3",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-white/60 rounded-[8px] px-2 py-1">
          <Image src={TRANSPORT_ICONS[type]} alt={type} width={16} height={16} />
          <span className="font-paperlogy text-xs font-semibold text-text-primary">{type}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-paperlogy font-bold text-md text-text-heading">{routeName}</span>
          <span className="font-paperlogy text-xs text-text-primary flex items-center gap-1">
            {from}
            <Image src={arrowIcon} alt="→" width={10} height={10} />
            {to}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-0.5">
        <span className="font-paperlogy text-sm text-text-primary flex items-center gap-1">
          <Image src={clockIcon} alt="시간" width={10} height={10} />
          {durationMin}min
        </span>
        {cost !== undefined && (
          <span className="font-paperlogy text-sm text-text-primary">
            ₩{cost.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
