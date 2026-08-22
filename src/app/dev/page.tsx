import { EmptyState } from "@/components";

export default function DevPage() {
  return (
    <section className="flex min-h-full items-center justify-center">
      <EmptyState
        title="아직 여행 기록이 없어요"
        description="여행을 시작하고 나만의 기록을 남겨보세요."
        actionLabel="여행 시작하기"
        onAction={() => {}}
      />
    </section>
  );
}
