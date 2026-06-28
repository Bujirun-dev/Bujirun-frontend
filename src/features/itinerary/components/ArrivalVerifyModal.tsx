"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import cameraCharacter from "@/assets/character/camera.png";
import congsCharacter from "@/assets/character/congs.png";
import failCharacter from "@/assets/character/fail.png";
import mapCharacter from "@/assets/character/map.png";
import markerIcon from "@/assets/icons/itinerary/marker.svg?url";
import samplePlaceImage from "@/assets/place/place1.png";
import { Button, Card, Modal } from "@/components";

type VerifyStep =
  | "arrival"
  | "gps-permission"
  | "gps-fail"
  | "gps-success"
  | "camera-permission"
  | "camera-capture"
  | "photo-confirm"
  | "complete";

interface ArrivalVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeName: string;
  userAvatarUrl?: string;
  characterImageUrl?: string;
  onVerify: () => void;
  onLater: () => void;
}

function PlaceBadge({ placeName }: { placeName: string }) {
  return (
    <div className="inline-flex items-center gap-1 bg-main-blue px-3 py-1">
      <Image src={markerIcon} alt="" width={10} height={10} className="icon-coral" aria-hidden />
      <span className="font-ssurround text-md font-bold text-main-white">{placeName}</span>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <Card
      variant="glass-sm"
      className="flex h-[34px] w-full items-center justify-center rounded-xl border-[0.5px] border-system-scroll px-3 py-0 text-center"
    >
      <span className="text-xs font-medium text-sub-darkgray">{children}</span>
    </Card>
  );
}

function CharacterImage({
  src,
  alt,
  className = "mb-5 h-[156px] w-[156px]",
}: {
  src: StaticImageData | string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Image src={src} alt={alt} fill className="object-contain" />
    </div>
  );
}

function PermissionButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      className="h-[42px] w-full rounded-lg bg-main-blue font-ssurround text-sm font-bold text-main-white active:opacity-80"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function MapPreview() {
  return (
    <div className="relative h-[200px] w-full overflow-hidden rounded-[10px] bg-[#f4efe7]">
      <div className="absolute left-[-20px] top-8 h-4 w-[360px] rotate-[-28deg] bg-main-white/90" />
      <div className="absolute left-2 top-20 h-4 w-[330px] rotate-[-28deg] bg-main-white/90" />
      <div className="absolute left-20 top-[-10px] h-[220px] w-4 rotate-[26deg] bg-main-white/90" />
      <div className="absolute left-36 top-[-10px] h-[220px] w-4 rotate-[26deg] bg-main-white/90" />
      <div className="absolute left-52 top-[-10px] h-[220px] w-4 rotate-[26deg] bg-main-white/90" />
      <div className="absolute left-0 top-20 h-4 w-[360px] rotate-[32deg] bg-[#ffd976]" />
      <div className="absolute left-12 top-0 h-[220px] w-4 rotate-[26deg] bg-[#b7d8ff]" />
      <div className="absolute left-4 top-4 size-9 rounded-full bg-sub-green/70" />
      <div className="absolute right-7 top-7 size-2 rounded-full bg-[#ffd976]" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl">📍</div>
    </div>
  );
}

export function ArrivalVerifyModal({
  isOpen,
  onClose,
  placeName,
  userAvatarUrl,
  characterImageUrl,
  onVerify,
  onLater,
}: ArrivalVerifyModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<VerifyStep>("arrival");
  const [isVerified, setIsVerified] = useState(false);

  const closeAndReset = () => {
    setStep("arrival");
    setIsVerified(false);
    onClose();
  };

  const finishVerification = () => {
    if (!isVerified) {
      onVerify();
      setIsVerified(true);
    }
    setStep("complete");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeAndReset}
      hideActions
      childrenVariant="plain"
      className="rounded-[28px] px-8 pb-8 pt-12 gap-0"
      childrenClassName="flex w-full flex-col items-center"
    >
        {userAvatarUrl && (
          <div className="absolute -top-6 left-1/2 size-[56px] -translate-x-1/2 overflow-hidden rounded-full border-4 border-main-white shadow-[0_2px_8px_0_var(--color-system-scroll)]">
            <Image src={userAvatarUrl} alt="avatar" fill className="object-cover" />
          </div>
        )}

        {step === "arrival" && (
          <>
            <CharacterImage src={characterImageUrl ?? mapCharacter} alt="지도 캐릭터" />
            <div className="mb-5 flex flex-col items-center gap-2 text-center">
              <PlaceBadge placeName={placeName} />
              <h2 className="text-xl font-bold text-text-heading">이곳에 도착하셨나요?</h2>
            </div>
            <div className="mb-7 w-full">
              <Notice>* GPS 위치 확인 후 관광지를 수집해주세요.</Notice>
            </div>
            <div className="flex w-full gap-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  onLater();
                  closeAndReset();
                }}
              >
                나중에 하기
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => setStep("gps-permission")}
              >
                인증하기
              </Button>
            </div>
          </>
        )}

        {step === "gps-permission" && (
          <>
            <h2 className="mb-5 whitespace-pre-line text-center text-xl font-bold text-text-heading">
              “BUJIRUN”이 사용자의{"\n"}위치에 접근하려고 합니다.
            </h2>
            <div className="mb-6 w-full">
              <Notice>* 관광지를 수집해서 도감을 채워봐요!</Notice>
            </div>
            <div className="mb-6 w-full">
              <MapPreview />
            </div>
            <div className="flex w-full flex-col gap-2">
              {/* TODO: navigator.geolocation 권한 요청 결과에 따라 성공/실패 분기 */}
              <PermissionButton onClick={() => setStep("gps-success")}>
                앱을 사용하는 동안 허용
              </PermissionButton>
              <PermissionButton onClick={() => setStep("gps-success")}>항상 허용</PermissionButton>
              <PermissionButton onClick={() => setStep("gps-fail")}>허용 안 함</PermissionButton>
            </div>
          </>
        )}

        {step === "gps-fail" && (
          <>
            <CharacterImage src={failCharacter} alt="위치 확인 실패" className="mb-5 h-[150px] w-[150px]" />
            <div className="mb-5 flex flex-col items-center gap-2 text-center">
              <PlaceBadge placeName={placeName} />
              <h2 className="text-lg font-bold text-text-heading">위치를 확인할 수 없어요!</h2>
            </div>
            <div className="mb-7 w-full">
              <Notice>* 관광지 근처에서 다시 시도해주세요.</Notice>
            </div>
            <div className="flex w-full gap-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  onLater();
                  closeAndReset();
                }}
              >
                나중에 하기
              </Button>
              <Button variant="primary" className="flex-1" onClick={() => setStep("gps-permission")}>
                다시 확인
              </Button>
            </div>
          </>
        )}

        {step === "gps-success" && (
          <>
            <CharacterImage src={cameraCharacter} alt="사진 촬영 안내" className="mb-5 h-[150px] w-[150px]" />
            <div className="mb-5 flex flex-col items-center gap-2 text-center">
              <PlaceBadge placeName={placeName} />
              <h2 className="text-lg font-bold text-text-heading">관광지 확인이 완료되었어요!</h2>
            </div>
            <div className="mb-7 w-full">
              <Notice>* 사진을 찍어 기록을 남겨주세요.</Notice>
            </div>
            <div className="flex w-full gap-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  onLater();
                  closeAndReset();
                }}
              >
                나중에 하기
              </Button>
              <Button variant="primary" className="flex-1" onClick={() => setStep("camera-permission")}>
                사진 찍기
              </Button>
            </div>
          </>
        )}

        {step === "camera-permission" && (
          <>
            <h2 className="mb-5 whitespace-pre-line text-center text-xl font-bold text-text-heading">
              “BUJIRUN”이 사용자의{"\n"}카메라에 접근하려고 합니다.
            </h2>
            <div className="mb-6 w-full">
              <Notice>* 사진을 촬영해서 기록을 남겨봐요!</Notice>
            </div>
            <div className="relative mb-6 h-[162px] w-full overflow-hidden rounded-[10px]">
              <Image src={samplePlaceImage} alt={placeName} fill className="object-cover" />
            </div>
            <div className="flex w-full flex-col gap-2">
              {/* TODO: navigator.mediaDevices.getUserMedia 권한 결과에 따라 촬영 화면/이전 화면 분기 */}
              <PermissionButton onClick={() => setStep("camera-capture")}>
                앱을 사용하는 동안 허용
              </PermissionButton>
              <PermissionButton onClick={() => setStep("camera-capture")}>항상 허용</PermissionButton>
              <PermissionButton onClick={() => setStep("gps-success")}>허용 안 함</PermissionButton>
            </div>
          </>
        )}

        {step === "camera-capture" && (
          <>
            <div className="relative mb-6 h-[310px] w-full overflow-hidden rounded-[10px] bg-text-heading">
              <Image src={samplePlaceImage} alt={placeName} fill className="object-cover" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-main-white/60 px-3 py-2 text-2xs font-medium text-main-white [writing-mode:vertical-rl]">
                관광지가 잘 보이도록 촬영해주세요!
              </div>
              <button
                type="button"
                aria-label="촬영"
                className="absolute bottom-5 left-1/2 size-[54px] -translate-x-1/2 rounded-full border-4 border-main-white bg-main-white/70"
                onClick={() => setStep("photo-confirm")}
              />
            </div>
          </>
        )}

        {step === "photo-confirm" && (
          <>
            <h2 className="mb-6 text-lg font-bold text-text-heading">사진 촬영이 완료되었어요.</h2>
            <div className="relative mb-6 h-[164px] w-full overflow-hidden rounded-[10px]">
              <Image src={samplePlaceImage} alt={placeName} fill className="object-cover" />
            </div>
            <p className="mb-5 text-sm font-medium text-text-heading">관광지가 잘 보이나요?</p>
            <div className="mb-7 w-full">
              <Notice>* 마음에 들지 않는다면 다시 촬영할 수 있어요!</Notice>
            </div>
            <div className="flex w-full gap-6">
              <Button variant="secondary" className="flex-1" onClick={() => setStep("camera-capture")}>
                다시 찍기
              </Button>
              <Button variant="primary" className="flex-1" onClick={finishVerification}>
                인증하기
              </Button>
            </div>
          </>
        )}

        {step === "complete" && (
          <>
            <CharacterImage src={congsCharacter} alt="인증 완료" className="mb-2 h-[92px] w-[120px]" />
            <div className="mb-4 flex flex-col items-center gap-2 text-center">
              <PlaceBadge placeName={placeName} />
              <h2 className="text-lg font-bold text-text-heading">인증이 완료되었어요!</h2>
            </div>
            <div className="relative mb-4 h-[164px] w-full overflow-hidden rounded-[10px]">
              <Image src={samplePlaceImage} alt={placeName} fill className="object-cover" />
            </div>
            <div className="mb-5 flex h-[74px] w-full flex-col items-center justify-center gap-1 rounded-xl border-[0.5px] border-system-scroll bg-main-white text-center">
              <span className="text-sm font-medium text-text-heading">📖 도감 등록 완료!</span>
              <span className="text-xs font-medium text-sub-deepblue">새로운 관광지 + 1</span>
            </div>
            <div className="flex w-full gap-6">
              <Button variant="secondary" className="flex-1" onClick={closeAndReset}>
                계속 여행하기
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  closeAndReset();
                  router.push("/collection");
                }}
              >
                도감 보러가기
              </Button>
            </div>
          </>
        )}
    </Modal>
  );
}
