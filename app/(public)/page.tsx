"use client";

import CustomCursor from "@/_components/ui/custom-cursor";
import Preloader from "@/_components/preloader";
import {
  Hero,
  HorizontalProducts,
  Stats,
  Process,
  FeaturesGrid,
  Testimonials,
  CtaFinal,
} from "./_sections";

export default function PublicHome() {
  return (
    <div className="bg-background text-foreground w-full">
      <CustomCursor />
      <Preloader />

      {/* Section 1: Hero (includes Brand Statement) */}
      <Hero />

      {/* Section 2: Horizontal Scroll Products */}
      <HorizontalProducts />

      {/* Section 4: Stats */}
      <Stats />

      {/* Section 5: Process */}
      <Process />

      {/* Section 6: Features Grid */}
      <FeaturesGrid />

      {/* Section 7: Testimonials */}
      <Testimonials />

      {/* Section 8: CTA Final */}
      <CtaFinal />
    </div>
  );
}
