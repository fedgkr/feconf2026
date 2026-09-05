import { BUDDY_SNAILS } from "@/data/site";

/**
 * `COUNT` snails roam the Forever Buddy section: they crawl left along free
 * horizontal lanes (never through the copy or the button), can be dragged
 * anywhere, and react to a tap with one of four little moves. Their pink
 * bodies are re-dyed to the hero pick's accent.
 *
 * Imperative on purpose — positions move every frame and React state would
 * re-render five times per frame for nothing. The section component owns the
 * lifecycle: `mountBuddySnails` returns a disposer.
 */

const SNAIL_W = 165;
const SNAIL_H = 87;
const COUNT = 7;
/** narrow screens have only 2–3 free lanes — fewer, smaller snails spread
 * across them instead of piling up on the same spots */
const MOBILE_COUNT = 5;
const SPEED: [number, number] = [22, 36]; // px/s
const BODY_HEX = /#FF5080/gi; // body colour in the source SVGs

/** tap reactions: swap to `asset`, scoot forward, hop, briefly speed up */
const TAP_MOTIONS = [
  { asset: 1, hold: 420, advance: 34, lift: 22, boost: 1.4, duration: 520, ease: easeOutCubic },
  { asset: 2, hold: 120, advance: 46, lift: 0, boost: 2.6, duration: 420, ease: easeOutCubic },
  { asset: 2, hold: 520, advance: 24, lift: 6, boost: 1.7, duration: 560, ease: easeOutCubic },
  { asset: 3, hold: 720, advance: 30, lift: 16, boost: 1.5, duration: 620, ease: easeOutBack },
];

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function easeOutBack(t: number) {
  const c1 = 1.70158;
  return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

interface Motion {
  start: number;
  duration: number;
  advance: number;
  lift: number;
  ease: (t: number) => number;
  lastX: number;
  lastY: number;
}

interface Snail {
  el: HTMLDivElement;
  img: HTMLImageElement;
  w: number;
  h: number;
  x: number;
  y: number;
  drawnX: number | null;
  drawnY: number | null;
  speed: number;
  boost: number;
  boostUntil: number;
  motion: Motion | null;
  drag: boolean;
  lastTap: number;
  returnTimer: ReturnType<typeof setTimeout> | undefined;
  assetIndex: number;
}

export function mountBuddySnails(
  layer: HTMLElement,
  stage: HTMLElement,
  accent?: string,
) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const snails: Snail[] = [];
  let W = 0;
  let H = 0;
  let raf = 0;
  let last = 0;
  // Placement stays eager; walking waits for the first visibility report.
  let active = false;
  let disposed = false;

  /* ---------- tint: dye the SVG bodies to the hero accent ---------- */

  const tinted = new Map<string, string>(); // source URL -> dyed data URI
  if (accent) {
    for (const src of BUDDY_SNAILS) {
      fetch(src)
        .then((res) => (res.ok ? res.text() : null))
        .then((svg) => {
          if (!svg || disposed) return;
          tinted.set(
            src,
            `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(BODY_HEX, accent))}`,
          );
          snails.forEach((s) => setAsset(s, s.assetIndex));
        })
        .catch(() => {});
    }
  }

  const assetUrl = (index: number) => {
    const src = BUDDY_SNAILS[index] ?? BUDDY_SNAILS[0];
    return tinted.get(src) ?? src;
  };

  function setAsset(s: Snail, index: number) {
    s.assetIndex = index;
    const next = assetUrl(index);
    if (s.img.getAttribute("src") !== next) s.img.src = next;
  }

  /* ---------- lanes: horizontal bands clear of copy and button ---------- */

  function keepOuts() {
    const layerBox = layer.getBoundingClientRect();
    return [...stage.querySelectorAll<HTMLElement>("[data-fc-keepout]")].map((el) => {
      const r = el.getBoundingClientRect();
      return { y: r.top - layerBox.top, h: r.height };
    });
  }

  function laneSlots(h: number) {
    const pad = 18;
    const gap = 10;
    const intervals = keepOuts()
      .map((b) => [b.y - pad, b.y + b.h + pad] as [number, number])
      .sort((a, b) => a[0] - b[0]);
    const free: [number, number][] = [];
    let cursor = 0;
    for (const [top, bottom] of intervals) {
      if (top - cursor >= h) free.push([cursor, top]);
      if (bottom > cursor) cursor = bottom;
    }
    if (H - cursor >= h) free.push([cursor, H]);

    const slots: number[] = [];
    for (const [top, bottom] of free) {
      let y = top;
      while (bottom - y >= h) {
        slots.push(y);
        y += h + gap;
      }
    }
    return slots;
  }

  function laneBad(y: number, h: number) {
    const pad = 18;
    return keepOuts().some((b) => !(y + h + pad <= b.y || b.y + b.h + pad <= y));
  }

  /* ---------- placement ---------- */

  function draw(s: Snail) {
    const x = Math.round(s.x);
    const y = Math.round(s.y);
    if (s.drawnX === x && s.drawnY === y) return;
    s.el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    s.drawnX = x;
    s.drawnY = y;
  }

  function place() {
    W = layer.clientWidth;
    H = layer.clientHeight;
    if (!W || !H) return;

    const count = W < 720 ? MOBILE_COUNT : COUNT;
    const scale = W < 480 ? 0.6 : W < 720 ? 0.75 : 1;
    const w = Math.round(SNAIL_W * scale);
    const h = Math.round(SNAIL_H * scale);

    const slots = laneSlots(h);
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }

    // crossing the mobile breakpoint changes the herd size — rebuild
    if (snails.length && snails.length !== count) {
      snails.forEach((s) => {
        clearTimeout(s.returnTimer);
        s.el.remove();
      });
      snails.length = 0;
    }

    // snails already walking keep their spot; only size and lane are fixed up
    if (snails.length === count) {
      snails.forEach((s, k) => {
        if (s.w !== w) {
          s.el.style.width = `${w}px`;
          s.el.style.height = `${h}px`;
          s.x = s.x * (w / s.w);
          s.w = w;
          s.h = h;
        }
        if (!s.drag && laneBad(s.y, h) && slots.length) s.y = slots[k % slots.length];
        s.y = clamp(s.y, 0, Math.max(0, H - h));
        if (s.x > W) s.x = -w;
        draw(s);
      });
      startLoop();
      return;
    }

    // lane k % slots.length walks round-robin, so snails sharing a lane are
    // staggered along the full walking track [-w, W] — on narrow screens the
    // old (W - w) / COUNT spacing painted them as one overlapping clump
    const laneShare = slots.length ? Math.ceil(count / slots.length) : count;

    for (let k = 0; k < count; k++) {
      const el = document.createElement("div");
      el.className = "fc-snail";
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      const img = document.createElement("img");
      img.alt = "";
      img.decoding = "async";
      img.draggable = false;
      img.src = assetUrl(0);
      el.appendChild(img);
      layer.appendChild(el);

      const lane = slots.length
        ? slots[k % slots.length]
        : Math.round((H - h) * Math.random());
      const seat = slots.length ? Math.floor(k / slots.length) : k;
      const s: Snail = {
        el,
        img,
        w,
        h,
        // seats within a lane split the track evenly, with jitter inside the
        // seat so nobody wraps around immediately or paints on a neighbour
        x: ((seat + 0.15 + Math.random() * 0.7) / laneShare) * (W + w) - w,
        y: clamp(lane, 0, Math.max(0, H - h - 6)) + Math.round(Math.random() * 6),
        drawnX: null,
        drawnY: null,
        speed: SPEED[0] + Math.random() * (SPEED[1] - SPEED[0]),
        boost: 1,
        boostUntil: 0,
        motion: null,
        drag: false,
        lastTap: -1,
        returnTimer: undefined,
        assetIndex: 0,
      };
      snails.push(s);
      draw(s);
      bindPointer(s);
    }
    startLoop();
  }

  /* ---------- walking ---------- */

  function updateTapMotion(s: Snail, now: number) {
    const m = s.motion;
    if (!m) return;
    const p = clamp((now - m.start) / m.duration, 0, 1);
    const e = m.ease(p);
    const nextX = -m.advance * e;
    const nextY = -m.lift * Math.sin(Math.PI * p);
    s.x += nextX - m.lastX;
    s.y = clamp(s.y + nextY - m.lastY, 0, H - s.h);
    m.lastX = nextX;
    m.lastY = nextY;
    if (p >= 1) {
      s.motion = null;
      s.x = Math.round(s.x);
      s.y = Math.round(s.y);
    }
  }

  function tick(ts: number) {
    if (!active || reduced || document.hidden) {
      raf = 0;
      last = 0;
      return;
    }
    const dt = last ? Math.min(64, ts - last) / 1000 : 0;
    last = ts;
    for (const s of snails) {
      if (s.drag) continue;
      updateTapMotion(s, ts);
      const boost = s.boostUntil && ts < s.boostUntil ? s.boost : 1;
      s.x -= s.speed * boost * dt; // heads point left
      if (s.x < -s.w) s.x = W + Math.random() * s.w * 0.5;
      draw(s);
    }
    raf = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (!raf && !reduced && active && !document.hidden) {
      last = 0;
      raf = requestAnimationFrame(tick);
    }
  }

  function stopLoop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
  }

  /* ---------- tap reactions ---------- */

  function playTap(s: Snail) {
    let pick = Math.floor(Math.random() * TAP_MOTIONS.length);
    if (pick === s.lastTap) pick = (pick + 1) % TAP_MOTIONS.length;
    s.lastTap = pick;
    const motion = TAP_MOTIONS[pick];
    const now = performance.now();
    updateTapMotion(s, now);
    clearTimeout(s.returnTimer);
    setAsset(s, motion.asset);
    s.boost = motion.boost;
    s.boostUntil = now + motion.duration;
    s.motion = {
      start: now,
      duration: motion.duration,
      advance: motion.advance,
      lift: motion.lift,
      ease: motion.ease,
      lastX: 0,
      lastY: 0,
    };
    s.returnTimer = setTimeout(
      () => {
        if (s.el.isConnected && !s.drag) setAsset(s, 0);
      },
      Math.max(2200, motion.duration + motion.hold),
    );
  }

  /* ---------- drag ---------- */

  function bindPointer(s: Snail) {
    let id: number | null = null;
    let dx = 0;
    let dy = 0;
    let sx = 0;
    let sy = 0;
    let began = 0;
    let moved = false;

    s.el.addEventListener("pointerdown", (e) => {
      if (s.drag || (e.pointerType === "mouse" && e.button !== 0)) return;
      const box = layer.getBoundingClientRect();
      id = e.pointerId;
      dx = e.clientX - box.left - s.x;
      dy = e.clientY - box.top - s.y;
      sx = e.clientX;
      sy = e.clientY;
      began = performance.now();
      moved = false;
      updateTapMotion(s, began);
      s.motion = null;
      clearTimeout(s.returnTimer);
      setAsset(s, 0);
      s.drag = true;
      s.el.classList.add("is-dragging");
      s.el.setPointerCapture(id);
      e.preventDefault();
    });

    s.el.addEventListener("pointermove", (e) => {
      if (!s.drag || e.pointerId !== id) return;
      const box = layer.getBoundingClientRect();
      if (Math.hypot(e.clientX - sx, e.clientY - sy) > 6) moved = true;
      s.x = clamp(e.clientX - box.left - dx, -s.w * 0.4, box.width - s.w * 0.6);
      s.y = clamp(e.clientY - box.top - dy, 0, box.height - s.h);
      draw(s);
      e.preventDefault();
    });

    const drop = (e: PointerEvent) => {
      if (!s.drag || e.pointerId !== id) return;
      const now = performance.now();
      const tapped =
        e.type === "pointerup" &&
        !moved &&
        Math.hypot(e.clientX - sx, e.clientY - sy) <= 8 &&
        now - began < 420;
      s.drag = false; // walks on from wherever it was dropped
      s.el.classList.remove("is-dragging");
      id = null;
      if (tapped) playTap(s);
    };
    s.el.addEventListener("pointerup", drop);
    s.el.addEventListener("pointercancel", drop);
    s.el.addEventListener("dragstart", (e) => e.preventDefault());
  }

  /* ---------- lifecycle ---------- */

  place();
  if (document.fonts?.ready) document.fonts.ready.then(() => !disposed && place());

  const observer = new IntersectionObserver(
    ([entry]) => {
      active = !!entry?.isIntersecting;
      if (active) startLoop();
      else stopLoop();
    },
    { rootMargin: "180px 0px", threshold: 0.01 },
  );
  observer.observe(layer);

  const onVisibility = () => {
    if (document.hidden) stopLoop();
    else startLoop();
  };
  document.addEventListener("visibilitychange", onVisibility);

  let resizeTimer: ReturnType<typeof setTimeout>;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(place, 200);
  };
  window.addEventListener("resize", onResize);

  return () => {
    disposed = true;
    stopLoop();
    observer.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("resize", onResize);
    clearTimeout(resizeTimer);
    snails.forEach((s) => {
      clearTimeout(s.returnTimer);
      s.el.remove();
    });
    snails.length = 0;
  };
}
