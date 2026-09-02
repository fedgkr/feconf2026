"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useHeroMedia } from "@/hooks/useMedia";
import { useInView } from "@/hooks/useAnimation";
import { HERO, HERO_LETTERS } from "@/data/site";
import { assetPath } from "@/lib/assetPath";

/**
 * Hero background, reproduced from Figma (Frame 68, node 0:4): 27 slanted
 * stripes over a white ground, painted back-to-front in document order.
 * Every stripe is the same parallelogram; its fill is a linear gradient of
 * one colour whose alpha ramps 0 → 1 → 1 → 0 along a shared diagonal, which
 * is what produces the blurred-streak look. Each stripe drifts right-to-left
 * on a shared 5-second looping timeline traced from the Figma motion spec
 * (frame "blue", node 12:902): within each loop it eases in to a midpoint
 * keyframe, then eases out back to rest, so the whole field pulses once per
 * loop. A stripe wraps around once it has fully left the frame.
 *
 * Over it, the intro logo plays once on a clock (pure CSS keyframes): the
 * FECONF clusters gather as the compressed mark, scatter into the full
 * wordmark and invert to white while the flat backdrop fades to the stripes.
 */

const FRAME_W = 1601.134;
const FRAME_H = 900.638;
const STRIPE_W = 1183.973;
const STRIPE_H = 218.723;
/** horizontal offset of a stripe's top edge against its bottom edge */
const SLANT = 132.932;
/** gradient line, relative to each stripe's bounding-box origin */
const GRAD_FROM: [number, number] = [81.57, 109.361];
const GRAD_TO: [number, number] = [704.592, 624.524];
/** gradient alpha stops: fade-in ends at the first, fade-out starts at the second */
const STOP_IN = 0.288462;
const STOP_OUT = 0.697115;

/** once a stripe is fully off the left edge it re-enters from the right */
const WRAP_SPAN = FRAME_W + STRIPE_W;
/** global multiplier over the hand-tuned per-stripe drift speeds */
const SPEED_SCALE = 30;

/**
 * Stripe bounding-box origins in frame coordinates (y down), in paint order.
 * `speed` is the leftward drift in frame px/s, hand-varied per stripe.
 */
let STRIPES: {
  x: number;
  y: number;
  color: string;
  speed: number;
  gradTo?: [number, number];
}[] = [
  { x: 830.078, y: 469.29, color: "#7CA24B", speed: 42 },
  { x: -383.401, y: 444.067, color: "#859D94", speed: 74 },
  { x: 800.569, y: 726.157, color: "#0082FB", speed: 58 },
  { x: 856.906, y: 261.252, color: "#19C9E5", speed: 96 },
  { x: -226.876, y: -31.251, color: "#0082FB", speed: 33 },
  { x: -267.113, y: 330.132, color: "#9189F6", speed: 65 },
  { x: 706.677, y: -86.342, color: "#9189F6", speed: 48 },
  { x: 42.249, y: 772.15, color: "#9189F6", speed: 82 },
  { x: -477.294, y: 578.652, color: "#9189F6", speed: 27 },
  { x: 167.963, y: 385.413, color: "#30C068", speed: 71 },
  { x: 417.167, y: 231.595, color: "#30C068", speed: 54 },
  { x: 529.833, y: 425.094, color: "#30C068", speed: 88 },
  { x: 223.429, y: 662.79, color: "#FFC701", speed: 38 },
  { x: 786.777, y: 534.457, color: "#FFC701", speed: 62 },
  { x: 614.595, y: 67.825, color: "#FF8862", speed: 93 },
  { x: -43.589, y: 244.585, color: "#FFC701", speed: 45 },
  { x: 22.61, y: 507.433, color: "#EA87F7", speed: 78 },
  { x: -226.876, y: 726.157, color: "#EA87F7", speed: 30 },
  { x: 42.249, y: 111.408, color: "#FF8862", speed: 68 },
  { x: 441.965, y: -16.922, color: "#30C068", speed: 51 },
  { x: 81.255, y: 645.982, color: "#0082FB", speed: 85 },
  { x: 308.708, y: 398.072, color: "#9189F6", speed: 40 },
  { x: 308.708, y: 398.072, color: "#9189F6", speed: 59, gradTo: [685.462, 593.236] },
  { x: -424.026, y: 794.093, color: "#9189F6", speed: 76 },
  { x: -414.971, y: 187.402, color: "#859D94", speed: 35 },
  { x: 469.28, y: -86.342, color: "#FFBBD0", speed: 90 },
  { x: 365.113, y: 706.984, color: "#FFBBD0", speed: 47 },
];

/**
 * Two-tone repaint: the Figma palette above is remapped onto a
 * #FE4500 ↔ #FFC300 ramp. Each stripe keeps its source colour's relative
 * lightness — the darkest source paints as raw #FE4500, the lightest as
 * raw #FFC300 — so the layered depth of the original composition survives
 * the two-colour palette.
 */

// orange
// const RAMP_FROM = [0xfe, 0x45, 0x00];
// const RAMP_TO = [0xff, 0xc3, 0x00];

function luminance(color: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const LUMS = STRIPES.map((s) => luminance(s.color));
const LOW = Math.min(...LUMS);
const SPAN = Math.max(...LUMS) - LOW || 1;

function toTwoTone(color: string, from: number[], to: number[]): string {
  const t = (luminance(color) - LOW) / SPAN;
  const hex = from.map((c, ch) =>
    Math.round(c + (to[ch] - c) * t)
      .toString(16)
      .padStart(2, "0"),
  ).join("");

  return `#${hex}`;
}

STRIPES = [
  ...STRIPES,
  ...STRIPES.map(stripe => {
    return {
      ...stripe,
      x: STRIPE_W / 3 * 2 + stripe.x,
    };
  }),
  ...STRIPES.map(stripe => {
    return {
      ...stripe,
      x: STRIPE_W / 3 * 4 + stripe.x,
    };
  }),
];

const vertexShader = /* glsl */ `
  uniform float uTime;
  attribute vec3 stripeColor;
  attribute float gradientT;
  attribute float stripeX;
  attribute float stripeSpeed;
  varying vec3 vColor;
  varying float vT;
  void main() {
    vColor = stripeColor;
    vT = gradientT;
    // right-to-left drift; the offset is derived from the stripe's origin,
    // shared by all four vertices, so the parallelogram translates rigidly
    float wrapped = mod(stripeX - uTime * stripeSpeed + ${STRIPE_W.toFixed(3)},
      ${WRAP_SPAN.toFixed(3)}) - ${STRIPE_W.toFixed(3)};
    vec3 pos = position;
    pos.x += wrapped - stripeX;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// colours arrive as raw sRGB and are written out untouched, so blending in
// the canvas matches the SVG's sRGB source-over compositing exactly
const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vT;
  void main() {
    float t = clamp(vT, 0.0, 1.0);
    float alpha = clamp(min(t / ${STOP_IN}, (1.0 - t) / ${1 - STOP_OUT}), 0.0, 1.0);
    gl_FragColor = vec4(vColor, alpha);
  }
`;

export function StripeField(props: {
  ramp: number[][],
}) {
  const rampFrom = props.ramp[0];
  const rampTo = props.ramp[1];
  const { width, height } = useThree((state) => state.size);

  const geometry = useMemo(() => {
    const positions = new Float32Array(STRIPES.length * 4 * 3);
    const colors = new Float32Array(STRIPES.length * 4 * 3);
    const ts = new Float32Array(STRIPES.length * 4);
    const stripeXs = new Float32Array(STRIPES.length * 4);
    const speeds = new Float32Array(STRIPES.length * 4);
    const indices: number[] = [];

    STRIPES.forEach(({ x, y, color, speed, gradTo = GRAD_TO }, i) => {
      const tone = toTwoTone(color, rampFrom, rampTo);
      // corners relative to the box origin: bottom-left, top-left, top-right,
      // bottom-right (frame coordinates, y down)
      const corners: [number, number][] = [
        [0, STRIPE_H],
        [SLANT, 0],
        [STRIPE_W, 0],
        [STRIPE_W - SLANT, STRIPE_H],
      ];
      const dx = gradTo[0] - GRAD_FROM[0];
      const dy = gradTo[1] - GRAD_FROM[1];
      const dd = dx * dx + dy * dy;
      const r = parseInt(tone.slice(1, 3), 16) / 255;
      const g = parseInt(tone.slice(3, 5), 16) / 255;
      const b = parseInt(tone.slice(5, 7), 16) / 255;

      corners.forEach(([cx, cy], j) => {
        const v = i * 4 + j;
        positions[v * 3] = x + cx - FRAME_W / 2;
        positions[v * 3 + 1] = FRAME_H / 2 - (y + cy);
        positions[v * 3 + 2] = 0;
        colors[v * 3] = r;
        colors[v * 3 + 1] = g;
        colors[v * 3 + 2] = b;
        // the gradient offset is linear across the plane, so interpolating
        // per-vertex values reproduces the SVG gradient exactly
        ts[v] = ((cx - GRAD_FROM[0]) * dx + (cy - GRAD_FROM[1]) * dy) / dd;
        stripeXs[v] = x;
        speeds[v] = speed * SPEED_SCALE;
      });
      const base = i * 4;
      indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("stripeColor", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("gradientT", new THREE.BufferAttribute(ts, 1));
    geo.setAttribute("stripeX", new THREE.BufferAttribute(stripeXs, 1));
    geo.setAttribute("stripeSpeed", new THREE.BufferAttribute(speeds, 1));
    geo.setIndex(indices);
    // wrapped stripes leave the original bounding sphere; never cull
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), WRAP_SPAN);
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: { uTime: { value: 0 } },
        transparent: true,
        depthTest: false,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  );

  // drift on the render clock; hold still for prefers-reduced-motion
  const meshRef = useRef<THREE.Mesh>(null);
  const reduceMotion = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reduceMotion.current = mq.matches;
    };
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  useFrame(({ clock }) => {
    if (reduceMotion.current) return;
    const mat = meshRef.current?.material as THREE.ShaderMaterial | undefined;
    if (mat) mat.uniforms.uTime.value = clock.getElapsedTime();
  });

  // fill the viewport like `object-fit: cover`, keeping the frame centred
  const scale = Math.max(width / FRAME_W, height / FRAME_H);

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} scale={[scale, scale, 1]} />
  );
}

export default function HeroSection() {
  // the letter fill reads the accent of the page-wide media pick
  const media = useHeroMedia();
  // the drift loop parks while the hero is scrolled offscreen
  const { ref: sectionRef, inView } = useInView<HTMLElement>({
    threshold: 0.01,
    once: false,
  });

  return (
    <section
      ref={sectionRef}
      id="home"
      aria-label="FEConf 2026 intro"
      className="relative h-dvh overflow-hidden bg-white"
    >
      {/* the stripes are soft gradients, so capping the render buffer at
          1.5x has no visible cost — at DPR 2 the fill cost of 81 blended
          quads dominated the frame budget (measured ~20ms/frame at rest) */}
      <Canvas orthographic dpr={[1, 1.5]} frameloop={inView ? "always" : "never"} aria-hidden="true" className="hero-intro-canvas">
        <color attach="background" args={["#ffffff"]} />
        {media && <StripeField ramp={media.ramp}/>}
      </Canvas>
      <div className="hero-intro-backdrop" aria-hidden="true" />

      <span className="hero-letter-frame">
        <img src={assetPath("/images/fe-white.svg")} />
      </span>
      <div className="hero-mark-anchor" aria-hidden="true">
        <div
          className="hero-letter-stack"
          style={{ "--hero-logo-color": media?.accent } as React.CSSProperties}
        >
          {HERO_LETTERS.map(({ shiftX, shiftY, d }, i) => (
            <svg
              key={i}
              className="hero-letter"
              viewBox="0 0 973.369 87.0588"
              preserveAspectRatio="none"
              aria-hidden="true"
              style={
                {
                  "--cluster-x": `${shiftX}%`,
                  "--cluster-y": `${shiftY}%`,
                } as React.CSSProperties
              }
            >
              <path d={d} />
            </svg>
          ))}
        </div>
      </div>
    </section>
  );
}
