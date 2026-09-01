import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, "src/data/site.ts");
const OUT_DIR = path.join(ROOT, "public/images/generated");
const SVG_PATH = path.join(OUT_DIR, "full-schedule-overview.svg");

const COLORS = {
  navy: "#10183d",
  navy70: "rgba(16, 24, 61, 0.7)",
  navy56: "rgba(16, 24, 61, 0.56)",
  navy44: "rgba(16, 24, 61, 0.44)",
  hairline: "#d4daed",
  hairlineSoft: "#e8ecf7",
  surface: "#f8faff",
  pink: "#ff1762",
  blue: "#32cbf8",
  white: "#ffffff",
};

const TRACKS = [
  { hall: "A Auditorium", label: "Session A", venue: "A Auditorium", color: COLORS.pink },
  { hall: "B Hall", label: "Session B", venue: "B Hall", color: COLORS.blue },
  { hall: "Talk 1", label: "Talk 1", venue: "Lightning Talk", color: COLORS.pink },
  { hall: "Talk 2", label: "Talk 2", venue: "Lightning Talk", color: COLORS.blue },
];

const START_MINUTE = 11 * 60;
const END_MINUTE = 17 * 60;
const PX_PER_MINUTE = 12;
const WIDTH = 2600;
const MARGIN = 108;
const TOP = 96;
const HEADER_Y = 304;
const HEADER_H = 94;
const TIMELINE_Y = HEADER_Y + HEADER_H;
const TIMELINE_H = (END_MINUTE - START_MINUTE) * PX_PER_MINUTE;
const FOOTER_H = 134;
const HEIGHT = TIMELINE_Y + TIMELINE_H + FOOTER_H;
const GRID_X = MARGIN;
const GRID_W = WIDTH - MARGIN * 2;
const TIME_W = 164;
const GAP = 18;
const COL_W = (GRID_W - TIME_W - GAP * TRACKS.length) / TRACKS.length;
const COL_X = (index) => GRID_X + TIME_W + GAP + index * (COL_W + GAP);

function extractScheduleGroups(source) {
  const start = source.indexOf("export const SCHEDULE_GROUPS");
  if (start < 0) throw new Error("SCHEDULE_GROUPS not found");

  const arrayStart = source.indexOf("[", start);
  const end = source.indexOf("\n];\n\nexport const SCHEDULE", arrayStart);
  if (arrayStart < 0 || end < 0) {
    throw new Error("Unable to locate SCHEDULE_GROUPS array");
  }

  const arrayText = source
    .slice(arrayStart, end + 2)
    .replace(/\s+as const/g, "");

  return Function(`"use strict"; return (${arrayText});`)();
}

function parseTime(time) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function parseRange(range) {
  const [start, end] = range.split("~");
  return { start: parseTime(start), end: parseTime(end) };
}

function formatRange(range) {
  return range.replace("~", " - ");
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function tag(name, attrs = {}, children = "") {
  const attrText = Object.entries(attrs)
    .filter(([, value]) => value !== undefined && value !== null && value !== false)
    .map(([key, value]) => ` ${key}="${esc(value)}"`)
    .join("");

  return `<${name}${attrText}>${children}</${name}>`;
}

function selfClosing(name, attrs = {}) {
  const attrText = Object.entries(attrs)
    .filter(([, value]) => value !== undefined && value !== null && value !== false)
    .map(([key, value]) => ` ${key}="${esc(value)}"`)
    .join("");

  return `<${name}${attrText}/>`;
}

function text(x, y, value, attrs = {}) {
  return tag("text", { x, y, ...attrs }, esc(value));
}

function rect(x, y, width, height, attrs = {}) {
  return selfClosing("rect", { x, y, width, height, ...attrs });
}

function line(x1, y1, x2, y2, attrs = {}) {
  return selfClosing("line", { x1, y1, x2, y2, ...attrs });
}

function roughTextWidth(value, size) {
  return Array.from(value).reduce((sum, char) => {
    if (char === " ") return sum + size * 0.34;
    if (/[가-힣]/.test(char)) return sum + size * 0.9;
    if (/[A-Z0-9]/.test(char)) return sum + size * 0.64;
    if (/[a-z]/.test(char)) return sum + size * 0.54;
    return sum + size * 0.45;
  }, 0);
}

function splitLongToken(token, maxWidth, size) {
  const chunks = [];
  let current = "";

  for (const char of Array.from(token)) {
    const next = current + char;
    if (current && roughTextWidth(next, size) > maxWidth) {
      chunks.push(current);
      current = char;
    } else {
      current = next;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

function wrapText(value, maxWidth, size) {
  const lines = [];
  const tokens = String(value).split(/(\s+)/).filter((token) => token.trim().length);
  let lineText = "";

  for (const token of tokens) {
    const candidates =
      roughTextWidth(token, size) > maxWidth
        ? splitLongToken(token, maxWidth, size)
        : [token];

    for (const candidate of candidates) {
      const next = lineText ? `${lineText} ${candidate}` : candidate;
      if (lineText && roughTextWidth(next, size) > maxWidth) {
        lines.push(lineText);
        lineText = candidate;
      } else {
        lineText = next;
      }
    }
  }

  if (lineText) lines.push(lineText);
  return lines;
}

function fittedLines(value, maxWidth, maxHeight, initialSize, minSize, lineRatio = 1.24) {
  for (let size = initialSize; size >= minSize; size -= 1) {
    const lineHeight = Math.round(size * lineRatio);
    const lines = wrapText(value, maxWidth, size);
    if (lines.length * lineHeight <= maxHeight) {
      return { lines, size, lineHeight };
    }
  }

  const size = minSize;
  const lineHeight = Math.round(size * lineRatio);
  const maxLines = Math.max(1, Math.floor(maxHeight / lineHeight));
  const lines = wrapText(value, maxWidth, size).slice(0, maxLines);

  if (lines.length) {
    let last = lines[lines.length - 1];
    while (last.length > 1 && roughTextWidth(`${last}...`, size) > maxWidth) {
      last = last.slice(0, -1);
    }
    lines[lines.length - 1] = `${last}...`;
  }

  return { lines, size, lineHeight };
}

function multilineText(x, y, lines, attrs = {}) {
  const { lineHeight = 28, ...textAttrs } = attrs;

  return tag(
    "text",
    { x, y, ...textAttrs },
    lines
      .map((lineText, index) =>
        tag(
          "tspan",
          { x, dy: index === 0 ? 0 : lineHeight },
          esc(lineText),
        ),
      )
      .join(""),
  );
}

function sessionCard(session, trackIndex) {
  const { start, end } = parseRange(session.time);
  const duration = end - start;
  const x = COL_X(trackIndex);
  const y = TIMELINE_Y + (start - START_MINUTE) * PX_PER_MINUTE + 8;
  const height = duration * PX_PER_MINUTE - 16;
  const width = COL_W;
  const track = TRACKS[trackIndex];
  const pad = duration <= 15 ? 18 : 22;
  const topMetaSize = duration <= 15 ? 17 : 18;
  const contentWidth = width - pad * 2;
  const titleMaxHeight = Math.max(
    42,
    height - pad * 2 - topMetaSize - 20 - (duration <= 15 ? 24 : 34),
  );
  const title = fittedLines(
    session.title,
    contentWidth,
    titleMaxHeight,
    duration <= 15 ? 25 : 29,
    duration <= 15 ? 18 : 22,
  );
  const speakerText = session.affiliation
    ? `${session.speaker} · ${session.affiliation}`
    : session.speaker;
  const speaker = fittedLines(
    speakerText,
    contentWidth,
    duration <= 15 ? 30 : 44,
    duration <= 15 ? 18 : 20,
    16,
    1.2,
  );
  const titleY = y + pad + topMetaSize + 32;
  const speakerY = Math.min(
    y + height - pad,
    titleY + (title.lines.length - 1) * title.lineHeight + title.lineHeight + 24,
  );

  return tag(
    "g",
    { class: "session-card" },
    [
      rect(x, y, width, height, {
        fill: COLORS.white,
        stroke: COLORS.hairline,
        "stroke-width": 1.5,
      }),
      rect(x, y, 8, height, { fill: track.color }),
      text(x + pad, y + pad + topMetaSize, formatRange(session.time), {
        class: "mono meta",
        "font-size": topMetaSize,
        fill: COLORS.navy56,
      }),
      multilineText(x + pad, titleY, title.lines, {
        class: "title",
        "font-size": title.size,
        "font-weight": 800,
        fill: COLORS.navy,
        lineHeight: title.lineHeight,
      }),
      multilineText(x + pad, speakerY, speaker.lines, {
        class: "speaker",
        "font-size": speaker.size,
        fill: COLORS.navy70,
        lineHeight: speaker.lineHeight,
      }),
    ].join(""),
  );
}

function breakCard(time, trackIndex) {
  const { start, end } = parseRange(time);
  const x = COL_X(trackIndex);
  const y = TIMELINE_Y + (start - START_MINUTE) * PX_PER_MINUTE + 8;
  const height = end - start;
  const pixelHeight = height * PX_PER_MINUTE - 16;

  return tag(
    "g",
    {},
    [
      rect(x, y, COL_W, pixelHeight, {
        fill: COLORS.surface,
        stroke: COLORS.hairline,
        "stroke-width": 1.5,
      }),
      text(x + COL_W / 2, y + pixelHeight / 2 + 8, "Break Time", {
        class: "meta",
        "font-size": 17,
        "font-weight": 800,
        fill: COLORS.navy44,
        "text-anchor": "middle",
      }),
    ].join(""),
  );
}

function collectCards(groups) {
  const cards = [];

  for (const group of groups) {
    for (const row of group.rows) {
      if (row.kind === "break") {
        if (group.id === "lightning") {
          cards.push(breakCard(row.time, 2));
          cards.push(breakCard(row.time, 3));
        }
        continue;
      }

      row.sessions.forEach((session, index) => {
        if (!session) return;
        const hall = group.halls[index];
        const trackIndex = TRACKS.findIndex((track) => track.hall === hall);
        if (trackIndex >= 0) cards.push(sessionCard(session, trackIndex));
      });
    }
  }

  return cards.join("");
}

function buildSvg(groups) {
  const children = [];

  children.push(rect(0, 0, WIDTH, HEIGHT, { fill: COLORS.white }));
  children.push(
    tag(
      "style",
      {},
      `
      .display { font-family: "Special Gothic", "Arial Black", sans-serif; font-stretch: 112.5%; }
      .body, .title, .speaker, .meta { font-family: "Pretendard Variable", Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", Arial, sans-serif; }
      .mono { font-family: "JetBrains Mono", "SFMono-Regular", Menlo, monospace; }
      .title { letter-spacing: 0; }
      .speaker, .meta { font-weight: 800; letter-spacing: 0; }
      `,
    ),
  );

  children.push(text(MARGIN, TOP, "FEConf 2026", {
    class: "meta",
    "font-size": 26,
    "font-weight": 800,
    fill: COLORS.navy56,
  }));
  children.push(text(MARGIN, TOP + 88, "FULL SCHEDULE", {
    class: "display",
    "font-size": 82,
    "font-weight": 600,
    fill: COLORS.navy,
  }));
  children.push(text(MARGIN, TOP + 136, "최종 세션 시간표와 라이트닝 토크 전체보기", {
    class: "body",
    "font-size": 30,
    "font-weight": 700,
    fill: COLORS.navy70,
  }));
  children.push(text(WIDTH - MARGIN, TOP + 136, "11:00 - 17:00", {
    class: "mono",
    "font-size": 30,
    "font-weight": 700,
    fill: COLORS.navy,
    "text-anchor": "end",
  }));

  children.push(line(MARGIN, HEADER_Y - 34, WIDTH - MARGIN, HEADER_Y - 34, {
    stroke: COLORS.hairline,
    "stroke-width": 2,
  }));

  children.push(rect(GRID_X, HEADER_Y, TIME_W, HEADER_H, {
    fill: COLORS.white,
    stroke: COLORS.hairline,
    "stroke-width": 1.5,
  }));
  children.push(text(GRID_X + TIME_W - 18, HEADER_Y + 58, "TIME", {
    class: "meta",
    "font-size": 18,
    fill: COLORS.navy44,
    "text-anchor": "end",
  }));

  TRACKS.forEach((track, index) => {
    const x = COL_X(index);
    children.push(rect(x, HEADER_Y, COL_W, HEADER_H, {
      fill: COLORS.white,
      stroke: COLORS.hairline,
      "stroke-width": 1.5,
    }));
    children.push(rect(x, HEADER_Y + HEADER_H - 6, COL_W, 6, { fill: track.color }));
    children.push(text(x + 24, HEADER_Y + 42, track.label, {
      class: "title",
      "font-size": 31,
      "font-weight": 800,
      fill: COLORS.navy,
    }));
    children.push(text(x + 24, HEADER_Y + 72, track.venue, {
      class: "meta",
      "font-size": 17,
      fill: COLORS.navy44,
    }));
  });

  for (let minute = START_MINUTE; minute <= END_MINUTE; minute += 15) {
    const y = TIMELINE_Y + (minute - START_MINUTE) * PX_PER_MINUTE;
    const major = (minute - START_MINUTE) % 30 === 0;
    children.push(line(GRID_X, y, WIDTH - MARGIN, y, {
      stroke: major ? COLORS.hairline : COLORS.hairlineSoft,
      "stroke-width": major ? 1.5 : 1,
    }));

    if (major && minute < END_MINUTE) {
      const hour = String(Math.floor(minute / 60)).padStart(2, "0");
      const min = String(minute % 60).padStart(2, "0");
      children.push(text(GRID_X + TIME_W - 18, y + 8, `${hour}:${min}`, {
        class: "mono",
        "font-size": 22,
        "font-weight": 700,
        fill: COLORS.navy56,
        "text-anchor": "end",
      }));
    }
  }

  children.push(line(GRID_X, TIMELINE_Y, GRID_X, TIMELINE_Y + TIMELINE_H, {
    stroke: COLORS.hairline,
    "stroke-width": 1.5,
  }));
  children.push(line(GRID_X + TIME_W, TIMELINE_Y, GRID_X + TIME_W, TIMELINE_Y + TIMELINE_H, {
    stroke: COLORS.hairline,
    "stroke-width": 1.5,
  }));
  TRACKS.forEach((_, index) => {
    const x = COL_X(index);
    children.push(line(x, TIMELINE_Y, x, TIMELINE_Y + TIMELINE_H, {
      stroke: COLORS.hairline,
      "stroke-width": 1.5,
    }));
    children.push(line(x + COL_W, TIMELINE_Y, x + COL_W, TIMELINE_Y + TIMELINE_H, {
      stroke: COLORS.hairline,
      "stroke-width": 1.5,
    }));
  });

  children.push(collectCards(groups));

  children.push(line(MARGIN, HEIGHT - 76, WIDTH - MARGIN, HEIGHT - 76, {
    stroke: COLORS.hairline,
    "stroke-width": 2,
  }));
  children.push(text(MARGIN, HEIGHT - 38, "Session A/B: Main Sessions", {
    class: "meta",
    "font-size": 22,
    fill: COLORS.navy56,
  }));
  children.push(text(WIDTH - MARGIN, HEIGHT - 38, "Talk 1/2: Lightning Talk", {
    class: "meta",
    "font-size": 22,
    fill: COLORS.navy56,
    "text-anchor": "end",
  }));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
${children.join("\n")}
</svg>
`;
}

const source = fs.readFileSync(DATA_PATH, "utf8");
const groups = extractScheduleGroups(source);
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(SVG_PATH, buildSvg(groups), "utf8");

console.log(SVG_PATH);
