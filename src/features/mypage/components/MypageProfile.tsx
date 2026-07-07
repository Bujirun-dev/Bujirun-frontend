"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ProfileImageSelectModal } from "./ProfileImageSelectModal";
import { NicknameInlineEdit } from "./NicknameInlineEdit";
import { ProfileStats } from "./ProfileStats";
import { PROFILE_IMAGES } from "@/components/profile/profileImages";
import { Toast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";
import { CategoryChip } from "@/components/ui/CategoryChip";
import type { Category } from "@/components/ui/CategoryChip";
import SuccessIcon from "@/assets/icons/mypage/success.svg?svgr";
import pencilIcon from "@/assets/icons/mypage/pencil.svg?url";

// TODO: API 연결 시 useQuery로 교체 (visits, itineraries, travel_logs 카운트 조회)
const MOCK_USER = {
  nickname: "은지미",
  profileImageId: 1,
  tags: ["sea", "culture"] as Category[],
  visitedCount: 12,
  completedItineraryCount: 5,
  travelLogCount: 8,
};

const AVATAR_SIZE = 100;

export function MypageProfile() {
  const { tags, visitedCount, completedItineraryCount, travelLogCount } = MOCK_USER;

  const [nickname, setNickname] = useState(MOCK_USER.nickname);
  const [currentImageId, setCurrentImageId] = useState(MOCK_USER.profileImageId);
  const [isProfileImageModalOpen, setIsProfileImageModalOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const currentImage = PROFILE_IMAGES.find((img) => img.id === currentImageId) ?? PROFILE_IMAGES[0];

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  const hideToast = useCallback(() => setToastVisible(false), []);

  return (
    <>
      <Card variant="white" className="w-full pt-[24px] pb-[24px]">
        <div className="flex flex-col items-center gap-5">
          {/* 프로필 사진 */}
          <div
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
            className="relative shrink-0 rounded-full"
          >
            <div
              style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
              className="overflow-hidden rounded-full bg-system-navbg"
            >
              <Image
                src={currentImage.src}
                alt={`${nickname} 프로필 이미지`}
                width={AVATAR_SIZE}
                height={AVATAR_SIZE}
                className="h-full w-full object-cover"
              />
            </div>
            <button
              type="button"
              aria-label="프로필 사진 변경"
              onClick={() => setIsProfileImageModalOpen(true)}
              className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-lg bg-system-navbg transition-opacity active:opacity-60"
            >
              <Image src={pencilIcon} alt="사진 변경" width={10} height={10} />
            </button>
          </div>

          <NicknameInlineEdit
            nickname={nickname}
            onConfirm={(newNickname) => {
              setNickname(newNickname);
              showToast("닉네임이 변경되었어요");
            }}
          />

          <div className="flex flex-wrap justify-center gap-1.5">
            {tags.map((tag) => (
              <CategoryChip key={tag} category={tag} />
            ))}
          </div>

          {/* 활동 지표 - visits/itineraries/travel_logs 테이블 기준 */}
          <ProfileStats
            visitedCount={visitedCount}
            completedItineraryCount={completedItineraryCount}
            travelLogCount={travelLogCount}
          />
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
        }}
      />

      <Toast
        isVisible={toastVisible}
        message={toastMessage}
        onHide={hideToast}
        icon={<SuccessIcon width={12} height={12} className="fill-white" />}
      />
    </>
  );
}
