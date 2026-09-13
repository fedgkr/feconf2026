import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { SiteAnalytics } from "@/components/SiteAnalytics";
import { introScrollResetScript } from "@/components/IntroScrollReset";
import "./globals.css";

const stableViewportHeightScript = `
  (() => {
    let width = window.innerWidth;
    const allowsHeightResize = () =>
      navigator.maxTouchPoints === 0 &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const setViewportHeight = () =>
      document.documentElement.style.setProperty("--fc-vh", window.innerHeight + "px");
    setViewportHeight();
    window.addEventListener("resize", () => {
      const widthChanged = window.innerWidth !== width;
      if (!widthChanged && !allowsHeightResize()) return;
      width = window.innerWidth;
      setViewportHeight();
    });
  })();
`;

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["600", "800"],
  variable: "--font-archivo",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-jbmono",
});

const description =
  "프론트엔드 개발 컨퍼런스, FEConf 2026에서 다양한 기술과 트렌드를 경험하세요.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "http://localhost:3000",
  ),
  title: "FEConf 2026",
  description,
  openGraph: { title: "FEConf 2026", description, type: "website" },
  twitter: { card: "summary_large_image", title: "FEConf 2026", description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${archivo.variable} ${jetbrainsMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script id="fc-stable-viewport-height" strategy="beforeInteractive">
          {stableViewportHeightScript}
        </Script>
        <Script id="fc-intro-scroll-reset" strategy="beforeInteractive">
          {introScrollResetScript}
        </Script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* the width axis stands in for the "Special Gothic Expanded" cut the
            design names; .font-display sets the stretch */}
        <link
          href="https://fonts.googleapis.com/css2?family=Special+Gothic:wdth,wght@75..125,400..700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* the story lock caps this wrapper's max-height (overflow: clip) to
            bound compositor scrolling — body/html styles must stay untouched:
            overflow set on body propagates to the viewport on some engines
            and froze page scrolling entirely */}
        <div id="fc-scroll-cap">{children}</div>
        <SiteAnalytics />
      </body>
    </html>
  );
}
