# 2026-07-29 일정 탭 버그 세션 정리

담당(은진) 파트: 원래 팀 버그 목록 15개 중 3, 9, 11, 13, 14번.
작업 브랜치: `fix/itinerary-tab-issues` (base: `origin/develop`), 커밋 `d4c90283`, `7585d02a`.
**주의: 로컬 커밋만 해뒀고 PR은 아직 안 올림. develop/배포에 반영 안 됨.**

## 완료

- **9번 (검색창이 페이지 이동해도 안 사라짐)**: 원인은 `SlidingTimeline`이 모든 Day를 동시에
  마운트해두고 `translateX`로 넘기는 구조라, 화면 밖으로 밀려난 Day의 검색/상세/시간변경
  팝업이 계속 열려있던 것. `ItineraryTimeline`에 `isActive` prop을 추가해서 비활성화되는
  순간 팝업 상태를 리셋하도록 수정 (`ItineraryTimeline.tsx`, `SlidingTimeline.tsx`).

- **11번 (프론트서버 느림)**: `next/image`의 `fill` 사용처 여러 곳에 `sizes`가 없어서, 실제
  화면에 50~250px로 보이는 관광지 썸네일이 전부 1920px로 요청되고 있었음. `PlaceCard.tsx`,
  `PlaceDetailContent.tsx`, `PlaceDetailSheet.tsx`, `LogDetailContent.tsx`,
  `ArrivalVerifyStages.tsx` 등에 실제 표시 크기 기준 `sizes` 지정. 검증 결과 요청 크기
  `w=1920` → `w=256`로 감소(약 56배). 이게 유일한 원인은 아닐 수 있으니 계속 느리다는
  피드백 오면 번들 크기/Lighthouse 감사 등 추가로 볼 것.

- **13번 (결과페이지 "우리 공통 취향" 카테고리 API 미연동)**: 고정 카테고리(`["sea","culture","nature"]`)
  대신, 생성된 A/B/C안에 실제로 포함된 관광지들의 카테고리를 집계해서 상위 3개를 표시하도록
  변경 (`result/page.tsx`의 `computeCommonCategories`).

- **14번 (지난 날짜 선택 막기)**: `TripDateTimePicker`에 `minValue`(현재 시각) + `onInvalidSelect`
  토스트 추가. 겸사겸사 날짜/시간 선택 UX 전체를 다시 다듬음:
  - 날짜 먼저 고르고 나서 시간 휠이 나타나는 2단계 흐름
  - 시간 입력을 텍스트 직접입력 대신 롤러 휠로 변경 — `TimelineTimePicker`(일정 항목 시간변경)에서
    쓰던 휠을 `TimeWheelColumn.tsx`로 공용 추출해서 재사용 (새로 안 만듦)
  - 팝업 전체 컴팩트화, 캘린더 폭 축소
  - 날짜를 새로 고르면 시간은 00:00으로 리셋(이전 시간 안 들고 옴)

## 미완료

- **3번 (투표 후 대기창 반영 안 됨)**: 계정 하나로 여러 번 재현 시도했으나 매번 정상 동작
  (투표 → 대기창 1/2 카운트 정상 → 테스트 확정 버튼으로 확정까지 잘 됨). 코드상 이상한 점을
  못 찾았고, 실제 2명이 각자 기기로 동시에 투표하는 상황에서만 나는 문제일 수 있어서 실사용자
  테스트가 필요함.

## 이번에 추가로 발견/처리한 것 (원래 15개 목록엔 없던 것)

- 여행 생성 페이지(`trips/new`) 캐릭터 영역이 `flex-1`로 화면 전체를 억지로 채우던 구조라,
  짧은 화면(실기기)에서 폼과 겹치는 레이아웃 버그가 있었음 → 캐릭터 영역 `shrink-0`(고정
  높이)로, 폼은 자연 높이로 수정.
- 결과 페이지/스와이프 페이지에 레이아웃(AppShell) 상단 패딩(`pt-6`) 위에 `pt-4`가 중복으로
  붙어있어서 상단 여백이 과했던 문제 수정.
- 관광지 검색 카테고리 필터를 도감과 동일한 4개 체계(바다/자연/문화/체험)로 통일. **중요**:
  `GET /api/spots/search`가 실제로 내려주는 `category` 값은 여전히 옛 6개 체계
  ("자연·공원", "역사·문화", "쇼핑", "음식" 등)이고 **"바다"에 대응하는 값이 아예 없음**
  (라이브 API 응답 직접 캡처해서 확인함, 스웨거 예시 아님). 그래서 프론트에서
  `getCategoryFromKo(category, name)`처럼 이름도 같이 받아서, 이름에 "해변"/"해수욕장"이
  들어가면 카테고리 문자열과 무관하게 바다로 분류하도록 처리 (`shared/constants/category.ts`).
  이 함수를 쓰는 모든 곳(`PlaceSearchPanel`, `scheduleUtils.ts`, `useSpotDetail.ts`,
  `collection/records/page.tsx`, `related-logs/page.tsx`)에 name 인자 전달하도록 반영.
- C안(자유 편집형) 결과 카드를 캐릭터 이미지(`assets/character/map.png`) 포함한 디자인으로 교체.
- 인증 완료 화면에서, 도감(수집) 대상이 아닌 관광지면 "도감 등록 완료!" 대신
  "해당 관광지는 도감에는 포함되어있지 않아요" 안내로 교체 (`ArrivalVerifyModal`,
  `ArrivalVerifyStages`) — `getCollectionDetail` 호출 성공 여부로 판단.
- 관광지 검색 결과에서 도감 대상이 아닌 곳은 "미수집" 배지를 아예 안 보여주도록 수정
  (`spot.isCollection` 필드 활용).

## 백엔드에 전달해야 할 것

1. **C안 확정 400 에러**: `POST /api/itineraries/vote-sessions/{id}/finalize`가
   `{"message":"day 1에 최소 1개 이상의 관광지가 필요합니다."}`로 실패함. C안은 빈 상태로
   시작하는 게 컨셉이라 프론트가 의도적으로 `spotContentIds: []`인 빈 Day를 보내는데, 백엔드가
   Day당 관광지 최소 1개를 무조건 검증해서 막고 있음. C안일 때는 이 검증을 스킵하거나, 새
   스와이프가 0건이어도 기존 좋아요 이력으로 대체 처리하는 방식 검토 필요.
2. **관광지 검색 category 필드 불일치**: `GET /api/spots/search`의 `category`가 도감(4개
   카테고리: 바다/자연/문화/체험)과 다른 옛 6개 체계로 내려옴. 특히 "바다" 카테고리 자체가
   없어서 해변류 스팟이 전부 "자연"으로 집계됨. 4개 체계로 통일 요청.
3. **(이전 세션에 전달) 헤비유저 스와이프 덱**: `GET /api/collections/swipe-deck`가 도감을
   이미 많이/다 채운 계정에 빈 배열을 반환해서, "난 다 좋아" 시 그룹 일정 생성 자체가 구조적으로
   실패함 (스와이프 데이터 0건 → generate 400).

## 다음에 이어받을 때 체크리스트

- [ ] `fix/itinerary-tab-issues` 브랜치 PR 올릴지 은진에게 확인 (지금은 로컬 커밋만 있음)
- [ ] 3번 실사용자 2인 테스트
- [ ] 위 백엔드 이슈 3건 최유정님께 전달 확인
- [ ] 배포 사이트(`bujirun-frontend.vercel.app`)에서 최종 확인 — 오늘 작업은 전부 로컬에서만
      확인함, 배포본 미반영
