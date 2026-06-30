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
  {
    id: "19",
    title: "기장 드라이브 로그 🚗",
    placeName: "오시리아 해안산책로",
    extraCount: 2,
    author: "드라이브러버",
    duration: "1박2일",
    date: "2026.06.14 ~ 06.15",
    downloadCount: 47,
    imageUrl: "https://picsum.photos/seed/log19/400/300",
  },
  {
    id: "20",
    title: "해양박물관 가족 로그 ⚓",
    placeName: "국립해양박물관",
    extraCount: 1,
    author: "가족여행자",
    duration: "당일치기",
    date: "2026.06.20",
    downloadCount: 26,
    imageUrl: "https://picsum.photos/seed/log20/400/300",
  },
  {
    id: "21",
    title: "낙동강 노을 로그 🌾",
    placeName: "삼락생태공원",
    extraCount: 2,
    author: "노을수집가",
    duration: "1박2일",
    date: "2026.07.03 ~ 07.04",
    downloadCount: 31,
    imageUrl: "https://picsum.photos/seed/log21/400/300",
  },
  {
    id: "22",
    title: "기장시장 먹방 로그 🦀",
    placeName: "기장시장",
    extraCount: 1,
    author: "먹방탐험가",
    duration: "당일치기",
    date: "2026.07.11",
    downloadCount: 63,
    imageUrl: "https://picsum.photos/seed/log22/400/300",
  },
  {
    id: "23",
    title: "어린이대공원 산책 로그 🎠",
    placeName: "부산어린이대공원",
    extraCount: 0,
    author: "초록산책러",
    duration: "당일치기",
    date: "2026.07.19",
    downloadCount: 22,
    imageUrl: "https://picsum.photos/seed/log23/400/300",
  },
  {
    id: "24",
    title: "요트 야경 로그 ⛵",
    placeName: "부산요트투어",
    extraCount: 1,
    author: "야경항해자",
    duration: "당일치기",
    date: "2026.08.02",
    downloadCount: 72,
    imageUrl: "https://picsum.photos/seed/log24/400/300",
  },
  {
    id: "25",
    title: "청사포 전망대 로그 🌊",
    placeName: "청사포 다릿돌전망대",
    extraCount: 1,
    author: "청사포단골",
    duration: "당일치기",
    date: "2026.07.06",
    downloadCount: 36,
    imageUrl: "https://picsum.photos/seed/log25/400/300",
  },
  {
    id: "26",
    title: "상상마당 전시 로그 🎧",
    placeName: "KT&G 상상마당 부산",
    extraCount: 1,
    author: "서면문화러",
    duration: "당일치기",
    date: "2026.07.08",
    downloadCount: 18,
    imageUrl: "https://picsum.photos/seed/log26/400/300",
  },
  {
    id: "27",
    title: "감지해변 산책 로그 🪨",
    placeName: "감지해변",
    extraCount: 1,
    author: "영도산책러",
    duration: "당일치기",
    date: "2026.07.13",
    downloadCount: 11,
    imageUrl: "https://picsum.photos/seed/log27/400/300",
  },
  {
    id: "28",
    title: "절영해안 산책 로그 🚶",
    placeName: "절영해안산책로",
    extraCount: 1,
    author: "바다산책러",
    duration: "당일치기",
    date: "2026.07.16",
    downloadCount: 24,
    imageUrl: "https://picsum.photos/seed/log28/400/300",
  },
];

// PLACES id 기준으로 관련 로그 매핑
// key: PLACES id, value: RELATED_LOGS id 배열
const RELATED_LOG_IDS_BY_PLACE: Record<number, string[]> = {
  1: ["1", "5"], // 해운대해수욕장
  2: ["11"], // 동백섬
  3: ["12"], // 더베이101
  5: ["14", "25"], // 청사포
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
  39: ["21"], // 을숙도
  51: ["19"], // 오시리아 해안산책로
  52: ["20"], // 국립해양박물관
  53: ["21"], // 부산현대미술관
  54: ["23"], // 회동수원지
  55: ["19"], // 죽성성당
  56: ["22"], // 기장시장
  57: ["19"], // 아난티 코브
  58: ["23"], // 부산어린이대공원
  59: ["21"], // 삼락생태공원
  60: ["24"], // 부산요트투어
};

function normalizePlaceName(name: string) {
  return name.replace(/\s/g, "");
}

export function getRelatedLogs(placeId: number) {
  const ids = RELATED_LOG_IDS_BY_PLACE[placeId] ?? [];
  return RELATED_LOGS.filter((log) => ids.includes(log.id));
}

export function getRelatedLogsByPlaceName(placeName: string) {
  const normalizedPlaceName = normalizePlaceName(placeName);

  return RELATED_LOGS.filter((log) => {
    const normalizedLogPlaceName = normalizePlaceName(log.placeName);
    return (
      normalizedLogPlaceName === normalizedPlaceName ||
      normalizedLogPlaceName.includes(normalizedPlaceName) ||
      normalizedPlaceName.includes(normalizedLogPlaceName)
    );
  });
}
