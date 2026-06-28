"use client";

import { useState } from "react";

import { cn } from "@/shared/utils";

import { TagAddChip } from "./TagAddChip";

import type { Category } from "@/shared/types/category";
import { getCategoryLabel } from "@/shared/constants/category";

const CATEGORY_BG: Record<Category, string> = {
  sea: "bg-category-sea",
  nature: "bg-category-nature",
  culture: "bg-category-culture",
  experience: "bg-category-experience",
};

interface TagChipProps {
  label: string;
  className?: string;
  onClick?: () => void;
  isCategory?: boolean;
}

interface TagInputChipProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

interface TagChipsProps {
  category: Category;
  tags: string[];
  onAdd?: (tag: string) => void;
  onDelete?: (tag: string) => void;
}

export function TagChip({ label, className, onClick, isCategory = false }: TagChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isCategory}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-1.5 py-1",
        isCategory ? "cursor-default" : "cursor-pointer",
        className ?? "bg-main-blue",
      )}
    >
      <span
        className={cn(
          "text-center text-xs tracking-[0.16px]",
          isCategory ? "text-text-primary" : "text-main-white",
        )}
      >
        {label}
      </span>
    </button>
  );
}

function TagInputChip({ value, onChange, onSubmit, onCancel }: TagInputChipProps) {
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

export function TagChips({ category, tags, onAdd, onDelete }: TagChipsProps) {
  const categoryLabel = getCategoryLabel(category);
  const categoryBg = CATEGORY_BG[category];
  const [editableTags, setEditableTags] = useState(tags);
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
    const deletedTag = editableTags[index];

    setEditableTags((prevTags) => prevTags.filter((_, i) => i !== index));
    onDelete?.(deletedTag);
  };

  const handleSubmit = () => {
    const trimmedTag = newTag.trim().replace(/^#/, "");

    if (!trimmedTag) {
      handleCancel();
      return;
    }

    const nextTag = `#${trimmedTag}`;

    setEditableTags((prevTags) => [...prevTags, nextTag]);
    onAdd?.(nextTag);
    handleCancel();
  };

  return (
    <div className="flex flex-wrap items-center gap-1">
      <TagChip label={categoryLabel} className={categoryBg} isCategory />
      {editableTags.map((tag, tagIdx) => (
        <TagChip key={`${tag}-${tagIdx}`} label={tag} onClick={() => handleDelete(tagIdx)} />
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
