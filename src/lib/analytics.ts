const GA_ID_PATTERN = /^G-[A-Z0-9]+$/;

export const GA_EVENT = {
  clickTicketFromNav: "click_ticket_from_nav",
  clickTicketFromNavMobile: "click_ticket_from_nav_mobile",
  copySiteShareLink: "copy_site_share_link",
  copyContactEmail: "copy_contact_email",
  downloadFullSchedule: "download_full_schedule",
  copyBuddyNpxCommand: "copy_buddy_npx_command",
  openBuddyNpmPage: "open_buddy_npm_page",
  expandSessionDetail: "expand_session_detail",
} as const;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function getGaId() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();
  if (!gaId || !GA_ID_PATTERN.test(gaId)) return undefined;
  return gaId;
}

function sendGtag(...args: unknown[]) {
  if (typeof window === "undefined" || !getGaId()) return;
  window.dataLayer ??= [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag() {
      window.dataLayer!.push(arguments);
    };
  }
  window.gtag(...args);
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
) {
  sendGtag("event", name, params);
}

export function copyAndTrack(name: string, text: string) {
  const write = navigator.clipboard?.writeText(text);
  if (!write) return Promise.resolve(false);
  return write
    .then(() => {
      trackEvent(name);
      return true;
    })
    .catch(() => false);
}

export function trackSessionExpand(session: {
  title: string;
  hall?: string;
  speaker?: string;
}) {
  const params: Record<string, string> = {
    session_title: session.title,
    schedule_view: "timeflow",
  };
  if (session.hall) params.session_hall = session.hall;
  if (session.speaker) params.session_speaker = session.speaker;
  trackEvent(GA_EVENT.expandSessionDetail, params);
}
