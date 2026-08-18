import CoverPane from "@/components/CoverPane";
import ScrollProgress from "@/components/ScrollProgress";
import SiteNav from "@/components/SiteNav";
import HeroSection from "@/components/sections/HeroSection";
import QuoteSection from "@/components/sections/QuoteSection";
import EventsSection from "@/components/sections/EventsSection";
import BuddySection from "@/components/sections/BuddySection";
import SponsorsSection from "@/components/sections/SponsorsSection";
import ConductSection from "@/components/sections/ConductSection";
import ShareContactSection from "@/components/sections/ShareContactSection";
import FooterSection from "@/components/sections/FooterSection";

export default function Home() {
  return (
    <div className="overflow-x-clip">
      <ScrollProgress />
      <SiteNav />
      {/* Each pane stops at the end of its own scroll and the next one covers
          it. The footer is last, so nothing needs to hold it. */}
      <CoverPane>
        <HeroSection />
      </CoverPane>
      <CoverPane>
        <QuoteSection />
      </CoverPane>
      <CoverPane>
        <EventsSection />
      </CoverPane>
      <CoverPane>
        <BuddySection />
      </CoverPane>
      <CoverPane>
        <SponsorsSection />
      </CoverPane>
      <CoverPane>
        <ConductSection />
      </CoverPane>
      <CoverPane>
        <ShareContactSection />
      </CoverPane>
      <FooterSection />
    </div>
  );
}
