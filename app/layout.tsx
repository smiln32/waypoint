import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "../styles/tokens.css";
import "../styles/waypoint.css";
import { DemoModeProvider } from "@/components/layout/DemoMode";
import { Shell } from "@/components/layout/Shell";
import { liveAiEnabled, liveJobsEnabled } from "@/lib/live-config";
import { WaypointProvider } from "@/lib/store";

const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Waypoint — Veteran Career Transition",
    template: "%s · Waypoint",
  },
  description:
    "A critique-only resume editor for veterans entering civilian careers — and the career-transition workspace built around it.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={publicSans.variable}>
      <body>
        <WaypointProvider>
          <DemoModeProvider demonstration={!liveAiEnabled() && !liveJobsEnabled()}>
            <Shell>{children}</Shell>
          </DemoModeProvider>
        </WaypointProvider>
      </body>
    </html>
  );
}
