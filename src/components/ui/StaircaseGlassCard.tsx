"use client";

import { useRef, useLayoutEffect, useState } from "react";

const OFFSET_X = 56;
const OVERLAP = 8;
const R = 20;

function buildPath(w1: number, h1: number, w2: number, h2: number): string {
  const oy = h1 - OVERLAP;
  const tw = OFFSET_X + w2;
  const th = oy + h2;
  return [
    `M 0,${R}`,
    `A ${R},${R} 0 0 1 ${R},0`,
    `L ${w1 - R},0`,
    `A ${R},${R} 0 0 1 ${w1},${R}`,
    `L ${w1},${oy}`,
    `L ${tw - R},${oy}`,
    `A ${R},${R} 0 0 1 ${tw},${oy + R}`,
    `L ${tw},${th - R}`,
    `A ${R},${R} 0 0 1 ${tw - R},${th}`,
    `L ${OFFSET_X + R},${th}`,
    `A ${R},${R} 0 0 1 ${OFFSET_X},${th - R}`,
    `L ${OFFSET_X},${h1}`,
    `L ${R},${h1}`,
    `A ${R},${R} 0 0 1 0,${h1 - R}`,
    `Z`,
  ].join(" ");
}

interface StaircaseGlassCardProps {
  line1: string;
  line2: string;
}

export function StaircaseGlassCard({ line1, line2 }: StaircaseGlassCardProps) {
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<{
    w1: number;
    h1: number;
    w2: number;
    h2: number;
  } | null>(null);

  useLayoutEffect(() => {
    if (!ref1.current || !ref2.current) return;
    setDims({
      w1: ref1.current.offsetWidth,
      h1: ref1.current.offsetHeight,
      w2: ref2.current.offsetWidth,
      h2: ref2.current.offsetHeight,
    });
  }, [line1, line2]);

  const totalW = dims ? OFFSET_X + dims.w2 : undefined;
  const totalH = dims ? dims.h1 - OVERLAP + dims.h2 : undefined;
  const clipPath = dims ? `path('${buildPath(dims.w1, dims.h1, dims.w2, dims.h2)}')` : undefined;

  return (
    <div className="relative" style={{ width: totalW, height: totalH }}>
      {/* 텍스트 크기 측정용 (화면 밖) */}
      <div
        ref={ref1}
        className="absolute left-[-9999px] py-[10px] px-5 whitespace-nowrap"
        aria-hidden
      >
        <span className="font-proup text-xl">{line1}</span>
      </div>
      <div
        ref={ref2}
        className="absolute left-[-9999px] py-[10px] px-5 whitespace-nowrap"
        aria-hidden
      >
        <span className="font-proup text-xl">{line2}</span>
      </div>

      {dims && clipPath && (
        <>
          {/* backdrop-blur + gradient 단 한 번만 적용 */}
          <div
            className="absolute inset-0 backdrop-blur-[15px] bg-gradient-to-b from-system-glassfrom to-system-glassto opacity-[0.97]"
            style={{ clipPath }}
          />
          <div className="absolute top-0 left-0 py-[10px] px-5 whitespace-nowrap">
            <span className="font-proup text-xl text-text-heading">{line1}</span>
          </div>
          <div
            className="absolute py-[10px] px-5 whitespace-nowrap"
            style={{ top: dims.h1 - OVERLAP, left: OFFSET_X }}
          >
            <span className="font-proup text-xl text-text-heading">{line2}</span>
          </div>
        </>
      )}
    </div>
  );
}
