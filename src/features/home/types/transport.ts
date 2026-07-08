export type TransportType = "버스" | "지하철" | "도보" | "택시";

export interface TransportStep {
  type: TransportType;
  routeName: string;
  from: string;
  to: string;
  arrivalText?: string;
  // 버스 실시간 도착정보(GET /api/transit/arrival/bus) 폴링용 — 둘 다 있을 때만 실시간 조회
  arsId?: string;
  routeNo?: string;
}

export interface TransportOption {
  id: string;
  durationText: string;
  costText: string;
  isRecommended?: boolean;
  steps: TransportStep[];
}

export interface TransportGroup {
  fromPlace: string;
  toPlace: string;
  selectedOptionId: string;
  options: TransportOption[];
}
