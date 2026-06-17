import { cn } from "@/shared/utils";

interface PlaceInfoRowProps {
  icon: string;
  label: string;
  value: string;
  className?: string;
}

export function PlaceInfoRow({ icon, label, value, className }: PlaceInfoRowProps) {
  return (
    <div className={cn("flex items-center justify-between py-2.5 border-b border-sub-lightblue last:border-b-0", className)}>
      <div className="flex items-center gap-2">
        <span className="text-[15px]">{icon}</span>
        <span className="font-paperlogy text-[12px] text-text-primary">{label}</span>
      </div>
      <span className="font-paperlogy text-[12px] text-text-primary">{value}</span>
    </div>
  );
}
