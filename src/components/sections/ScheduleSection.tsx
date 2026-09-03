"use client";

import {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import ClickFrame from "../ClickFrame";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import { useInView } from "@/hooks/useAnimation";
import { useManagedVideo } from "@/hooks/useMedia";
import {
  HALL_COLOR,
  HERO,
  SCHEDULE,
  SCHEDULE_GROUPS,
  type Hall,
  type ScheduleRow,
  type Session,
} from "@/data/site";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/** per-row entrance delay: the header row settles first, then row by row */
const rowDelay = (row: number) => 120 + row * 80;

type SessionListGroupId = "auditorium" | "b-hall" | "lightning";
type ScheduleTopic = (typeof SCHEDULE_TOPIC_FILTERS)[number];
type TopicFilter = "all" | ScheduleTopic;
type TimeScheduleItem = {
  id: string;
  minute: number;
  label: string;
  snapId: string;
  isHour: boolean;
  isSessionStart: boolean;
  boundary?: "start" | "finish";
};
type SessionListItem = {
  id: string;
  time: string;
  kind?: "break";
  sessions: Session[];
};
type SessionListGroup = {
  id: SessionListGroupId;
  title: string;
  badge: string;
  description: string;
  items: SessionListItem[];
};

const MAIN_GROUP = SCHEDULE_GROUPS.find((group) => group.id === "main");
const LIGHTNING_GROUP = SCHEDULE_GROUPS.find((group) => group.id === "lightning");
const OVERVIEW_COLUMNS = ["session A", "session B", "Talk 1", "Talk 2"] as const;
const SCHEDULE_TOPIC_FILTERS = [
  "AI 제품",
  "React Native",
  "아키텍처",
  "테스트",
  "디자인 시스템",
  "성능",
  "웹 플랫폼",
  "개발자 경험",
  "제품 판단",
] as const;
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
    badge: "Talk 1 · Talk 2",
    halls: ["Talk 1", "Talk 2"],
  },
];
const TIMETABLE_START = 11 * 60;
const TIMETABLE_END = 17 * 60;
const TIMETABLE_STEP = 5;
const TIMETABLE_SLOTS = (TIMETABLE_END - TIMETABLE_START) / TIMETABLE_STEP;
const TIMEFLOW_TICK_STEP = 12;

function fadeIn(inView: boolean, delay: number): CSSProperties {
  return {
    opacity: inView ? 1 : 0,
    transition: `opacity 700ms ${EASE} ${delay}ms`,
  };
}

function hallBadge(hall: Hall) {
  if (hall === "A Auditorium") return "A";
  if (hall === "B Hall") return "B";
  return hall === "Talk 1" ? "1" : "2";
}

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

function timetablePlacement(
  range: string,
  column: number,
  columnSpan = 1,
  rowSpanBoost = 0,
): CSSProperties {
  const { start, end } = parseRange(range);
  const rowStart = 2 + (start - TIMETABLE_START) / TIMETABLE_STEP;
  const rowSpan = Math.max(1, (end - start) / TIMETABLE_STEP) + rowSpanBoost;

  return {
    gridColumn: `${column} / span ${columnSpan}`,
    gridRow: `${rowStart} / span ${rowSpan}`,
  };
}

function rowsForHall(hall: Hall): ScheduleRow[] {
  if (!MAIN_GROUP) return [];
  const hallIndex = MAIN_GROUP.halls.indexOf(hall);
  if (hallIndex < 0) return [];

  return MAIN_GROUP.rows.map((row) => {
    const session = row.sessions[hallIndex];

    return session
      ? { ...row, sessions: [session] }
      : {
          time: row.time,
          kind: "break" as const,
          sessions: [],
        };
  });
}

function sessionMatchesTopic(session: Session, selectedTopic: TopicFilter) {
  if (selectedTopic === "all") return true;

  return Boolean(session.topics?.includes(selectedTopic));
}

function overviewIdForSession(session: Session) {
  return `${session.hall}-${session.time}-${session.title}`;
}

function sessionsFromRows(rows: ScheduleRow[]) {
  return rows.flatMap((row) =>
    row.kind === "break"
      ? []
      : row.sessions.filter((session): session is Session => Boolean(session)),
  );
}

function allScheduleSessions() {
  return SCHEDULE_GROUPS.flatMap((group) => sessionsFromRows(group.rows));
}

function sessionsForTopic(selectedTopic: TopicFilter) {
  if (selectedTopic === "all") return [];

  return allScheduleSessions()
    .filter((session) => sessionMatchesTopic(session, selectedTopic))
    .sort((a, b) => parseRange(a.time).start - parseRange(b.time).start);
}

function firstOverviewIdForTopic(selectedTopic: TopicFilter) {
  const firstSession = sessionsForTopic(selectedTopic)[0];

  return firstSession ? overviewIdForSession(firstSession) : null;
}

function timeScheduleStartMinutes() {
  const rows = [MAIN_GROUP?.rows ?? [], LIGHTNING_GROUP?.rows ?? []].flat();

  return Array.from(
    new Set(
      rows
        .filter(
          (row) =>
            row.kind !== "break" &&
            row.sessions.some((session) => Boolean(session)),
        )
        .map((row) => parseRange(row.time).start),
    ),
  ).sort((a, b) => a - b);
}

function timeScheduleFinishMinute() {
  const rows = [MAIN_GROUP?.rows ?? [], LIGHTNING_GROUP?.rows ?? []].flat();

  return rows.reduce((latest, row) => {
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

function sessionsForTimeScheduleMinute(minute: number) {
  const rows = [MAIN_GROUP?.rows ?? [], LIGHTNING_GROUP?.rows ?? []].flat();

  return rows.flatMap((row) => {
    if (row.kind === "break") return [];

    const { start, end } = parseRange(row.time);

    if (start > minute || end <= minute) return [];

    return row.sessions.filter((session): session is Session =>
      Boolean(session),
    );
  });
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

function sessionTitle(item: SessionListItem) {
  if (item.kind === "break") return "Break Time";

  return item.sessions.map((session) => session.title).join(" / ");
}

function sessionSpeaker(item: SessionListItem) {
  if (item.kind === "break") return "휴식 및 이동 시간";

  return item.sessions.map((session) => session.speaker).join(" · ");
}

function uniqueSessionValues(
  item: SessionListItem,
  field: "affiliation" | "audience",
) {
  return Array.from(
    new Set(item.sessions.map((session) => session[field]).filter(Boolean)),
  ).join(" · ");
}

function listItemsForHall(hall: Hall): SessionListItem[] {
  return rowsForHall(hall).map((row) => {
    const session = row.sessions[0];

    return session
      ? {
          id: `${hall}-${session.time}`,
          time: session.time,
          sessions: [session],
        }
      : {
          id: `${hall}-${row.time}-break`,
          time: row.time,
          kind: "break" as const,
          sessions: [],
        };
  });
}

function lightningListItems(): SessionListItem[] {
  if (!LIGHTNING_GROUP) return [];

  return LIGHTNING_GROUP.rows.flatMap((row) => {
    if (row.kind === "break") {
      return [
        {
          id: `lightning-${row.time}-break`,
          time: row.time,
          kind: "break" as const,
          sessions: [],
        },
      ];
    }

    const sessions = row.sessions.filter((session): session is Session =>
      Boolean(session),
    );

    return sessions.length
      ? [{ id: `lightning-${row.time}`, time: row.time, sessions }]
      : [];
  });
}

function sessionListGroups(): SessionListGroup[] {
  return [
    {
      id: "auditorium",
      title: "A Auditorium",
      badge: "session A",
      description: "A 오디토리움에서 진행되는 메인 세션을 시간 순서대로 보여줍니다.",
      items: listItemsForHall("A Auditorium"),
    },
    {
      id: "b-hall",
      title: "B Hall",
      badge: "session B",
      description: "B Hall에서 진행되는 메인 세션을 시간 순서대로 보여줍니다.",
      items: listItemsForHall("B Hall"),
    },
    {
      id: "lightning",
      title: "Lightning Talk",
      badge: "Talk 1 · Talk 2",
      description: "같은 시간대에 함께 열리는 라이트닝톡 두 발표를 묶어 보여줍니다.",
      items: lightningListItems(),
    },
  ];
}

function defaultSessionListItem(items: SessionListItem[]) {
  return items.find((item) => item.kind !== "break") ?? items[0];
}

function TopicRail({
  selectedTopic,
  onSelect,
}: {
  selectedTopic: TopicFilter;
  onSelect: (topic: TopicFilter) => void;
}) {
  const topics: Array<{ id: TopicFilter; label: string }> = [
    { id: "all", label: "전체" },
    ...SCHEDULE_TOPIC_FILTERS.map((topic) => ({ id: topic, label: topic })),
  ];

  return (
    <Reveal delay={25} threshold={0.01}>
      <div className="sched-topic-rail" aria-label="추천 주제 필터">
        <span className="sched-topic-kicker">이런 분께 추천</span>
        <div className="sched-topic-viewport">
          <div
            className={`sched-topic-track ${
              selectedTopic === "all" ? "" : "is-paused"
            }`}
          >
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                className={`sched-topic-chip ${
                  selectedTopic === topic.id ? "is-active" : ""
                }`}
                aria-pressed={selectedTopic === topic.id}
                onClick={() => onSelect(topic.id)}
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
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

  return (
    <article className={`sched-timeflow-space ${isBreak ? "is-break" : ""}`}>
      <div className="sched-timeflow-space-head">
        <p>{title}</p>
        <span>{badge}</span>
      </div>
      {isBreak ? (
        <div className="sched-timeflow-empty">Break Time</div>
      ) : (
        <div className="sched-timeflow-space-stack">
          {sessions.map((session) => (
            <div
              key={`timeflow-${session.hall}-${session.time}-${session.title}`}
              className="sched-timeflow-session"
            >
              <span className="sched-timeflow-session-time">
                {formatRange(session.time)}
              </span>
              <h4>{session.title}</h4>
              <p className="sched-timeflow-speaker">
                {session.speaker}
                {session.affiliation ? ` · ${session.affiliation}` : ""}
              </p>
              {session.audience && (
                <p className="sched-timeflow-audience">
                  이런 분께 추천: {session.audience}
                </p>
              )}
              {session.description && (
                <p className="sched-timeflow-desc">{session.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function TimeflowGhostTicks({
  minutes,
}: {
  minutes: number[];
}) {
  return (
    <div className="sched-timeflow-ghost" aria-hidden="true">
      {minutes.map((minute) => (
        <span
          key={`ghost-tick-${minute}`}
          className={minute % 60 === 0 ? "is-hour" : ""}
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
        { length: 7 },
        (_, index) => firstMinute - (7 - index) * TIMEFLOW_TICK_STEP,
      ),
      after: Array.from(
        { length: 7 },
        (_, index) => lastMinute + (index + 1) * TIMEFLOW_TICK_STEP,
      ),
    };
  }, [items]);
  const listRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<number | null>(null);
  const dragState = useRef<{
    pointerId: number;
    startY: number;
    startScrollTop: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const [activeId, setActiveId] = useState(starts[0] ? String(starts[0]) : "");
  const [isDragging, setIsDragging] = useState(false);
  const activeMinute = Number(activeId || starts[0]);
  const activeItem = starts.length
    ? {
        id: String(activeMinute),
        minute: activeMinute,
        label: formatMinute(activeMinute),
        sessions: sessionsForTimeScheduleMinute(activeMinute),
      }
    : null;

  const scrollMinuteToCenter = useCallback((
    minute: number,
    behavior: ScrollBehavior = "smooth",
  ) => {
    const list = listRef.current;
    const target = list?.querySelector<HTMLElement>(
      `[data-minute="${minute}"]`,
    );

    if (!list || !target) return;

    list.scrollTo({
      top: target.offsetTop - list.clientHeight / 2 + target.offsetHeight / 2,
      behavior,
    });
  }, []);

  useEffect(() => {
    if (!starts[0]) return;

    scrollMinuteToCenter(starts[0], "auto");
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

    const center = list.scrollTop + list.clientHeight / 2;
    const closest = items.reduce((nearest, item) => {
      const target = list.querySelector<HTMLElement>(
        `[data-minute="${item.minute}"]`,
      );
      if (!target) return nearest;

      const distance = Math.abs(
        target.offsetTop + target.offsetHeight / 2 - center,
      );

      return distance < nearest.distance ? { item, distance } : nearest;
    }, {
      item: items[0],
      distance: Number.POSITIVE_INFINITY,
    }).item;
    const snapMinute = Number(closest.snapId);

    setActiveId(String(snapMinute));

    if (scrollTimer.current) {
      window.clearTimeout(scrollTimer.current);
    }

    if (!shouldSnap) return;

    scrollTimer.current = window.setTimeout(() => {
      scrollMinuteToCenter(snapMinute);
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
    <Reveal delay={100} threshold={0.01} className="sched-wrap sched-timeflow-wrap">
      {!activeItem ? (
        <div className="sched-empty-message">아직 공개된 세션이 없습니다.</div>
      ) : (
        <div className="sched-timeflow">
          <div className="sched-timeflow-detail">
            <div className="sched-timeflow-active">
              <div className="sched-timeflow-active-copy">
                <span>Selected Time</span>
                <p>{activeItem.label}</p>
              </div>
            </div>
            <div
              key={activeItem.id}
              className="sched-timeflow-spaces is-vertical"
            >
              {TIME_SCHEDULE_SPACES.map((space) => {
                const sessions = activeItem.sessions.filter((session) =>
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
              <TimeflowGhostTicks minutes={ghostTicks.before} />
              {items.map((item) => {
                const selected = item.minute === activeMinute;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`sched-timeflow-item ${
                      item.isHour ? "is-hour" : "is-minute"
                    } ${
                      item.isSessionStart ? "is-session-start" : ""
                    } ${
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

                      setActiveId(item.snapId);
                      scrollMinuteToCenter(Number(item.snapId));
                    }}
                >
                  {item.boundary && (
                    <em className={`sched-timeflow-boundary is-${item.boundary}`}>
                      {item.boundary === "start" ? "start" : "finish"}
                    </em>
                  )}
                  <span>{selected ? formatMinute(item.minute) : item.label}</span>
                </button>
              );
            })}
              <TimeflowGhostTicks minutes={ghostTicks.after} />
            </div>
          </div>
        </div>
      )}
    </Reveal>
  );
}

function SessionCard({
  session,
  active,
  inView,
  delay,
  mediaSrc,
  onToggle,
  compact = false,
}: {
  session: Session;
  active: boolean;
  inView: boolean;
  delay: number;
  mediaSrc?: string;
  onToggle: () => void;
  compact?: boolean;
}) {
  const color = HALL_COLOR[session.hall];
  const detailVisible = hasDetail(session);
  const [hovered, setHovered] = useState(false);
  // the video layer mounts on first touch, so 18 decoders never start at once
  const [everLit, setEverLit] = useState(false);
  const lit = hovered || active;
  const videoRef = useManagedVideo(lit);

  const light = () => {
    setHovered(true);
    setEverLit(true);
  };

  return (
    <div
      role={detailVisible ? "button" : undefined}
      tabIndex={detailVisible ? 0 : undefined}
      aria-expanded={detailVisible ? active : undefined}
      aria-label={detailVisible ? `${session.title} 상세 펼치기` : undefined}
      className={`session-card group relative flex min-w-0 flex-1 flex-col justify-between overflow-hidden p-6 ${
        active ? "is-active" : ""
      } ${detailVisible ? "cursor-pointer" : "cursor-default"} ${
        compact ? "sched-card-compact" : ""
      }`}
      style={{
        ...fadeIn(inView, delay),
        minHeight: compact ? 152 : 200,
        ["--badge-color" as string]: color,
      }}
      onClick={detailVisible ? onToggle : undefined}
      onKeyDown={(e) => {
        if (!detailVisible) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      onPointerEnter={light}
      onPointerLeave={() => setHovered(false)}
      onFocus={light}
      onBlur={() => setHovered(false)}
    >
      {/* hover flood: hall colour + the picked WEBM over it */}
      <div
        className="sched-flood absolute inset-0 opacity-0 transition-opacity duration-[260ms]"
        style={{
          backgroundColor: color,
          backgroundImage: `url(${HERO.posterSrc})`,
          backgroundBlendMode: "normal",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {(everLit || active) && mediaSrc && (
          <div className="sched-hover-media">
            <video
              ref={videoRef}
              src={mediaSrc}
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
      <div className="relative z-10 flex items-start justify-between">
        <div className="sched-speaker">
          <p className="sched-speaker-name text-[18px] font-medium leading-[1.4] text-navy/80">
            {session.speaker}
          </p>
          {session.affiliation && (
            <span className="sched-affiliation">{session.affiliation}</span>
          )}
        </div>
        <div className="sched-mark session-badge flex size-[50px] shrink-0 items-center justify-center text-[40px] font-bold leading-none text-white opacity-0 transition-opacity duration-[400ms]">
          {hallBadge(session.hall)}
        </div>
      </div>
      <p className="sched-title relative z-10 mt-4 text-[22px] font-semibold leading-[1.4] text-navy">
        {session.title}
      </p>
      {session.audience && (
        <p className="sched-audience-note relative z-10 mt-4">
          이런 분께 추천: {session.audience}
        </p>
      )}
      {detailVisible && (
        <div className="sched-detail" aria-hidden={!active}>
          {session.description && (
            <p className="sched-detail-desc">{session.description}</p>
          )}
          {!!session.tags?.length && (
            <div className="sched-detail-tags">
              {session.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SessionListDetail({ item }: { item: SessionListItem }) {
  if (item.kind === "break") {
    return (
      <div className="sched-list-detail sched-list-detail-break">
        <p className="sched-list-detail-time">{formatRange(item.time)}</p>
        <div>
          <h4>Break Time</h4>
          <p className="sched-list-detail-desc">
            다음 세션을 준비하고 잠시 쉬어가는 시간입니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="sched-list-detail">
      <p className="sched-list-detail-time">{formatRange(item.time)}</p>
      <div className="sched-list-detail-stack">
        {item.sessions.map((session) => (
          <article
            key={`${session.hall}-${session.time}`}
            className="sched-list-detail-session"
          >
            <h4>{session.title}</h4>
            <div className="sched-list-detail-meta">
              <span>{session.speaker}</span>
              {session.affiliation && <span>{session.affiliation}</span>}
            </div>
            {session.audience && (
              <p className="sched-list-detail-audience">
                이런 분께 추천: {session.audience}
              </p>
            )}
            {session.description && (
              <p className="sched-list-detail-desc">{session.description}</p>
            )}
            {!!session.tags?.length && (
              <div className="sched-list-detail-tags">
                {session.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function SessionListView() {
  const groups = sessionListGroups();
  const [openGroupId, setOpenGroupId] = useState<SessionListGroupId>("auditorium");
  const [activeItemByGroup, setActiveItemByGroup] = useState<
    Partial<Record<SessionListGroupId, string>>
  >({});

  return (
    <Reveal
      delay={100}
      threshold={0.01}
      className="sched-wrap sched-overview-wrap"
    >
      <div className="sched-list-accordion">
        {groups.map((group) => {
          const isOpen = openGroupId === group.id;
          const fallbackItem = defaultSessionListItem(group.items);
          const activeItemId = activeItemByGroup[group.id] ?? fallbackItem?.id;
          const activeItem =
            group.items.find((item) => item.id === activeItemId) ??
            fallbackItem;

          return (
            <section
              key={group.id}
              className={`sched-list-group ${isOpen ? "is-open" : ""}`}
            >
              <button
                type="button"
                className="sched-list-toggle"
                aria-expanded={isOpen}
                onClick={() => setOpenGroupId(group.id)}
              >
                <span className="sched-list-toggle-copy">
                  <span className="sched-list-title-row">
                    <span className="sched-list-title">{group.title}</span>
                    <span className="sched-list-badge">{group.badge}</span>
                  </span>
                  <span className="sched-list-description">
                    {group.description}
                  </span>
                </span>
                <span className="sched-list-chevron" aria-hidden="true" />
              </button>
              {isOpen && (
                <div className="sched-list-panel">
                  {group.items.length === 0 || !activeItem ? (
                    <div className="sched-list-empty">
                      아직 공개된 세션이 없습니다.
                    </div>
                  ) : (
                    <>
                      <div className="sched-list-menu">
                        {group.items.map((item) => {
                          const selected = item.id === activeItem.id;
                          const affiliation = uniqueSessionValues(
                            item,
                            "affiliation",
                          );
                          const audience = uniqueSessionValues(
                            item,
                            "audience",
                          );

                          if (item.kind === "break") {
                            return (
                              <div
                                key={item.id}
                                className="sched-list-item sched-list-item-breakline"
                              >
                                <span className="sched-list-item-time">
                                  {formatRange(item.time)}
                                </span>
                                <span className="sched-list-item-copy">
                                  <strong>Break Time</strong>
                                </span>
                              </div>
                            );
                          }

                          return (
                            <button
                              key={item.id}
                              type="button"
                              className={`sched-list-item ${
                                selected ? "is-active" : ""
                              }`}
                              onClick={() =>
                                setActiveItemByGroup((current) => ({
                                  ...current,
                                  [group.id]: item.id,
                                }))
                              }
                            >
                              <span className="sched-list-item-time">
                                {formatRange(item.time)}
                              </span>
                              <span className="sched-list-item-copy">
                                <strong>{sessionTitle(item)}</strong>
                                <span>{sessionSpeaker(item)}</span>
                                {affiliation && (
                                  <span className="sched-list-item-meta">
                                    {affiliation}
                                  </span>
                                )}
                                {audience && (
                                  <span className="sched-list-item-audience">
                                    이런 분께 추천: {audience}
                                  </span>
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <SessionListDetail item={activeItem} />
                    </>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </Reveal>
  );
}

function OverviewBlock({
  session,
  column,
  selectedTopic,
  expanded,
  onToggle,
}: {
  session: Session;
  column: number;
  selectedTopic: TopicFilter;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isFiltered = selectedTopic !== "all";
  const isMatch = sessionMatchesTopic(session, selectedTopic);

  return (
    <article
      role="button"
      tabIndex={0}
      className={`sched-overview-block ${
        isFiltered ? (isMatch ? "is-topic-match" : "is-topic-muted") : ""
      } ${expanded ? "is-expanded" : ""}`}
      data-hall={session.hall}
      style={timetablePlacement(session.time, column, 1, expanded ? 10 : 0)}
      aria-expanded={expanded}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <span className="sched-overview-block-time">
        {formatRange(session.time)}
      </span>
      <h3>{session.title}</h3>
      <p className="sched-overview-block-speaker">{session.speaker}</p>
      {expanded && (
        <div className="sched-overview-inline-detail">
          {session.affiliation && <p>{session.affiliation}</p>}
          {session.audience && <strong>이런 분께 추천: {session.audience}</strong>}
          {session.description && <span>{session.description}</span>}
        </div>
      )}
    </article>
  );
}

function OverviewBreak({
  time,
  column,
  columnSpan,
}: {
  time: string;
  column: number;
  columnSpan: number;
}) {
  return (
    <div
      className="sched-overview-break"
      style={timetablePlacement(time, column, columnSpan)}
    >
      Break Time
    </div>
  );
}

function FullTimetable({
  selectedTopic,
  onTopicSelect,
}: {
  selectedTopic: TopicFilter;
  onTopicSelect: (topic: TopicFilter) => void;
}) {
  const [expandedOverviewId, setExpandedOverviewId] = useState<string | null>(
    null,
  );
  const tickCount = TIMETABLE_SLOTS / 6;
  const timeTicks = Array.from({ length: tickCount }, (_, index) => {
    const minute = TIMETABLE_START + index * 30;
    const hourLabel = String(Math.floor(minute / 60)).padStart(2, "0");
    const minuteLabel = String(minute % 60).padStart(2, "0");

    return {
      label: `${hourLabel}:${minuteLabel}`,
      row: 2 + index * 6,
    };
  });
  const handleTopicSelect = (topic: TopicFilter) => {
    onTopicSelect(topic);
    setExpandedOverviewId(firstOverviewIdForTopic(topic));
  };
  const toggleOverview = (overviewId: string) => {
    setExpandedOverviewId((current) =>
      current === overviewId ? null : overviewId,
    );
  };

  return (
    <Reveal delay={100} threshold={0.01} className="sched-wrap">
      <TopicRail selectedTopic={selectedTopic} onSelect={handleTopicSelect} />
      <div className="sched-overview-scroll">
        <div
          className={`sched-overview-grid ${
            selectedTopic === "all" ? "" : "has-topic-filter"
          }`}
        >
          <div className="sched-vline sched-vline-out fe-line-v fe-fade-30" style={{ left: 0 }} />
          <div
            className="sched-vline fe-line-v fe-fade-0"
            style={{ left: "var(--overview-time-w)" }}
          />
          {OVERVIEW_COLUMNS.slice(1).map((hall, index) => (
            <div
              key={`overview-line-${hall}`}
              className="sched-vline fe-line-v fe-fade-0"
              style={{
                left: `calc(var(--overview-time-w) + (100% - var(--overview-time-w)) / ${OVERVIEW_COLUMNS.length} * ${
                  index + 1
                })`,
              }}
            />
          ))}
          <div className="sched-vline sched-vline-out fe-line-v fe-fade-30" style={{ right: 0 }} />

          <div className="sched-overview-head sched-overview-time-head">Time</div>
          {OVERVIEW_COLUMNS.map((hall) => (
            <div key={hall} className="sched-overview-head">
              {hall}
            </div>
          ))}
          {timeTicks.map((tick) => (
            <div
              key={tick.label}
              className="sched-overview-time"
              style={{ gridRow: tick.row }}
            >
              {tick.label}
            </div>
          ))}
          {MAIN_GROUP?.rows.flatMap((row) =>
            row.sessions.map((session, index) =>
              session ? (
                <OverviewBlock
                  key={`${session.hall}-${session.time}`}
                  session={session}
                  column={index + 2}
                  selectedTopic={selectedTopic}
                  expanded={
                    expandedOverviewId === overviewIdForSession(session)
                  }
                  onToggle={() => toggleOverview(overviewIdForSession(session))}
                />
              ) : null,
            ),
          )}
          {LIGHTNING_GROUP?.rows.map((row) => {
            if (row.kind === "break") {
              return [4, 5].map((column) => (
                <OverviewBreak
                  key={`${row.time}-${column}`}
                  time={row.time}
                  column={column}
                  columnSpan={1}
                />
              ));
            }

            return row.sessions.map((session, index) =>
              session ? (
                <OverviewBlock
                  key={`${session.hall}-${session.time}`}
                  session={session}
                  column={index + 4}
                  selectedTopic={selectedTopic}
                  expanded={
                    expandedOverviewId === overviewIdForSession(session)
                  }
                  onToggle={() => toggleOverview(overviewIdForSession(session))}
                />
              ) : null,
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}

function ScheduleTable({
  tableId,
  halls,
  rows,
  mediaSrc,
  active,
  setActive,
  compact = false,
}: {
  tableId: string;
  halls: Hall[];
  rows: ScheduleRow[];
  mediaSrc?: string;
  active: string | null;
  setActive: (key: string | null) => void;
  compact?: boolean;
}) {
  const { ref: gridRef, inView } = useInView<HTMLDivElement>({ threshold: 0.01 });

  return (
    <Reveal
      delay={100}
      threshold={0.01}
      className={`sched-wrap ${compact ? "is-compact" : ""}`}
    >
      <div
        ref={gridRef}
        className="sched-grid"
        style={{ ["--sched-halls" as string]: halls.length }}
      >
        <div className="sched-vline sched-vline-out fe-line-v fe-fade-30" style={{ left: 0 }} />
        <div className="sched-vline fe-line-v fe-fade-0" style={{ left: 132 }} />
        {halls.slice(1).map((hall, index) => (
          <div
            key={`line-${hall}`}
            className="sched-vline fe-line-v fe-fade-0"
            style={{
              left: `calc(132px + (100% - 132px) / ${halls.length} * ${
                index + 1
              })`,
            }}
          />
        ))}
        <div className="sched-vline sched-vline-out fe-line-v fe-fade-30" style={{ right: 0 }} />

        <div className="sched-hline fe-line-h fe-fade-30" />
        <div className="sched-cell sched-time sched-time-head">
          <span>Time</span>
        </div>
        {halls.map((hall) => (
          <div key={hall} className="sched-cell sched-hall">
            <p className="font-display text-xl font-semibold uppercase leading-[1.4] text-navy">
              {hall}
            </p>
          </div>
        ))}
        <div className="sched-hline sched-hline-head fe-line-h fe-fade-30" />

        {rows.length === 0 ? (
          <div className="sched-empty-message">
            아직 공개된 세션이 없습니다.
          </div>
        ) : (
          rows.map((row, index) => {
            const [start, end] = row.time.split("~");
            const delay = rowDelay(index);

            return (
              <div
                key={`${tableId}-${row.time}-${index}`}
                className="contents"
              >
                <div
                  className={`sched-cell sched-time ${
                    row.kind === "break" ? "sched-time-break" : ""
                  }`}
                >
                  <div
                    className={`sched-time-inner ${
                      row.kind === "break" ? "sched-time-inner-break" : ""
                    }`}
                    style={fadeIn(inView, delay)}
                  >
                    <span className="sched-time-start">{start}</span>
                    <span className="sched-time-end">{end}</span>
                  </div>
                </div>
                {row.kind === "break" ? (
                  <div
                    className="sched-cell sched-break-cell"
                    style={{ gridColumn: `2 / span ${halls.length}` }}
                  >
                    <div
                      className="sched-break-card flex w-full items-center justify-center"
                      style={{
                        ...fadeIn(inView, delay),
                        minHeight: compact ? 38 : 44,
                      }}
                    >
                      Break Time
                    </div>
                  </div>
                ) : (
                  row.sessions.map((session, sessionIndex) => {
                    const hall = halls[sessionIndex];
                    const key = `${tableId}-${row.time}-${sessionIndex}`;

                    return (
                      <div key={key} className="contents">
                        <div className="sched-hline sched-hline-m fe-line-h fe-fade-30" />
                        <div
                          className={`sched-cell sched-card-cell ${
                            session ? "" : "sched-card-cell-empty"
                          }`}
                        >
                          {session ? (
                            <SessionCard
                              session={session}
                              active={active === key}
                              inView={inView}
                              delay={delay}
                              mediaSrc={mediaSrc}
                              onToggle={() =>
                                setActive(active === key ? null : key)
                              }
                              compact={compact}
                            />
                          ) : (
                            <div
                              className="sched-empty-card w-full"
                              style={{
                                ...fadeIn(inView, delay),
                                minHeight: compact ? 152 : 200,
                                ["--badge-color" as string]:
                                  HALL_COLOR[hall],
                              }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div className="sched-hline fe-line-h fe-fade-30" />
              </div>
            );
          })
        )}
      </div>
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
        </Reveal>
      </div>
    </section>
  );
}
