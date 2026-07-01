import type { TransportStep } from "@/features/home/components/TransportDetail";

export interface Transport {
  fromPlace: string;
  toPlace: string;
  durationText: string;
  costText: string;
  steps: TransportStep[];
}

export const SAMPLE_TRANSPORTS: Transport[] = [
  {
    fromPlace: "광안리 해수욕장",
    toPlace: "광안대교",
    durationText: "30분",
    costText: "1,500원",
    steps: [
      {
        type: "버스",
        routeName: "2012",
        from: "광안리 해수욕장 정류장",
        to: "광안역 정류장",
        arrivalText: "3분 후 도착 | 2정류장 전",
      },
      {
        type: "지하철",
        routeName: "2호선",
        from: "광안역",
        to: "광안대교역",
        arrivalText: "5분 후 도착 | 2역 전",
      },
    ],
  },
  {
    fromPlace: "광안대교",
    toPlace: "민락수변공원",
    durationText: "8분",
    costText: "5,800원",
    steps: [
      {
        type: "택시",
        routeName: "택시",
        from: "광안대교",
        to: "민락수변공원",
      },
    ],
  },
];

export const DEFAULT_TRANSPORT = SAMPLE_TRANSPORTS[0];

export function findTransportByPlaces(fromPlace: string, toPlace: string) {
  return SAMPLE_TRANSPORTS.find(
    (transport) => transport.fromPlace === fromPlace && transport.toPlace === toPlace,
  );
}
