"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { VIEW_PATHS } from "@/lib/nav";
import type { View } from "@/lib/types";

const NAV_ITEMS: [View, string][] = [
  ["start", "Start Here"],
  ["dashboard", "Dashboard"],
  ["resume", "Resume"],
  ["search", "Job Search"],
  ["applications", "Job Tracking"],
  ["coverletter", "Cover Letter"],
  ["interview", "Interview Prep"],
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="side" aria-label="Waypoint sidebar">
      <Link className="logo" href="/">
        <span>W</span>Waypoint
      </Link>
      <nav aria-label="Primary navigation">
        {NAV_ITEMS.map(([view, label]) => {
          const href = VIEW_PATHS[view];
          return (
            <Link
              className={pathname === href ? "active" : ""}
              key={view}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <p>
        <b>Your record stays yours.</b>
        <br />
        Review every change before it becomes part of your materials.
      </p>
    </aside>
  );
}
