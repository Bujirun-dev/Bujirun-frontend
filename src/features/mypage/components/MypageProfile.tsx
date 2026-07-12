"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfileImageSelectModal } from "./ProfileImageSelectModal";
import { NicknameInlineEdit } from "./NicknameInlineEdit";
import { ProfileStats } from "./ProfileStats";
import { PROFILE_IMAGES } from "@/components/profile/profileImages";
import { Toast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";
import { CategoryChip } from "@/components/ui/CategoryChip";
import type { Category } from "@/components/ui/CategoryChip";
import { userApi, travelLogApi, visitApi } from "@/shared/api/domains";
import SuccessIcon from "@/assets/icons/mypage/success.svg?svgr";
import pencilIcon from "@/assets/icons/mypage/pencil.svg?url";

// TODO: 백엔드에서 태그 데이터 내려오면 API로 교체
const MOCK_TAGS: Category[] = [];

const AVATAR_SIZE = 100;

// profileImageUrl이 숫자 문자열("1"~"9")이면 로컬 이미지로 매핑
function resolveProfileImage(profileImageUrl?: string | null) {
  if (!profileImageUrl) return PROFILE_IMAGES[0];
  const id = Number(profileImageUrl);
  if (!isNaN(id)) {
    return PROFILE_IMAGES.find((img) => img.id === id) ?? PROFILE_IMAGES[0];
  }
  return { id: -1, src: profileImageUrl };
}

export function MypageProfile() {
  const queryClient = useQueryClient();

  const [isProfileImageModalOpen, setIsProfileImageModalOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // 유저 프로필 조회
  const { data: profile, isLoading } = useQuery({
    queryKey: userApi.keys.me(),
    queryFn: userApi.getMyProfile,
  });

  // 내 여행 로그 목록 조회 — 개수를 ProfileStats에 표시하기 위해 사용
  const { data: myLogs = [] } = useQuery({
    queryKey: travelLogApi.keys.mine(),
    queryFn: () => travelLogApi.getMyLogs(),
  });

  // 방문 관광지 개수
  const { data: visitHistory = [] } = useQuery({
    queryKey: visitApi.keys.history(), // ← keys 활용
    queryFn: visitApi.getHistory,
  });

  // 닉네임 수정
  const { mutate: updateNickname } = useMutation({
    mutationFn: (nickname: string) => userApi.updateMyProfile({ nickname }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userApi.keys.me() });
      showToast("닉네임이 변경되었어요");
    },
    onError: () => {
      showToast("닉네임 변경에 실패했어요");
    },
  });

  // 프로필 이미지 수정
  const { mutate: updateProfileImage } = useMutation({
    mutationFn: (imageId: number) => userApi.updateMyProfile({ profileImageUrl: String(imageId) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userApi.keys.me() });
      showToast("프로필 사진이 변경되었어요");
    },
    onError: () => {
      showToast("프로필 사진 변경에 실패했어요");
    },
  });

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  const hideToast = useCallback(() => setToastVisible(false), []);

  const currentImage = resolveProfileImage(profile?.profileImageUrl);
  const nickname = profile?.nickname ?? "";

  // 현재 이미지 ID (로컬 이미지인 경우에만 유효)
  const currentImageId = currentImage.id !== -1 ? currentImage.id : null;

  if (isLoading) {
    return (
      <Card variant="white" className="w-full pt-[24px] pb-[24px]">
        <div className="flex flex-col items-center gap-5">
          <div
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
            className="rounded-full bg-system-navbg animate-pulse"
          />
          <div className="h-5 w-20 rounded bg-system-navbg animate-pulse" />
          <div className="h-14 w-full rounded-2xl bg-system-navbg animate-pulse" />
        </div>
      </Card>
    );
  }

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

          {/* 닉네임 인라인 편집 — 확인 시 API 호출 */}
          <NicknameInlineEdit
            nickname={nickname}
            onConfirm={(newNickname) => updateNickname(newNickname)}
          />

          {/* TODO: 백엔드에서 태그 데이터 내려오면 profile에서 읽도록 교체 */}
          {MOCK_TAGS.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {MOCK_TAGS.map((tag) => (
                <CategoryChip key={tag} category={tag} />
              ))}
            </div>
          )}

          {/* 활동 지표
              - visitedCount, completedItineraryCount: 백엔드 통계 API 추가되면 교체
              - travelLogCount: 내 로그 목록 길이로 실제 값 표시 */}
          <ProfileStats
            visitedCount={visitHistory.length}
            completedItineraryCount={0}
            travelLogCount={myLogs.length}
          />
        </div>
      </Card>

      <ProfileImageSelectModal
        isOpen={isProfileImageModalOpen}
        onClose={() => setIsProfileImageModalOpen(false)}
        images={PROFILE_IMAGES}
        currentId={currentImageId}
        onConfirm={(id) => updateProfileImage(id)}
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
