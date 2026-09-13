import Script from "next/script";
import { getGaId } from "@/lib/analytics";

export function SiteAnalytics() {
  const gaId = getGaId();
  if (!gaId) return null;

  return (
    <>
      <Script
        id="google-analytics-js"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', ${JSON.stringify(gaId)});
        `}
      </Script>
    </>
  );
}
