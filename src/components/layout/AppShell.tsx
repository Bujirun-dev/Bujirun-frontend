import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { BottomNavigation } from "./BottomNavigation";
import { ScrollToTop } from "./ScrollToTop";
import backgroundImg from "../../assets/background/background.png";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh">
      {" "}
      <ScrollToTop />
      <div
        className="mx-auto min-h-dvh w-full max-w-[402px] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImg.src})` }}
      >
        <AppHeader />
        <div className="min-h-[calc(100dvh-3.5rem)]">{children}</div>
        <BottomNavigation />
      </div>
    </div>
  );
}
