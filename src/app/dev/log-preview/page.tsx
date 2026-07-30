"use client";

import { LogDetailContent } from "@/components/log/LogDetailContent";
import type { LogDetailData } from "@/components/log/LogDetailContent";
import placeImage from "@/assets/place2.png";

const MOCK_LOG: LogDetailData = {
  title: "부산 여행 기록 미리보기",
  placeName: "해운대해수욕장",
  extraCount: 2,
  duration: "1박 2일",
  date: "2026.07.30",
  days: [
    {
      day: 1,
      date: "2026.07.30",
      stops: [
        {
          time: "10:00",
          place: "해운대해수욕장",
          visited: true,
          tags: ["#바다", "#산책"],
        },
        {
          time: "13:30",
          place: "동백섬",
          visited: false,
          tags: ["#자연", "#미인증"],
        },
        {
          time: "16:00",
          place: "광안리해수욕장",
          visited: false,
          tags: ["#바다"],
        },
      ],
    },
  ],
};

export default function LogPreviewPage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <LogDetailContent log={MOCK_LOG} />
    </div>
  );
}
