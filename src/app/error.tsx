"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full flex-col">
      <ErrorState code={500} onRetry={unstable_retry} />
    </div>
  );
}
