import type { TripReceipt } from "@/features/receipt/data/tripReceipts";
import type { MoodValue } from "@/features/home/components/MoodOptions";

export interface ReviewPromptSubmitData {
  mood: MoodValue;
  theme: string;
}

export type ReceiptData = Omit<TripReceipt, "mood" | "theme"> & {
  mood: string;
  theme: string;
};
