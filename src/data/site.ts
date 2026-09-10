/**
 * All page content in one place: nav, hero media, story copy, session
 * schedule, experience cards, sponsors, guidelines, and asset paths.
 * Components stay purely presentational.
 */

import { assetPath } from "@/lib/assetPath";

/* ------------------------------- nav ---------------------------------- */

export const NAV_MENU = [
  { id: "home", label: "FECONF", href: "#" },
  { id: "schedule", label: "SCHEDULE", href: "#sessions" },
  { id: "events", label: "EVENTS", href: "#feconf-experience" },
  { id: "sponsors", label: "SPONSORS", href: "#sponsors" },
] as const;

/** Ticket opening moment the D-day counters count down to. */
export const TICKET_OPEN_AT = "2026-10-01T10:00:00+09:00";

/** Conference start; the counter switches to it once the ticket day passes. */
export const CONFERENCE_AT = "2026-10-24T10:00:00+09:00";

export const TICKET_LINK = {
  href: "https://ticketa.co/event/t12vlmil",
};

/**
 * Ticket counter copy. `useTicketStatus` appends the day number and both the
 * nav and the footer uppercase it in CSS.
 */
export const TICKET_STATUS_LABEL = {
  beforeOpen: "TICKET OPEN",
  ticketDay: "TICKET OPEN D-DAY",
  afterOpen: "OPEN",
  conferenceDay: "D-DAY",
  ended: "See you next year!",
};

/* ------------------------------- hero --------------------------------- */

/**
 * One of these plays behind the whole page load: the hero picks it once and
 * the schedule-card hovers, the story silhouettes, the buddy tint, and the
 * footer all reuse the same pick so the page reads as one palette.
 */
export const HERO_MEDIA: Array<{
  src: string;
  accent: string;
  ramp: number[][];
}> = [
  {
    src: assetPath("/images/1_1.5x_cut.webm"),
    accent: "#F85578",
    ramp: [
      // FF62DD
      [0xff, 0x62, 0xdd],
      // FE4500
      [0xfe, 0x45, 0x00],
    ],
  },
  {
    src: assetPath("/images/2_1.5x_cut.webm"),
    accent: "#3DB3F8",
    ramp: [
      [0x38, 0xb1, 0xff],
      [0x00, 0x64, 0xff],
    ],
  },
  {
    src: assetPath("/images/3_1.5x_cut.webm"),
    accent: "#F98B0F",
    ramp: [
      [0xfe, 0x45, 0x00],
      [0xff, 0xc3, 0x00],
    ],
  },
] as const;

export const HERO = {
  posterSrc: assetPath("/images/hero-gradient-bg.png"),
  /** compressed-mark frame shown while the letters are gathered */
  introFrameSrc: assetPath("/images/fe-white.svg"),
};

/**
 * FECONF wordmark, one SVG path per glyph cluster. `shift` is where the
 * cluster sits while gathered in the centre, as a percentage of the mark box;
 * the intro scatters them out to their resting positions.
 */
export const HERO_LETTERS: { shiftX: number; shiftY: number; d: string }[] = [
  {
    shiftX: 8.338256,
    shiftY: -0.604649,
    d: "M467.816 64.4276H364.597L380.02 22.4291H483.181L491.257 0.243192H388.16H351.403L319.521 87.059H356.287H459.554L467.816 64.4276Z",
  },
  {
    shiftX: -24.451672,
    shiftY: -0.325642,
    d: "M780.662 86.816L812.535 0.000174332H775.777L753.397 60.9446L718.932 0.332274L669.562 0.000174332L637.689 86.816H674.454L696 28.1396L729.453 86.978L780.662 86.816Z",
  },
  {
    shiftX: -7.921662,
    shiftY: -0.604649,
    d: "M619.569 87.059H619.739L628.002 64.4276H627.88L643.294 22.4291H643.367L651.443 0.243192H508.672L476.791 87.059H619.569ZM591.106 64.4276H521.867L537.29 22.4291H606.537L591.114 64.4276H591.106Z",
  },
  {
    shiftX: 24.680774,
    shiftY: -0.604649,
    d: "M302.398 87.0586H159.449L167.598 64.8809H310.474L302.398 87.0586ZM313.858 54.4971H171.647L179.787 32.3193H321.935L313.858 54.4971ZM334.142 0.243164L326.065 22.4287H183.117L191.266 0.243164H334.142Z",
  },
  {
    shiftX: 41.06192,
    shiftY: -0.604649,
    d: "M174.652 0.243164L166.576 22.4287H60.499L36.7656 87.0586H0L23.7334 22.4287L31.873 0.243164H174.652ZM149.852 33.0479L141.671 55.5088H62.8818L71.1279 33.0479H149.852Z",
  },
  {
    shiftX: -40.995039,
    shiftY: -0.604649,
    d: "M973.368 0.243164L965.293 22.4287H859.215L835.482 87.0586H798.717L822.449 22.4287L830.59 0.243164H973.368ZM948.568 33.0479L940.388 55.5088H861.599L869.845 33.0479H948.568Z",
  },
];

/* --------------------------- story sequence --------------------------- */

export const STORY_PHRASES: [string, string][] = [
  ["기술은 빠르게 변하고,", "세상은 끊임없이 다음을 향합니다."],
  ["그 흐름 속에서도", "우리는 우리의 속도를 잃지 않습니다."],
  ["느리지만 멈추지 않았던 10년을 보내온", "FECONF가 여러분을 기다립니다."],
];

export const STORY_ASSETS = {
  carSrc: assetPath("/images/pixel-car-blue.svg"),
  snailSrc: assetPath("/images/snail-forward.svg"),
};

/* ------------------------------ schedule ------------------------------ */

export type Hall =
  | "A Auditorium"
  | "B Hall"
  | "Talk 1"
  | "Talk 2"
  | "Networking";

export interface Session {
  time: string;
  hall: Hall;
  title: string;
  speaker?: string;
  affiliation?: string;
  audience?: string;
  topics?: string[];
  description?: string;
  tags?: string[];
}

export interface ScheduleRow {
  time: string;
  sessions: Array<Session | null>;
  kind?: "break";
}

export interface ScheduleGroup {
  id: string;
  title: string;
  subtitle: string;
  halls: Hall[];
  rows: ScheduleRow[];
}

/** hall accent: badge letter, card hover flood, detail surface */
export const HALL_COLOR: Record<Hall, string> = {
  "A Auditorium": "var(--color-pink)",
  "B Hall": "var(--color-blue)",
  "Talk 1": "var(--color-pink)",
  "Talk 2": "var(--color-blue)",
  Networking: "var(--color-navy)",
};

export const SCHEDULE_GROUPS: ScheduleGroup[] = [
  {
    id: "main",
    title: "Sessions",
    subtitle: "A Auditorium과 B Hall에서 교차로 진행되는 메인 세션입니다.",
    halls: ["A Auditorium", "B Hall"],
    rows: [
      {
        time: "11:00~11:30",
        sessions: [
          {
            time: "11:00~11:30",
            hall: "A Auditorium",
            title: "후원사 세션 (피그마)",
          },
          null,
        ],
      },
      {
        time: "11:20~11:50",
        sessions: [
          null,
          {
            time: "11:20~11:50",
            hall: "B Hall",
            title: "후원사 세션 (와이스)",
          },
        ],
      },
      {
        time: "11:50~12:20",
        sessions: [
          {
            time: "11:50~12:20",
            hall: "A Auditorium",
            title: "절대 지워지지 않는 E2E 테스트를 위해 필요한 것들: 디바이스 팜부터 JavaScript의 새 문법까지",
            speaker: "김지원, 박서진",
            affiliation: "토스",
            description:
              "토스에서 E2E 테스트 작성 워크플로우를 갖추어 나가며 0개부터 1천 개가 넘는 E2E 테스트를 작성한 경험을 소개합니다. 지워지거나 깨지지 않는 E2E 테스트를 위해 안정적인 디바이스 팜을 구축하고, 새로운 JavaScript 문법을 도입한 경험을 공유합니다.",
          },
          null,
        ],
      },
      {
        time: "12:10~12:40",
        sessions: [
          null,
          {
            time: "12:10~12:40",
            hall: "B Hall",
            title: "웹처럼 배포하고, 앱처럼 그리기: 당근 앱에 Lynx 도입하기",
            speaker: "원지혁",
            affiliation: "당근",
            description:
              "당근 앱에서 WebView의 유연함은 유지하면서 더 빠른 화면 경험을 만들기 위해 Lynx를 도입한 과정을 공유합니다. URL 기반 화면 제공, 네이티브 인증 체계와의 연결, Instant First-Frame Rendering을 실제 서비스에 적용하며 얻은 고민을 다룹니다.",
          },
        ],
      },
      {
        time: "12:40~13:10",
        sessions: [
          {
            time: "12:40~13:10",
            hall: "A Auditorium",
            title: "어느 날 옆자리 동료가 localhost:3000 링크를 보냈다",
            speaker: "이호연, 우창완",
            affiliation: "토스",
            description:
              "AI가 코드를 쓰기 시작하면서 3개월 만에 저장소가 1,000개 넘게 생겼습니다. 모두가 빠르게 만들 수 있게 됐지만, 제품의 하방은 누가 지킬까요? 1,000개의 폴리리포를 모노리포처럼 다루기 위해 만든 도구 Canopy를 소개합니다.",
          },
          null,
        ],
      },
      {
        time: "13:00~13:30",
        sessions: [
          null,
          {
            time: "13:00~13:30",
            hall: "B Hall",
            title: "디자인 시스템, 더 나아가서",
            speaker: "정현수",
            affiliation: "당근",
            description:
              "컴포넌트와 패턴을 늘리고 품질과 사용성을 높이는 일은 디자인 시스템의 기본입니다. AI 시대에 문서를 기준으로 코드 속 사용을 살피고, 여러 저장소가 업데이트를 따라가도록 도우며, 디자인 시스템의 맥락을 가진 AI로 프로토타입을 만드는 시도까지 이야기합니다.",
          },
        ],
      },
      {
        time: "13:30~14:00",
        sessions: [
          {
            time: "13:30~14:00",
            hall: "A Auditorium",
            title: "React Native에 현대적인 빌드 도구 더하기: Rollipop 구현기",
            speaker: "이근혁",
            affiliation: "토스",
            description:
              "React Native에 현대적인 프론트엔드 빌드 도구를 적용하기 위해 Rolldown 기반 번들러 Rollipop을 구현한 과정을 소개합니다. Metro의 개발 경험을 유지하면서 성능과 확장성을 개선하기 위한 설계와 최적화 경험을 공유합니다.",
          },
          null,
        ],
      },
      {
        time: "13:50~14:20",
        sessions: [
          null,
          {
            time: "13:50~14:20",
            hall: "B Hall",
            title: "수백개 패키지의 모노레포와 함께 micro frontends로 전환하기",
            speaker: "김종현",
            affiliation: "미리디",
            description:
              "모놀리스 환경에서 마이크로서비스까지, 미리캔버스 프론트엔드팀의 아키텍처 전환 과정에서 구축한 모노레포 플랫폼과 그 위에서 동작하는 마이크로서비스까지의 전환 과정을 소개합니다.",
          },
        ],
      },
      {
        time: "14:20~14:50",
        sessions: [
          {
            time: "14:20~14:50",
            hall: "A Auditorium",
            title: "오프라인 우선 Micro Frontend 구축기",
            speaker: "나석주",
            affiliation: "토스플레이스",
            description:
              "오프라인 우선 웹 앱을 위해 아키텍처를 구성한 경험을 소개합니다. 멀티플랫폼에서 같은 프론트엔드 코드를 동작하게 만드는 웹뷰 번들 개념과 Micro Frontend를 안전하게 운영하기 위한 전략을 다룹니다.",
          },
          null,
        ],
      },
      {
        time: "14:40~15:10",
        sessions: [
          null,
          {
            time: "14:40~15:10",
            hall: "B Hall",
            title: "Lighthouse는 100점인데 왜 느릴까? - 미리캔버스로 짚어본 런타임 성능 개선 포인트",
            speaker: "김해동",
            affiliation: "미리캔버스 엔진팀 요소E파트 리드",
            description:
              "프론트엔드 성능이라고 하면 가장 먼저 떠오르는 것 중 하나가 Lighthouse입니다. 하지만 사용자는 페이지를 연 이후에 더 큰 불편을 느끼곤 합니다. WYSIWYG 에디터에서 사용자가 기대하는 즉각적인 반응을 위해 미리캔버스 엔진팀이 성능 피드백에 대응해온 경험을 공유합니다.",
          },
        ],
      },
      {
        time: "15:10~15:40",
        sessions: [
          {
            time: "15:10~15:40",
            hall: "A Auditorium",
            title: "조합이 폭발하는 디자인 시스템, 이걸 눈으로도 테스트하라고요?",
            speaker: "유길종",
            affiliation: "토스",
            description:
              "props, 서브컴포넌트, 다크모드, pseudo state가 만드는 수많은 UI 상태를 어떻게 검증할지 이야기합니다. 토스 디자인 시스템 TDS에서 조합적 폭발이 발생하는 컴포넌트의 시각 회귀 테스트를 운영하며 얻은 고민을 공유합니다.",
          },
          null,
        ],
      },
      {
        time: "15:30~16:00",
        sessions: [
          null,
          {
            time: "15:30~16:00",
            hall: "B Hall",
            title: "Agent First CMS",
            speaker: "이재승",
            affiliation: "LG유플러스",
            description:
              "AI 에이전트를 활용해 HTML 기반 콘텐츠를 제작하는 CMS를 소개합니다. 사내 적용 경험을 바탕으로 에이전트 기반 백오피스를 만들 때 도움이 될 설계와 운영 포인트를 공유합니다.",
          },
        ],
      },
      {
        time: "16:00~16:30",
        sessions: [
          {
            time: "16:00~16:30",
            hall: "A Auditorium",
            title: "붙어야 할 때와 떨어져야 할 때: Module Federation과 Web Component로 보는 결합의 트레이드오프",
            speaker: "진유림",
            affiliation: "토스",
            description:
              "여러 제품에 배포되는 크로스앱 UI를 운영하며 Module Federation과 Web Component 사이에서 마주한 트레이드오프를 다룹니다. 의존성 충돌, 배포 통제, 공유 경계를 다시 설계하게 된 실제 경험을 공유합니다.",
          },
          null,
        ],
      },
      {
        time: "16:20~16:50",
        sessions: [
          null,
          {
            time: "16:20~16:50",
            hall: "B Hall",
            title: "이미지 한 장을 편집 가능한 레이어로: Cloud AI에서 On-device AI와 WebGPU까지",
            speaker: "김민성",
            affiliation: "미리디",
            description:
              "이미지 한 장을 웹 에디터에서 편집 가능한 레이어로 만들려면 어떤 선택이 필요할까요? 생성형 AI에 모든 작업을 맡기며 마주한 품질, 지연, 비용의 문제에서 출발해 Cloud AI에서 On-device AI와 WebGPU까지 더 나은 편집 경험을 만들기 위해 내린 선택을 공유합니다.",
          },
        ],
      }
    ],
  },
  {
    id: "lightning",
    title: "Lightning Talk",
    subtitle: "Conference A에서 진행되는 Talk 1과 Talk 2입니다.",
    halls: ["Talk 1", "Talk 2"],
    rows: [
      {
        time: "11:00~11:15",
        sessions: [
          {
            time: "11:00~11:15",
            hall: "Talk 1",
            title: "AI와 똥손 개발자를 위한 디자인 가이드",
            speaker: "김해준",
            affiliation: "onpoom.co.kr",
            description:
              "AI와 함께 일관된 UI를 만들기 위한 색상, 타이포그래피, 레이아웃 원칙을 소개합니다.",
          },
          {
            time: "11:00~11:15",
            hall: "Talk 2",
            title: "당근 동네지도로 살펴보는 복잡한 애플리케이션 설계 사례",
            speaker: "최하영",
            affiliation: "당근마켓",
            description:
              "당근 동네지도팀이 복잡한 상태와 UI를 가진 애플리케이션을 설계해온 방법을 소개합니다.",
          },
        ],
      },
      {
        time: "11:25~11:40",
        sessions: [
          {
            time: "11:25~11:40",
            hall: "Talk 1",
            title: "밤티같은 AI 프론트엔드 제대로 만들기",
            speaker: "김승모",
            affiliation: "리멤버앤컴퍼니",
            description:
              "AI가 평균적인 UI로 수렴하지 않도록 우리만의 스타일과 제작 과정을 구조화한 경험을 공유합니다.",
          },
          {
            time: "11:25~11:40",
            hall: "Talk 2",
            title: "따라잡기보다 버리기, 프론트엔드 개발자에게 남는 판단력",
            speaker: "심윤섭",
            description:
              "정보와 코드 생성이 쉬워진 시대에 무엇을 버리고 무엇을 깊이 볼지 판단하는 기준을 이야기합니다.",
          },
        ],
      },
      {
        time: "11:50~12:05",
        sessions: [
          {
            time: "11:50~12:05",
            hall: "Talk 1",
            title: "후원사 세션",
          },
          null,
        ],
      },
      {
        time: "12:15~12:30",
        sessions: [
          {
            time: "12:15~12:30",
            hall: "Talk 1",
            title: "Web Component 그리고 Shadow DOM",
            speaker: "정도영",
            affiliation: "카카오페이증권",
            description:
              "Web Component와 Shadow DOM을 활용해 브라우저 표준 기반 컴포넌트를 만든 경험을 공유합니다.",
          },
          {
            time: "12:15~12:30",
            hall: "Talk 2",
            title: "AI는 디자인보다 데이터를 해석한다 - 정확한 코드 생성을 위한 데이터 품질 개선과 도구 제작 경험",
            speaker: "김인숙",
            affiliation: "가비아",
            description:
              "AI가 디자인 데이터를 일관되게 해석하도록 입력 데이터 품질을 개선하고 도구를 만든 경험을 공유합니다.",
          },
        ],
      },
      {
        time: "12:40~12:55",
        sessions: [
          {
            time: "12:40~12:55",
            hall: "Talk 1",
            title: "React Native 프로젝트를 Expo 로 마이그레이션 한 썰 풉니다",
            speaker: "박소미",
            description:
              "레거시 React Native 프로젝트를 Expo로 옮기며 겪은 시작점, 시행착오, 얻은 점을 공유합니다.",
          },
          {
            time: "12:40~12:55",
            hall: "Talk 2",
            title: "Chrome OS, 궁극의 개발 운영체제",
            speaker: "김기범",
            affiliation: "10x.builders",
            description:
              "Chrome OS와 Crostini를 활용한 안정적인 프론트엔드 개발 환경과 생산성 노하우를 소개합니다.",
          },
        ],
      },
      {
        time: "13:05~13:20",
        sessions: [
          {
            time: "13:05~13:20",
            hall: "Talk 1",
            title: "우리의 Nitro Module은 당신의 Native Module보다 아름답다",
            speaker: "이현우",
            affiliation: "토스",
            description:
              "Nitro Modules의 동작 방식과 React Native 오픈소스 라이브러리 개발 과정의 인사이트를 공유합니다.",
          },
          {
            time: "13:05~13:20",
            hall: "Talk 2",
            title: "노래 가사가 쏟아지고, 부딪히고, 쌓입니다",
            speaker: "임민주",
            description:
              "노래 가사가 떨어지고 쌓이는 인터랙션을 만들며 5fps 성능 문제를 추적한 과정을 이야기합니다.",
          },
        ],
      }
    ],
  },
  {
    id: "networking",
    title: "Networking",
    subtitle: "참가자들이 자유롭게 교류하는 네트워킹 시간입니다.",
    halls: ["Networking"],
    rows: [
      {
        time: "14:00~14:30",
        sessions: [
          {
            time: "14:00~14:30",
            hall: "Networking",
            title: "네트워킹 타임 1",
          },
        ],
      },
      {
        time: "14:40~15:10",
        sessions: [
          {
            time: "14:40~15:10",
            hall: "Networking",
            title: "네트워킹 타임 2",
          },
        ],
      },
      {
        time: "15:20~15:50",
        sessions: [
          {
            time: "15:20~15:50",
            hall: "Networking",
            title: "네트워킹 타임 3",
          },
        ],
      },
      {
        time: "16:00~16:30",
        sessions: [
          {
            time: "16:00~16:30",
            hall: "Networking",
            title: "네트워킹 타임 4",
          },
        ],
      }
    ],
  }
];

export const SCHEDULE = {
  heading: {
    title: ["Schedule"],
    subtitle: ["최종 세션 시간표와", "라이트닝 토크를 소개합니다"],
  },
  download: {
    // pre-rasterized from full-schedule-overview.svg (same document the
    // browser would show) so the click saves a ready-to-share image —
    // regenerate the PNG whenever the SVG is regenerated
    label: "FullSchedule.png",
    href: assetPath(
      "/images/generated/full-schedule-overview-networking-updated.png",
    ),
    notice: "*스케줄은 추후 변경될 수 있습니다",
  },
};

/* ----------------------------- experience ----------------------------- */

export interface ExperienceCard {
  no: string;
  image: string;
  alt: string;
  title: string;
  description: string;
}

export const EXPERIENCE = {
  heading: {
    title: ["Experience"],
    subtitle: ["FEConf 현장에서만 만나는", "다섯 가지 순간들을 소개합니다"],
  },
  cards: [
    {
      no: "01",
      image: assetPath("/images/experience/feconf-experience-01.jpg"),
      alt: "FEConf 체크인 데스크에서 참가자를 맞이하는 스태프들",
      title: "웰컴 체크인 데스크",
      description:
        "FEConf의 하루를 부드럽게 시작할 수 있도록 현장에서 참가자를 맞이합니다.",
    },
    {
      no: "02",
      image: assetPath("/images/experience/feconf-experience-02.jpg"),
      alt: "참가자에게 FEConf 출입 배지를 전달하는 모습",
      title: "참가자 배지와 굿즈",
      description: "컨퍼런스 여정에 필요한 배지와 작은 환영 선물을 준비합니다.",
    },
    {
      no: "03",
      image: assetPath("/images/experience/feconf-experience-03.jpg"),
      alt: "프론트엔드 엔지니어들이 둥근 테이블에서 대화하는 모습",
      title: "동료들과의 대화 시간",
      description:
        "같은 고민을 가진 개발자들과 인사이트를 나누고 연결되는 시간을 만듭니다.",
    },
    {
      no: "04",
      image: assetPath("/images/experience/feconf-experience-04.jpg"),
      alt: "FEConf 행사장 부스에서 참가자와 대화하는 모습",
      title: "커뮤니티 부스",
      description:
        "후원사와 커뮤니티를 만나 새로운 협업의 가능성을 발견해 보세요.",
    },
    {
      no: "05",
      image: assetPath("/images/experience/feconf-experience-05.jpg"),
      alt: "FEConf 발표자가 무대에서 세션을 진행하는 모습",
      title: "깊이 있는 세션",
      description:
        "실무 경험이 담긴 발표를 통해 다음 프론트엔드 도전을 위한 힌트를 얻습니다.",
    },
  ] as ExperienceCard[],
};

/* ------------------------------ sponsors ------------------------------ */

export interface Sponsor {
  name: string;
  src?: string;
  width?: number;
  height?: number;
  logoVariant?: "jpub";
}

export interface SponsorTier {
  id: "diamond" | "platinum" | "special" | "media";
  title: string;
  sponsors: Sponsor[];
}

export const SPONSORS_SECTION = {
  heading: {
    title: ["Sponsors"],
    subtitle: ["FECONF 10주년을 빛내줄 스폰서를 소개합니다"],
  },
  tiers: [
    {
      id: "diamond",
      title: "Diamond",
      sponsors: [
        {
          name: "토스",
          src: assetPath("/images/sponsor-toss.svg"),
          width: 659,
          height: 200,
        },
      ],
    },
    {
      id: "platinum",
      title: "Platinum",
      sponsors: [
        {
          name: "미리디",
          src: assetPath("/images/sponsor-miridih.png"),
          width: 687,
          height: 157,
        },
        { name: "당근", src: assetPath("/images/sponsor-2.svg") },
        {
          name: "피그마",
          src: assetPath("/images/sponsor-figma.svg"),
          width: 624,
          height: 247,
        },
        {
          name: "와이스",
          src: assetPath("/images/sponsor-wyyyes.svg"),
          width: 1000,
          height: 219,
        },
      ],
    },
    {
      id: "special",
      title: "Special",
      sponsors: [
        {
          name: "티켓타코",
          src: assetPath("/images/sponsor-ticketaco.svg"),
          width: 1251,
          height: 415,
        },
        {
          name: "제이펍",
          src: assetPath("/images/sponsor-jpub.png"),
          width: 459,
          height: 262,
          logoVariant: "jpub",
        },
      ],
    },
    {
      id: "media",
      title: "Media Partner",
      sponsors: [
        {
          name: "요즘 IT",
          src: assetPath("/images/sponsor-yozm.png"),
          width: 104,
          height: 28,
        },
      ],
    },
  ] as SponsorTier[],
};

/* ------------------------------- buddy -------------------------------- */

export const BUDDY = {
  heading: {
    title: ["FORWARD EVER", "Forever Buddy"],
    subtitle: ["FEConf의 마스코트를 직접 키워보세요."],
  },
  command: {
    /** the prompt is decoration; only `text` reaches the clipboard */
    prompt: "$",
    text: "npx feconf2026-buddy",
    copy: "COPY",
    copied: "COPIED",
  },
  link: {
    label: "View on npm",
    href: "https://www.npmjs.com/package/feconf2026-buddy",
  },
};

/**
 * Buddy sprite sheet. The roaming snails walk with the first frame and switch
 * to the others for tap reactions; their #FF5080 body is re-tinted to the
 * hero pick's accent at runtime.
 */
export const BUDDY_SNAILS = [
  assetPath("/images/snail/snail-forward-hero-sharp.svg"),
  assetPath("/images/snail/snail-happy-hero-sharp.svg"),
  assetPath("/images/snail/snail-hello-hero-sharp.svg"),
  assetPath("/images/snail/snail-sleep-hero-sharp.svg"),
];

/* --------------------------- code of conduct -------------------------- */

export const CONDUCT = {
  heading: { title: ["Code of", "Conducts"] },
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
      body: "FEConf는 지식 재산권과 개인 정보 등의 권리를 존중합니다. 지식 재산권을 위배하거나 개인 정보를 침해하는 어떠한 콘텐츠도 FEConf에서 사용할 수 없습니다.",
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
      button: {
        label: "Copy link",
        icon: "link" as const,
        href: "https://www.linkedin.com/groups/14618353/",
        /** clicking copies `href` instead of opening it */
        copy: true,
        copiedText: "Copied!",
      },
    },
    {
      title: "Contact",
      lines: [
        "접근성 관련하여 행사 참석에 도움이 필요하실 경우,",
        "메일로 편하게 연락주세요.",
        "프론트엔드 개발자에 의한, 프론트엔드 개발자를 위한 FEConf의 발전을 위해",
        "도움을 주실 분도 언제든 환영합니다.",
      ],
      mail: "feconf@googlegroups.com",
      button: {
        label: "Copy mail",
        icon: "copy" as const,
        href: "mailto:feconf@googlegroups.com",
        copy: true,
        /** the address itself, not the `mailto:` href */
        copyText: "feconf@googlegroups.com",
        copiedText: "Copied!",
      },
    },
  ],
};

/* ------------------------------- footer ------------------------------- */

export const FOOTER = {
  bgSrc: assetPath("/images/footer-gradient-bg.png"),
  note: "FEConf BY FEDG. 2026.10.24 SAT. 10:00 OPEN. LOTTE TOWER 35F SEOUL, KOREA",
};
