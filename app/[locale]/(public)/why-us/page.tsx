"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CustomCursor from "@/_components/ui/custom-cursor";
import {
  WhyUsHero,
  WhyUsProblem,
  WhyUsTransition,
  WhyUsValues,
  WhyUsStats,
  WhyUsStory,
  WhyUsPromise,
  WhyUsCta,
} from "./_sections";

gsap.registerPlugin(ScrollTrigger);

export default function WhyUsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Refresh ScrollTrigger after mount
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="bg-background text-foreground w-full overflow-x-hidden">
      <CustomCursor />

      {/* Section 1: Hero - Cinematic entrance */}
      <WhyUsHero />

      {/* Section 2: The Problem - Pain points */}
      <WhyUsProblem />

      {/* Section 3: The Transition - Light reveal */}
      <WhyUsTransition />

      {/* Section 4: Values - 4 pillars */}
      <WhyUsValues />

      {/* Section 5: Stats - Proof points */}
      <WhyUsStats />

      {/* Section 6: Story - Origin */}
      <WhyUsStory />

      {/* Section 7: Promise - What we guarantee */}
      <WhyUsPromise />

      {/* Section 8: CTA - Final call to action */}
      <WhyUsCta />
    </div>
  );
}
