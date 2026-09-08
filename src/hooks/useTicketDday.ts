"use client";

import { useSyncExternalStore } from "react";
import { TICKET_OPEN_AT } from "@/data/site";

function remainingMs() {
  return new Date(TICKET_OPEN_AT).getTime() - Date.now();
}

function dday() {
  const ms = remainingMs();
  if (ms <= 0) return "D-DAY";
  return `D-${Math.floor(ms / 86_400_000)}`;
}

function ticketOpen() {
  return remainingMs() <= 0;
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

/**
 * Whether `TICKET_OPEN_AT` has passed, read on the same 60s tick as the
 * D-day label, so a page left open flips within a minute of the opening.
 * Hydration deliberately starts from `false`: the static export is built
 * before the opening, and the store re-reads right after mount.
 */
export function useTicketOpen() {
  return useSyncExternalStore(subscribe, ticketOpen, () => false);
}
