"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/shared/utils";
import Image from "next/image";
import pencilIcon from "@/assets/icons/mypage/pencil.svg?url";
import { ProfileImageSelectModal, NicknameEditModal } from "@/features/mypage/components";
import { PROFILE_IMAGES } from "@/components/profile/profileImages";
import { Toast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";
import { CategoryChip } from "@/components/ui/CategoryChip";
import type { Category } from "@/components/ui/CategoryChip";
import SuccessIcon from "@/assets/icons/mypage/success.svg?svgr";

// TODO: API 연결 시 useQuery로 교체
const MOCK_USER = {
  nickname: "은지미",
  profileImageId: 1,
  tags: ["sea", "culture"] as Category[],
  collectedCount: 24,
  totalCount: 34,
};

export function MypageProfile() {
  const { tags, collectedCount, totalCount } = MOCK_USER;

  const [nickname, setNickname] = useState(MOCK_USER.nickname);
  const [currentImageId, setCurrentImageId] = useState(MOCK_USER.profileImageId);
  const [isProfileImageModalOpen, setIsProfileImageModalOpen] = useState(false);
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // 닉네임 span 기준으로 모달 위치 잡기
  const nicknameRef = useRef<HTMLSpanElement>(null);

  const currentImage = PROFILE_IMAGES.find((img) => img.id === currentImageId) ?? PROFILE_IMAGES[0];
  const progressPercent = Math.round((collectedCount / totalCount) * 100);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  const hideToast = useCallback(() => setToastVisible(false), []);

  return (
    <>
      {/* 프로필 카드 */}
      <Card variant="white" className="w-full p-[20px]">
        <div className="flex items-center gap-4">
          {/* 프로필 사진 */}
          <div className="relative shrink-0">
            <button
              type="button"
              aria-label="프로필 사진 변경"
              onClick={() => setIsProfileImageModalOpen(true)}
              className="relative h-[72px] w-[72px] transition-opacity active:opacity-70"
            >
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-system-navbg">
                <Image
                  src={currentImage.src}
                  alt={`${nickname} 프로필 이미지`}
                  fill
                  className="object-cover"
                />
              </div>
            </button>
            {/* 연필 아이콘 */}
            <div className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-lg bg-system-navbg pointer-events-none">
              <Image src={pencilIcon} alt="사진 변경" width={10} height={10} />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            {/* 닉네임 + 편집 버튼 */}
            <div className="flex items-center gap-1.5">
              <span
                ref={nicknameRef}
                className={cn(
                  "text-lg font-bold relative z-50",
                  isNicknameModalOpen ? "text-white" : "text-text-heading",
                )}
              >
                {nickname}
              </span>
              <button
                type="button"
                aria-label="닉네임 편집"
                onClick={() => setIsNicknameModalOpen(true)}
                className="flex h-5 w-5 items-center justify-center rounded-lg bg-system-navbg transition-opacity active:opacity-60"
              >
                <Image src={pencilIcon} alt="닉네임 편집" width={10} height={10} />
              </button>
            </div>

            {/* 태그 칩 */}
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <CategoryChip key={tag} category={tag} />
              ))}
            </div>

            {/* 도감 진행 바 */}
            <div className="flex flex-col gap-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-system-navbg">
                <div
                  className="h-full rounded-full bg-main-blue transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-end">
                <span className="text-xs text-sub-darkgray">
                  <span className="font-bold text-sub-deepblue">{collectedCount}</span>
                  {" / "}
                  {totalCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <ProfileImageSelectModal
        isOpen={isProfileImageModalOpen}
        onClose={() => setIsProfileImageModalOpen(false)}
        images={PROFILE_IMAGES}
        currentId={currentImageId}
        onConfirm={(id) => {
          setCurrentImageId(id);
          showToast("프로필 사진이 변경되었어요");
          // TODO: API 연결 시 mutation으로 서버에 반영
        }}
      />

      <NicknameEditModal
        isOpen={isNicknameModalOpen}
        onClose={() => setIsNicknameModalOpen(false)}
        currentNickname={nickname}
        anchorRef={nicknameRef}
        onConfirm={(newNickname) => {
          setNickname(newNickname);
          showToast("닉네임이 변경되었어요");
          // TODO: API 연결 시 mutation으로 서버에 반영
        }}
      />

      {/* 토스트 */}
      <Toast
        isVisible={toastVisible}
        message={toastMessage}
        onHide={hideToast}
        icon={<SuccessIcon width={12} height={12} className="fill-white" />}
      />
    </>
  );
}
