"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import CheckCircleIcon from "@/assets/icons/itinerary/check-circle.svg?svgr";
import AntennaIcon from "@/assets/icons/itinerary/antenna.svg?svgr";
import cameraCharacter from "@/assets/character/camera.png";
import congsCharacter from "@/assets/character/congs.png";
import failCharacter from "@/assets/character/fail.png";
import mapCharacter from "@/assets/character/map.png";
import seaCharacter from "@/assets/character/sea.png";
import LandLayerLocationIcon from "@/assets/icons/itinerary/land-layer-location.svg?svgr";
import samplePlaceImage from "@/assets/place/place1.png";
import { Button, Card } from "@/components";
import { LoadingProgressBar } from "../LoadingProgressBar";
import { CharacterImage, MapPreview, Notice, PlaceBadge } from "./ArrivalVerifyShared";

export type VerifyStep =
  | "arrival"
  | "gps-permission"
  | "gps-loading"
  | "gps-fail"
  | "gps-success"
  | "camera-permission"
  | "camera-capture"
  | "photo-confirm"
  | "complete";

type CommonProps = {
  placeName: string;
  setStep: (step: VerifyStep) => void;
  characterImageUrl?: string | StaticImageData;
};

const MOCK_LOADING_DURATION_MS = 3000;

export function ArrivalStage({
  placeName,
  characterImageUrl,
}: Pick<CommonProps, "placeName" | "characterImageUrl">) {
  return (
    <>
      <CharacterImage
        src={characterImageUrl ?? mapCharacter}
        alt="지도 캐릭터"
        className="-mb-3 h-[200px] w-[200px]"
      />
      <div className="mb-3 flex flex-col items-center gap-2 text-center">
        <PlaceBadge placeName={placeName} />
        <h2 className="font-paperlogy text-md font-semibold text-text-primary">
          이곳에 도착하셨나요?
        </h2>
      </div>
      <div className="w-full">
        <Notice>* GPS 위치 확인 후 관광지를 수집해주세요.</Notice>
      </div>
    </>
  );
}

export function GpsPermissionStage({}: Pick<CommonProps, never>) {
  return (
    <>
      <h2 className="mb-5 whitespace-pre-line text-center text-lg font-ssurround font-bold text-text-heading">
        “BUJIRUN”이 사용자의{"\n"}위치에 접근하려고 합니다.
      </h2>
      <div className="mb-3 w-full">
        <Notice>* 관광지를 수집해서 도감을 채워봐요!</Notice>
      </div>
      <div className="w-full">
        <MapPreview />
      </div>
    </>
  );
}

export function GpsLoadingStage({}: Pick<CommonProps, never>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTimer = window.setTimeout(() => setProgress(100), 50);
    return () => window.clearTimeout(startTimer);
  }, []);

  return (
    <>
      <div className="mb-5 flex size-[48px] items-center justify-center rounded-full bg-system-navbg">
        <LandLayerLocationIcon width={25} height={25} className="fill-sub-deepblue" aria-hidden />
      </div>
      <h2 className="mb-2 text-center text-lg font-ssurround font-bold text-text-heading">
        현재 위치를 확인하고 있어요.
      </h2>
      <div className="mb-6 w-full">
        <Notice
          icon={
            <AntennaIcon
              width={18}
              height={18}
              className="shrink-0 fill-sub-deepblue"
              aria-hidden
            />
          }
        >
          GPS 신호를 확인하는 중...
        </Notice>
      </div>
      <div className="mb-5 w-full">
        <LoadingProgressBar
          progress={progress}
          durationMs={MOCK_LOADING_DURATION_MS}
          className="w-full"
        />
      </div>
      <CharacterImage src={seaCharacter} alt="위치 확인 중" className="h-[187px] w-[250px]" />
    </>
  );
}

export function GpsFailStage({ placeName }: Pick<CommonProps, "placeName">) {
  return (
    <>
      <CharacterImage
        src={failCharacter}
        alt="위치 확인 실패"
        className="mb-5 h-[150px] w-[150px]"
      />
      <div className="mb-5 flex flex-col items-center gap-2 text-center">
        <PlaceBadge placeName={placeName} />
        <h2 className="font-paperlogy text-md font-bold text-text-heading">
          위치를 확인할 수 없어요!
        </h2>
      </div>
      <div className="w-full">
        <Notice>* 관광지 근처에서 다시 시도해주세요.</Notice>
      </div>
    </>
  );
}

export function GpsSuccessStage({ placeName }: Pick<CommonProps, "placeName">) {
  return (
    <>
      <CharacterImage
        src={cameraCharacter}
        alt="사진 촬영 안내"
        className="-mb-1 h-[200px] w-[200px]"
      />
      <div className="mb-3 flex flex-col items-center gap-2 text-center">
        <PlaceBadge placeName={placeName} />
        <h2 className="font-paperlogy text-md font-semibold text-text-primary">
          관광지 확인이 완료되었어요!
        </h2>
      </div>
      <div className="w-full">
        <Notice>* 사진을 찍어 기록을 남겨주세요.</Notice>
      </div>
    </>
  );
}

export function CameraPermissionStage({ placeName }: Pick<CommonProps, "placeName">) {
  return (
    <>
      <h2 className="mb-5 whitespace-pre-line text-center text-lg font-ssurround font-bold text-text-heading">
        “BUJIRUN”이 사용자의{"\n"}카메라에 접근하려고 합니다.
      </h2>
      <div className="mb-6 w-full">
        <Notice>* 사진을 촬영해서 기록을 남겨봐요!</Notice>
      </div>
      <div className="relative h-[162px] w-full overflow-hidden rounded-[10px]">
        <Image src={samplePlaceImage} alt={placeName} fill className="object-cover" />
      </div>
    </>
  );
}

export function CameraCaptureStage({
  placeName,
  setStep,
}: Pick<CommonProps, "placeName" | "setStep">) {
  return (
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
  );
}

export function PhotoConfirmStage({ placeName }: Pick<CommonProps, "placeName">) {
  return (
    <>
      <h2 className="mb-[25px] text-lg font-ssurround font-bold text-text-heading">
        사진 촬영이 완료되었어요.
      </h2>
      <div className="relative mb-[22px] h-[153px] w-[273px] overflow-hidden rounded-[10px]">
        <Image src={samplePlaceImage} alt={placeName} fill className="object-cover" />
      </div>
      <p className="mb-5 flex items-center justify-center gap-1 font-paperlogy text-sm font-medium text-text-primary">
        <CheckCircleIcon width={14} height={14} className="fill-main-blue" aria-hidden />
        관광지가 잘 보이나요?
      </p>
      <div className="w-full">
        <Notice>* 마음에 들지 않는다면 다시 촬영할 수 있어요!</Notice>
      </div>
    </>
  );
}

export function CompleteStage({ placeName }: Pick<CommonProps, "placeName">) {
  return (
    <>
      <CharacterImage src={congsCharacter} alt="인증 완료" className="-mb-[14px] h-[160px] w-[180px]" />
      <div className="mb-5 flex flex-col items-center gap-2 text-center">
        <PlaceBadge placeName={placeName} />
        <h2 className="text-lg font-paperlogy font-bold text-text-heading">인증이 완료되었어요!</h2>
      </div>
      <div className="relative mb-[14px] h-[153px] w-full overflow-hidden rounded-[10px]">
        <Image src={samplePlaceImage} alt={placeName} fill className="object-cover" />
      </div>
      <Card
        variant="glass-sm"
        className="w-full flex flex-col items-center justify-center gap-[12px] py-[12px] text-center"
      >
        <span className="flex items-center gap-[3px] font-paperlogy text-md font-medium text-text-heading">
          <span>📖</span>
          <span>도감 등록 완료!</span>
        </span>
        <span className="font-mona font-normal text-sm text-sub-deepblue">도감 +1</span>
      </Card>
    </>
  );
}

export function ArrivalStageFooter({
  onLater,
  onNext,
}: {
  onLater: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex w-full gap-6">
      <Button variant="secondary" className="flex-1" onClick={onLater}>
        나중에 하기
      </Button>
      <Button variant="primary" className="flex-1" onClick={onNext}>
        인증하기
      </Button>
    </div>
  );
}

export function BasicTwoButtonFooter({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="flex w-full gap-6">
      <div className="flex-1">{left}</div>
      <div className="flex-1">{right}</div>
    </div>
  );
}
