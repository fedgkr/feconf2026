/**
 * A reload always opens on the hero intro. Browsers restore the previous
 * scroll offset on reload, which would drop the visitor mid-page with the
 * intro already spent unseen; this turns
 * that restoration off and pins the document to the top before any Next.js
 * code runs, so the FE mark → coloured wordmark → stripes play is seen from
 * its first frame every time. Deep links (a URL with a hash) keep their
 * target: those visitors asked for a section, not the intro.
 *
 * The root layout inlines this as a `beforeInteractive` script so it fires
 * ahead of the browser's own restoration, which can happen before hydration.
 */
export const introScrollResetScript = `
  (() => {
    if (!("scrollRestoration" in history) || location.hash) return;
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  })();
`;
