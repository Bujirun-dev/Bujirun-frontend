import { TransportCard } from "./TransportCard";
import type { TransportLeg } from "./TransportCard";

export interface RouteOption {
  id: string;
  legs: TransportLeg[];
  durationMin: number;
  cost: number;
  isRecommended?: boolean;
}

interface TransportSelectSheetProps {
  isOpen: boolean;
  onClose: () => void;
  from: string;
  to: string;
  options: RouteOption[];
  selectedOptionId?: string;
  onSelect: (option: RouteOption) => void;
}

export function TransportSelectSheet({
  isOpen,
  onClose,
  from,
  to,
  options,
  selectedOptionId,
  onSelect,
}: TransportSelectSheetProps) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "var(--color-system-blackbg)" }}
      onClick={onClose}
    >
      <div
        className="bg-main-white rounded-[20px] px-5 py-6 flex flex-col gap-3 max-h-[80%] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {options.map((option) => (
          <button key={option.id} className="text-left active:opacity-80" onClick={() => onSelect(option)}>
            <TransportCard
              from={from}
              to={to}
              durationMin={option.durationMin}
              cost={option.cost}
              legs={option.legs}
              isRecommended={option.isRecommended}
              selected={selectedOptionId === undefined || option.id === selectedOptionId}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
