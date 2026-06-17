"use client";

import { useState } from "react";
import {
  Button, Card, CategoryChip, StatusBadge,
  SearchBar, TimePicker, TextInput, Counter,
  PermissionModal, KakaoLoginButton, SectionHeader, Modal,
} from "@/components";
import {
  PlaceCard, TransportCard, LogCard, DayHeader,
  PlaceDetailSheet, ArrivalVerifyModal,
  MemberAvatar, VotePlaceCard, FriendAvatarGrid, InviteCard,
} from "@/features/itinerary";
import {
  ProfileCard, MenuItem, NicknameModal, AvatarSelectModal,
} from "@/features/mypage";
import { CollectionProgressCard, CategoryStatCard } from "@/features/collection";
import { HomeDogamCard, HomeItineraryItem } from "@/features/home";

const IMG = "https://picsum.photos/400/300";
const IMG2 = "https://picsum.photos/401/300";
const MOCK_FRIENDS = [{ imageUrl: IMG }, { imageUrl: IMG2 }, { imageUrl: IMG }, { imageUrl: IMG2 }];
const MOCK_AVATARS = [IMG, IMG2, IMG, IMG2, IMG, IMG2, IMG, IMG2, IMG];

export default function TestPage() {
  const [search, setSearch] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [count, setCount] = useState(2);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showNickname, setShowNickname] = useState(false);
  const [showAvatarSelect, setShowAvatarSelect] = useState(false);
  const [showPermission, setShowPermission] = useState(false);

  return (
    <div className="bg-system-navbg px-5 py-8 flex flex-col gap-10 overflow-y-auto">
      <h1 className="font-paperlogy font-bold text-[20px] text-text-heading">컴포넌트 테스트</h1>

      {/* ── 공통 UI ── */}
      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">Button</h2>
        <Button variant="primary">primary</Button>
        <Button variant="secondary">secondary</Button>
        <Button variant="warning">warning</Button>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">KakaoLoginButton</h2>
        <KakaoLoginButton onClick={() => {}} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">Card</h2>
        <Card variant="glass-lg" className="p-4"><p className="font-paperlogy text-[13px]">glass-lg</p></Card>
        <Card variant="glass-sm" className="p-4"><p className="font-paperlogy text-[13px]">glass-sm</p></Card>
        <Card variant="white" className="p-4"><p className="font-paperlogy text-[13px]">white</p></Card>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">SectionHeader</h2>
        <SectionHeader title="오늘의 일정" subtitle="2026.05.18 (월)" />
        <SectionHeader title="여기는 어때요?" actionLabel="더보기" onAction={() => {}} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">CategoryChip</h2>
        <div className="flex gap-2 flex-wrap">
          <CategoryChip category="sea" /><CategoryChip category="nature" />
          <CategoryChip category="culture" /><CategoryChip category="experience" />
        </div>
        <div className="flex gap-2">
          <CategoryChip category="sea" /><CategoryChip category="nature" />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">StatusBadge</h2>
        <div className="flex gap-2">
          <StatusBadge status="completed" /><StatusBadge status="verify" /><StatusBadge status="pending" />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">SearchBar</h2>
        <SearchBar value={search} onChange={setSearch} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">TextInput</h2>
        <TextInput value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="2-10자 이내" maxLength={10} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">Counter</h2>
        <div className="flex items-center gap-2">
          <span className="font-paperlogy text-[13px]">👥 친구 수</span>
          <Counter value={count} onChange={setCount} min={2} max={6} />
        </div>
      </section>

      {/* ── Mypage ── */}
      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">ProfileCard</h2>
        <ProfileCard nickname="은지미" isVerified categories={["sea", "culture"]} collectedCount={24} totalCount={34} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">MenuItem</h2>
        <MenuItem icon="🔖" label="북마크 목록" onClick={() => {}} />
        <MenuItem icon="🚪" label="로그아웃" onClick={() => setShowLogout(true)} />
        <MenuItem icon="🚫" label="회원 탈퇴" onClick={() => {}} />
      </section>

      {/* ── Collection ── */}
      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">CollectionProgressCard</h2>
        <CollectionProgressCard collectedCount={24} totalCount={34} description="부산에서 내가 남긴 나의 여행 발자국 🐾" onViewMore={() => {}} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">CategoryStatCard</h2>
        <div className="grid grid-cols-4 gap-2">
          <CategoryStatCard category="sea" collectedCount={4} totalCount={34} />
          <CategoryStatCard category="nature" collectedCount={4} totalCount={34} />
          <CategoryStatCard category="culture" collectedCount={4} totalCount={34} />
          <CategoryStatCard category="experience" collectedCount={4} totalCount={34} />
        </div>
      </section>

      {/* ── Home ── */}
      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">HomeDogamCard</h2>
        <HomeDogamCard mapImageUrl={IMG} collectedCount={24} totalCount={34} progressMessage="영자영자, 현재 33% 수집했어요!" onClick={() => {}} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">HomeItineraryItem</h2>
        <HomeItineraryItem placeName="송도 해수욕장" status="completed" transport={{ type: "버스", routeName: "2012", durationMin: 20, nextStop: "5분 후" }} />
        <HomeItineraryItem placeName="영도 해안선" status="verify" transport={{ type: "버스", routeName: "2012", durationMin: 20, nextStop: "5분 후" }} />
        <HomeItineraryItem placeName="광안대교" status="pending" isLast />
      </section>

      {/* ── Itinerary ── */}
      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">DayHeader</h2>
        <Card variant="white">
          <DayHeader day={1} date="2026.05.18" onMapPress={() => {}} onAIPress={() => setShowAIModal(true)} onListPress={() => {}} />
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">MemberAvatar</h2>
        <div className="flex gap-2">
          <MemberAvatar label="A" index={0} /><MemberAvatar label="B" index={1} />
          <MemberAvatar label="C" index={2} /><MemberAvatar label="D" index={3} />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">PlaceCard</h2>
        <PlaceCard imageUrl={IMG} name="송도 해수욕장" category="sea" status="completed" onDelete={() => setShowDeleteModal(true)} onClick={() => setShowDetailSheet(true)} />
        <PlaceCard imageUrl={IMG} name="해운대 해수욕장" category="culture" status="verify" onDelete={() => setShowDeleteModal(true)} />
        <PlaceCard imageUrl={IMG} name="광안리 해수욕장" category="nature" status="pending" />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">TransportCard</h2>
        <TransportCard type="버스" routeName="2012" from="송도 해수욕장" to="해운대" durationMin={20} cost={1500} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">VotePlaceCard</h2>
        <div className="flex gap-3">
          <VotePlaceCard imageUrl={IMG} name="송도 해수욕장" isSelected />
          <VotePlaceCard imageUrl={IMG2} name="광안리 해수욕장" />
          <VotePlaceCard imageUrl={IMG} name="해운대" />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">LogCard</h2>
        <LogCard imageUrl={IMG} placeName="송도 해수욕장" extraCount={3} author="은지미" tripType="당일치기" date="2026.05.18" dDay={90} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">FriendAvatarGrid</h2>
        <FriendAvatarGrid friends={MOCK_FRIENDS} total={6} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">InviteCard</h2>
        <InviteCard friends={MOCK_FRIENDS} total={6} onInvite={() => {}} />
      </section>

      {/* ── 팝업 트리거 ── */}
      <section className="flex flex-col gap-2">
        <h2 className="font-paperlogy font-bold text-[14px] text-sub-gray">팝업 / 시트</h2>
        <Button variant="secondary" onClick={() => setShowTimePicker(true)}>TimePicker</Button>
        <Button variant="secondary" onClick={() => setShowDeleteModal(true)}>삭제 Modal (base)</Button>
        <Button variant="secondary" onClick={() => setShowAIModal(true)}>AI최적화 Modal (base)</Button>
        <Button variant="secondary" onClick={() => setShowLogout(true)}>로그아웃 Modal (base)</Button>
        <Button variant="secondary" onClick={() => setShowArrivalModal(true)}>ArrivalVerifyModal</Button>
        <Button variant="secondary" onClick={() => setShowDetailSheet(true)}>PlaceDetailSheet</Button>
        <Button variant="secondary" onClick={() => setShowNickname(true)}>NicknameModal</Button>
        <Button variant="secondary" onClick={() => setShowAvatarSelect(true)}>AvatarSelectModal</Button>
        <Button variant="secondary" onClick={() => setShowPermission(true)}>PermissionModal</Button>
      </section>

      <div className="h-10" />

      <TimePicker isOpen={showTimePicker} onClose={() => setShowTimePicker(false)} hour={hour} minute={minute} onChange={(h, m) => { setHour(h); setMinute(m); }} onConfirm={() => setShowTimePicker(false)} />

      {/* base Modal 재사용 예시 */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} icon="🗑" title="일정 삭제" description={"'송도 해수욕장'을(를)\n일정에서 삭제하시겠어요?"} confirmText="삭제하기" cancelText="취소" confirmVariant="warning" onConfirm={() => setShowDeleteModal(false)}>
        <span className="font-paperlogy text-[12px] text-sub-gray text-center">* 삭제한 일정은 복구할 수 없어요.</span>
      </Modal>
      <Modal isOpen={showAIModal} onClose={() => setShowAIModal(false)} icon="✨" title="AI 일정 최적화" description={"관광지의 위치와 이동 경로를 분석해\n더 효율적인 여행 코스를 추천해드릴게요."} confirmText="최적화 시작" cancelText="취소" onConfirm={() => setShowAIModal(false)}>
        <div className="flex flex-col gap-2 font-paperlogy text-[13px] text-text-primary"><span>✨ 이동 동선 최적화</span><span>⏰ 이동 시간 단축</span><span>🚌 교통비 절약</span></div>
      </Modal>
      <Modal isOpen={showLogout} onClose={() => setShowLogout(false)} icon="🚪" title="로그아웃" description={"정말 로그아웃 하시겠어요?\n다음 여행도 함께 해요!"} confirmText="로그아웃" cancelText="취소" onConfirm={() => setShowLogout(false)}>
        <span className="font-paperlogy text-[12px] text-sub-gray text-center">* 언제든 다시 로그인할 수 있어요.</span>
      </Modal>

      <ArrivalVerifyModal isOpen={showArrivalModal} onClose={() => setShowArrivalModal(false)} placeName="송도 해수욕장" onVerify={() => {}} onLater={() => {}} />
      <PlaceDetailSheet isOpen={showDetailSheet} onClose={() => setShowDetailSheet(false)} imageUrl={IMG} name="송도 해수욕장" category="sea" status="pending" description="부산의 대표적인 해수욕장입니다." address="서울 서구 송도해변로 100" info="운영시간: 09:00 ~ 18:00" />
      <NicknameModal isOpen={showNickname} onClose={() => setShowNickname(false)} currentNickname="은지미" onConfirm={() => {}} />
      <AvatarSelectModal isOpen={showAvatarSelect} onClose={() => setShowAvatarSelect(false)} avatars={MOCK_AVATARS} currentAvatar={MOCK_AVATARS[0]} onConfirm={() => {}} />
      <PermissionModal isOpen={showPermission} onClose={() => setShowPermission(false)} message="사용자의 앨범에 접근하려고 합니다." subMessage="앱수품을 기록하며 여행의 순간을 담아보세요." options={[{ label: "앱을 사용하는 동안 허용", variant: "primary", onClick: () => {} }, { label: "항상 허용", onClick: () => {} }, { label: "허용 안 함", onClick: () => {} }]} />
    </div>
  );
}
