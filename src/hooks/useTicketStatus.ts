"use client";

import { useSyncExternalStore } from "react";
import {
  CONFERENCE_AT,
  TICKET_OPEN_AT,
  TICKET_STATUS_LABEL,
} from "@/data/site";

const DAY_MS = 86_400_000;
/** KST never shifts, so a fixed offset is enough to bucket instants by date. */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function kstDay(ms: number) {
  return Math.floor((ms + KST_OFFSET_MS) / DAY_MS);
}

/** Whole KST calendar days from `now` to `iso` — 0 means "same day". */
function daysUntil(iso: string, now: number) {
  return kstDay(new Date(iso).getTime()) - kstDay(now);
}

function label() {
  const now = Date.now();
  const toTicket = daysUntil(TICKET_OPEN_AT, now);
  if (toTicket > 0) return `${TICKET_STATUS_LABEL.beforeOpen} D-${toTicket}`;
  if (toTicket === 0) return TICKET_STATUS_LABEL.ticketDay;

  const toConference = daysUntil(CONFERENCE_AT, now);
  if (toConference > 0)
    return `${TICKET_STATUS_LABEL.afterOpen} D-${toConference}`;
  if (toConference === 0) return TICKET_STATUS_LABEL.conferenceDay;
  return TICKET_STATUS_LABEL.ended;
}

/**
 * Booking runs from the opening minute (a clock time, not a date) until the
 * conference day starts.
 */
function booking() {
  const now = Date.now();
  return (
    now >= new Date(TICKET_OPEN_AT).getTime() &&
    daysUntil(CONFERENCE_AT, now) > 0
  );
}

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

/**
 * Live ticket counter label. The static export bakes the build-time string, so
 * render it with `suppressHydrationWarning` — a page viewed on a later day
 * hydrates to a different label by design.
 */
export function useTicketLabel() {
  return useSyncExternalStore(subscribe, label, label);
}

/**
 * Whether the booking link is live, read on the same 60s tick as the label.
 * Hydration deliberately starts from `false`: the static export is built
 * before the opening, and the store re-reads right after mount, so the markup
 * never disagrees with the prerendered HTML.
 */
export function useTicketBookingOpen() {
  return useSyncExternalStore(subscribe, booking, () => false);
}
