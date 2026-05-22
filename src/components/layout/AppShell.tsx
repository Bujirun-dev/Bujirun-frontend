import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { BottomNavigation } from "./BottomNavigation";
import { ScrollToTop } from "./ScrollToTop";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-background">
      <ScrollToTop />
      <div className="mx-auto min-h-dvh w-full max-w-[402px] bg-background shadow-[0_0_0_1px_var(--border)]">
        <AppHeader />
        <div className="min-h-[calc(100dvh-3.5rem)]">{children}</div>
        <BottomNavigation />
      </div>
    </div>
  );
}
