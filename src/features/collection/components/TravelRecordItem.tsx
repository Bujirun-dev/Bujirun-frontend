interface TravelRecordItemProps {
  title: string;
  period: string;
  onDelete?: () => void;
}

function ReceiptIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[22px] w-[22px] shrink-0 fill-sub-gray"
    >
      <path d="M16,0H8A5.006,5.006,0,0,0,3,5V23a1,1,0,0,0,1.564.825L6.67,22.386l2.106,1.439a1,1,0,0,0,1.13,0l2.1-1.439,2.1,1.439a1,1,0,0,0,1.131,0l2.1-1.438,2.1,1.437A1,1,0,0,0,21,23V5A5.006,5.006,0,0,0,16,0Zm3,21.1-1.1-.752a1,1,0,0,0-1.132,0l-2.1,1.439-2.1-1.439a1,1,0,0,0-1.131,0l-2.1,1.439-2.1-1.439a1,1,0,0,0-1.129,0L5,21.1V5A3,3,0,0,1,8,2h8a3,3,0,0,1,3,3Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 512 512" aria-hidden="true" className="h-[14px] w-[14px] fill-main-white">
      <path d="M448,85.333h-66.133C371.66,35.703,328.002,0.064,277.333,0h-42.667c-50.669,0.064-94.327,35.703-104.533,85.333H64c-11.782,0-21.333,9.551-21.333,21.333S52.218,128,64,128h21.333v277.333C85.404,464.214,133.119,511.93,192,512h128c58.881-0.07,106.596-47.786,106.667-106.667V128H448c11.782,0,21.333-9.551,21.333-21.333S459.782,85.333,448,85.333z M234.667,362.667c0,11.782-9.551,21.333-21.333,21.333C201.551,384,192,374.449,192,362.667v-128c0-11.782,9.551-21.333,21.333-21.333c11.782,0,21.333,9.551,21.333,21.333V362.667z M320,362.667c0,11.782-9.551,21.333-21.333,21.333c-11.782,0-21.333-9.551-21.333-21.333v-128c0-11.782,9.551-21.333,21.333-21.333c11.782,0,21.333,9.551,21.333,21.333V362.667z M174.315,85.333c9.074-25.551,33.238-42.634,60.352-42.667h42.667c27.114,0.033,51.278,17.116,60.352,42.667H174.315z" />
    </svg>
  );
}

export function TravelRecordItem({ title, period, onDelete }: TravelRecordItemProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-start gap-2">
        <ReceiptIcon />
        <div className="min-w-0">
          <p className="font-paperlogy text-md font-bold text-sub-gray underline underline-offset-2">
            {title}
          </p>
          <p className="mt-0.5 font-paperlogy text-md text-sub-gray">{period}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onDelete}
        aria-label={`${title} 삭제`}
        className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[8px] bg-sub-coral"
      >
        <TrashIcon />
      </button>
    </div>
  );
}
