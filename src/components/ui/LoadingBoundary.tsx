"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { LoadingModal } from "./LoadingModal";

interface LoadingBoundaryProps {
  isLoading: boolean;
  children: ReactNode;
  message?: string;
  delay?: number;
  minDuration?: number;
}

export function LoadingBoundary({
  isLoading,
  children,
  message,
  delay = 300,
  minDuration = 1000,
}: LoadingBoundaryProps) {
  const [showLoading, setShowLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const shownAtRef = useRef<number | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (isLoading) {
      timer = setTimeout(() => {
        shownAtRef.current = Date.now();
        setIsComplete(false);
        setShowLoading(true);
      }, delay);
    } else if (shownAtRef.current !== null) {
      const elapsed = Date.now() - shownAtRef.current;
      const remaining = Math.max(minDuration - elapsed, 0);

      timer = setTimeout(() => {
        setIsComplete(true);

        window.setTimeout(() => {
          setShowLoading(false);
          setIsComplete(false);
          shownAtRef.current = null;
        }, 250);
      }, remaining);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, delay, minDuration]);

  if (isLoading || showLoading) {
    return showLoading ? <LoadingModal message={message} isComplete={isComplete} /> : null;
  }

  return children;
}
