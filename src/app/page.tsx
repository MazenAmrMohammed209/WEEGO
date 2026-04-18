import { Hero } from "@/components/home/Hero";
import { StepsSection } from "@/components/home/StepsSection";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { FleetSection } from "@/components/home/FleetSection";
import { AirportTransfers } from "@/components/home/AirportTransfers";
import { RewardsHighlight } from "@/components/home/RewardsHighlight";
import { Testimonials } from "@/components/home/Testimonials";
import { CTASection } from "@/components/home/CTASection";
import { StatsSection } from "@/components/home/StatsSection";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <StatsSection />
      <StepsSection />
      <WhyChooseUs />
      <FleetSection />
      <AirportTransfers />
      <Testimonials />
      <RewardsHighlight />
    </div>
  );
}
