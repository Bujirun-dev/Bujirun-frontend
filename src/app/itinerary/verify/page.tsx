"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrivalVerifyModal } from "@/features/itinerary";
import { PageCard } from "@/components";
import characterImg from "@/assets/character/face.png";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const spotId = searchParams.get("spotId");
  const itineraryId = searchParams.get("itineraryId");
  const logId = searchParams.get("logId");
  const itemId = searchParams.get("itemId");
  const placeName = searchParams.get("placeName") ?? "관광지";

  if (!spotId || !itineraryId || !logId || !itemId) {
    return null;
  }

  return (
    <div className="relative flex h-full flex-col">
      <PageCard />

      <ArrivalVerifyModal
        spotId={spotId}
        itineraryId={itineraryId}
        logId={logId}
        itemId={itemId}
        isOpen
        onClose={() => router.back()}
        placeName={placeName}
        characterImageUrl={characterImg.src}
        onVerify={() => router.back()}
        onLater={() => router.back()}
      />
    </div>
  );
}
