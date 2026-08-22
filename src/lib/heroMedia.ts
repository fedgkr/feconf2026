import { HERO_MEDIA } from "@/data/site";

/**
 * The random pick is made once per page load and shared by everything that
 * shows the video or its accent colour. Module state (not React state) so the
 * hero, the schedule cards, the story silhouettes, the buddy tint, and the
 * footer can never disagree within one load.
 *
 * Client-only: call from effects or event handlers. Rendering it on the
 * server would bake one pick into the static export for every visitor.
 */
let picked: (typeof HERO_MEDIA)[number] | null = null;

export function heroMedia() {
  if (!picked) {
    picked = HERO_MEDIA[Math.floor(Math.random() * HERO_MEDIA.length)];
  }
  return picked;
}
