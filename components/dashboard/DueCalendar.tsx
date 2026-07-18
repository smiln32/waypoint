"use client";
import { useSyncExternalStore } from "react";
import { useWaypoint } from "@/lib/store";
import { useGo } from "@/lib/use-go";

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Render only after mount so the calendar never mismatches a stale prerender. */
const useMounted = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

export function DueCalendar() {
  const { applications } = useWaypoint();
  const onGo = useGo();
  const mounted = useMounted();
  if (!mounted) return null;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // "Jul 19" → day 19, when the month matches the one on screen.
  const dueByDay = new Map<number, { label: string; role: string }[]>();
  for (const row of applications) {
    const match = row.due.match(/^([A-Z][a-z]{2}) (\d{1,2})$/);
    if (!match || match[1] !== MONTH_SHORT[month]) continue;
    const day = Number(match[2]);
    const list = dueByDay.get(day) ?? [];
    list.push({ label: row.nextAction, role: row.role });
    dueByDay.set(day, list);
  }

  const monthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <section className="dash-section" aria-label="Due this month">
      <div className="dash-section-head">
        <h2>{monthName}</h2>
        <button className="link" onClick={() => onGo("applications")}>
          Open Job Tracking →
        </button>
      </div>
      <div className="month-cal">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="cal-weekday">
            {weekday}
          </div>
        ))}
        {Array.from({ length: firstWeekday }, (_, i) => (
          <div key={`blank-${i}`} className="cal-cell cal-blank" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const due = dueByDay.get(day) ?? [];
          const isToday = day === now.getDate();
          return (
            <div key={day} className={`cal-cell${isToday ? " cal-today" : ""}`}>
              <span className="cal-day">{day}</span>
              {due.map((item) => (
                <span className="cal-due" key={item.role} title={item.role}>
                  {item.label}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
