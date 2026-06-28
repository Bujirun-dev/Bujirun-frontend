"use client";

import { useState } from "react";

import { cn } from "@/shared/utils";

import { TagAddChip } from "./TagAddChip";

interface TagChipProps {
  label: string;
  isLight?: boolean;
  onClick?: () => void;
}

interface TagChipsProps {
  tags: string[];
  onAdd?: (tag: string) => void;
  onDelete?: (tag: string) => void;
}

export function TagChip({ label, isLight = false, onClick }: TagChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-1.5 py-1",
        isLight ? "bg-category-sea" : "bg-main-blue",
      )}
    >
      <span
        className={cn(
          "text-center text-xs tracking-[0.16px]",
          isLight ? "text-text-primary" : "text-main-white",
        )}
      >
        {label}
      </span>
    </button>
  );
}

function TagInputChip({
  value,
  onChange,
  onSubmit,
  onCancel,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="inline-flex items-center justify-center rounded-md bg-main-blue px-1.5 py-1">
      <span className="text-center text-xs tracking-[0.16px] text-main-white">#</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onSubmit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onSubmit();
          }

          if (event.key === "Escape") {
            onCancel();
          }
        }}
        style={{ width: `${Math.max(value.length + 1, 1)}ch` }}
        className="ml-0.5 min-w-5 max-w-[16ch] bg-transparent text-xs tracking-[0.16px] text-main-white outline-none placeholder:text-main-white/70"
        autoFocus
      />
    </div>
  );
}

export function TagChips({ tags, onAdd, onDelete }: TagChipsProps) {
  const [localTags, setLocalTags] = useState(tags);
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState("");

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewTag("");
  };

  const handleDelete = (index: number) => {
    const deletedTag = localTags[index];

    setLocalTags((prevTags) => prevTags.filter((_, i) => i !== index));
    onDelete?.(deletedTag);
  };

  const handleSubmit = () => {
    const trimmedTag = newTag.trim().replace(/^#/, "");

    if (!trimmedTag) {
      handleCancel();
      return;
    }

    const nextTag = `#${trimmedTag}`;

    setLocalTags((prevTags) => [...prevTags, nextTag]);
    onAdd?.(nextTag);
    handleCancel();
  };

  return (
    <div className="flex flex-wrap items-center gap-1">
      {localTags.map((tag, tagIdx) => (
        <TagChip
          key={`${tag}-${tagIdx}`}
          label={tag}
          isLight={tagIdx === 0}
          onClick={() => handleDelete(tagIdx)}
        />
      ))}

      {isAdding ? (
        <TagInputChip
          value={newTag}
          onChange={setNewTag}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      ) : (
        <TagAddChip onClick={handleAddClick} />
      )}
    </div>
  );
}
