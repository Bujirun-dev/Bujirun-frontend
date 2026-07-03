export type TransportType = "버스" | "지하철" | "도보" | "택시";

export interface TransportStep {
  type: TransportType;
  routeName: string;
  from: string;
  to: string;
  arrivalText?: string;
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
