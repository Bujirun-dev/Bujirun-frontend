import { cn } from "@/shared/utils";

interface CollectionProgressCardProps {
  collectedCount: number;
  totalCount: number;
  description?: string;
  onViewMore?: () => void;
  className?: string;
}

const RADIUS = 30;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CollectionProgressCard({
  collectedCount,
  totalCount,
  description,
  onViewMore,
  className,
}: CollectionProgressCardProps) {
  const progress = totalCount > 0 ? collectedCount / totalCount : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className={cn("bg-white/60 rounded-[20px] px-5 py-4 flex items-center gap-4", className)}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={RADIUS} fill="none" stroke="#e2ecff" strokeWidth="8" />
        <circle
          cx="40" cy="40" r={RADIUS}
          fill="none"
          stroke="#97c1ff"
          strokeWidth="8"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
        />
        <text x="40" y="44" textAnchor="middle" className="font-paperlogy" fontSize="13" fontWeight="bold" fill="#0f172a">
          {Math.round(progress * 100)}%
        </text>
      </svg>

      <div className="flex flex-col gap-1 flex-1">
        <span className="font-paperlogy font-bold text-[15px] text-text-heading">
          {collectedCount} / {totalCount} 수집 정보
        </span>
        {description && (
          <p className="font-paperlogy text-sm text-sub-gray leading-relaxed">{description}</p>
        )}
        {onViewMore && (
          <button onClick={onViewMore}>
            <span className="font-paperlogy text-sm text-sub-deepblue">이제 기록을 보기 ›</span>
          </button>
        )}
      </div>
    </div>
  );
}
