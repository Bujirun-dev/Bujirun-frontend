"use client";

import { use, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { PageCard, ErrorState, Toast, LoadingBoundary } from "@/components";
import { LogDetailContent } from "@/components/log/LogDetailContent";
import { SwitchButton } from "@/features/collection/components/SwitchButton";
import { travelLogApi } from "@/shared/api/domains";

type LogStop = {
  itemId: string;
  photoId: string;
  representative: boolean;
  visited: boolean;
  time: string;
  place: string;
  imageUrl: string;
  tags: string[];
  hashtagIds: string[];
};

type LogDay = {
  day: number;
  date: string;
  stops: LogStop[];
};

export default function LogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [localVisibility, setLocalVisibility] = useState<boolean | null>(null);
  const [editedDays, setEditedDays] = useState<LogDay[] | null>(null);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const queryClient = useQueryClient();

  const {
    data: travelLog,
    isLoading,
    isError,
  } = useQuery({
    queryKey: travelLogApi.keys.detail(id),
    queryFn: () => travelLogApi.getLog(id),
    enabled: !!id,
  });

  const apiDays = useMemo<LogDay[]>(
    () =>
      travelLog?.days?.map((day) => ({
        day: (day.dayNumber ?? 0) + 1,
        date: day.date ?? "",
        stops:
          day.items?.map((item) => {
            const displayedPhoto =
              item.photos?.find((photo) => photo.representative) ?? item.photos?.[0];

            return {
              itemId: item.id ?? "",
              photoId: displayedPhoto?.id ?? "",
              representative: displayedPhoto?.representative ?? false,
              visited: item.visited ?? true,
              time: item.arrivalTime ?? "",
              place: item.spotName ?? "",
              imageUrl: displayedPhoto?.photoUrl ?? "",
              tags:
                item.hashtags
                  ?.map((hashtag) => hashtag.tag)
                  .filter((tag): tag is string => !!tag) ?? [],
              hashtagIds:
                item.hashtags
                  ?.map((hashtag) => hashtag.id)
                  .filter((hashtagId): hashtagId is string => !!hashtagId) ?? [],
            };
          }) ?? [],
      })) ?? [],
    [travelLog],
  );

  const days = editedDays ?? apiDays;
  const isVisible = localVisibility ?? travelLog?.isPublic ?? false;

  const updateVisibilityMutation = useMutation({
    mutationFn: (nextIsPublic: boolean) => travelLogApi.updateLog(id, { isPublic: nextIsPublic }),
    onSuccess: (_, nextIsPublic) => {
      setLocalVisibility(nextIsPublic);
      setToast({
        visible: true,
        message: nextIsPublic ? "공개로 전환했어요" : "비공개로 전환했어요",
      });
      queryClient.invalidateQueries({ queryKey: travelLogApi.keys.detail(id) });
    },
    onError: () => {
      setToast({ visible: true, message: "변경에 실패했어요. 다시 시도해주세요" });
    },
  });

  const handleVisibilityToggle = () => {
    updateVisibilityMutation.mutate(!isVisible);
  };
  const handleAddTag = async (dayIndex: number, stopIndex: number, tag: string) => {
    const targetStop = days[dayIndex]?.stops[stopIndex];

    if (!targetStop?.itemId || !targetStop.visited) return;

    const normalizedTag = tag.replace(/^#/, "");

    const createdHashtag = await travelLogApi.addHashtag(id, targetStop.itemId, {
      tag: normalizedTag,
    });

    setEditedDays((prevDays) => {
      const baseDays = prevDays ?? apiDays;

      return baseDays.map((day, dIdx) =>
        dIdx !== dayIndex
          ? day
          : {
              ...day,
              stops: day.stops.map((stop, sIdx) =>
                sIdx !== stopIndex
                  ? stop
                  : {
                      ...stop,
                      tags: [...stop.tags, createdHashtag.tag ?? normalizedTag],
                      hashtagIds: [...stop.hashtagIds, createdHashtag.id ?? ""],
                    },
              ),
            },
      );
    });
  };

  const handleDeleteTag = async (dayIndex: number, stopIndex: number, tagIndex: number) => {
    const targetStop = days[dayIndex]?.stops[stopIndex];

    if (!targetStop?.itemId || !targetStop.visited) return;

    const hashtagId = targetStop.hashtagIds[tagIndex];

    if (!hashtagId) return;

    await travelLogApi.deleteHashtag(id, targetStop.itemId, hashtagId);

    setEditedDays((prevDays) => {
      const baseDays = prevDays ?? apiDays;

      return baseDays.map((day, dIdx) =>
        dIdx !== dayIndex
          ? day
          : {
              ...day,
              stops: day.stops.map((stop, sIdx) =>
                sIdx !== stopIndex
                  ? stop
                  : {
                      ...stop,
                      tags: stop.tags.filter((_, tIdx) => tIdx !== tagIndex),
                      hashtagIds: stop.hashtagIds.filter((_, tIdx) => tIdx !== tagIndex),
                    },
              ),
            },
      );
    });
  };

  const handleSetRepresentativePhoto = async (dayIndex: number, stopIndex: number) => {
    const targetStop = days[dayIndex]?.stops[stopIndex];

    if (
      !targetStop?.itemId ||
      !targetStop.visited ||
      !targetStop.photoId ||
      targetStop.representative
    ) {
      return;
    }

    await travelLogApi.setRepresentativePhoto(id, targetStop.itemId, targetStop.photoId);

    setEditedDays((prevDays) => {
      const baseDays = prevDays ?? apiDays;

      return baseDays.map((day, dIdx) => ({
        ...day,
        stops: day.stops.map((stop, sIdx) => ({
          ...stop,
          representative: dIdx === dayIndex && sIdx === stopIndex,
        })),
      }));
    });
  };

  const firstStopName = days[0]?.stops[0]?.place ?? "";

  const totalStops = days.reduce((count, day) => count + day.stops.length, 0);

  const extraCount = Math.max(totalStops - 1, 0);

  return (
    <PageCard>
      <LogDetailContent
        log={{
          title: travelLog.title ?? "여행 기록",
          placeName: firstStopName,
          extraCount,
          duration: travelLog.duration ?? "",
          date: travelLog.startDate ?? "",
          days,
        }}
        onBack={() => router.back()}
        headerRight={<SwitchButton isPublic={isVisible} onClick={handleVisibilityToggle} />}
        editableTags
        onAddTag={handleAddTag}
        onDeleteTag={handleDeleteTag}
        editableRepresentativePhoto
        onSetRepresentativePhoto={handleSetRepresentativePhoto}
      />
      <Toast
        isVisible={toast.visible}
        message={toast.message}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
        className="bg-main-blue border-main-blue text-main-white"
      />
    </PageCard>
  );
}
