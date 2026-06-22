import Image from "next/image";
import clockIcon from "@/assets/icons/home/clock.png";
import { cn } from "@/shared/utils";

type TransportType = "버스" | "지하철" | "도보" | "택시";

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
        "flex items-center gap-[9px]",
        "bg-sub-green rounded-[15px] w-[285px] p-[8px]",
        className
      )}
    >
      {/* 교통수단 타입 배지 */}
      <div className="flex items-center justify-center bg-main-white rounded-[10px] w-[35px] h-[27px] shrink-0">
        <span className="font-ssurround text-[12px] font-bold text-main-blue">{type}</span>
      </div>

      {/* 중간: 노선명 + 구간 */}
      <div className="flex-1 flex flex-col gap-px min-w-0">
        <span className="font-paperlogy font-medium text-[12px] text-text-primary leading-none truncate">{routeName}</span>
        <span className="font-paperlogy font-normal text-[11px] text-sub-darkgray truncate">
          {from} → {to}
        </span>
      </div>

      {/* 오른쪽: 시간 + 비용 */}
      <div className="flex flex-col items-end gap-px shrink-0">
        <span className="font-paperlogy font-normal text-[12px] text-text-primary flex items-center gap-px">
          <Image src={clockIcon} alt="시간" width={10} height={10} />
          {durationMin}min
        </span>
        {cost !== undefined && (
          <span className="font-paperlogy font-normal text-[11px] text-sub-darkgray">
            ₩{cost.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
