"use client";

import { useState } from "react";
import { Button, Card, CategoryChip, StatusBadge, SearchBar, TimePicker, Modal } from "@/components";
import {
  PlaceCard,
  TransportCard,
  LogCard,
  DayHeader,
  PlaceDetailSheet,
  DeleteModal,
  AIOptimizeModal,
  ArrivalVerifyModal,
} from "@/features/itinerary";

const IMG = "https://picsum.photos/400/300";

export default function TestPage() {
  const [search, setSearch] = useState("");
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const [showDetailSheet, setShowDetailSheet] = useState(false);

  return (
    <div className="min-h-screen bg-system-navbg px-5 py-8 flex flex-col gap-10 overflow-y-auto">
      <h1 className="font-paperlogy font-bold text-[20px] text-text-heading">컴포넌트 테스트</h1>

      {/* Button */}
      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">Button</h2>
        <Button variant="primary">primary 버튼</Button>
        <Button variant="secondary">secondary 버튼</Button>
        <Button variant="danger">danger 버튼</Button>
      </section>

      {/* Card */}
      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">Card</h2>
        <Card variant="glass-lg" className="p-4">
          <p className="font-paperlogy text-[13px]">glass-lg 카드</p>
        </Card>
        <Card variant="glass-sm" className="p-4">
          <p className="font-paperlogy text-[13px]">glass-sm 카드</p>
        </Card>
        <Card variant="white" className="p-4">
          <p className="font-paperlogy text-[13px]">white 카드</p>
        </Card>
      </section>

      {/* CategoryChip */}
      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">CategoryChip</h2>
        <div className="flex gap-2 flex-wrap">
          <CategoryChip category="sea" />
          <CategoryChip category="nature" />
          <CategoryChip category="culture" />
          <CategoryChip category="experience" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <CategoryChip category="sea" size="sm" />
          <CategoryChip category="nature" size="sm" />
        </div>
      </section>

      {/* StatusBadge */}
      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">StatusBadge</h2>
        <div className="flex gap-2 flex-wrap">
          <StatusBadge status="completed" />
          <StatusBadge status="verify" />
          <StatusBadge status="pending" />
        </div>
      </section>

      {/* SearchBar */}
      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">SearchBar</h2>
        <SearchBar value={search} onChange={setSearch} />
      </section>

      {/* DayHeader */}
      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">DayHeader</h2>
        <Card variant="white">
          <DayHeader
            day={1}
            date="2026.05.18"
            onMapPress={() => {}}
            onAIPress={() => setShowAIModal(true)}
            onListPress={() => {}}
          />
        </Card>
      </section>

      {/* PlaceCard */}
      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">PlaceCard</h2>
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
          name="송도 해수욕장"
          category="culture"
          status="verify"
          onDelete={() => setShowDeleteModal(true)}
          onClick={() => setShowDetailSheet(true)}
        />
        <PlaceCard
          imageUrl={IMG}
          name="송도 해수욕장"
          category="nature"
          status="pending"
        />
      </section>

      {/* TransportCard */}
      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">TransportCard</h2>
        <TransportCard
          type="버스"
          routeName="2012"
          from="송도 해수욕장"
          to="해운대"
          durationMin={20}
          cost={1500}
        />
      </section>

      {/* LogCard */}
      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">LogCard</h2>
        <LogCard
          imageUrl={IMG}
          placeName="송도 해수욕장"
          extraCount={3}
          author="은지미"
          tripType="당일치기"
          date="2026.05.18"
          dDay={90}
        />
        <LogCard
          imageUrl={IMG}
          placeName="광안리 해수욕장"
          extraCount={4}
          author="베니"
          tripType="2박3일"
          date="2026.05.18"
          dDay={40}
        />
      </section>

      {/* Modals / Pickers 트리거 버튼 */}
      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">팝업 / 시트</h2>
        <Button variant="secondary" onClick={() => setShowTimePicker(true)}>
          TimePicker 열기
        </Button>
        <Button variant="secondary" onClick={() => setShowDeleteModal(true)}>
          DeleteModal 열기
        </Button>
        <Button variant="secondary" onClick={() => setShowAIModal(true)}>
          AIOptimizeModal 열기
        </Button>
        <Button variant="secondary" onClick={() => setShowArrivalModal(true)}>
          ArrivalVerifyModal 열기
        </Button>
        <Button variant="secondary" onClick={() => setShowDetailSheet(true)}>
          PlaceDetailSheet 열기
        </Button>
      </section>

      {/* Popups */}
      <TimePicker
        isOpen={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        hour={hour}
        minute={minute}
        onChange={(h, m) => { setHour(h); setMinute(m); }}
        onConfirm={() => setShowTimePicker(false)}
      />
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        placeName="송도 해수욕장"
        onConfirm={() => setShowDeleteModal(false)}
      />
      <AIOptimizeModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onConfirm={() => setShowAIModal(false)}
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
        description="부산의 대표적인 해수욕장 중 하나로, 아름다운 백사장과 맑은 바다가 펼쳐지는 곳입니다."
        address="서울 서구 송도해변로 100 일대 (암남동)"
        info="운영시간: 09:00 ~ 18:00"
      />
    </div>
  );
}
