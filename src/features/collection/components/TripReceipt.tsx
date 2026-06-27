import Image from "next/image";

import receiptBackground from "@/assets/receipt/receipt_background.png";
import { ReceiptBarcode } from "@/features/collection/components/ReceiptBarcode";
import { tripReceipts } from "@/features/collection/data/tripReceipts";
import { PLACES } from "@/features/collection/data/places";

const formatDateWithDots = (date: string) => date.replaceAll("-", ".");

const formatDateToReceiptCode = (date: string) => date.replaceAll("-", "").slice(2);

const createArchiveNumber = (startDate: string, tripOrder: number) =>
  `#BUSAN-${formatDateToReceiptCode(startDate)}-${String(tripOrder).padStart(3, "0")}`;

const createBarcode = (startDate: string, endDate: string) =>
  `${formatDateToReceiptCode(startDate)}-${formatDateToReceiptCode(endDate)}-BUSAN`;

const calculateTotalDays = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();

  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};

export function TripReceipt() {
  const receipt = tripReceipts[0];
  const tripOrder = receipt.tripId;
  const archiveNumber = createArchiveNumber(receipt.period.startDate, tripOrder);
  const issuedOn = formatDateWithDots(receipt.period.endDate);
  const barcode = createBarcode(receipt.period.startDate, receipt.period.endDate);
  const totalDays = calculateTotalDays(receipt.period.startDate, receipt.period.endDate);

  const spotsVisited = receipt.days.reduce((count, day) => count + day.places.length, 0);
  const totalCollectionCount = PLACES.length;
  const collectedCount = PLACES.filter((place) => place.isCollected).length;
  const collectionRate = Math.round((collectedCount / totalCollectionCount) * 100);

  const receiptInfo = [
    ["TRAVELER", receipt.traveler],
    ["TITLE", receipt.title],
    [
      "PERIOD",
      `${formatDateWithDots(receipt.period.startDate)} - ${formatDateWithDots(receipt.period.endDate)}`,
    ],
    ["TOTAL DAYS", `${totalDays} days`],
    ["COMPANION", receipt.companion],
    ["MOOD", receipt.mood],
    ["THEME", receipt.theme],
    ["SPOTS VISITED", `${spotsVisited} PLACES`],
    ["COLLECTION", `${collectedCount}/${totalCollectionCount} (${collectionRate}%)`],
  ] as const;

  return (
    <article className="relative isolate w-full overflow-hidden px-3 py-10 font-courierprime text-sm text-text-receipt-main">
      <Image
        src={receiptBackground}
        alt="여행 영수증 배경"
        fill
        priority
        sizes="342px"
        className="pointer-events-none -z-[1] object-cover"
      />

      <header className="text-center">
        <h2 className="text-3xl font-bold tracking-[0.08em]">MEMORY ARCHIVE</h2>
        <p className="mt-2 text-text-receipt-sub tracking-[0.12em]">COLLECTED ALONG THE WAY</p>
        <p className="mb-2 text-text-receipt-sub tracking-[0.12em]">W. BUJIRUN</p>
      </header>

      <div className=" my-3 border-t border-dashed border-sub-darkgray" />

      <section className="px-3">
        <h3 className="mb-2 font-bold text-md italic tracking-[0.04em] text-sub-darkgray">
          JOURNEY OVERVIEW
        </h3>

        <div className="grid items-center gap-3">
          <div className="relative size-[80px] justify-self-center">
            <Image
              src={receipt.profileImage}
              alt="여행 영수증 프로필 사진"
              fill
              sizes="80px"
              className="object-contain"
            />
          </div>

          <dl className="space-y-0.5 leading-none">
            {receiptInfo.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[110px_minmax(0,1fr)] gap-1">
                <dt className="font-bold tracking-[0.04em]">{label}</dt>
                <dd className="min-w-0 break-keep font-bold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="my-3 border-t border-dashed border-sub-darkgray" />

      <section className="px-3">
        <h3 className="mb-2 font-bold text-md italic tracking-[0.04em] text-sub-darkgray">
          JOURNEY ROUTE
        </h3>

        <div className="space-y-4">
          {receipt.days.map((day) => (
            <div key={day.day}>
              <div className="my-2 flex items-center gap-4 font-bold">
                <span className="text-text-receipt-sub text-lg">DAY {day.day}</span>
                <span className="text-sub-gray">
                  {day.date} ({day.weekday})
                </span>
              </div>

              <ul>
                {day.places.map((place, placeIndex) => (
                  <li
                    key={place.id}
                    className={`grid grid-cols-[48px_86px_minmax(0,1fr)] items-center gap-3 py-2 ${
                      placeIndex !== day.places.length - 1 ? "border-b border-sub-lightgray" : ""
                    }`}
                  >
                    <time className="text-center text-text-receipt-sub">{place.time}</time>

                    <div className="relative h-12 w-22 overflow-hidden rounded-md">
                      <Image
                        src={place.image}
                        alt={`${place.name} 사진`}
                        fill
                        sizes="88px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 space-y-1.5">
                      <p className="truncate font-bold">{place.name}</p>
                      <p className="text-xs font-bold">
                        <span aria-hidden="true">{place.categoryIcon}</span> {place.category}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="my-3 border-t border-dashed border-sub-darkgray" />

      <section className="px-3">
        <div className="flex items-center justify-between text-lg font-bold">
          <p>TOTAL JOURNEY</p>
          <p className="shrink-0 text-text-receipt-sub text-md">
            {totalDays} DAYS. {spotsVisited} PLACES
          </p>
        </div>
      </section>

      <div className="my-3 border-t border-dashed border-sub-darkgray" />

      <section className="px-3">
        <div className="space-y-0.5 mb-3 text-xs font-bold">
          <div className="flex justify-between">
            <span>ARCHIVE NO.</span>
            <span>{archiveNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>ISSUED ON</span>
            <span>{issuedOn}</span>
          </div>
        </div>

        <ReceiptBarcode value={barcode} />
      </section>

      <div className="my-3 border-t border-dashed border-sub-darkgray" />

      <footer className="text-center px-3 text-2xs">
        <p className="font-bold">this journey is now part of your collection. ♡</p>
        <p className="mt-1 tracking-[0.08em] text-text-receipt-sub">
          HOPE THIS JOURNEY BECAME A PRECIOUS MEMORY
        </p>
      </footer>
    </article>
  );
}
