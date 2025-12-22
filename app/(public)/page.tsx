"use client";

import { useRef } from "react";
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
import { BrandOverlay, type BrandOverlayRef } from "./_sections/hero/brand-overlay";

export default function PublicHome() {
  const brandOverlayRef = useRef<BrandOverlayRef>(null);

  return (
    <div className="bg-background text-foreground w-full overflow-x-hidden">
      <CustomCursor />
      <Preloader />

      {/* Brand overlay - fixed, z-index allows sections to pass over */}
      <BrandOverlay ref={brandOverlayRef} />

      {/* Section 1: Hero */}
      <Hero brandOverlayRef={brandOverlayRef} />

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
