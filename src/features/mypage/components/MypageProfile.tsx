"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ProfileImageSelectModal } from "./ProfileImageSelectModal";
import { NicknameInlineEdit, type NicknameInlineEditRef } from "./NicknameInlineEdit";
import { ProfileStats } from "./ProfileStats";
import { PROFILE_IMAGES } from "@/components/profile/profileImages";
import { Toast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";
import type { Category } from "@/components/ui/CategoryChip";
import { userApi, travelLogApi, spotApi } from "@/shared/api/domains";
import { getCategoryFromKo } from "@/shared/constants/category";
import pencilIcon from "@/assets/icons/mypage/pencil.svg?url";

const AVATAR_SIZE = 100;

// profileImageUrl이 숫자 문자열("1"~"9")이면 로컬 이미지로 매핑
function resolveProfileImage(profileImageUrl?: string | null) {
  if (!profileImageUrl) return PROFILE_IMAGES[0];
  const id = Number(profileImageUrl);
  if (!isNaN(id)) {
    return PROFILE_IMAGES.find((img) => img.id === id) ?? PROFILE_IMAGES[0];
  }
  // http/https로 시작하는 유효한 URL만 외부 이미지로 허용
  if (profileImageUrl.startsWith("http://") || profileImageUrl.startsWith("https://")) {
    return { id: -1, src: profileImageUrl };
  }
  // 그 외 잘못된 값은 기본 이미지로 fallback
  return PROFILE_IMAGES[0];
}

export function MypageProfile() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // NicknameInlineEdit의 closeEdit을 외부에서 호출하기 위한 ref
  const nicknameEditRef = useRef<NicknameInlineEditRef>(null);

  const [isProfileImageModalOpen, setIsProfileImageModalOpen] = useState(false);
  const [toastVariant, setToastVariant] = useState<"success" | "error">("success");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  // 닉네임 중복 여부 — mutation onError에서 409 감지 시 true로 설정
  const [isNicknameDuplicate, setIsNicknameDuplicate] = useState(false);

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

  // 수집 관광지 개수 및 최애 카테고리 — /collection/records 페이지와 완전히 동일한 계산 방식
  const { data: spots = [] } = useQuery({
    queryKey: spotApi.keys.search(),
    queryFn: () => spotApi.searchSpots(),
  });

  const collectedPlaces = useMemo(
    () => spots.filter((spot) => spot.isCollection && spot.collected),
    [spots],
  );
  const collectedCount = collectedPlaces.length;

  const favoriteCategory = useMemo(() => {
    const count = collectedPlaces.reduce<Partial<Record<Category, number>>>((acc, place) => {
      const category = getCategoryFromKo(place.category, place.name);

      acc[category] = (acc[category] ?? 0) + 1;

      return acc;
    }, {});

    return Object.entries(count).sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))[0]?.[0] as
      Category | undefined;
  }, [collectedPlaces]);

  // 닉네임 수정
  const { mutate: updateNickname } = useMutation({
    mutationFn: (nickname: string) => userApi.updateMyProfile({ nickname }),
    onSuccess: () => {
      setIsNicknameDuplicate(false);
      queryClient.invalidateQueries({ queryKey: userApi.keys.me() });
      showToast("닉네임이 변경되었어요", "success");
      // 저장 성공 시 편집 모드 종료
      nicknameEditRef.current?.closeEdit();
    },
    onError: (error) => {
      // 409: 중복 닉네임 — 인라인 에러 표시 (토스트 없음, 편집 모드 유지)
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setIsNicknameDuplicate(true);
        return;
      }
      showToast("닉네임 변경에 실패했어요", "error");
    },
  });

  // 프로필 이미지 수정
  const { mutate: updateProfileImage } = useMutation({
    mutationFn: (imageId: number) => userApi.updateMyProfile({ profileImageUrl: String(imageId) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userApi.keys.me() });
      showToast("프로필 사진이 변경되었어요", "success");
    },
    onError: () => {
      showToast("프로필 사진 변경에 실패했어요", "error");
    },
  });

  const showToast = useCallback((message: string, variant: "success" | "error") => {
    setToastMessage(message);
    setToastVariant(variant);
    setToastVisible(true);
  }, []);

  const hideToast = useCallback(() => setToastVisible(false), []);

  // 입력값이 바뀌면 이전 중복 에러 초기화
  const handleNicknameValueChange = useCallback(() => {
    setIsNicknameDuplicate(false);
  }, []);

  const currentImage = resolveProfileImage(profile?.profileImageUrl);
  const nickname = profile?.nickname ?? "";
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
              className="relative overflow-hidden rounded-full bg-system-navbg"
            >
              <Image
                src={currentImage.src}
                alt={`${nickname} 프로필 이미지`}
                fill
                sizes="100px"
                className="object-cover scale-[1.27] origin-[center_10%]"
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

          {/* 닉네임 인라인 편집 — 성공 시 ref로 편집 모드 종료, 중복 에러는 isDuplicate prop으로 전달 */}
          <NicknameInlineEdit
            ref={nicknameEditRef}
            nickname={nickname}
            isDuplicate={isNicknameDuplicate}
            onConfirm={(newNickname) => updateNickname(newNickname)}
            onValueChange={handleNicknameValueChange}
          />

          {/* 활동 지표 — /collection/records 상단 요약 카드와 동일한 항목
              - travelLogCount: 내 여행 로그 목록 길이
              - collectedCount: 도감 수집 관광지 수
              - favoriteCategory: 수집한 관광지 중 가장 많은 카테고리 */}
          <ProfileStats
            travelLogCount={myLogs.length}
            collectedCount={collectedCount}
            favoriteCategory={favoriteCategory}
            onClick={() => router.push("/collection/records")}
          />
        </div>
      </Card>

      <ProfileImageSelectModal
        key={currentImageId}
        isOpen={isProfileImageModalOpen}
        onClose={() => setIsProfileImageModalOpen(false)}
        images={PROFILE_IMAGES}
        currentId={currentImageId}
        onConfirm={(id) => updateProfileImage(id)}
      />

      <Toast
        isVisible={toastVisible}
        onHide={hideToast}
        message={toastMessage}
        variant={toastVariant}
      />
    </>
  );
}
