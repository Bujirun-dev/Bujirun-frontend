"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import mapCharacter from "@/assets/character/map.png";
import { Button, Modal } from "@/components";
import type { VerifyStep } from "./arrival-verify/ArrivalVerifyStages";
import { PermissionButton } from "./arrival-verify/ArrivalVerifyShared";
import {
  ArrivalStage,
  ArrivalStageFooter,
  BasicTwoButtonFooter,
  CameraCaptureStage,
  CameraPermissionStage,
  CompleteStage,
  GpsFailStage,
  GpsLoadingStage,
  GpsPermissionStage,
  GpsSuccessStage,
  PhotoConfirmStage,
} from "./arrival-verify/ArrivalVerifyStages";

const MOCK_GPS_LOADING_DURATION_MS = 3000;

interface ArrivalVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeName: string;
  userAvatarUrl?: string;
  characterImageUrl?: string;
  onVerify: () => void;
  onContinue?: () => void;
  onLater: () => void;
}

export function ArrivalVerifyModal({
  isOpen,
  onClose,
  placeName,
  userAvatarUrl,
  characterImageUrl,
  onVerify,
  onContinue,
  onLater,
}: ArrivalVerifyModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<VerifyStep>("arrival");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (step !== "gps-loading") return;
    // TODO: 실제 GPS 검증 API 응답에 따라 gps-success/gps-fail로 분기
    const timer = window.setTimeout(() => setStep("gps-success"), MOCK_GPS_LOADING_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [step]);

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

  const renderBody = () => {
    switch (step) {
      case "arrival":
        return (
          <ArrivalStage
            placeName={placeName}
            characterImageUrl={characterImageUrl ?? mapCharacter}
          />
        );
      case "gps-permission":
        return <GpsPermissionStage />;
      case "gps-loading":
        return <GpsLoadingStage />;
      case "gps-fail":
        return <GpsFailStage placeName={placeName} />;
      case "gps-success":
        return <GpsSuccessStage placeName={placeName} />;
      case "camera-permission":
        return <CameraPermissionStage placeName={placeName} />;
      case "camera-capture":
        return <CameraCaptureStage placeName={placeName} setStep={setStep} />;
      case "photo-confirm":
        return <PhotoConfirmStage placeName={placeName} />;
      case "complete":
        return <CompleteStage placeName={placeName} />;
      default:
        return null;
    }
  };

  const renderFooter = () => {
    switch (step) {
      case "arrival":
        return (
          <ArrivalStageFooter
            onLater={() => {
              onLater();
              closeAndReset();
            }}
            onNext={() => setStep("gps-permission")}
          />
        );
      case "gps-permission":
        return (
          <div className="flex w-full flex-col gap-2">
            {/* TODO: navigator.geolocation 권한 요청 결과에 따라 성공/실패 분기 */}
            <PermissionButton onClick={() => setStep("gps-loading")}>
              앱을 사용하는 동안 허용
            </PermissionButton>
            <PermissionButton onClick={() => setStep("gps-loading")}>항상 허용</PermissionButton>
            <PermissionButton onClick={() => setStep("gps-fail")}>허용 안 함</PermissionButton>
          </div>
        );
      case "gps-fail":
        return (
          <BasicTwoButtonFooter
            left={
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  onLater();
                  closeAndReset();
                }}
              >
                나중에 하기
              </Button>
            }
            right={
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setStep("gps-permission")}
              >
                다시 확인
              </Button>
            }
          />
        );
      case "gps-success":
        return (
          <BasicTwoButtonFooter
            left={
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  onLater();
                  closeAndReset();
                }}
              >
                나중에 하기
              </Button>
            }
            right={
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setStep("camera-permission")}
              >
                사진 찍기
              </Button>
            }
          />
        );
      case "camera-permission":
        return (
          <div className="flex w-full flex-col gap-2">
            {/* TODO: navigator.mediaDevices.getUserMedia 권한 결과에 따라 촬영 화면/이전 화면 분기 */}
            <PermissionButton onClick={() => setStep("camera-capture")}>
              앱을 사용하는 동안 허용
            </PermissionButton>
            <PermissionButton onClick={() => setStep("camera-capture")}>항상 허용</PermissionButton>
            <PermissionButton onClick={() => setStep("gps-success")}>허용 안 함</PermissionButton>
          </div>
        );
      case "photo-confirm":
        return (
          <BasicTwoButtonFooter
            left={
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setStep("camera-capture")}
              >
                다시 찍기
              </Button>
            }
            right={
              <Button variant="primary" className="w-full" onClick={finishVerification}>
                인증하기
              </Button>
            }
          />
        );
      case "complete":
        return (
          <BasicTwoButtonFooter
            left={
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  onContinue?.();
                  closeAndReset();
                  router.push("/itinerary");
                }}
              >
                계속 여행하기
              </Button>
            }
            right={
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  closeAndReset();
                  router.push("/collection");
                }}
              >
                도감 보러가기
              </Button>
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeAndReset}
      hideActions
      childrenVariant="plain"
      className="rounded-[28px]"
      childrenClassName="flex w-full flex-col items-center gap-5"
    >
      <div className="relative flex w-full flex-col items-center">
        {userAvatarUrl && (
          <div className="absolute -top-6 left-1/2 size-[56px] -translate-x-1/2 overflow-hidden rounded-full border-4 border-main-white shadow-[0_2px_8px_0_var(--color-system-scroll)]">
            <Image src={userAvatarUrl} alt="avatar" fill className="object-cover" />
          </div>
        )}

        {renderBody()}
      </div>

      {renderFooter()}
    </Modal>
  );
}
