import Link from "next/link";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[402px] items-center justify-center px-4">
        <Link href="/" className="text-base font-black tracking-[0.18em] text-foreground">
          BUJIRUN
        </Link>
      </div>
    </header>
  );
}
