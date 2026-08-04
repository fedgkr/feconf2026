/**
 * All page content in one place: nav, copy, session schedule, sponsors,
 * guidelines, and asset paths. Components stay purely presentational.
 */

/* ------------------------------- nav ---------------------------------- */

export const NAV_MENU = [
  { id: "home", label: "HOME" },
  { id: "events", label: "EVENTS" },
  { id: "sponsors", label: "SPONSORS" },
] as const;

export const BUY_TICKET = { label: "BUY TICKET →", href: "#site-footer" };

/** sections with the pink gradient background — the nav stays white there */
export const PINK_SECTION_IDS = ["home", "site-footer"];

/* ------------------------------- hero --------------------------------- */

export const HERO = {
  bgSrc: "/assets/hero-bg.png",
  logoSrc: "/assets/feconf-logo.svg",
  tagline: "FORWARD EVER 10 YEARS",
  info: "FRONTEND CONFERENCE BY FEDG. 2026.10.24 THU. LOTTE TOWER 35F SEOUL, KOREA",
};

/* --------------------------- quote sequence --------------------------- */

export const QUOTES = [
  "기술은 빠르게 변하고,\n세상은 끊임없이 다음을 향합니다.",
  "그 흐름 속에서도\n우리는 우리의 속도를 잃지 않습니다.",
  "느리지만 멈추지 않았고,\n화려하지 않아도 꾸준했던 10년을 지나",
  "10번째 FEConf가\n여러분을 기다립니다.",
];

/** finale message lines; highlighted segments render in pink */
export const QUOTE_FINALE: { text: string; highlight?: boolean }[][] = [
  [{ text: "프론트를 넘어 언제나 " }, { text: "앞으로 나아가는", highlight: true }],
  [
    { text: "이시대의 " },
    { text: "달팽이", highlight: true },
    { text: "들을 위한 컨퍼런스" },
  ],
];

export const QUOTE_ASSETS = {
  carSrc: "/assets/pixel-sportscar-blue.svg",
  snailSrc: "/assets/pixel-snail.svg",
};

/* ------------------------------ events -------------------------------- */

export type SessionBadge = "A" | "B" | "toss";

export interface Session {
  title: string;
  badge: SessionBadge;
}

/** badge circle color + card hover flood color */
export const BADGE_STYLE: Record<SessionBadge, { badge: string; hover: string }> = {
  A: { badge: "#ff1762", hover: "#ff1762" },
  B: { badge: "#32cbf8", hover: "#32cbf8" },
  toss: { badge: "#0064ff", hover: "#0064ff" },
};

export const TOSS_BADGE_SRC = "/assets/toss-badge-square.png";

const DEFAULT_SESSION_TITLE =
  "Airbridge SDK팀이 순수한 Unit Testable한 코드를 작성하는 방법";

export const EVENTS = {
  heading: {
    title: ["FORWARD EVER", "10 YEARS"],
    subtitle: ["10주년을 맞아 풍부해진", "다양한 이벤트들을 소개합니다"],
  },
  download: { label: "FullSchedule.jpg", href: "#" },
  halls: [
    {
      hall: "A hall",
      sessions: [
        { title: "후원사 세션", badge: "A" },
        ...Array.from({ length: 5 }, () => ({
          title: DEFAULT_SESSION_TITLE,
          badge: "A" as SessionBadge,
        })),
      ] as Session[],
    },
    {
      hall: "B hall",
      sessions: Array.from({ length: 6 }, () => ({
        title: DEFAULT_SESSION_TITLE,
        badge: "B",
      })) as Session[],
    },
    {
      hall: "TOSS",
      sessions: Array.from({ length: 6 }, () => ({
        title: DEFAULT_SESSION_TITLE,
        badge: "toss",
      })) as Session[],
    },
  ],
};

/* ------------------------------- buddy -------------------------------- */

export const BUDDY = {
  heading: {
    title: ["FORWARD EVER", "Forever Buddy"],
    subtitle: ["feconf 준비를 함께 도와줄 친구를", "데스크탑에 키워보세요"],
  },
  download: { label: "Forever Buddy.jpg", href: "#" },
  snails: [
    "/assets/pixel-snail-blue.svg",
    "/assets/pixel-snail-pink.svg",
    "/assets/pixel-snail-blue.svg",
  ],
};

/* ------------------------------ sponsors ------------------------------ */

export type Sponsor =
  | {
      variant: "logo";
      name: string;
      src: string;
      width: number;
      height: number;
      className?: string;
    }
  | { variant: "carrot"; name: string; iconSrc: string; textSrc: string }
  | {
      variant: "media-partner";
      name: string;
      label: string;
      src: string;
      width: number;
      height: number;
    };

export const SPONSORS_SECTION = {
  heading: {
    title: ["Sponsors"],
    subtitle: ["Meet Our", "sponsors"],
  },
  sponsors: [
    {
      variant: "logo",
      name: "WYYYES",
      src: "/assets/sponsor-wyyyes.png",
      width: 153,
      height: 42,
      className: "rounded-[9px] object-cover",
    },
    {
      variant: "logo",
      name: "imweb",
      src: "/assets/sponsor-imweb.svg",
      width: 162,
      height: 35.4,
    },
    {
      variant: "logo",
      name: "toss",
      src: "/assets/sponsor-toss.png",
      width: 144,
      height: 43.5,
      className: "mix-blend-multiply",
    },
    {
      variant: "carrot",
      name: "당근",
      iconSrc: "/assets/sponsor-carrot-icon.svg",
      textSrc: "/assets/sponsor-carrot-text.svg",
    },
    {
      variant: "logo",
      name: "stibee",
      src: "/assets/sponsor-stibee.svg",
      width: 138.25,
      height: 31,
    },
    {
      variant: "logo",
      name: "F-Lab",
      src: "/assets/sponsor-flab.svg",
      width: 121.4,
      height: 35.6,
    },
    {
      variant: "logo",
      name: "OLIVE YOUNG",
      src: "/assets/sponsor-oliveyoung.png",
      width: 189,
      height: 42,
    },
    {
      variant: "media-partner",
      name: "요즘 IT",
      label: "Media Partner",
      src: "/assets/sponsor-yozm-it.png",
      width: 102.5,
      height: 25.6,
    },
  ] as Sponsor[],
};

/* --------------------------- code of conduct -------------------------- */

export const CONDUCT = {
  heading: {
    title: ["Code of", "Conducts"],
    subtitle: ["Our community", "guidelines"],
  },
  guidelines: [
    {
      title: "다양성",
      body: "FEConf는 개개인의 정체성과 개성 및 취향을 존중합니다. 하지만 성별, 성 정체성, 외모, 인종, 종교, 지역, 장애, 나이, 국가, 약자 등에 대한 혐오와 폭력은 어떤 방식이라도 허용하지 않습니다.",
    },
    {
      title: "사회적 책임",
      body: "FEConf참여자는 프론트엔드 분야의 성장에 대한 사회적 책임을 가집니다. 내가 알고 있는 지식은 아무리 작은 것이라도 다른 누군가에 도움을 줄 수 있습니다. 이를 다양한 방법으로 공유하세요.",
    },
    {
      title: "서로 돕고 협력하기",
      body: "참여자의 다양한 배경이 협업과 커뮤니케이션을 방해하는 요소가 될 수 없습니다. 도움을 요청하기 전에 먼저 도움을 주고 자신의 생각을 자유롭게 표현할 수 있는 FEConf가 될 수 있도록 노력해 주세요.",
    },
    {
      title: "지식 재산권 및 개인 정보",
      body: "FEConf는 지식 재산권과 개인 정보 등의 권리를 존중합니다. 지식 재산권을 위배하거나\n개인 정보를 침해하는 어떠한 콘텐츠도 FEConf에서 사용할 수 없습니다.",
    },
  ],
};

/* ---------------------------- share & contact ------------------------- */

export const SHARE_CONTACT = {
  heading: { title: ["Share & Contact"] },
  rows: [
    {
      title: "Share",
      lines: [
        "국내 최고의 프론트엔드 개발 인사이트를 얻을 수 있는",
        "기회를 공유하여 함께 배우고, 함께 성장해보세요.",
      ],
      button: { label: "Share", icon: "link", href: "#" },
    },
    {
      title: "Contact",
      lines: [
        "접근성 관련하여 행사 참석에 도움이 필요하실 경우, 메일로 편하게 연락주세요.",
        "프론트엔드 개발자에 의한, 프론트엔드 개발자를 위한 FEConf의 발전을 위해 도움을 주실 분도 언제든 환영합니다.",
      ],
      mail: "@feconf@googlegroups.com",
      button: {
        label: "Mail",
        icon: "arrow",
        href: "mailto:feconf@googlegroups.com",
      },
    },
  ] as {
    title: string;
    lines: string[];
    mail?: string;
    button: { label: string; icon: "download" | "link" | "arrow"; href: string };
  }[],
};

/* ------------------------------- footer ------------------------------- */

export const FOOTER = {
  bgSrc: "/assets/footer-bg.png",
  logoSrc: "/assets/feconf-logo-footer.svg",
  date: "2026.10.23",
  note: "// TODO : 티켓 예매하기",
  ticket: { label: "TICKET OPEN", dday: "D-31", href: "#" },
  venue: "2026.10.24 THU. LOTTE TOWER 35F SEOUL, KOREA",
};
