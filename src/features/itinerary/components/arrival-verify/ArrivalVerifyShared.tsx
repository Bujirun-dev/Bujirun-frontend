"use client";

import type { ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import { Card } from "@/components";

export function PlaceBadge({ placeName }: { placeName: string }) {
  return (
    <div className="inline-flex items-center gap-1 bg-main-blue px-[10px] py-[4px]">
      <span className="text-base leading-none" aria-hidden>
        📍
      </span>
      <span className="font-ssurround text-lg font-bold text-main-white">{placeName}</span>
    </div>
  );
}

export function Notice({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <Card
      variant="glass-sm"
      className="flex h-[34px] w-full items-center justify-center gap-2 rounded-xl border-[0.5px] border-system-scroll px-3 py-0 text-center"
    >
      {icon}
      <span className="text-sm font-medium text-sub-darkgray">{children}</span>
    </Card>
  );
}

export function CharacterImage({
  src,
  alt,
  className = "h-[156px] w-[156px]",
}: {
  src: StaticImageData | string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Image src={src} alt={alt} fill className="object-contain" />
    </div>
  );
}

export function PermissionButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="h-[42px] w-full rounded-lg bg-main-blue font-ssurround text-sm font-bold text-main-white active:opacity-80"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function MapPreview() {
  return (
    <div className="relative h-[166px] w-full overflow-hidden rounded-[10px] bg-[#f4efe7]">
      <div className="absolute left-[-20px] top-8 h-4 w-[360px] rotate-[-28deg] bg-main-white/90" />
      <div className="absolute left-2 top-20 h-4 w-[330px] rotate-[-28deg] bg-main-white/90" />
      <div className="absolute left-20 top-[-10px] h-[220px] w-4 rotate-[26deg] bg-main-white/90" />
      <div className="absolute left-36 top-[-10px] h-[220px] w-4 rotate-[26deg] bg-main-white/90" />
      <div className="absolute left-52 top-[-10px] h-[220px] w-4 rotate-[26deg] bg-main-white/90" />
      <div className="absolute left-0 top-20 h-4 w-[360px] rotate-[32deg] bg-[#ffd976]" />
      <div className="absolute left-12 top-0 h-[220px] w-4 rotate-[26deg] bg-[#b7d8ff]" />
      <div className="absolute left-4 top-4 size-9 rounded-full bg-sub-green/70" />
      <div className="absolute right-7 top-7 size-2 rounded-full bg-[#ffd976]" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl">📍</div>
    </div>
  );
}
