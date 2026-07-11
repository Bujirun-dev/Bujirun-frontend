"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import mapCharacter from "@/assets/character/map.png";
import { Button, Modal } from "@/components";
import { useVerifyVisit } from "@/shared/hooks/useVerifyVisit";
import { presignUpload } from "@/shared/api/domains/upload";
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

const GPS_ALLOWED_DISTANCE = 200; // 200m 이내 -> 성공
const EARTH_RADIUS = 6371000;

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(a));
}

interface ArrivalVerifyModalProps {
  spotId: string;
  gpsLat: number;
  gpsLng: number;
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
  spotId,
  gpsLat,
  gpsLng,
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
  const { mutateAsync: verifyVisit, isPending: isVerifying } = useVerifyVisit();
  const [step, setStep] = useState<VerifyStep>("arrival");
  const [isVerified, setIsVerified] = useState(false);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleRequestLocation = () => {
    if (isCheckingLocation) return;

    if (!navigator.geolocation) {
      setStep("gps-fail");
      return;
    }

    setIsCheckingLocation(true);
    setStep("gps-loading");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const currentLat = coords.latitude;
        const currentLng = coords.longitude;

        setCurrentLocation({
          lat: currentLat,
          lng: currentLng,
        });

        const distance = getDistance(currentLat, currentLng, gpsLat, gpsLng);

        console.log("현재 거리:", distance); // 확인용

        if (distance <= GPS_ALLOWED_DISTANCE) {
          setStep("gps-success");
        } else {
          setStep("gps-fail");
        }

        setIsCheckingLocation(false);
      },
      (error) => {
        console.error(error);

        setStep("gps-fail");
        setIsCheckingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const handleCapture = (file: File, previewUrl: string) => {
    if (capturedImageUrl) {
      URL.revokeObjectURL(capturedImageUrl);
    }

    setCapturedFile(file);
    setCapturedImageUrl(previewUrl);
  };

  const handleRetake = () => {
    if (capturedImageUrl) {
      URL.revokeObjectURL(capturedImageUrl);
    }

    setCapturedFile(null);
    setCapturedImageUrl(null);
    setStep("camera-capture");
  };

  const handleRequestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      stream.getTracks().forEach((track) => track.stop());
      setStep("camera-capture");
    } catch {
      setStep("gps-success");
    }
  };

  const closeAndReset = () => {
    setStep("arrival");
    setIsVerified(false);
    setIsCheckingLocation(false);

    if (capturedImageUrl) {
      URL.revokeObjectURL(capturedImageUrl);
    }

    setCapturedFile(null);
    setCapturedImageUrl(null);
    setCurrentLocation(null);
    onClose();
  };
  const finishVerification = async () => {
    if (!capturedFile || !currentLocation || isVerified || isVerifying) return;

    try {
      const { uploadUrl } = await presignUpload({
        contentType: capturedFile.type,
      });

      if (!uploadUrl) {
        throw new Error("업로드 URL을 받지 못했습니다.");
      }

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": capturedFile.type,
        },
        body: capturedFile,
      });

      if (!uploadResponse.ok) {
        throw new Error("사진 업로드에 실패했습니다.");
      }

      const response = await verifyVisit({
        tourSpotId: spotId,
        gpsLat: currentLocation.lat,
        gpsLng: currentLocation.lng,
      });

      if (!response.verified) {
        setStep("gps-fail");
        return;
      }

      setIsVerified(true);
      onVerify();
      setStep("complete");
    } catch {
      setStep("gps-fail");
    }
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
        return (
          <CameraCaptureStage placeName={placeName} setStep={setStep} onCapture={handleCapture} />
        );
      case "photo-confirm":
        return (
          <PhotoConfirmStage
            placeName={placeName}
            capturedImageUrl={capturedImageUrl ?? undefined}
          />
        );
      case "complete":
        return (
          <CompleteStage placeName={placeName} capturedImageUrl={capturedImageUrl ?? undefined} />
        );
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
            <PermissionButton onClick={handleRequestLocation}>
              앱을 사용하는 동안 허용
            </PermissionButton>

            <PermissionButton onClick={handleRequestLocation}>항상 허용</PermissionButton>
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
            <PermissionButton onClick={handleRequestCamera}>
              앱을 사용하는 동안 허용
            </PermissionButton>
            <PermissionButton onClick={handleRequestCamera}>항상 허용</PermissionButton>
            <PermissionButton onClick={() => setStep("gps-success")}>허용 안 함</PermissionButton>
          </div>
        );
      case "photo-confirm":
        return (
          <BasicTwoButtonFooter
            left={
              <Button variant="secondary" className="w-full" onClick={handleRetake}>
                다시 찍기
              </Button>
            }
            right={
              <Button
                variant="primary"
                className="w-full"
                onClick={finishVerification}
                disabled={isVerifying}
              >
                {isVerifying ? "인증 중..." : "인증하기"}
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
