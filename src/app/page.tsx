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
      <HeroSection />
      <QuoteSection />
      <EventsSection />
      <BuddySection />
      <SponsorsSection />
      <ConductSection />
      <ShareContactSection />
      <FooterSection />
    </div>
  );
}
