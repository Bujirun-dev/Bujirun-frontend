import Link from "next/link";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex w-full max-w-[390px] items-center justify-center px-4 py-2.5">
        <Link
          href="/"
          className="text-text-heading text-2xl font-giants tracking-[-0.02em] text-foreground"
        >
          BUJIRUN
        </Link>
      </div>
    </header>
  );
}
