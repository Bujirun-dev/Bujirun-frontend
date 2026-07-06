interface ProfileStatsProps {
  visitedCount: number; // visits 테이블 기준
  completedItineraryCount: number; // itineraries 완료 상태 기준
  travelLogCount: number; // travel_logs 테이블 기준
}

export function ProfileStats({
  visitedCount,
  completedItineraryCount,
  travelLogCount,
}: ProfileStatsProps) {
  const items = [
    { label: "방문 관광지", value: visitedCount },
    { label: "완료 일정", value: completedItineraryCount },
    { label: "여행 로그", value: travelLogCount },
  ];

  return (
    <div className="flex w-full divide-x divide-system-divider rounded-2xl bg-system-searchbg py-3">
      {items.map(({ label, value }) => (
        <div key={label} className="flex flex-1 flex-col items-center gap-0.5">
          <span className="text-lg font-bold text-text-heading">{value}</span>
          <span className="text-2xs text-sub-gray">{label}</span>
        </div>
      ))}
    </div>
  );
}
