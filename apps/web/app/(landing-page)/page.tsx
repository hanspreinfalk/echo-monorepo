import { HeroHeader } from "./_components/header";
import HeroSection from "./_components/hero-section";
import FAQs from "./_components/faqs";
import FeaturesSection from "./_components/features";
import PricingSection from "./_components/pricing-section";
import { Footer } from "./_components/footer";
import CallToAction from "./_components/cta";

export default function LandingPage() {
  return (
    <>
      <HeroHeader />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <FAQs />
      <CallToAction />
      <Footer />
    </>
  )
}