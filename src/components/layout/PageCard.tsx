import type { ReactNode } from "react";
import { cn } from "@/shared/utils";

interface PageCardProps {
  children?: ReactNode;
  className?: string;
}

export function PageCard({ children, className }: PageCardProps) {
  return (
    <div className="flex h-full flex-col relative -mx-[24px]">
      <div className={cn("flex flex-1 flex-col overflow-hidden rounded-tl-[40px] rounded-tr-[40px] bg-white px-5", className)}>
        {children}
      </div>
    </div>
  );
}
