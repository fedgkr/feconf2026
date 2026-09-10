"use client";

import {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import ClickFrame from "../ClickFrame";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import {
  SCHEDULE,
  SCHEDULE_GROUPS,
  type Hall,
  type Session,
} from "@/data/site";

type TimeScheduleItem = {
  id: string;
  minute: number;
  label: string;
  snapId: string;
  isHour: boolean;
  isSessionStart: boolean;
  boundary?: "start" | "finish";
};
type TimeScheduleSelection = {
  id: string;
  minute: number;
  label: string;
  sessions: Session[];
};

const TIME_SCHEDULE_ROWS = SCHEDULE_GROUPS.flatMap((group) => group.rows);
const TIME_SCHEDULE_SPACES: Array<{
  id: string;
  title: string;
  badge: string;
  halls: Hall[];
}> = [
  {
    id: "auditorium",
    title: "Auditorium",
    badge: "session A",
    halls: ["A Auditorium"],
  },
  {
    id: "b-hall",
    title: "Conference B",
    badge: "session B",
    halls: ["B Hall"],
  },
  {
    id: "lightning",
    title: "Conference A",
    badge: "TALK 1 · TALK 2 · NETWORKING",
    halls: ["Talk 1", "Talk 2", "Networking"],
  },
];
const TIMEFLOW_TICK_STEP = 12;
const TIMEFLOW_GHOST_TICK_COUNT = 24;

function hasDetail(session: Session) {
  return Boolean(session.description || session.tags?.length);
}

function parseTime(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function parseRange(range: string) {
  const [start, end] = range.split("~");
  return { start: parseTime(start), end: parseTime(end) };
}

function formatRange(range: string) {
  return range.replace("~", " - ");
}

function formatMinute(minute: number) {
  const hourLabel = String(Math.floor(minute / 60)).padStart(2, "0");
  const minuteLabel = String(minute % 60).padStart(2, "0");

  return `${hourLabel}:${minuteLabel}`;
}

function timeScheduleStartMinutes() {
  return Array.from(
    new Set(
      TIME_SCHEDULE_ROWS.filter(
        (row) =>
          row.kind !== "break" &&
          row.sessions.some((session) => Boolean(session)),
      ).map((row) => parseRange(row.time).start),
    ),
  ).sort((a, b) => a - b);
}

function timeScheduleFinishMinute() {
  return TIME_SCHEDULE_ROWS.reduce((latest, row) => {
    if (row.kind === "break" || !row.sessions.some(Boolean)) return latest;

    return Math.max(latest, parseRange(row.time).end);
  }, 0);
}

function nearestTimeScheduleStart(minute: number, starts: number[]) {
  return starts.reduce((nearest, candidate) => {
    const nearestDistance = Math.abs(nearest - minute);
    const candidateDistance = Math.abs(candidate - minute);

    if (candidateDistance === nearestDistance) {
      return candidate < nearest ? candidate : nearest;
    }

    return candidateDistance < nearestDistance ? candidate : nearest;
  }, starts[0]);
}

function sessionsAtTimeScheduleMinute(minute: number) {
  return TIME_SCHEDULE_ROWS.flatMap((row) => {
    if (row.kind === "break") return [];

    return row.sessions
      .filter((session): session is Session => Boolean(session))
      .filter((session) => {
        const range = parseRange(session.time);

        return range.start <= minute && minute < range.end;
      });
  });
}

function timeScheduleSelection(minute: number): TimeScheduleSelection {
  return {
    id: String(minute),
    minute,
    label: formatMinute(minute),
    sessions: sessionsAtTimeScheduleMinute(minute),
  };
}

function timeScheduleItems(): TimeScheduleItem[] {
  const starts = timeScheduleStartMinutes();
  if (starts.length === 0) return [];

  const finishMinute = timeScheduleFinishMinute();
  const firstHour = Math.floor(starts[0] / 60) * 60;
  const lastHour = Math.ceil(finishMinute / 60) * 60;
  const tickCount = Math.floor((lastHour - firstHour) / TIMEFLOW_TICK_STEP);
  const tickMinutes = Array.from(
    new Set([
      ...Array.from(
        { length: tickCount + 1 },
        (_, index) => firstHour + index * TIMEFLOW_TICK_STEP,
      ),
      ...starts,
      finishMinute,
    ]),
  ).sort((a, b) => a - b);

  return tickMinutes.map((minute) => {
    const snapMinute = nearestTimeScheduleStart(minute, starts);

    return {
      id: String(minute),
      minute,
      label: minute % 60 === 0 ? formatMinute(minute) : "",
      snapId: String(snapMinute),
      isHour: minute % 60 === 0,
      isSessionStart: starts.includes(minute),
      boundary:
        minute === starts[0]
          ? "start"
          : minute === finishMinute
            ? "finish"
            : undefined,
    };
  });
}

function TimeflowChevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function TimeSpaceCard({
  title,
  badge,
  sessions,
}: {
  title: string;
  badge: string;
  sessions: Session[];
}) {
  const isBreak = sessions.length === 0;
  const [expandedSessionIds, setExpandedSessionIds] = useState<string[]>([]);
  const firstSession = sessions[0];
  const firstSessionId =
    firstSession && hasDetail(firstSession)
      ? `${firstSession.hall}-${firstSession.time}-${firstSession.title}`
      : null;
  const firstSessionExpanded = firstSessionId
    ? expandedSessionIds.includes(firstSessionId)
    : false;
  const toggleSession = (sessionId: string) => {
    setExpandedSessionIds((current) =>
      current.includes(sessionId)
        ? current.filter((id) => id !== sessionId)
        : [...current, sessionId],
    );
  };

  return (
    <article className={`sched-timeflow-space ${isBreak ? "is-break" : ""}`}>
      <div className="sched-timeflow-space-head">
        <p>{title}</p>
        <span>{badge}</span>
        {firstSessionId && (
          <>
            <span
              className={`sched-timeflow-session-state ${
                firstSessionExpanded ? "is-expanded" : ""
              }`}
              aria-hidden="true"
            >
              <TimeflowChevron />
            </span>
            <button
              type="button"
              className="sched-timeflow-space-head-toggle"
              aria-expanded={firstSessionExpanded}
              aria-label={`${firstSession.title} ${
                firstSessionExpanded ? "설명 접기" : "설명 보기"
              }`}
              onClick={() => toggleSession(firstSessionId)}
            />
          </>
        )}
      </div>
      {isBreak ? (
        <div className="sched-timeflow-empty">Break Time</div>
      ) : (
        <div className="sched-timeflow-space-stack">
          {sessions.map((session, index) => {
            const sessionId = `${session.hall}-${session.time}-${session.title}`;
            const detailVisible = hasDetail(session);
            const expanded = expandedSessionIds.includes(sessionId);

            return (
              <div
                key={`timeflow-${sessionId}`}
                className={`sched-timeflow-session ${
                  expanded ? "is-expanded" : ""
                }`}
                data-session-start-minute={parseRange(session.time).start}
              >
                <span className="sched-timeflow-session-time">
                  {formatRange(session.time)}
                </span>
                <div className="sched-timeflow-session-summary">
                  <h4>{session.title}</h4>
                </div>
                {(session.speaker || session.affiliation) && (
                  <p className="sched-timeflow-speaker">
                    {[session.speaker, session.affiliation]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                <div className="sched-timeflow-session-details">
                  {session.audience && (
                    <p className="sched-timeflow-audience">
                      이런 분께 추천: {session.audience}
                    </p>
                  )}
                  {session.description && (
                    <p className="sched-timeflow-desc">{session.description}</p>
                  )}
                </div>
                {index > 0 && detailVisible && (
                  <span
                    className="sched-timeflow-session-state"
                    aria-hidden="true"
                  >
                    <TimeflowChevron />
                  </span>
                )}
                {detailVisible && (
                  <button
                    type="button"
                    className="sched-timeflow-session-toggle"
                    aria-expanded={expanded}
                    aria-label={`${session.title} ${expanded ? "설명 접기" : "설명 보기"}`}
                    onClick={() => toggleSession(sessionId)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

function TimeflowDetailContent({ item }: { item: TimeScheduleSelection }) {
  return (
    <>
      <div className="sched-timeflow-active">
        <div className="sched-timeflow-active-copy">
          <span>Selected Time</span>
          <p>{item.label}</p>
        </div>
      </div>
      <div key={item.id} className="sched-timeflow-spaces is-vertical">
        {TIME_SCHEDULE_SPACES.map((space) => {
          const sessions = item.sessions.filter((session) =>
            space.halls.includes(session.hall),
          );

          return (
            <TimeSpaceCard
              key={space.id}
              title={space.title}
              badge={space.badge}
              sessions={sessions}
            />
          );
        })}
      </div>
    </>
  );
}

function TimeflowGhostTicks({
  minutes,
  direction,
}: {
  minutes: number[];
  direction: "before" | "after";
}) {
  return (
    <div className={`sched-timeflow-ghost is-${direction}`} aria-hidden="true">
      {minutes.map((minute) => (
        <span
          key={`ghost-tick-${minute}`}
          className={`${minute % 60 === 0 ? "is-hour" : ""} ${
            minute < 10 * 60 ? "is-before-mobile-start" : ""
          }`}
        >
          {minute % 60 === 0 ? formatMinute(minute) : ""}
        </span>
      ))}
    </div>
  );
}

function TimeScheduleView() {
  const items = useMemo(() => timeScheduleItems(), []);
  const starts = useMemo(() => timeScheduleStartMinutes(), []);
  const ghostTicks = useMemo(() => {
    const firstMinute = items[0]?.minute ?? 0;
    const lastMinute = items[items.length - 1]?.minute ?? 0;

    return {
      before: Array.from(
        { length: TIMEFLOW_GHOST_TICK_COUNT },
        (_, index) =>
          firstMinute -
          (TIMEFLOW_GHOST_TICK_COUNT - index) * TIMEFLOW_TICK_STEP,
      ),
      after: Array.from(
        { length: TIMEFLOW_GHOST_TICK_COUNT },
        (_, index) => lastMinute + (index + 1) * TIMEFLOW_TICK_STEP,
      ),
    };
  }, [items]);
  const sizingItem = useMemo(
    () =>
      starts
        .map(timeScheduleSelection)
        .reduce<TimeScheduleSelection | null>(
          (largest, item) =>
            !largest || item.sessions.length > largest.sessions.length
              ? item
              : largest,
          null,
        ),
    [starts],
  );
  const listRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const timeflowRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<number | null>(null);
  const scrollSequenceStartId = useRef<string | null>(null);
  // built once from the rendered ticks, then reused by every scroll/click
  // lookup instead of re-querying the DOM per item
  const itemElsRef = useRef<Map<number, HTMLElement>>(new Map());
  const dragState = useRef<{
    pointerId: number;
    startY: number;
    startScrollTop: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const [activeId, setActiveId] = useState(starts[0] ? String(starts[0]) : "");
  const activeIdRef = useRef(activeId);
  const [isDragging, setIsDragging] = useState(false);
  const activeMinute = Number(activeId || starts[0]);
  const activeItem = useMemo(
    () => (starts.length ? timeScheduleSelection(activeMinute) : null),
    [activeMinute, starts.length],
  );

  const scrollMinuteToCenter = useCallback(
    (minute: number, behavior: ScrollBehavior = "smooth") => {
      const list = listRef.current;
      const target = itemElsRef.current.get(minute);

      if (!list || !target) return;

      list.scrollTo({
        top: target.offsetTop - list.clientHeight / 2 + target.offsetHeight / 2,
        behavior,
      });
    },
    [],
  );

  useEffect(() => {
    const measure = measureRef.current;
    const timeflow = timeflowRef.current;
    if (!measure || !timeflow || !sizingItem) return;

    const syncMobileContentHeight = () => {
      if (measure.offsetWidth === 0) return;

      timeflow.style.setProperty(
        "--sched-mobile-content-height",
        `${measure.scrollHeight}px`,
      );
    };

    syncMobileContentHeight();

    const resizeObserver = new ResizeObserver(syncMobileContentHeight);
    resizeObserver.observe(measure);

    return () => resizeObserver.disconnect();
  }, [sizingItem]);

  useEffect(() => {
    const list = listRef.current;
    const firstItem = list?.querySelector<HTMLElement>(".sched-timeflow-item");
    if (!list || !firstItem || !starts[0]) return;

    const syncGhostHeight = (preservePosition: boolean) => {
      const previousHeight = Number.parseFloat(
        list.style.getPropertyValue("--sched-timeflow-ghost-height"),
      );
      const nextHeight = Math.max(
        0,
        list.clientHeight / 2 - firstItem.offsetHeight / 2,
      );

      list.style.setProperty(
        "--sched-timeflow-ghost-height",
        `${nextHeight}px`,
      );

      if (preservePosition && Number.isFinite(previousHeight)) {
        list.scrollTop += nextHeight - previousHeight;
      }
    };

    syncGhostHeight(false);
    scrollMinuteToCenter(starts[0], "auto");

    const resizeObserver = new ResizeObserver(() => syncGhostHeight(true));
    resizeObserver.observe(list);

    return () => resizeObserver.disconnect();
  }, [starts, scrollMinuteToCenter]);

  useEffect(() => {
    return () => {
      if (scrollTimer.current) {
        window.clearTimeout(scrollTimer.current);
      }
    };
  }, []);

  const updateTimeflowFromScroll = (shouldSnap: boolean) => {
    const list = listRef.current;
    if (!list || starts.length === 0) return;

    if (scrollSequenceStartId.current === null) {
      scrollSequenceStartId.current = activeIdRef.current;
    }

    const center = list.scrollTop + list.clientHeight / 2;
    const closest = items.reduce(
      (nearest, item) => {
        const target = itemElsRef.current.get(item.minute);
        if (!target) return nearest;

        const distance = Math.abs(
          target.offsetTop + target.offsetHeight / 2 - center,
        );

        return distance < nearest.distance ? { item, distance } : nearest;
      },
      {
        item: items[0],
        distance: Number.POSITIVE_INFINITY,
      },
    ).item;
    const snapMinute = Number(closest.snapId);
    const snapId = String(snapMinute);

    activeIdRef.current = snapId;
    setActiveId(snapId);

    if (scrollTimer.current) {
      window.clearTimeout(scrollTimer.current);
    }

    if (!shouldSnap) return;

    scrollTimer.current = window.setTimeout(() => {
      const selectionChanged = scrollSequenceStartId.current !== snapId;

      scrollSequenceStartId.current = null;
      scrollTimer.current = null;

      if (selectionChanged) {
        scrollMinuteToCenter(snapMinute);
      }
    }, 120);
  };

  const handleTimeflowScroll = () => {
    updateTimeflowFromScroll(!dragState.current);
  };

  const handleTimeflowPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const list = listRef.current;
    if (!list || (event.pointerType === "mouse" && event.button !== 0)) return;

    if (scrollTimer.current) {
      window.clearTimeout(scrollTimer.current);
    }

    scrollSequenceStartId.current = activeIdRef.current;
    dragState.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startScrollTop: list.scrollTop,
      moved: false,
    };
    setIsDragging(true);
    list.setPointerCapture(event.pointerId);
  };

  const handleTimeflowPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const list = listRef.current;
    const drag = dragState.current;
    if (!list || !drag || drag.pointerId !== event.pointerId) return;

    const deltaY = event.clientY - drag.startY;

    if (Math.abs(deltaY) > 3) {
      drag.moved = true;
      suppressClick.current = true;
    }

    list.scrollTop = drag.startScrollTop - deltaY;
  };

  const handleTimeflowPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const list = listRef.current;
    const drag = dragState.current;
    if (!list || !drag || drag.pointerId !== event.pointerId) return;

    dragState.current = null;
    setIsDragging(false);
    if (list.hasPointerCapture(event.pointerId)) {
      list.releasePointerCapture(event.pointerId);
    }
    updateTimeflowFromScroll(true);
  };

  const handleTimeflowPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    const list = listRef.current;
    if (list?.hasPointerCapture(event.pointerId)) {
      list.releasePointerCapture(event.pointerId);
    }

    dragState.current = null;
    setIsDragging(false);
    updateTimeflowFromScroll(true);
  };

  return (
    <Reveal
      delay={100}
      threshold={0.01}
      className="sched-wrap sched-timeflow-wrap"
    >
      {!activeItem ? (
        <div className="sched-empty-message">아직 공개된 세션이 없습니다.</div>
      ) : (
        <div ref={timeflowRef} className="sched-timeflow">
          <div className="sched-timeflow-detail">
            <TimeflowDetailContent item={activeItem} />
            {sizingItem && (
              <div
                ref={measureRef}
                className="sched-timeflow-mobile-measure"
                aria-hidden="true"
              >
                <TimeflowDetailContent item={sizingItem} />
              </div>
            )}
          </div>
          <div className="sched-timeflow-control">
            <div
              ref={listRef}
              className={`sched-timeflow-list ${
                isDragging ? "is-dragging" : ""
              }`}
              aria-label="시간대 선택"
              onScroll={handleTimeflowScroll}
              onPointerDown={handleTimeflowPointerDown}
              onPointerMove={handleTimeflowPointerMove}
              onPointerUp={handleTimeflowPointerUp}
              onPointerCancel={handleTimeflowPointerCancel}
            >
              <TimeflowGhostTicks
                minutes={ghostTicks.before}
                direction="before"
              />
              {items.map((item) => {
                const selected = item.minute === activeMinute;

                return (
                  <button
                    key={item.id}
                    ref={(el) => {
                      if (el) itemElsRef.current.set(item.minute, el);
                      else itemElsRef.current.delete(item.minute);
                    }}
                    type="button"
                    className={`sched-timeflow-item ${
                      item.isHour ? "is-hour" : "is-minute"
                    } ${item.isSessionStart ? "is-session-start" : ""} ${
                      selected ? "is-active" : ""
                    }`}
                    aria-pressed={selected}
                    aria-label={`${formatMinute(item.minute)} 눈금`}
                    data-minute={item.minute}
                    onClick={() => {
                      if (suppressClick.current) {
                        suppressClick.current = false;
                        return;
                      }

                      activeIdRef.current = item.snapId;
                      setActiveId(item.snapId);
                      scrollMinuteToCenter(Number(item.snapId));
                    }}
                  >
                    {item.boundary && (
                      <em
                        className={`sched-timeflow-boundary is-${item.boundary}`}
                      >
                        {item.boundary === "start" ? "start" : "finish"}
                      </em>
                    )}
                    <span>
                      {selected ? formatMinute(item.minute) : item.label}
                    </span>
                  </button>
                );
              })}
              <TimeflowGhostTicks
                minutes={ghostTicks.after}
                direction="after"
              />
            </div>
          </div>
        </div>
      )}
    </Reveal>
  );
}

export default function ScheduleSection() {
  return (
    <section
      id="sessions"
      data-nav-bg="#ffffff"
      className="relative isolate z-20 min-h-screen bg-white px-6 py-24 max-sm:px-5 sm:py-36"
    >
      <div className="sched-section-inner mx-auto max-w-[1366px]">
        <SectionHeading
          title={SCHEDULE.heading.title}
          subtitle={SCHEDULE.heading.subtitle}
          className="sched-section-heading"
          revealOnEntry
        />
        <div className="sched-section-stage mx-auto max-w-[1366px]">
          <TimeScheduleView />
        </div>
        <Reveal delay={200} className="sched-download-cta flex justify-center">
          <ClickFrame
            label={SCHEDULE.download.label}
            href={SCHEDULE.download.href}
            icon="download"
            download="FullSchedule.png"
          />
          <p className="sched-download-note">{SCHEDULE.download.notice}</p>
        </Reveal>
      </div>
    </section>
  );
}
