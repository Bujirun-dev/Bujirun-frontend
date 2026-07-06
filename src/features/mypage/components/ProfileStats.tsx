// 마이페이지 프로필 카드 - 활동 지표 (방문 관광지 / 완료 일정 / 여행 로그)
// visits / itineraries / travel_logs 테이블 카운트 기준
interface ProfileStatsProps {
  visitedCount: number;
  completedItineraryCount: number;
  travelLogCount: number;
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
