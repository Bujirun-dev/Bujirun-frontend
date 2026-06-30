// TODO: API 연결 시 GET /tour-spots/:spotId/logs 로 교체

export interface RelatedLog {
  id: string;
  title: string;
  placeName: string;
  extraCount: number;
  author: string;
  duration: string;
  date: string;
  downloadCount: number;
  imageUrl: string;
}

const RELATED_LOGS: RelatedLog[] = [
  {
    id: "1",
    title: "여행자123 로그 🌊",
    placeName: "해운대해수욕장",
    extraCount: 2,
    author: "여행자123",
    duration: "2박3일",
    date: "2026.05.10 ~ 05.12",
    downloadCount: 34,
    imageUrl: "https://picsum.photos/seed/log1/400/300",
  },
  {
    id: "2",
    title: "여행러버 로그 🏘️",
    placeName: "감천문화마을",
    extraCount: 1,
    author: "여행러버",
    duration: "1박2일",
    date: "2026.05.08 ~ 05.09",
    downloadCount: 12,
    imageUrl: "https://picsum.photos/seed/log2/400/300",
  },
  {
    id: "3",
    title: "트레커 로그 🏔️",
    placeName: "금정산",
    extraCount: 0,
    author: "트레커",
    duration: "2박3일",
    date: "2026.05.01 ~ 05.03",
    downloadCount: 8,
    imageUrl: "https://picsum.photos/seed/log3/400/300",
  },
  {
    id: "4",
    title: "테마파크매니아 로그 🚠",
    placeName: "송도해상케이블카",
    extraCount: 3,
    author: "테마파크매니아",
    duration: "1박2일",
    date: "2026.04.20 ~ 04.21",
    downloadCount: 56,
    imageUrl: "https://picsum.photos/seed/log4/400/300",
  },
  {
    id: "5",
    title: "바다사랑 로그 🌅",
    placeName: "광안리",
    extraCount: 1,
    author: "바다사랑",
    duration: "2박3일",
    date: "2026.04.15 ~ 04.17",
    downloadCount: 21,
    imageUrl: "https://picsum.photos/seed/log5/400/300",
  },
  {
    id: "6",
    title: "부산탐험대 로그 🗺️",
    placeName: "태종대",
    extraCount: 2,
    author: "부산탐험대",
    duration: "1박2일",
    date: "2026.04.10 ~ 04.11",
    downloadCount: 18,
    imageUrl: "https://picsum.photos/seed/log6/400/300",
  },
  {
    id: "7",
    title: "감성여행러 로그 🎨",
    placeName: "흰여울문화마을",
    extraCount: 1,
    author: "감성여행러",
    duration: "당일치기",
    date: "2026.04.05",
    downloadCount: 42,
    imageUrl: "https://picsum.photos/seed/log7/400/300",
  },
  {
    id: "8",
    title: "힐링여행 로그 🌿",
    placeName: "범어사",
    extraCount: 0,
    author: "힐링여행자",
    duration: "당일치기",
    date: "2026.03.28",
    downloadCount: 15,
    imageUrl: "https://picsum.photos/seed/log8/400/300",
  },
  {
    id: "9",
    title: "야경헌터 로그 🌉",
    placeName: "광안리",
    extraCount: 2,
    author: "야경헌터",
    duration: "1박2일",
    date: "2026.03.20 ~ 03.21",
    downloadCount: 67,
    imageUrl: "https://picsum.photos/seed/log9/400/300",
  },
  {
    id: "10",
    title: "서핑러버 로그 🏄",
    placeName: "송정해수욕장",
    extraCount: 1,
    author: "서핑러버",
    duration: "1박2일",
    date: "2026.03.15 ~ 03.16",
    downloadCount: 29,
    imageUrl: "https://picsum.photos/seed/log10/400/300",
  },
  {
    id: "11",
    title: "동백이좋아 로그 🌸",
    placeName: "동백섬",
    extraCount: 1,
    author: "동백이좋아",
    duration: "당일치기",
    date: "2026.04.02",
    downloadCount: 38,
    imageUrl: "https://picsum.photos/seed/log11/400/300",
  },
  {
    id: "12",
    title: "야경감성 로그 🌃",
    placeName: "더베이101",
    extraCount: 0,
    author: "야경감성",
    duration: "당일치기",
    date: "2026.04.08",
    downloadCount: 51,
    imageUrl: "https://picsum.photos/seed/log12/400/300",
  },
  {
    id: "13",
    title: "부산한바퀴 로그 🚂",
    placeName: "블루라인파크",
    extraCount: 2,
    author: "부산한바퀴",
    duration: "1박2일",
    date: "2026.03.25 ~ 03.26",
    downloadCount: 44,
    imageUrl: "https://picsum.photos/seed/log13/400/300",
  },
  {
    id: "14",
    title: "청사포뷰 로그 🐟",
    placeName: "청사포",
    extraCount: 1,
    author: "청사포뷰",
    duration: "당일치기",
    date: "2026.03.18",
    downloadCount: 23,
    imageUrl: "https://picsum.photos/seed/log14/400/300",
  },
  {
    id: "15",
    title: "F1963산책 로그 🏭",
    placeName: "F1963",
    extraCount: 1,
    author: "F1963산책",
    duration: "당일치기",
    date: "2026.03.10",
    downloadCount: 33,
    imageUrl: "https://picsum.photos/seed/log15/400/300",
  },
  {
    id: "16",
    title: "오륙도일몰 로그 🌇",
    placeName: "오륙도",
    extraCount: 0,
    author: "오륙도일몰",
    duration: "당일치기",
    date: "2026.03.05",
    downloadCount: 19,
    imageUrl: "https://picsum.photos/seed/log16/400/300",
  },
  {
    id: "17",
    title: "자갈치탐방 로그 🐠",
    placeName: "자갈치시장",
    extraCount: 2,
    author: "자갈치탐방",
    duration: "당일치기",
    date: "2026.02.28",
    downloadCount: 27,
    imageUrl: "https://picsum.photos/seed/log17/400/300",
  },
  {
    id: "18",
    title: "암남공원산책 로그 🌲",
    placeName: "암남공원",
    extraCount: 1,
    author: "암남산책러",
    duration: "당일치기",
    date: "2026.02.20",
    downloadCount: 14,
    imageUrl: "https://picsum.photos/seed/log18/400/300",
  },
];

// PLACES id 기준으로 관련 로그 매핑
// key: PLACES id, value: RELATED_LOGS id 배열
const RELATED_LOG_IDS_BY_PLACE: Record<number, string[]> = {
  1: ["1", "5"], // 해운대해수욕장
  2: ["11"], // 동백섬
  3: ["12"], // 더베이101
  5: ["14"], // 청사포
  6: ["13"], // 블루라인파크
  7: ["10"], // 송정해수욕장
  12: ["5", "9"], // 광안리
  13: ["15"], // F1963
  20: ["8"], // 범어사
  21: ["3"], // 금정산
  24: ["17"], // 자갈치시장
  28: ["7"], // 흰여울문화마을
  31: ["6"], // 태종대
  34: ["4"], // 송도해수욕장
  35: ["4"], // 송도해상케이블카
  36: ["2"], // 감천문화마을
  37: ["16"], // 오륙도
  38: ["18"], // 암남공원
};

export function getRelatedLogs(placeId: number) {
  const ids = RELATED_LOG_IDS_BY_PLACE[placeId] ?? [];
  return RELATED_LOGS.filter((log) => ids.includes(log.id));
}
