"use client";

import { useRouter } from "next/navigation";
import { ArrivalVerifyModal } from "@/features/itinerary";
import { PageCard } from "@/components";
import characterImg from "@/assets/character/face.png";

export default function VerifyPage() {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col relative">
      <PageCard />
      <ArrivalVerifyModal
        spotId="3fa85f64-5717-4562-b3fc-2c963f66afa6"
        gpsLat={35.1587}
        gpsLng={129.1604}
        isOpen
        onClose={() => router.back()}
        placeName="해운대 해수욕장"
        characterImageUrl={characterImg.src}
        onVerify={() => router.back()}
        onLater={() => router.back()}
      />
    </div>
  );
}
