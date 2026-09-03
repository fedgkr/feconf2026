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
export const TICKET_OPEN_AT = "2026-10-01T00:00:00+09:00";

export const TICKET_LINK = { label: "TICKET OPEN", href: "#tickets" };

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

export type Hall = "A hall" | "B hall" | "TOSS";

export interface Session {
  time: string;
  hall: Hall;
  title: string;
  speaker: string;
  affiliation: string;
  description: string;
  tags: string[];
}

/** hall accent: badge letter, card hover flood, detail surface */
export const HALL_COLOR: Record<Hall, string> = {
  "A hall": "var(--color-pink)",
  "B hall": "var(--color-blue)",
  TOSS: "var(--color-toss)",
};

export const TOSS_BADGE_SRC = assetPath("/images/toss-badge-21d583.png");

/** row-major: every three entries share a time slot across A / B / TOSS */
export const SESSIONS: Session[] = [
  {
    time: "13:00~13:40",
    hall: "A hall",
    title: "후원사 세션",
    speaker: "FEConf Team",
    affiliation: "FEConf",
    description:
      "FEConf 2026을 함께 만드는 파트너를 소개하고, 올해 행사에서 만날 수 있는 주요 프로그램과 현장 경험을 짧고 밀도 있게 안내합니다.",
    tags: ["#FEConf", "#Sponsor", "#Opening"],
  },
  {
    time: "13:00~13:40",
    hall: "B hall",
    title: "Airbridge SDK팀이 순수한 Unit Testable한 코드를 작성하는 방법",
    speaker: "최수범",
    affiliation: "Airbridge",
    description:
      "복잡한 SDK 코드에서 외부 의존성을 분리하고, 테스트 가능한 구조를 팀의 기본값으로 만드는 과정을 공유합니다. 실제 코드베이스에서 순수 함수와 경계 설계를 적용하며 얻은 시행착오를 통해 프론트엔드 테스트 전략을 다시 점검합니다.",
    tags: ["#Airbridge", "#UnitTest", "#SDK"],
  },
  {
    time: "13:00~13:40",
    hall: "TOSS",
    title: "대규모 금융 서비스에서 프론트엔드 안정성 지키기",
    speaker: "김도현",
    affiliation: "토스",
    description:
      "매일 수많은 사용자가 거치는 금융 화면에서 배포 안정성을 높이기 위해 어떤 기준과 자동화가 필요한지 살펴봅니다. 장애를 줄이는 관찰 지표, 릴리즈 흐름, 회귀 테스트 운영 방식을 실무 사례 중심으로 소개합니다.",
    tags: ["#Toss", "#Reliability", "#Frontend"],
  },
  {
    time: "13:50~14:30",
    hall: "A hall",
    title: "AI 시대의 프론트엔드 아키텍처",
    speaker: "김민준",
    affiliation: "뤼튼테크놀로지스",
    description:
      "생성형 AI 기능이 제품 안으로 들어올 때 프론트엔드 구조는 어떻게 달라져야 할까요? 스트리밍 응답, 실패 복구, 사용자 피드백 루프를 UI 아키텍처 관점에서 정리합니다.",
    tags: ["#AI", "#Architecture", "#Product"],
  },
  {
    time: "13:50~14:30",
    hall: "B hall",
    title: "상태 관리를 줄이는 서버 컴포넌트 설계",
    speaker: "이지원",
    affiliation: "당근",
    description:
      "서버와 클라이언트의 책임을 다시 나누면 상태 관리 코드가 얼마나 줄어드는지 실제 서비스 화면을 기준으로 설명합니다. 데이터 소유권, 캐싱, 인터랙션 경계를 결정하는 기준을 공유합니다.",
    tags: ["#React", "#ServerComponents", "#State"],
  },
  {
    time: "13:50~14:30",
    hall: "TOSS",
    title: "디자인 토큰으로 제품 속도를 높이는 법",
    speaker: "박서연",
    affiliation: "토스",
    description:
      "브랜드와 접근성 기준을 잃지 않으면서 여러 제품이 같은 속도로 움직이게 만드는 토큰 운영 방식을 다룹니다. 디자이너와 개발자가 함께 쓰는 언어를 만드는 과정을 소개합니다.",
    tags: ["#DesignSystem", "#Token", "#Toss"],
  },
  {
    time: "14:40~15:20",
    hall: "A hall",
    title: "웹 성능 예산을 팀 문화로 만드는 법",
    speaker: "정다은",
    affiliation: "무신사",
    description:
      "성능 개선이 일회성 프로젝트로 끝나지 않도록 예산, 측정, 리뷰 문화를 어떻게 운영했는지 공유합니다. Lighthouse 점수 너머의 실제 사용자 경험 지표를 중심으로 이야기합니다.",
    tags: ["#Performance", "#Culture", "#WebVitals"],
  },
  {
    time: "14:40~15:20",
    hall: "B hall",
    title: "접근성을 QA 체크리스트 밖으로 꺼내기",
    speaker: "한유진",
    affiliation: "네이버",
    description:
      "접근성을 마지막 점검 항목이 아니라 제품 설계의 기본값으로 만들기 위한 프론트엔드 팀의 실천 방법을 소개합니다. 컴포넌트, 문서, 테스트가 함께 움직이는 구조를 다룹니다.",
    tags: ["#Accessibility", "#QA", "#Component"],
  },
  {
    time: "14:40~15:20",
    hall: "TOSS",
    title: "결제 화면을 빠르게 실험하는 프론트엔드 플랫폼",
    speaker: "오세훈",
    affiliation: "토스페이먼츠",
    description:
      "결제 전환율을 높이기 위해 화면 실험을 안전하게 열고 닫는 플랫폼 구조를 설명합니다. 실험 단위, 지표 수집, 장애 차단 장치를 함께 살펴봅니다.",
    tags: ["#Experiment", "#Payment", "#Platform"],
  },
  {
    time: "15:40~16:20",
    hall: "A hall",
    title: "마이크로 인터랙션으로 제품의 감각 만들기",
    speaker: "윤하늘",
    affiliation: "라인플러스",
    description:
      "작은 움직임이 제품의 사용감을 어떻게 바꾸는지, 성능과 접근성을 해치지 않는 선에서 인터랙션을 설계하는 방법을 소개합니다. 디자인 의도를 코드로 옮기는 협업 과정도 함께 다룹니다.",
    tags: ["#Interaction", "#Motion", "#UX"],
  },
  {
    time: "15:40~16:20",
    hall: "B hall",
    title: "프론트엔드 관측 가능성 제대로 시작하기",
    speaker: "문태호",
    affiliation: "컬리",
    description:
      "사용자 브라우저에서 일어나는 오류와 느린 경험을 팀이 빠르게 이해하려면 어떤 이벤트와 지표가 필요할까요? 로깅, 세션 리플레이, 알림 기준을 현실적으로 구성하는 법을 공유합니다.",
    tags: ["#Observability", "#Monitoring", "#UX"],
  },
  {
    time: "15:40~16:20",
    hall: "TOSS",
    title: "모노레포에서 배포 자신감 회복하기",
    speaker: "서지훈",
    affiliation: "토스",
    description:
      "서비스가 늘어날수록 느려지는 빌드와 불안한 배포를 어떻게 다뤘는지 이야기합니다. 영향 범위 계산, 캐시 전략, 자동 검증 흐름으로 팀의 배포 리듬을 되찾은 경험을 공유합니다.",
    tags: ["#Monorepo", "#Deploy", "#CI"],
  },
  {
    time: "16:20~17:10",
    hall: "A hall",
    title: "개발자 채용을 어떻게 하면 잘 할 수 있을까요?",
    speaker: "개발자 출신 HR 연사",
    affiliation: "현대오토에버",
    description:
      "연간 수십만 건의 지원서를 처리하는 현대오토에버는 어떻게 최적의 개발자를 찾아낼까요? 개발자 출신 HR 연사가 AI와 데이터 분석으로 채용의 병목 현상을 해결한 실전 노하우를 공유합니다. 채용 브랜딩부터 기술 검증까지, 실력 있는 개발자가 먼저 찾아오게 만드는 고도화된 채용 시스템의 비밀을 통해 현실적인 해법을 얻어 가세요.",
    tags: ["#현대오토에버", "#개발자채용", "#AI"],
  },
  {
    time: "16:20~17:10",
    hall: "B hall",
    title: "브라우저 렌더링 병목을 찾는 디버깅 루틴",
    speaker: "최수범",
    affiliation: "Airbridge",
    description:
      "느린 화면을 감으로 고치지 않기 위해 렌더링 파이프라인을 어떻게 읽고 병목을 좁혀 가는지 소개합니다. 실제 트레이스 분석을 바탕으로 레이아웃, 페인트, 스크립트 비용을 분리해 봅니다.",
    tags: ["#Airbridge", "#Rendering", "#Debugging"],
  },
  {
    time: "16:20~17:10",
    hall: "TOSS",
    title: "타입 안정성으로 제품 변경을 더 빠르게",
    speaker: "장혜린",
    affiliation: "토스",
    description:
      "도메인이 빠르게 바뀌는 제품에서 타입 시스템을 방어막이 아니라 가속 장치로 쓰는 방법을 다룹니다. API 계약, 폼 모델, 런타임 검증을 연결해 변경 비용을 줄인 사례를 공유합니다.",
    tags: ["#TypeScript", "#Product", "#Toss"],
  },
  {
    time: "17:20~18:00",
    hall: "A hall",
    title: "10년 뒤에도 읽히는 프론트엔드 코드",
    speaker: "정윤호",
    affiliation: "카카오",
    description:
      "기술 선택보다 오래 남는 것은 팀이 코드를 이해하고 바꾸는 방식입니다. 컴포넌트 책임, 문서화, 리뷰 기준을 통해 시간이 지나도 고치기 쉬운 코드를 만드는 원칙을 정리합니다.",
    tags: ["#CodeQuality", "#Team", "#Frontend"],
  },
  {
    time: "17:20~18:00",
    hall: "B hall",
    title: "프론트엔드 리더가 기술 부채를 말하는 방식",
    speaker: "신예린",
    affiliation: "우아한형제들",
    description:
      "기술 부채를 단순히 낡은 코드의 문제가 아니라 제품 리스크와 팀 속도의 언어로 설명하는 방법을 다룹니다. 우선순위, 설득 자료, 점진적 개선 계획을 현실적으로 세우는 과정을 공유합니다.",
    tags: ["#Leadership", "#TechDebt", "#Team"],
  },
  {
    time: "17:20~18:00",
    hall: "TOSS",
    title: "프론트엔드 개발자가 제품 지표를 읽는 법",
    speaker: "이도윤",
    affiliation: "토스",
    description:
      "화면을 만드는 일을 넘어 제품 지표를 읽고 실험을 제안하는 프론트엔드 개발자의 역할을 이야기합니다. 로그 설계, 퍼널 해석, 사용자 행동을 코드 의사결정과 연결하는 방법을 다룹니다.",
    tags: ["#Metrics", "#Product", "#Toss"],
  },
];

export const SCHEDULE = {
  heading: {
    title: ["Schedule"],
    subtitle: ["10주년을 맞아 풍부해진", "다양한 이벤트들을 소개합니다"],
  },
  download: { label: "FullSchedule.jpg", href: "#" },
  halls: ["A hall", "B hall", "TOSS"] as Hall[],
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
  src: string;
  /** media partners carry a small label above the logo */
  label?: string;
  width?: number;
  height?: number;
}

export const SPONSORS_SECTION = {
  heading: {
    title: ["Sponsors"],
    subtitle: ["FECONF 10주년을 빛내줄 스폰서를 소개합니다"],
  },
  /** two rows of four; the grid draws hairlines between them */
  sponsors: [
    {
      name: "wyyyes",
      src: assetPath("/images/sponsor-wyyyes-4a5aac.png"),
      width: 200,
      height: 80,
    },
    { name: "imweb", src: assetPath("/images/sponsor-1.svg") },
    {
      name: "Toss",
      src: assetPath("/images/sponsor-toss.png"),
      width: 200,
      height: 80,
    },
    { name: "당근", src: assetPath("/images/sponsor-2.svg") },
    { name: "stibee", src: assetPath("/images/sponsor-3.svg") },
    { name: "F-Lab", src: assetPath("/images/sponsor-4.svg") },
    {
      name: "Olive Young",
      src: assetPath("/images/sponsor-oliveyoung-6dc94d.png"),
      width: 200,
      height: 80,
    },
    {
      name: "요즘 IT",
      src: assetPath("/images/sponsor-yozm.png"),
      label: "Media Partner",
      width: 104,
      height: 28,
    },
  ] as Sponsor[],
};

/* ------------------------------- buddy -------------------------------- */

export const BUDDY = {
  heading: {
    title: ["FORWARD EVER", "Forever Buddy"],
    subtitle: ["FEConf의 마스코트를 직접 키워보고, 10주년 굿즈도 받아보세요."],
  },
  button: {
    label: "View on npm",
    icon: "external" as const,
    href: "https://www.npmjs.com/package/feconf-26-mascot",
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
      button: { label: "Share", icon: "link" as const, href: "#" },
    },
    {
      title: "Contact",
      lines: [
        "접근성 관련하여 행사 참석에 도움이 필요하실 경우,",
        "메일로 편하게 연락주세요.",
        "프론트엔드 개발자에 의한, 프론트엔드 개발자를 위한 FEConf의 발전을 위해",
        "도움을 주실 분도 언제든 환영합니다.",
      ],
      mail: "@feconf@googlegroups.com",
      button: {
        label: "Mail",
        icon: "arrow" as const,
        href: "mailto:feconf@googlegroups.com",
      },
    },
  ],
};

/* ------------------------------- footer ------------------------------- */

export const FOOTER = {
  bgSrc: assetPath("/images/footer-gradient-bg.png"),
  note: "FEConf BY FEDG. 2026.10.24 THU. LOTTE TOWER 35F SEOUL, KOREA",
};
