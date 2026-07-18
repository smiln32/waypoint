import type { Metadata } from "next";
import "./globals.css";
import "./interview-polish.css";
import "./dashboard-applications.css";
import "./alignment-score-correction.css";
import "./hero-text-correction.css";
import "./interaction-resume-polish.css";
import "./colorize.css";
import "./career-dashboard.css";

export const metadata: Metadata = {
  title: "Waypoint — Veteran Career Transition",
  description: "Translate military experience into civilian opportunity without losing the person behind the record.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
