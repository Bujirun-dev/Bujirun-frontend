import Link from "next/link";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 w-full max-w-[402px] items-center justify-center px-4">
        <Link
          href="/"
          className="text-text-heading text-xl font-giants tracking-[0.18em] text-foreground"
        >
          BUJIRUN
        </Link>
      </div>
    </header>
  );
}
