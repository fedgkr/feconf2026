import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataPath = path.join(root, "src/data/site.ts");
const logoPath = path.join(root, "public/images/feconf-wordmark-black.svg");
const outPath = path.join(
  root,
  "public/images/generated/full-schedule-overview.svg",
);

const source = fs.readFileSync(dataPath, "utf8");
const wordmarkSource = fs.readFileSync(logoPath, "utf8").trim();
const groupsStart = source.indexOf("export const SCHEDULE_GROUPS");
const arrayStart = source.indexOf("[", groupsStart);
const arrayEnd = source.indexOf("\n];\n\nexport const SCHEDULE", arrayStart);
const groups = Function(
  `"use strict"; return (${source
    .slice(arrayStart, arrayEnd + 2)
    .replace(/\s+as const/g, "")});`,
)();

const color = {
  navy: "#10183d",
  hairline: "#d4daed",
  hairlineSoft: "#dee2ec",
  surface: "#fafafd",
  mutedSurface: "#f3f5fa",
  pink: "#ff1762",
  blue: "#32cbf8",
  white: "#ffffff",
};

const width = 2600;
const margin = 108;
const headingPad = 60;
const gridX = margin;
const gridW = width - margin * 2;
const timeW = 208;
const spaceHeadH = 108;
const columnHeadH = 104;
const headH = spaceHeadH + columnHeadH;
const pxPerMinute = 18;
const startMinute = 11 * 60;
const endMinute = 17 * 60;
const timelineH = (endMinute - startMinute) * pxPerMinute;
const headingY = 264;
const tableY = 520;
const timelineY = tableY + headH;
const footerH = 120;
const height = timelineY + timelineH + footerH;
const tableBottom = tableY + headH + timelineH;
const colW = (gridW - timeW) / 4;
const colX = (index) => gridX + timeW + colW * index;
const lineFadeStop = ((30 / gridW) * 100).toFixed(4);
const lineFadeHold = (100 - (30 / gridW) * 100).toFixed(4);

const esc = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const attrText = (attrs = {}) =>
  Object.entries(attrs)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== false,
    )
    .map(([key, value]) => ` ${key}="${esc(value)}"`)
    .join("");

const el = (name, attrs = {}, body = "") =>
  `<${name}${attrText(attrs)}>${body}</${name}>`;
const single = (name, attrs = {}) => `<${name}${attrText(attrs)}/>`;
const rect = (x, y, w, h, attrs = {}) =>
  single("rect", { x, y, width: w, height: h, ...attrs });
const line = (x1, y1, x2, y2, attrs = {}) =>
  single("line", { x1, y1, x2, y2, ...attrs });
const text = (x, y, value, attrs = {}) =>
  el("text", { x, y, ...attrs }, esc(value));

function parseTime(value) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function parseRange(value) {
  const [start, end] = value.split("~");
  return { start: parseTime(start), end: parseTime(end) };
}

function formatRange(value) {
  return value.replace("~", " - ");
}

function formatMinute(value) {
  const hour = String(Math.floor(value / 60)).padStart(2, "0");
  const minute = String(value % 60).padStart(2, "0");
  return `${hour}:${minute}`;
}

function textWidth(value, size) {
  return Array.from(value).reduce((sum, char) => {
    if (char === " ") return sum + size * 0.32;
    if (/[가-힣]/.test(char)) return sum + size * 0.88;
    if (/[A-Z0-9]/.test(char)) return sum + size * 0.66;
    if (/[a-z]/.test(char)) return sum + size * 0.54;
    return sum + size * 0.48;
  }, 0);
}

function splitToken(token, maxWidth, size) {
  const chunks = [];
  let current = "";

  for (const char of Array.from(token)) {
    const next = current + char;
    if (current && textWidth(next, size) > maxWidth) {
      chunks.push(current);
      current = char;
    } else {
      current = next;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

function wrap(value, maxWidth, size) {
  const lines = [];
  const tokens = String(value)
    .split(/(\s+)/)
    .filter((token) => token.trim());
  let current = "";

  for (const token of tokens) {
    const parts =
      textWidth(token, size) > maxWidth
        ? splitToken(token, maxWidth, size)
        : [token];

    for (const part of parts) {
      const next = current ? `${current} ${part}` : part;
      if (current && textWidth(next, size) > maxWidth) {
        lines.push(current);
        current = part;
      } else {
        current = next;
      }
    }
  }

  if (current) lines.push(current);
  return lines;
}

function fit(value, maxWidth, maxHeight, startSize, minSize, lineRatio = 1.28) {
  for (let size = startSize; size >= minSize; size -= 1) {
    const lineHeight = Math.round(size * lineRatio);
    const lines = wrap(value, maxWidth, size);
    if (lines.length * lineHeight <= maxHeight) {
      return { lines, size, lineHeight };
    }
  }

  const size = minSize;
  const lineHeight = Math.round(size * lineRatio);
  const maxLines = Math.max(1, Math.floor(maxHeight / lineHeight));
  const lines = wrap(value, maxWidth, size).slice(0, maxLines);
  if (lines.length) {
    let last = lines[lines.length - 1];
    while (last.length > 1 && textWidth(`${last}...`, size) > maxWidth) {
      last = last.slice(0, -1);
    }
    lines[lines.length - 1] = `${last}...`;
  }
  return { lines, size, lineHeight };
}

function multiline(x, y, lines, attrs = {}) {
  const { lineHeight = 32, ...textAttrs } = attrs;
  return el(
    "text",
    { x, y, ...textAttrs },
    lines
      .map((lineText, index) =>
        el("tspan", { x, dy: index === 0 ? 0 : lineHeight }, esc(lineText)),
      )
      .join(""),
  );
}

function wordmark(x, y, width, height) {
  return wordmarkSource
    .replace(
      /<svg\b[^>]*viewBox="([^"]+)"[^>]*>/,
      `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="$1" fill="none" xmlns="http://www.w3.org/2000/svg" overflow="visible">`,
    )
    .replaceAll('fill="black"', `fill="${color.navy}"`);
}

function hallColumn(hall) {
  if (hall === "A Auditorium") return 0;
  if (hall === "B Hall") return 1;
  if (hall === "Talk 1") return 2;
  return 3;
}

function hallLabel(hall) {
  if (hall === "A Auditorium") return "session A";
  if (hall === "B Hall") return "session B";
  return hall;
}

function titleWidth(session, contentW) {
  return session.hall.startsWith("Talk") ? contentW * 0.8 : contentW;
}

function titleSize(session) {
  return session.hall.startsWith("Talk")
    ? { start: 32, min: 25 }
    : { start: 36, min: 29 };
}

function isMainHall(hall) {
  return hall === "A Auditorium" || hall === "B Hall";
}

function allSessions() {
  return groups.flatMap((group) =>
    group.rows.flatMap((row) => row.sessions.filter(Boolean)),
  );
}

function emptyIntervals(column) {
  const occupied = allSessions()
    .filter((session) => hallColumn(session.hall) === column)
    .map((session) => parseRange(session.time))
    .map(({ start, end }) => ({
      start: Math.max(startMinute, start),
      end: Math.min(endMinute, end),
    }))
    .filter(({ start, end }) => end > start)
    .sort((a, b) => a.start - b.start);
  const gaps = [];
  let cursor = startMinute;

  occupied.forEach(({ start, end }) => {
    if (start > cursor) gaps.push({ start: cursor, end: start });
    cursor = Math.max(cursor, end);
  });

  if (cursor < endMinute) gaps.push({ start: cursor, end: endMinute });

  return gaps;
}

function buildEmptyCells() {
  return Array.from({ length: 4 }, (_, column) =>
    emptyIntervals(column)
      .map(({ start, end }) =>
        rect(
          colX(column),
          timelineY + (start - startMinute) * pxPerMinute,
          colW,
          (end - start) * pxPerMinute,
          {
            fill: color.mutedSurface,
            opacity: 0.72,
          },
        ),
      )
      .join(""),
  ).join("");
}

function sessionBlock(session) {
  const { start, end } = parseRange(session.time);
  const duration = end - start;
  const x = colX(hallColumn(session.hall));
  const y = timelineY + (start - startMinute) * pxPerMinute;
  const blockH = duration * pxPerMinute;
  const compact = duration <= 15;
  const padX = compact ? 32 : 36;
  const padTop = 40;
  const titleGap = 36;
  const descGap = 22;
  const speakerBottom = 34;
  const descSpeakerGap = 76;
  const contentW = colW - padX * 2;
  const metaSize = 20;
  const speakerSize = 21;
  const hasDescription =
    isMainHall(session.hall) && Boolean(session.description);
  const titleAreaH = hasDescription
    ? Math.min(214, blockH * 0.36)
    : blockH - padTop - metaSize - titleGap - speakerBottom - 30;
  const titleFont = titleSize(session);
  const title = fit(
    session.title,
    titleWidth(session, contentW),
    Math.max(32, titleAreaH),
    titleFont.start,
    titleFont.min,
    1.28,
  );
  const titleY = y + padTop + metaSize + titleGap;
  const titleH = title.lines.length * title.lineHeight;
  const speaker = fit(session.speaker, contentW, 26, speakerSize, 16, 1.2);
  const descriptionY = titleY + titleH + descGap;
  const description = hasDescription
    ? fit(
        session.description,
        contentW,
        Math.max(40, blockH - (descriptionY - y) - speakerBottom - 58),
        19,
        15,
        1.44,
      )
    : null;
  const speakerY = description
    ? descriptionY +
      (description.lines.length - 1) * description.lineHeight +
      descSpeakerGap
    : y + blockH - speakerBottom;
  const surfaceH = description
    ? Math.min(blockH, Math.ceil(speakerY - y + speakerBottom))
    : blockH;

  return el(
    "g",
    { class: "session-block" },
    [
      rect(x, y, colW, surfaceH, {
        class: "block-surface",
        fill: color.white,
      }),
      line(x, y, x + colW, y, {
        stroke: color.hairline,
        "stroke-width": 1,
      }),
      line(x, y, x, y + surfaceH, {
        stroke: color.hairline,
        "stroke-width": 1,
      }),
      line(x + colW, y, x + colW, y + surfaceH, {
        stroke: color.hairline,
        "stroke-width": 1,
      }),
      surfaceH === blockH
        ? line(x, y + blockH, x + colW, y + blockH, {
            stroke: color.hairline,
            "stroke-width": 1,
          })
        : "",
      text(x + padX, y + padTop, formatRange(session.time), {
        class: "mono",
        "font-size": metaSize,
        "font-weight": 700,
        fill: color.navy,
        opacity: 0.5,
      }),
      text(x + colW - padX, y + padTop, hallLabel(session.hall), {
        class: "body",
        "font-size": metaSize,
        "font-weight": 500,
        fill: color.navy,
        opacity: 0.42,
        "text-anchor": "end",
      }),
      multiline(x + padX, titleY, title.lines, {
        class: "body",
        "font-size": title.size,
        "font-weight": 700,
        fill: color.navy,
        lineHeight: title.lineHeight,
      }),
      description
        ? multiline(x + padX, descriptionY, description.lines, {
            class: "body",
            "font-size": description.size,
            "font-weight": 500,
            fill: color.navy,
            opacity: 0.58,
            lineHeight: description.lineHeight,
          })
        : "",
      multiline(x + padX, speakerY, speaker.lines, {
        class: "body",
        "font-size": speaker.size,
        "font-weight": 600,
        fill: color.navy,
        opacity: 0.56,
        lineHeight: speaker.lineHeight,
      }),
    ].join(""),
  );
}

function buildHeading() {
  const x = margin + headingPad;
  const logoH = 104;
  const logoW = 1162;
  return el(
    "g",
    {},
    [
      wordmark(x, headingY - 104, logoW, logoH),
      multiline(
        x,
        headingY + 80,
        [
          "느리지만 멈추지 않았던 10년을 보내온",
          "FECONF가 여러분을 기다립니다.",
        ],
        {
          class: "body",
          "font-size": 30,
          "font-weight": 500,
          fill: color.navy,
          opacity: 0.5,
          lineHeight: 42,
        },
      ),
    ].join(""),
  );
}

function buildGrid() {
  const parts = [];
  const labelY = tableY + spaceHeadH;

  parts.push(
    rect(gridX, tableY, gridW, headH + timelineH, { fill: color.white }),
  );
  parts.push(buildEmptyCells());

  parts.push(
    rect(gridX, tableY, timeW, headH, {
      fill: color.white,
    }),
  );

  [
    { label: "Auditorium", start: 0, span: 1 },
    { label: "Conference B", start: 1, span: 1 },
    { label: "Conference A", start: 2, span: 2 },
  ].forEach((space) => {
    const x = colX(space.start);
    const w = colW * space.span;
    parts.push(
      rect(x, tableY, w, spaceHeadH, {
        fill: color.white,
      }),
      text(x + 34, tableY + 66, space.label, {
        class: "display",
        "font-size": 40,
        "font-weight": 600,
        fill: color.navy,
      }),
    );
  });

  ["session A", "session B", "Talk 1", "Talk 2"].forEach((label, index) => {
    const x = colX(index);
    parts.push(
      rect(x, labelY, colW, columnHeadH, {
        fill: color.white,
      }),
      text(x + 34, labelY + 62, label, {
        class: "body",
        "font-size": 34,
        "font-weight": 500,
        fill: color.navy,
      }),
    );
  });

  [
    [gridX, labelY, gridX + gridW, labelY],
    [gridX, timelineY, gridX + gridW, timelineY],
    [gridX, tableBottom, gridX + gridW, tableBottom],
  ].forEach(([x1, y1, x2, y2]) => {
    parts.push(
      line(x1, y1, x2, y2, {
        stroke: "url(#fadeX)",
        "stroke-width": 1,
      }),
    );
  });

  for (let minute = startMinute + 30; minute < endMinute; minute += 30) {
    const y = timelineY + (minute - startMinute) * pxPerMinute;
    parts.push(
      line(gridX, y, gridX + gridW, y, {
        stroke: "url(#fadeX)",
        "stroke-width": 1,
      }),
    );

    if (minute < endMinute) {
      parts.push(
        text(gridX + timeW - 44, y + 40, formatMinute(minute), {
          class: "mono",
          "font-size": 22,
          "font-weight": 700,
          fill: color.navy,
          opacity: 0.52,
          "text-anchor": "end",
        }),
      );
    }
  }

  parts.push(
    text(gridX + timeW - 44, timelineY + 40, formatMinute(startMinute), {
      class: "mono",
      "font-size": 22,
      "font-weight": 700,
      fill: color.navy,
      opacity: 0.52,
      "text-anchor": "end",
    }),
  );

  [gridX + timeW, colX(1), colX(2), colX(3), gridX + gridW].forEach((x) => {
    parts.push(
      line(x, tableY, x, tableBottom, {
        stroke: color.hairline,
        "stroke-width": 1,
      }),
    );
  });

  return parts.join("");
}

function buildSessions() {
  const parts = [];
  const mainGroup = groups.find((group) => group.id === "main");
  const lightningGroup = groups.find((group) => group.id === "lightning");

  mainGroup?.rows.forEach((row) => {
    row.sessions.forEach((session) => {
      if (session) parts.push(sessionBlock(session));
    });
  });

  lightningGroup?.rows.forEach((row) => {
    if (row.kind === "break") {
      return;
    }

    row.sessions.forEach((session) => {
      if (session) parts.push(sessionBlock(session));
    });
  });

  return parts.join("");
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
  <linearGradient id="fadeX" x1="${gridX}" y1="0" x2="${gridX + gridW}" y2="0" gradientUnits="userSpaceOnUse">
    <stop offset="0%" stop-color="${color.hairline}" stop-opacity="0"/>
    <stop offset="${lineFadeStop}%" stop-color="${color.hairline}" stop-opacity="1"/>
    <stop offset="${lineFadeHold}%" stop-color="${color.hairline}" stop-opacity="1"/>
    <stop offset="100%" stop-color="${color.hairline}" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="fadeY" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${color.hairline}" stop-opacity="0"/>
    <stop offset="0.03" stop-color="${color.hairline}" stop-opacity="1"/>
    <stop offset="0.97" stop-color="${color.hairline}" stop-opacity="1"/>
    <stop offset="1" stop-color="${color.hairline}" stop-opacity="0"/>
  </linearGradient>
</defs>
${rect(0, 0, width, height, { fill: color.white })}
${el(
  "style",
  {},
  `
@import url("https://fonts.googleapis.com/css2?family=Special+Gothic:wdth,wght@75..125,400..700&amp;display=swap");
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css");
.display { font-family: "Special Gothic", "Arial Black", sans-serif; font-stretch: 112.5%; }
.body { font-family: "Pretendard Variable", Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", Arial, sans-serif; }
.mono { font-family: "JetBrains Mono", "SFMono-Regular", Menlo, monospace; }
text { letter-spacing: 0; }
`,
)}
${buildHeading()}
${buildGrid()}
${buildSessions()}
</svg>
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, svg, "utf8");
console.log(outPath);
