# 부지런 (Bujirun)

부산 관광지 도감과 동선 최적화를 기반으로 한 2030 뚜벅이 여행 최적화 서비스

## Tech Stack

| Category       | Technology             |
| -------------- | ---------------------- |
| Framework      | Next.js App Router 16  |
| UI Library     | React 19               |
| Language       | TypeScript             |
| Styling        | Tailwind CSS v4        |
| State (Client) | Zustand                |
| State (Server) | TanStack Query         |
| HTTP Client    | Axios                  |
| Map            | Kakao Map SDK          |
| Motion / DnD   | Framer Motion, DND Kit |
| Icon           | lucide-react           |
| Deploy         | Vercel                 |
| Code Quality   | ESLint, Prettier       |

## Getting Started

### Prerequisites

- Node.js 22+
- npm 10+

### Installation

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일 수정
```

### Development

```bash
npm run dev
```

http://localhost:3000 에서 확인합니다.

### Build

```bash
npm run build
npm run start
```

## Scripts

| Script                 | Description          |
| ---------------------- | -------------------- |
| `npm run dev`          | 개발 서버 실행       |
| `npm run build`        | 프로덕션 빌드        |
| `npm run start`        | 프로덕션 서버 실행   |
| `npm run lint`         | ESLint 검사          |
| `npm run typecheck`    | TypeScript 타입 검사 |
| `npm run format`       | Prettier 포맷팅      |
| `npm run format:check` | 포맷팅 검사          |

## Project Structure

```txt
src/
├── app/                         # Next.js App Router
│   ├── layout.tsx               # 루트 레이아웃
│   ├── page.tsx                 # 홈 탭
│   ├── providers.tsx            # 전역 Provider
│   ├── itinerary/page.tsx       # 일정 탭
│   ├── collection/page.tsx      # 도감 탭
│   └── mypage/page.tsx          # 마이페이지 탭
├── components/                  # 공통 컴포넌트
│   ├── FeaturePlaceholder.tsx
│   └── layout/
│       ├── AppHeader.tsx        # 상단 헤더
│       ├── AppShell.tsx         # 앱형 모바일 프레임
│       ├── BottomNavigation.tsx # 하단 탭 네비게이션
│       └── ScrollToTop.tsx      # 라우트 이동 시 최상단 이동
├── features/                    # 기능 단위 모듈
│   ├── home/                    # 홈 기능
│   ├── itinerary/               # 일정 기능
│   ├── collection/              # 도감 기능
│   └── mypage/                  # 마이페이지 기능
├── shared/
│   ├── api/                     # Axios API 클라이언트
│   ├── constants/               # 공통 상수
│   ├── hooks/                   # 공통 hooks
│   ├── stores/                  # Zustand 스토어
│   ├── types/                   # 전역 타입
│   └── utils/                   # 공통 유틸리티
└── styles/                      # 전역 스타일, 디자인 토큰
```

## Routing

| Path           | Page          | Layout   |
| -------------- | ------------- | -------- |
| `/`            | 홈 탭          | AppShell |
| `/itinerary`   | 일정 탭         | AppShell |
| `/collection`  | 도감 탭         | AppShell |
| `/mypage`      | 마이페이지 탭     | AppShell |

## Layout Policy

| Setting      | Value                                           |
| ------------ | ----------------------------------------------- |
| Layout Type  | Mobile Web App                                  |
| App Width    | `max-width: 402px`                              |
| Header       | Fixed Top                                       |
| Header Title | `BUJIRUN`                                       |
| Navigation   | Fixed Bottom Tab                                |
| Main Tabs    | `홈`, `일정`, `도감`, `마이페이지`              |
| Route Scroll | Top on route change                             |
| Scrollbar    | Hidden                                          |
| Safe Area    | `safe-area-inset-top`, `safe-area-inset-bottom` |

## Path Alias

`@/` → `src/`

```ts
import { AppShell } from "@/components";
import { apiClient } from "@/shared/api";
import { useUserPreferenceStore } from "@/shared/stores";
```

## State Management

### Zustand (Client State)

```tsx
import { useUserPreferenceStore } from "@/shared/stores";

function Component() {
  const { selectedRegion, setSelectedRegion } = useUserPreferenceStore();

  return (
    <button type="button" onClick={() => setSelectedRegion("서울")}>
      {selectedRegion ?? "지역 선택"}
    </button>
  );
}
```

### TanStack Query (Server State)

```tsx
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";

const { data, isLoading } = useQuery({
  queryKey: ["travel-spots"],
  queryFn: () => apiClient.get("/travel-spots").then((res) => res.data),
});

const mutation = useMutation({
  mutationFn: (payload: unknown) => apiClient.post("/schedules", payload),
});
```

## API

### Axios Client

```ts
import { apiClient } from "@/shared/api";

const response = await apiClient.get("/endpoint");
const created = await apiClient.post("/endpoint", { data: "value" });
```

공통 Axios 인스턴스는 `src/shared/api/client.ts`에 있습니다.

## Environment Variables

| Variable                        | Description             | Required |
| ------------------------------- | ----------------------- | -------- |
| `NEXT_PUBLIC_API_BASE_URL`      | 백엔드 API 기본 URL     | No       |
| `NEXT_PUBLIC_KAKAO_MAP_APP_KEY` | Kakao Map JavaScript 키 | Yes      |

## Design System

File: `src/styles/globals.css`

### Colors

| Token                  | Name               | Hex       | Usage |
| ---------------------- | ------------------ | --------- | ----- |
| `--soft-blue`          | 소프트 블루        | `#97C1FF` |       |
| `--deep-sky-blue`      | 딥 스카이 블루     | `#4DA6FF` |       |
| `--deep-navy-1`        | 딥 네이비 1        | `#1E293B` |       |
| `--deep-navy-2`        | 딥 네이비 2        | `#0F172A` |       |
| `--mint-cream`         | 민트 크림          | `#BFF2D4` |       |
| `--sage-green`         | 세이지 그린        | `#A2D7C7` |       |
| `--pistachio-milk`     | 피스타치오 밀크    | `#E1F4C5` |       |
| `--soft-greenery`      | 소프트 그린리      | `#CDE9B1` |       |
| `--pale-lime-greenery` | 페일 라임 그린리   | `#DCE999` |       |
| `--baby-powder-pink`   | 베이비 파우더 핑크 | `#FFCCE1` |       |
| `--soft-lavender`      | 소프트 라벤더      | `#D6C7FF` |       |
| `--soft-lemon`         | 소프트 레몬        | `#FFEAA7` |       |
| `--warm-oatmeal`       | 웜 오트밀          | `#F5EBE6` |       |

### Semantic Tokens

```css
var(--background)
var(--foreground)
var(--surface)
var(--surface-raised)
var(--border)
var(--primary)
var(--primary-strong)
var(--muted)
```

## Git Convention

### Branch Strategy (GitHub Flow)

| Branch      | Description           |
| ----------- | --------------------- |
| `main`      | 프로덕션 브랜치       |
| `feature/*` | 기능 개발             |
| `fix/*`     | 버그 수정             |
| `docs/*`    | 문서 작업             |
| `chore/*`   | 설정, 빌드, 기타 작업 |

### Commit Convention

Conventional Commits를 사용합니다.

```txt
<type>: <subject>
```

| Type       | Description      |
| ---------- | ---------------- |
| `feat`     | 새로운 기능      |
| `fix`      | 버그 수정        |
| `docs`     | 문서 변경        |
| `style`    | 코드 포맷팅      |
| `refactor` | 코드 리팩토링    |
| `perf`     | 성능 개선        |
| `test`     | 테스트 추가/수정 |
| `chore`    | 빌드, 설정 변경  |
| `ci`       | CI 설정 변경     |

### PR Process

1. `feature/*`, `fix/*` 등 작업 브랜치 생성
2. 작업 후 커밋
3. `main` 브랜치로 PR 생성
4. Lint, Typecheck, Build 통과 확인
5. 코드 리뷰 후 머지

## Deploy

Vercel
