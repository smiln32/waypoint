"use client";
import { useSyncExternalStore } from "react";
import { useWaypoint } from "@/lib/store";
import { useGo } from "@/lib/use-go";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const useMounted = () => useSyncExternalStore(() => () => {}, () => true, () => false);

export function DueCalendar() {
  const { opportunities } = useWaypoint();
  const onGo = useGo();
  const mounted = useMounted();
  if (!mounted) return null;
  const now = new Date();
  const year = now.getFullYear(); const month = now.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dueByDay = new Map<number, { label: string; role: string; id: string }[]>();
  for (const record of opportunities) {
    const iso = record.nextAction.dueDate;
    if (!iso) continue;
    const due = new Date(`${iso}T00:00:00`);
    if (due.getFullYear() !== year || due.getMonth() !== month) continue;
    const day = due.getDate();
    const list = dueByDay.get(day) ?? [];
    list.push({ label: record.nextAction.label, role: record.role, id: record.id });
    dueByDay.set(day, list);
  }
  const monthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  return (
    <section className="dash-section" aria-label="Due this month">
      <div className="dash-section-head"><h2>{monthName}</h2><button className="link" onClick={() => onGo("applications")}>Open Job Tracking →</button></div>
      <div className="month-cal">
        {WEEKDAYS.map((weekday) => <div key={weekday} className="cal-weekday">{weekday}</div>)}
        {Array.from({ length: firstWeekday }, (_, i) => <div key={`blank-${i}`} className="cal-cell cal-blank" />)}
        {Array.from({ length: daysInMonth }, (_, i) => { const day = i + 1; const due = dueByDay.get(day) ?? []; const isToday = day === now.getDate(); return (
          <div key={day} className={`cal-cell${isToday ? " cal-today" : ""}`}><span className="cal-day">{day}</span>
            {due.map((item) => <span className="cal-due" key={item.id} title={item.role} aria-label={`${item.label} — ${item.role}`}>{item.label}</span>)}
          </div>
        ); })}
      </div>
    </section>
  );
}
