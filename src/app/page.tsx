import SiteNav from "@/components/SiteNav";
import HeroSection from "@/components/sections/HeroSection";
import StorySection from "@/components/sections/StorySection";
import ScheduleSection from "@/components/sections/ScheduleSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import SponsorsSection from "@/components/sections/SponsorsSection";
import BuddySection from "@/components/sections/BuddySection";
import ConductSection from "@/components/sections/ConductSection";
import ShareContactSection from "@/components/sections/ShareContactSection";
import FooterSection from "@/components/sections/FooterSection";

export default function Home() {
  return (
    <div className="overflow-x-clip">
      <SiteNav />
      <main>
        <HeroSection />
        <StorySection />
        <ScheduleSection />
        <ExperienceSection />
        <SponsorsSection />
        <BuddySection />
        <ConductSection />
        <ShareContactSection />
      </main>
      <FooterSection />
    </div>
  );
}
