"use client";

import { useState } from "react";
import Image from "next/image";
import removeWhiteIcon from "@/assets/icons/itinerary/remove-white.png";
import {
  Button,
  Card,
  CategoryChip,
  FilterChips,
  StatusBadge,
  SearchBar,
  TimePicker,
  TextInput,
  Counter,
  KakaoLoginButton,
  Modal,
  SpeechBubble,
  Toast,
  PlaceCard,
  PlaceDetailSheet,
  PlaceInfoRow,
} from "@/components";
import {
  TransportCard,
  LogCard,
  ArrivalVerifyModal,
  VotePlaceCard,
  InviteCard,
  PlaceSearchItem,
} from "@/features/itinerary";
import { HomeItineraryItem, DogamProgressBar } from "@/features/home";

const IMG = "https://picsum.photos/400/300";
const IMG2 = "https://picsum.photos/401/300";
const MOCK_FRIENDS = [{ imageUrl: IMG }, { imageUrl: IMG2 }, { imageUrl: IMG }, { imageUrl: IMG2 }];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky top-0 bg-system-navbg py-2 z-10">
      <h2 className="font-paperlogy font-bold text-xl text-main-blue border-b-2 border-main-blue pb-1">
        {children}
      </h2>
    </div>
  );
}

function ComponentLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="font-paperlogy text-sm text-sub-gray font-semibold">{children}</h3>;
}

export default function TestPage() {
  const [search, setSearch] = useState("");
  const [filterChip, setFilterChip] = useState("전체");
  const [inputVal, setInputVal] = useState("");
  const [count, setCount] = useState(2);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);

  const [showBaseModal, setShowBaseModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showDeleteToast, setShowDeleteToast] = useState(false);

  return (
    <div className="bg-system-navbg px-5 py-6 flex flex-col gap-8 overflow-y-auto overflow-x-hidden">
      <h1 className="font-paperlogy font-bold text-2xl text-text-heading">컴포넌트 테스트</h1>

      {/* ════════════════════════════════ 공통 UI ════════════════════════════════ */}
      <SectionTitle>공통 UI</SectionTitle>

      <div className="flex flex-col gap-2">
        <ComponentLabel>Button</ComponentLabel>
        <Button variant="primary">primary</Button>
        <Button variant="secondary">secondary</Button>
        <Button variant="warning">warning</Button>
      </div>

      <div className="flex flex-col gap-2">
        <ComponentLabel>KakaoLoginButton</ComponentLabel>
        <KakaoLoginButton onClick={() => {}} />
      </div>

      <div className="flex flex-col gap-2">
        <ComponentLabel>Card</ComponentLabel>
        <Card variant="glass-lg" className="p-4">
          <p className="font-paperlogy text-md">glass-lg</p>
        </Card>
        <Card variant="glass-sm" className="p-4">
          <p className="font-paperlogy text-md">glass-sm</p>
        </Card>
        <Card variant="white" className="p-4">
          <p className="font-paperlogy text-md">white</p>
        </Card>
      </div>

      <div className="flex flex-col gap-2">
        <ComponentLabel>FilterChips</ComponentLabel>
        <FilterChips
          options={["전체", "바다", "자연", "문화", "체험"] as const}
          selected={filterChip}
          onChange={setFilterChip}
          className="justify-center"
        />
      </div>

      <div className="flex flex-col gap-2">
        <ComponentLabel>CategoryChip</ComponentLabel>
        <div className="flex gap-2 flex-wrap">
          <CategoryChip category="sea" />
          <CategoryChip category="nature" />
          <CategoryChip category="culture" />
          <CategoryChip category="experience" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <ComponentLabel>StatusBadge</ComponentLabel>
        <div className="flex gap-2 flex-wrap">
          <StatusBadge status="completed" />
          <StatusBadge status="verify" />
          <StatusBadge status="uncollected" />
          <StatusBadge status="collected" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <ComponentLabel>SearchBar</ComponentLabel>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      <div className="flex flex-col gap-2">
        <ComponentLabel>TextInput</ComponentLabel>
        <TextInput
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="2-6자 이내"
          maxLength={6}
        />
      </div>

      <div className="flex flex-col gap-2">
        <ComponentLabel>Counter</ComponentLabel>
        <Counter value={count} onChange={setCount} min={2} max={6} />
      </div>

      <div className="flex flex-col gap-2">
        <ComponentLabel>SpeechBubble</ComponentLabel>
        <SpeechBubble>말풍선 텍스트</SpeechBubble>
      </div>

      <div className="flex flex-col gap-2">
        <ComponentLabel>Modal (기본)</ComponentLabel>
        <Button variant="secondary" onClick={() => setShowBaseModal(true)}>
          Modal 열기
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <ComponentLabel>Modal / TimePicker</ComponentLabel>
        <Button variant="secondary" onClick={() => setShowTimePicker(true)}>
          TimePicker
        </Button>
        <Button variant="secondary" onClick={() => setShowDeleteModal(true)}>
          Modal — 삭제
        </Button>
        <Button variant="secondary" onClick={() => setShowAIModal(true)}>
          Modal — AI 최적화
        </Button>
        <Button variant="secondary" onClick={() => setShowLogout(true)}>
          Modal — 로그아웃
        </Button>
        <Button variant="secondary" onClick={() => setShowDeleteToast(true)}>
          Toast — 삭제
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <ComponentLabel>PlaceCard</ComponentLabel>
        <PlaceCard
          imageUrl={IMG}
          name="송도 해수욕장"
          category="sea"
          status="completed"
          onDelete={() => setShowDeleteModal(true)}
          onClick={() => setShowDetailSheet(true)}
        />
        <PlaceCard
          imageUrl={IMG}
          name="해운대 해수욕장"
          category="culture"
          status="verify"
          onDelete={() => setShowDeleteModal(true)}
        />
        <PlaceCard
          imageUrl={IMG}
          name="광안리 해수욕장"
          category="nature"
          status="pending"
          onDelete={() => setShowDeleteModal(true)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <ComponentLabel>PlaceInfoRow</ComponentLabel>
        <PlaceInfoRow
          items={[
            { icon: "🕐", label: "운영시간", value: "09:00 - 18:00" },
            { icon: "💰", label: "입장료", value: "무료" },
            { icon: "🏠", label: "주차", value: "공영 주차장" },
            { icon: "📞", label: "문의", value: "051-240-4000" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-2">
        <ComponentLabel>PlaceDetailSheet</ComponentLabel>
        <Button variant="secondary" onClick={() => setShowDetailSheet(true)}>
          PlaceDetailSheet 열기
        </Button>
      </div>

      {/* ════════════════════════════════ 홈 탭 ════════════════════════════════ */}
      <SectionTitle>홈 탭</SectionTitle>

      <div className="flex flex-col gap-2">
        <ComponentLabel>DogamProgressBar</ComponentLabel>
        <DogamProgressBar collectedCount={24} totalCount={34} />
      </div>

      <div className="flex flex-col gap-2">
        <ComponentLabel>HomeItineraryItem</ComponentLabel>
        <div className="flex flex-col">
          <HomeItineraryItem
            placeName="송도 해수욕장"
            status="completed"
            transport={{ type: "버스", routeName: "2012", durationMin: 20, nextStop: "5분 후" }}
          />
          <HomeItineraryItem
            placeName="영도 해안선"
            status="verify"
            transport={{ type: "버스", routeName: "2012", durationMin: 20, nextStop: "5분 후" }}
          />
          <HomeItineraryItem placeName="광안대교" status="pending" isLast />
        </div>
      </div>

      {/* ════════════════════════════════ 일정 탭 ════════════════════════════════ */}
      <SectionTitle>일정 탭</SectionTitle>

      <div className="flex flex-col gap-2">
        <ComponentLabel>TransportCard</ComponentLabel>
        <TransportCard
          from="출발 장소"
          to="도착 장소"
          durationMin={30}
          cost={1500}
          isRecommended
          legs={[
            { type: "버스", routeName: "2012", from: "버스 출발 정류장", to: "버스 도착 정류장" },
            { type: "지하철", routeName: "1호선", from: "지하철 출발역", to: "지하철 도착역" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-2">
        <ComponentLabel>PlaceSearchItem (추천순 — 이미지 있음)</ComponentLabel>
        <PlaceSearchItem
          imageUrl={IMG}
          name="감천 문화마을"
          category="culture"
          status="completed"
        />
        <PlaceSearchItem imageUrl={IMG} name="광안리 해수욕장" category="sea" status="pending" />
      </div>

      <div className="flex flex-col gap-2">
        <ComponentLabel>PlaceSearchItem (이름순 — 이미지 없음)</ComponentLabel>
        <PlaceSearchItem name="감천 문화마을" category="experience" />
        <PlaceSearchItem name="광안리 해수욕장" category="sea" />
        <PlaceSearchItem name="금정산성" category="nature" />
      </div>

      <div className="flex flex-col gap-2">
        <ComponentLabel>VotePlaceCard</ComponentLabel>
        <div className="flex gap-3">
          <VotePlaceCard imageUrl={IMG} name="송도 해수욕장" isSelected />
          <VotePlaceCard imageUrl={IMG2} name="광안리 해수욕장" />
          <VotePlaceCard imageUrl={IMG} name="해운대" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <ComponentLabel>LogCard</ComponentLabel>
        <LogCard
          imageUrl={IMG}
          placeName="송도 해수욕장"
          extraCount={3}
          author="은지미"
          duration="당일치기"
          date="2026.05.18"
          downloadCount={90}
        />
      </div>

      <div className="flex flex-col gap-2">
        <ComponentLabel>InviteCard</ComponentLabel>
        <InviteCard friends={MOCK_FRIENDS} total={6} onInvite={() => {}} />
      </div>

      <div className="flex flex-col gap-2">
        <ComponentLabel>ArrivalVerifyModal</ComponentLabel>
        <Button variant="secondary" onClick={() => setShowArrivalModal(true)}>
          ArrivalVerifyModal
        </Button>
      </div>

      <div className="h-10" />

      {/* ── 오버레이 ── */}
      <Modal
        isOpen={showBaseModal}
        onClose={() => setShowBaseModal(false)}
        icon="✦"
        title="모달 제목"
        description={"모달 설명이 들어오는 자리입니다.\n두 줄까지 가능해요."}
        confirmText="확인"
        cancelText="취소"
        onConfirm={() => setShowBaseModal(false)}
      />
      <TimePicker
        isOpen={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        hour={hour}
        minute={minute}
        onChange={(h, m) => {
          setHour(h);
          setMinute(m);
        }}
        onConfirm={() => setShowTimePicker(false)}
      />
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        icon="🗑"
        title="일정 삭제"
        description={"'송도 해수욕장'을(를)\n일정에서 삭제하시겠어요?"}
        confirmText="삭제하기"
        cancelText="취소"
        confirmVariant="warning"
        onConfirm={() => setShowDeleteModal(false)}
      >
        <span className="font-paperlogy text-sm text-sub-gray text-center">
          * 삭제한 일정은 복구할 수 없어요.
        </span>
      </Modal>
      <Modal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        icon="✨"
        title="AI 일정 최적화"
        description={"관광지의 위치와 이동 경로를 분석해\n더 효율적인 여행 코스를 추천해드릴게요."}
        confirmText="최적화 시작"
        cancelText="취소"
        onConfirm={() => setShowAIModal(false)}
      >
        <div className="flex flex-col gap-1 font-paperlogy text-md text-text-primary">
          <span>✨ 이동 동선 최적화</span>
          <span>⏰ 이동 시간 단축</span>
          <span>🚌 교통비 절약</span>
        </div>
      </Modal>
      <Modal
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        icon="🚪"
        title="로그아웃"
        description={"정말 로그아웃 하시겠어요?\n다음 여행도 함께 해요!"}
        confirmText="로그아웃"
        cancelText="취소"
        onConfirm={() => setShowLogout(false)}
      >
        <span className="font-paperlogy text-sm text-sub-gray text-center">
          * 언제든 다시 로그인할 수 있어요.
        </span>
      </Modal>
      <Toast
        isVisible={showDeleteToast}
        onHide={() => setShowDeleteToast(false)}
        message="여행이 삭제되었어요."
        icon={<Image src={removeWhiteIcon} alt="삭제" width={12} height={12} />}
      />
      <ArrivalVerifyModal
        isOpen={showArrivalModal}
        onClose={() => setShowArrivalModal(false)}
        placeName="송도 해수욕장"
        onVerify={() => {}}
        onLater={() => {}}
      />
      <PlaceDetailSheet
        isOpen={showDetailSheet}
        onClose={() => setShowDetailSheet(false)}
        imageUrl={IMG}
        name="송도 해수욕장"
        category="sea"
        status="pending"
        description="부산의 대표적인 해수욕장입니다."
        address="부산 서구 송도해변로 100"
        infoItems={[
          { icon: "🕐", label: "운영시간", value: "09:00 - 18:00" },
          { icon: "💰", label: "입장료", value: "무료" },
          { icon: "🏠", label: "주차", value: "공영 주차장" },
        ]}
        relatedLogs={[
          { imageUrl: IMG, userName: "은지미" },
          { imageUrl: IMG2, userName: "바니" },
          { imageUrl: IMG, userName: "쿠키" },
        ]}
        onViewMoreLogs={() => {}}
      />
    </div>
  );
}
