"use client";

interface TagAddChipProps {
  onClick?: () => void;
}

export function TagAddChip({ onClick }: TagAddChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="태그 추가"
      className="inline-flex min-w-[36px] items-center justify-center rounded-md border border-dashed border-main-blue px-1.5 py-1"
    >
      <svg viewBox="0 0 20 20" className="size-4 fill-main-blue" aria-hidden="true">
        <path d="M9 4a1 1 0 1 1 2 0v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4Z" />
      </svg>
    </button>
  );
}
