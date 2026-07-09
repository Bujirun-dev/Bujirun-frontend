"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { RelatedLogsContent } from "@/components";
import { travelLogApi } from "@/shared/api/domains";
import { useAuthStore } from "@/shared/stores/useAuthStore";

export default function RelatedLogsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data: relatedLogs = [], isLoading } = useQuery({
    queryKey: travelLogApi.keys.bySpot(id),
    queryFn: () => travelLogApi.getLogsBySpot(id),
    enabled: !!accessToken && !!id,
  });

  return (
    <RelatedLogsContent
      relatedLogs={relatedLogs}
      isLoading={isLoading}
      logHrefBase="/mypage/logs"
    />
  );
}
