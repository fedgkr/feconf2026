"use client";

import { useSyncExternalStore } from "react";
import { TICKET_OPEN_AT } from "@/data/site";

function dday() {
  const ms = new Date(TICKET_OPEN_AT).getTime() - Date.now();
  if (ms <= 0) return "D-DAY";
  return `D-${Math.floor(ms / 86_400_000)}`;
}

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

/**
 * Live D-day label for the ticket links. The static export bakes the value
 * from build time, so render it with `suppressHydrationWarning` — a page
 * viewed the next day hydrates to a different number by design.
 */
export function useTicketDday() {
  return useSyncExternalStore(subscribe, dday, dday);
}
