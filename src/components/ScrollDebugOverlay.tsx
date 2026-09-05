"use client";

import { useEffect, useRef, useState } from "react";

const DEBUG_QUERY_NAME = "scroll-debug";
const DEBUG_QUERY_VALUE = "1";
const SAMPLE_WINDOW_MS = 2_000;
const SAMPLE_LIMIT = 120;
const CALL_LIMIT = 12;
const LIVE_DISPLAY_SAMPLE_COUNT = 4;
const UI_REFRESH_MS = 150;
const BOTTOM_VIEWPORT_MULTIPLIER = 2;
const UNAVAILABLE = "측정 불가";

type Current = {
  timestamp: string;
  scrollY: number;
  maxScrollRaw: number;
  range: string;
};

type Sample = Current & {
  id: number;
  capturedAt: number;
  scrollingElement: string;
  documentElement: string;
  innerHeight: number;
  visualViewport: string;
  cap: string;
  shareContact: string;
};

type ScrollToCall = {
  id: number;
  timestamp: string;
  arguments: string;
  before: number;
  after: number;
};

type Snapshot = {
  current: Current | null;
  samples: Sample[];
  calls: ScrollToCall[];
};

const emptySnapshot: Snapshot = { current: null, samples: [], calls: [] };

function number(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(1) : UNAVAILABLE;
}

function timestamp(now: number, startedAt: number) {
  return `+${(now - startedAt).toFixed(1)}ms`;
}

function readCurrent(now: number, startedAt: number): Current {
  const documentElement = document.documentElement;
  const scrollY = window.scrollY;
  const maxScrollRaw = documentElement.scrollHeight - documentElement.clientHeight;

  return {
    timestamp: timestamp(now, startedAt),
    scrollY,
    maxScrollRaw,
    range: scrollY < 0 || scrollY > maxScrollRaw ? "범위 밖 overscroll" : "범위 안",
  };
}

function readSample(current: Current, now: number, id: number): Sample {
  const scrollingElement = document.scrollingElement;
  const documentElement = document.documentElement;
  const cap = document.getElementById("fc-scroll-cap");
  const shareContact = document.querySelector<HTMLElement>(
    'main > section.z-33[data-nav-bg="#fafafd"]',
  );
  const viewport = window.visualViewport;

  let shareContactValue = UNAVAILABLE;
  if (shareContact) {
    const rect = shareContact.getBoundingClientRect();
    const style = getComputedStyle(shareContact);
    try {
      const matrix = new DOMMatrixReadOnly(style.transform);
      shareContactValue = `top=${number(rect.top)} matrixY=${number(matrix.m42)} --fc-cover-y=${style.getPropertyValue("--fc-cover-y").trim() || UNAVAILABLE}`;
    } catch {
      shareContactValue = `top=${number(rect.top)} matrixY=${UNAVAILABLE} --fc-cover-y=${style.getPropertyValue("--fc-cover-y").trim() || UNAVAILABLE}`;
    }
  }

  return {
    ...current,
    id,
    capturedAt: now,
    scrollingElement: scrollingElement
      ? `height=${number(scrollingElement.scrollHeight)} client=${number(scrollingElement.clientHeight)}`
      : UNAVAILABLE,
    documentElement: `height=${number(documentElement.scrollHeight)} client=${number(documentElement.clientHeight)}`,
    innerHeight: window.innerHeight,
    visualViewport: viewport
      ? `height=${number(viewport.height)} offsetTop=${number(viewport.offsetTop)}`
      : UNAVAILABLE,
    cap: cap
      ? `inline maxHeight=${cap.style.maxHeight || "(비어 있음)"} overflow=${cap.style.overflow || "(비어 있음)"}`
      : UNAVAILABLE,
    shareContact: shareContactValue,
  };
}

function scrollToArguments(args: unknown[]) {
  try {
    if (typeof args[0] === "number") {
      return `left=${number(args[0])} top=${number(args[1])} behavior=미지정`;
    }
    const options = args[0] as ScrollToOptions | undefined;
    const behavior = options?.behavior;
    return `left=${number(options?.left)} top=${number(options?.top)} behavior=${typeof behavior === "string" ? behavior : UNAVAILABLE}`;
  } catch {
    return UNAVAILABLE;
  }
}

function spreadRecentSamples(samples: Sample[]) {
  if (samples.length <= LIVE_DISPLAY_SAMPLE_COUNT) return samples;
  return Array.from(
    { length: LIVE_DISPLAY_SAMPLE_COUNT },
    (_, index) => samples[Math.round((index * (samples.length - 1)) / (LIVE_DISPLAY_SAMPLE_COUNT - 1))],
  );
}

export default function ScrollDebugOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [paused, setPaused] = useState(false);
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);
  const [snapshot, setSnapshot] = useState<Snapshot>(emptySnapshot);
  const pausedRef = useRef(false);
  const samplesRef = useRef<Sample[]>([]);
  const callsRef = useRef<ScrollToCall[]>([]);
  const currentRef = useRef<Current | null>(null);
  const sampleSequenceRef = useRef(0);
  const callSequenceRef = useRef(0);
  const refreshAtRef = useRef(0);
  const resumeRef = useRef<() => void>(() => {});

  useEffect(() => {
    setEnabled(new URLSearchParams(window.location.search).get(DEBUG_QUERY_NAME) === DEBUG_QUERY_VALUE);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let frameId = 0;
    const startedAt = performance.now();
    const originalScrollTo = window.scrollTo;
    const refresh = () => {
      refreshAtRef.current = performance.now();
      setSnapshot({
        current: currentRef.current,
        samples: [...samplesRef.current],
        calls: [...callsRef.current],
      });
    };
    const wrappedScrollTo = function (this: Window, ...args: unknown[]) {
      const before = (() => {
        try {
          return window.scrollY;
        } catch {
          return Number.NaN;
        }
      })();
      const result = Reflect.apply(originalScrollTo, this, args);
      try {
        if (!pausedRef.current) {
          const now = performance.now();
          callsRef.current = [
            ...callsRef.current,
            {
              id: ++callSequenceRef.current,
              timestamp: timestamp(now, startedAt),
              arguments: scrollToArguments(args),
              before,
              after: (() => {
                try {
                  return window.scrollY;
                } catch {
                  return Number.NaN;
                }
              })(),
            },
          ].slice(-CALL_LIMIT);
          if (now - refreshAtRef.current >= UI_REFRESH_MS) refresh();
        }
      } catch {
        // 진단 기록 실패는 원래 scrollTo 호출 결과에 영향을 주지 않는다.
      }
      return result;
    } as unknown as typeof window.scrollTo;
    window.scrollTo = wrappedScrollTo;

    const tick = () => {
      if (pausedRef.current) return;
      const now = performance.now();
      const current = readCurrent(now, startedAt);
      currentRef.current = current;
      const bottomStart = Math.max(0, current.maxScrollRaw - window.innerHeight * BOTTOM_VIEWPORT_MULTIPLIER);
      samplesRef.current = samplesRef.current.filter((item) => now - item.capturedAt <= SAMPLE_WINDOW_MS);
      if (current.scrollY >= bottomStart) {
        samplesRef.current = [
          ...samplesRef.current,
          readSample(current, now, ++sampleSequenceRef.current),
        ].slice(-SAMPLE_LIMIT);
      }
      if (now - refreshAtRef.current >= UI_REFRESH_MS) refresh();
      frameId = requestAnimationFrame(tick);
    };
    const resume = () => {
      if (!pausedRef.current) return;
      pausedRef.current = false;
      samplesRef.current = [];
      callsRef.current = [];
      currentRef.current = null;
      setSnapshot(emptySnapshot);
      frameId = requestAnimationFrame(tick);
    };
    resumeRef.current = resume;
    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      if (window.scrollTo === wrappedScrollTo) window.scrollTo = originalScrollTo;
      resumeRef.current = () => {};
    };
  }, [enabled]);

  if (!enabled) return null;

  const togglePause = () => {
    if (paused) {
      resumeRef.current();
      setSelectedSampleIndex(0);
      setPaused(false);
      return;
    }
    pausedRef.current = true;
    const frozenSamples = [...samplesRef.current];
    setSnapshot({ current: currentRef.current, samples: frozenSamples, calls: [...callsRef.current] });
    setSelectedSampleIndex(Math.max(0, frozenSamples.length - 1));
    setPaused(true);
  };
  const selectedSample = paused ? snapshot.samples[selectedSampleIndex] : snapshot.samples.at(-1);
  const liveSamples = spreadRecentSamples(snapshot.samples);

  return (
    <aside
      aria-live="polite"
      style={{
        position: "fixed",
        right: 8,
        bottom: 8,
        zIndex: 9999,
        width: "min(360px, calc(100vw - 16px))",
        maxHeight: "48vh",
        overflowY: paused ? "auto" : "hidden",
        pointerEvents: paused ? "auto" : "none",
        border: "1px solid #94a3b8",
        borderRadius: 8,
        background: "rgba(15, 23, 42, 0.94)",
        color: "#f8fafc",
        padding: 8,
        fontFamily: "var(--font-jbmono), monospace",
        fontSize: 11,
        lineHeight: 1.35,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <strong>스크롤 진단 ({paused ? "일시정지" : "수집 중"})</strong>
        <button type="button" onClick={togglePause} style={{ pointerEvents: "auto", color: "#0f172a" }}>
          {paused ? "재개 (기록 초기화)" : "일시정지"}
        </button>
      </div>
      <p style={{ margin: "6px 0" }}>진단 오버레이는 성능에 영향을 줄 수 있습니다. 일반 URL과 비교하세요. 원인 판별기가 아닌 증거 수집입니다.</p>
      {snapshot.current ? (
        <div>
          <strong>현재 scroll bounds</strong>
          <div>{snapshot.current.timestamp} scrollY={number(snapshot.current.scrollY)} maxScroll(raw)={number(snapshot.current.maxScrollRaw)} ({snapshot.current.range})</div>
        </div>
      ) : (
        <div>하단 표본 대기 중 (측정 불가 값은 그대로 표시됩니다)</div>
      )}
      {paused && snapshot.samples.length > 0 && (
        <label style={{ display: "block", marginTop: 6 }}>
          동결 표본 {selectedSampleIndex + 1}/{snapshot.samples.length}
          <input
            type="range"
            min="0"
            max={snapshot.samples.length - 1}
            value={selectedSampleIndex}
            onChange={(event) => setSelectedSampleIndex(Number(event.target.value))}
            style={{ display: "block", width: "100%" }}
          />
        </label>
      )}
      {selectedSample ? (
        <div style={{ marginTop: 6 }}>
          <strong>{paused ? "선택 표본" : "마지막 기록 표본"}</strong>
          <div>{selectedSample.timestamp} y={number(selectedSample.scrollY)} max(raw)={number(selectedSample.maxScrollRaw)} ({selectedSample.range})</div>
          <div>scrollingElement {selectedSample.scrollingElement}</div>
          <div>documentElement {selectedSample.documentElement}</div>
          <div>innerHeight={number(selectedSample.innerHeight)} visualViewport {selectedSample.visualViewport}</div>
          <div>#fc-scroll-cap {selectedSample.cap}</div>
          <div>ShareContact {selectedSample.shareContact}</div>
        </div>
      ) : (
        <div style={{ marginTop: 6 }}>마지막 기록 표본 없음</div>
      )}
      {!paused && (
        <div style={{ marginTop: 6 }}>
          <strong>기록 구간 표본 ({liveSamples.length}/{snapshot.samples.length || SAMPLE_LIMIT})</strong>
          {liveSamples.length ? liveSamples.map((sample) => <div key={sample.id}>{sample.timestamp} y={number(sample.scrollY)} max(raw)={number(sample.maxScrollRaw)} {sample.range} vv={sample.visualViewport}</div>) : <div>대기 중</div>}
        </div>
      )}
      <div style={{ marginTop: 6 }}>
        <strong>{paused ? "동결 scrollTo 호출" : "최근 scrollTo 호출"} ({snapshot.calls.length}/{CALL_LIMIT})</strong>
        {snapshot.calls.length ? snapshot.calls.map((call) => <div key={call.id}>{call.timestamp} {call.arguments} before={number(call.before)} after={number(call.after)}</div>) : <div>없음 — 모든 imperative 이동 부재의 증명은 아님</div>}
      </div>
    </aside>
  );
}
