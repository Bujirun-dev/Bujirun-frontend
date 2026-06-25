import { cn } from "@/shared/utils";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}

export function MenuItem({ icon, label, onClick, className }: MenuItemProps) {
  return (
    <button
      className={cn(
        "w-full flex items-center justify-between",
        "bg-white/60 rounded-2xl px-5 py-4",
        "transition-opacity active:opacity-70",
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className="font-paperlogy text-md text-text-primary">{label}</span>
      </div>
      <span className="text-sub-gray text-md">›</span>
    </button>
  );
}
