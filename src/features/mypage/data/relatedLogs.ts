// TODO: API 연결 시 GET /tour-spots/:spotId/logs 로 교체
import { SAMPLE_LOGS } from "@/features/itinerary/data/sampleLogs";

// PLACES id 기준으로 관련 로그 매핑
// key: PLACES id, value: itinerary SAMPLE_LOGS id 배열
const RELATED_LOG_IDS_BY_PLACE: Record<number, string[]> = {
  1: ["1", "5"], // 해운대해수욕장
  12: ["5"], // 광안리
  21: ["3"], // 금정산
  35: ["4"], // 송도해상케이블카
  36: ["2"], // 감천문화마을
};

export function getRelatedLogs(placeId: number) {
  const ids = RELATED_LOG_IDS_BY_PLACE[placeId] ?? [];
  return SAMPLE_LOGS.filter((log) => ids.includes(log.id));
}
