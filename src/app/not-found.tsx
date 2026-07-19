import { ErrorState } from "@/components";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col">
      <ErrorState code={404} />
    </div>
  );
}
