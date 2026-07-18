"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { VIEW_PATHS } from "./nav";
import type { View } from "./types";

/** Navigate to a workspace by its view key. */
export function useGo() {
  const router = useRouter();
  return useCallback((view: View) => router.push(VIEW_PATHS[view]), [router]);
}
