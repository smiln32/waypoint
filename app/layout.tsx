import type { Metadata } from "next";
import "../styles/tokens.css";
import "../styles/waypoint.css";
import { Shell } from "@/components/layout/Shell";
import { WaypointProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Waypoint — Veteran Career Transition",
  description:
    "Translate military experience into civilian opportunity without losing the person behind the record.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <WaypointProvider>
          <Shell>{children}</Shell>
        </WaypointProvider>
      </body>
    </html>
  );
}
