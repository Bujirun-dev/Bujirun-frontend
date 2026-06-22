import Image from "next/image";
import busIcon from "@/assets/icons/home/bus.png";
import subwayIcon from "@/assets/icons/home/subway.png";
import walkIcon from "@/assets/icons/home/walk.png";
import taxiIcon from "@/assets/icons/home/taxi.png";
import type { StaticImageData } from "next/image";

type TransportType = "버스" | "지하철" | "도보" | "택시";

const TRANSPORT_ICONS: Record<TransportType, StaticImageData> = {
  버스: busIcon,
  지하철: subwayIcon,
  도보: walkIcon,
  택시: taxiIcon,
};

interface TransportSelectSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: TransportType) => void;
}

export function TransportSelectSheet({ isOpen, onClose, onSelect }: TransportSelectSheetProps) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-end"
      style={{ backgroundColor: "var(--color-system-blackbg)" }}
      onClick={onClose}
    >
      <div
        className="w-full bg-white rounded-t-[30px] px-6 pt-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-paperlogy font-bold text-lg text-text-heading mb-5 text-center">
          교통수단 선택
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {(["버스", "지하철", "도보", "택시"] as const).map((type) => (
            <button
              key={type}
              className="flex items-center gap-2 bg-sub-green rounded-[16px] px-4 py-3 active:opacity-80"
              onClick={() => onSelect(type)}
            >
              <Image src={TRANSPORT_ICONS[type]} alt={type} width={20} height={20} />
              <span className="font-paperlogy font-bold text-md text-text-heading">{type}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
