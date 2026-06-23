# 프론트엔드 개발 규칙

부지런 프론트엔드 작업할 때 같이 맞춰두면 좋은 기준입니다. 너무 복잡하게 외우기보다, 새 화면이나 PR 만들 때 한 번씩 확인하는 용도로 사용합니다.

## 1. 기본 스택

| 구분 | 사용 기술 |
| --- | --- |
| Framework | Next.js App Router 16 |
| UI | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand, TanStack Query |
| API | Axios |
| 기타 | Kakao Map SDK, Framer Motion, DND Kit |
| 품질 체크 | ESLint, Prettier, TypeScript |

## 2. 실행 명령어

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

- Node.js는 `22` 이상을 사용합니다.
- 배포 전에는 `lint`, `typecheck`, `build`를 확인합니다.

## 3. 폴더 구조

```txt
src/
├── app/          # 페이지, 레이아웃
├── components/   # 공통 컴포넌트
├── features/     # 기능별 컴포넌트
├── shared/       # api, types, stores, utils, constants
├── mocks/        # 임시 데이터
├── assets/       # 이미지, 아이콘
└── styles/       # 전역 스타일, 디자인 토큰
```

- 라우트 페이지는 `src/app/**/page.tsx`에 둡니다.
- 특정 화면에서만 쓰면 `features/{기능명}`에 둡니다.
- 여러 화면에서 같이 쓰면 `components`로 올립니다.
- API, 타입, store, util처럼 공통으로 쓰는 코드는 `shared`에 둡니다.

## 4. Import 규칙

- 깊은 상대 경로 대신 `@/` alias를 사용합니다.

```ts
import { Button } from "@/components";
import { apiClient } from "@/shared/api";
```

- 공통 컴포넌트는 `src/components/index.ts`에서 export합니다.
- 타입만 가져올 때는 `import type`을 사용합니다.

## 5. 화면 작성 규칙

- 기본은 Server Component로 작성합니다.
- `useState`, `useEffect`, `useRouter`, 이벤트 핸들러가 필요하면 `"use client"`를 붙입니다.
- 페이지는 `AppShell` 안에서 보여집니다.
- 라우트 이동은 `Link` 또는 `useRouter`를 사용합니다.

## 6. 레이아웃 기준

- 우리 앱은 모바일 웹앱 기준입니다.
- 화면 최대 너비는 현재 코드 기준 `390px`입니다.
- 상단 헤더와 하단 탭은 공통 레이아웃을 사용합니다.
- 스크롤은 페이지 본문 영역에서만 자연스럽게 되도록 맞춥니다.
- 하단 탭과 콘텐츠가 겹치지 않게 여백을 확인합니다.

## 7. 스타일 규칙

- 스타일은 Tailwind class를 우선 사용합니다.
- 색상, 폰트, spacing은 `src/styles/globals.css`의 토큰을 먼저 사용합니다.
- 반복되는 hex 색상은 컴포넌트에 직접 쓰지 말고 토큰으로 정리합니다.
- 조건부 class는 `cn` 유틸을 사용합니다.
- 반복되는 스타일은 공통 컴포넌트나 variant로 빼는 것을 우선합니다.

## 8. 패딩 기준

전체 화면:

- 기본 페이지 좌우 패딩은 `24px`입니다.
- `AppShell` 본문은 현재 `px-[24px] pt-[24px]`를 사용합니다.
- `PageCard`처럼 화면을 꽉 채우는 카드형 영역은 `-mx-[24px]`로 바깥 여백을 맞춥니다.

컴포넌트:

| 영역 | 기준 |
| --- | --- |
| 큰 카드 | `p-[20px]` |
| 작은 카드 | `p-[16px]` |
| 리스트 아이템 | `px-4~5`, `py-3~4` |
| 검색/입력 | `px-3~4`, 높이 `40px` 기준 |
| 모달 | 바깥 여백 `px-6`, 내부 여백은 컴포넌트별로 조정 |

- 새 화면을 만들 때는 먼저 전체 `24px` 기준을 맞춥니다.
- 카드 안쪽 여백은 보통 `16px` 또는 `20px` 중에서 고릅니다.
- 같은 화면 안에서는 패딩 값을 너무 많이 섞지 않습니다.
- 특별한 이유가 없으면 `13px`, `17px`처럼 애매한 값은 피합니다.

자주 쓰는 토큰:

| 용도 | 토큰 |
| --- | --- |
| 메인 | `main-blue`, `main-white` |
| 서브 | `sub-deepblue`, `sub-pink`, `sub-green`, `sub-violet`, `sub-coral` |
| 텍스트 | `text-primary`, `text-heading` |
| 시스템 | `system-navbg`, `system-searchbg`, `system-blackbg` |

폰트:

| 용도 | 클래스 |
| --- | --- |
| 기본 | `font-paperlogy` |
| 강조/버튼 | `font-ssurround` |
| 로고성 텍스트 | `font-giants`, `font-proup`, `font-dxmovie` |

## 9. 공통 UI 사용

- 버튼은 `Button`을 먼저 사용합니다.
  - `primary`, `secondary`, `warning`
- 카드형 UI는 `Card` 또는 `PageCard`를 사용합니다.
  - `glass-lg`, `glass-sm`, `white`
- 팝업은 `Modal`을 사용합니다.
- 검색은 `SearchBar`, 일반 입력은 `TextInput`을 사용합니다.
- 상태 표시는 `StatusBadge`, 카테고리는 `CategoryChip`을 사용합니다.
- 화면별로 조금 다른 스타일은 `className`으로 확장합니다.

## 10. 이미지와 아이콘

- 이미지는 `src/assets`에 기능별로 정리합니다.
- 이미지 렌더링은 `next/image`를 우선 사용합니다.
- 단순 공통 아이콘은 `lucide-react` 사용을 먼저 고려합니다.
- `alt`는 가능한 의미 있게 적습니다.

## 11. 상태 관리

- API 데이터는 TanStack Query를 사용합니다.
- 한 화면 안에서만 쓰는 UI 상태는 `useState`를 사용합니다.
- 여러 화면에서 같이 쓰는 상태는 Zustand를 사용합니다.
- store 파일명은 `use{Name}Store.ts` 형태로 만듭니다.

간단히 정리하면:

```txt
API 데이터 = TanStack Query
한 화면 안의 상태 = useState
여러 화면이 같이 쓰는 상태 = Zustand
```

```ts
useQuery({
  queryKey: ["travel-spots"],
  queryFn: () => apiClient.get("/travel-spots").then((res) => res.data),
});
```

## 12. API 규칙

- HTTP 요청은 `apiClient`를 사용합니다.
- API 기본 주소는 `NEXT_PUBLIC_API_BASE_URL`을 사용합니다.
- 컴포넌트 안에서 axios 설정을 새로 만들지 않습니다.
- API 응답 타입은 가능한 명확히 적습니다.
- 지금 UI 작업 중에는 mock 데이터를 쓰더라도, 나중에 API로 바꾸기 쉽게 props 형태를 맞춰둡니다.

## 13. 나중에 API 연결할 때 체크할 것

- 백엔드 응답 데이터 이름과 프론트에서 쓰는 이름을 맞춥니다.
- 로딩, 에러, 빈 데이터 화면을 준비합니다.
- 로그인 필요한 API는 토큰 저장 방식과 만료 처리를 정합니다.
- POST, PATCH, DELETE 후에는 관련 query를 다시 불러오거나 화면 데이터를 갱신합니다.
- mock 데이터 구조는 가능하면 실제 API 응답과 비슷하게 맞춥니다.
- 날짜, 시간, 이미지 URL, id 값은 화면에서 바로 쓰기 좋은 형태인지 확인합니다.
- API 연결 후에도 모바일 화면이 깨지지 않는지 다시 확인합니다.

## 14. TypeScript 규칙

- `any`는 최대한 피합니다.
- 공통 타입은 `src/shared/types`에 둡니다.
- 특정 기능에서만 쓰는 타입은 해당 feature 안에 둡니다.
- 상수 객체는 필요하면 `as const`를 사용합니다.

## 15. 컴포넌트 규칙

- 컴포넌트 파일명은 PascalCase로 작성합니다.
- 일반 컴포넌트는 named export를 사용합니다.
- 페이지 컴포넌트는 default export를 사용합니다.
- 이벤트 함수는 `handle`, 모달 함수는 `open`, `close`로 시작하면 좋습니다.
- 리스트 key는 가능하면 id를 사용합니다.

## 16. Git 규칙

브랜치:

| 브랜치 | 용도 |
| --- | --- |
| `main` | 배포 기준 |
| `feature/*` | 기능 개발 |
| `fix/*` | 버그 수정 |
| `docs/*` | 문서 |
| `chore/*` | 설정, 기타 작업 |

커밋:

```txt
feat: 일정 타임라인 추가
fix: 하단 네비게이션 수정
docs: 프론트엔드 규칙 정리
chore: 설정 업데이트
```

## 17. PR 체크리스트

- [ ] 요구사항을 만족했나요?
- [ ] 모바일 `390px` 기준으로 화면이 깨지지 않나요?
- [ ] 공통 UI와 디자인 토큰을 사용했나요?
- [ ] `npm run lint`를 통과했나요?
- [ ] `npm run typecheck`를 통과했나요?
- [ ] 불필요한 console, 임시 주석, 죽은 코드를 지웠나요?

## 18. 팀 담당 영역

| 담당자 | 담당 화면/기능 |
| --- | --- |
| 은진 | 일정 탭 |
| 유리 | 도감 탭, 마이페이지 탭 |
| 성빈 | 홈 탭, 일정 탭 중 취향분석결과까지, 로그인/회원가입 |

## 19. 팀 작업 규칙

- 작업 시작 전 `main`을 최신 상태로 맞춥니다.
- 같은 파일을 건드릴 것 같으면 미리 공유합니다.
- 담당 영역 밖을 수정해야 하면 담당자에게 먼저 말합니다.
- `components`, `shared`, `globals.css`, `layout.tsx`, `providers.tsx`는 여러 화면에 영향이 있어서 수정 전 공유합니다.
- PR은 가능하면 한 화면 또는 한 기능 단위로 작게 올립니다.
- 최소 1명 이상 확인 후 merge합니다.

브랜치 예시:

```txt
feature/home-main
feature/itinerary-timeline
feature/collection-list
feature/mypage-profile
feature/login
fix/itinerary-modal
docs/frontend-rules
```

## 20. 환경변수

- `.env.local`은 커밋하지 않습니다.
- 노션이나 README에는 환경변수 이름만 적습니다.
- 실제 키 값은 공개 문서에 올리지 않습니다.
