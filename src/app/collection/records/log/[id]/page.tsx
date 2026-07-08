"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { PageCard } from "@/components";
import { LogDetailContent } from "@/components/log/LogDetailContent";
import { SwitchButton } from "@/features/collection/components/SwitchButton";
import { SAMPLE_LOGS } from "@/features/collection/data/sampleLogs";
import { getCategoryLabel } from "@/shared/constants/category";

export default function LogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const log = SAMPLE_LOGS.find((l) => l.id === id);
  const [isVisible, setIsVisible] = useState(log?.isVisible ?? false);
  const [days, setDays] = useState(
    () =>
      log?.days.map((day) => ({
        day: day.day,
        date: day.date,
        stops: day.stops.map((stop) => ({
          time: stop.time,
          place: stop.place,
          imageUrl: stop.imageUrl,
          tags: [getCategoryLabel(stop.category), ...stop.tags],
        })),
      })) ?? [],
  );

  if (!log) {
    return (
      <PageCard>
        <div className="flex flex-1 items-center justify-center text-sub-gray text-sm">
          로그를 찾을 수 없습니다.
        </div>
      </PageCard>
    );
  }

  const handleVisibilityToggle = () => {
    setIsVisible((prev) => !prev);
  };

  const handleAddTag = (dayIndex: number, stopIndex: number, tag: string) => {
    setDays((prevDays) =>
      prevDays.map((day, dIdx) =>
        dIdx !== dayIndex
          ? day
          : {
              ...day,
              stops: day.stops.map((stop, sIdx) =>
                sIdx !== stopIndex ? stop : { ...stop, tags: [...stop.tags, tag] },
              ),
            },
      ),
    );
  };

  const handleDeleteTag = (dayIndex: number, stopIndex: number, tagIndex: number) => {
    setDays((prevDays) =>
      prevDays.map((day, dIdx) =>
        dIdx !== dayIndex
          ? day
          : {
              ...day,
              stops: day.stops.map((stop, sIdx) =>
                sIdx !== stopIndex
                  ? stop
                  : { ...stop, tags: stop.tags.filter((_, tIdx) => tIdx !== tagIndex) },
              ),
            },
      ),
    );
  };

  return (
    <PageCard>
      <LogDetailContent
        log={{
          title: log.title,
          placeName: log.placeName,
          extraCount: log.extraCount,
          duration: log.duration,
          date: log.date,
          days,
        }}
        onBack={() => router.back()}
        headerRight={<SwitchButton isPublic={isVisible} onClick={handleVisibilityToggle} />}
        editableTags
        onAddTag={handleAddTag}
        onDeleteTag={handleDeleteTag}
      />
    </PageCard>
  );
}
