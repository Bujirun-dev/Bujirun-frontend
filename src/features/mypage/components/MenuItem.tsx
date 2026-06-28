"use client";

import type { LucideProps } from "lucide-react";
import type { ComponentType } from "react";

interface MenuItemProps {
  icon: ComponentType<LucideProps>; // LucideIcon → ComponentType<LucideProps>
  label: string;
  isDanger?: boolean;
  onClick?: () => void;
}

export function MenuItem({ icon: Icon, label, isDanger = false, onClick }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full flex flex-row items-center gap-[12px]
        px-[20px] h-[55px]
        rounded-[15px] border-[0.5px] border-main-blue
        bg-main-white backdrop-blur-[15px]
        text-left
        active:scale-[0.98] transition-transform duration-100
      "
    >
      <Icon
        size={18}
        strokeWidth={2}
        className={isDanger ? "text-sub-coral" : "text-main-blue"}
        aria-hidden="true"
      />
      <span
        className={`font-ssurround font-bold text-lg ${isDanger ? "text-sub-coral" : "text-text-primary"}`}
      >
        {label}
      </span>
    </button>
  );
}
