import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
  title: "FEConf 2026",
  description,
  openGraph: { title: "FEConf 2026", description, type: "website" },
  twitter: { card: "summary", title: "FEConf 2026", description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${archivo.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <head>
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
      <body>{children}</body>
    </html>
  );
}
