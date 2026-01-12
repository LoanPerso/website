/**
 * Country Flag SVG Components
 *
 * Clean SVG flags instead of emoji to ensure consistent rendering
 * across all platforms and browsers.
 */

import { CountryCode } from "../types";

interface FlagProps {
  className?: string;
}

// France Flag - Blue White Red
function FranceFlag({ className = "w-8 h-6" }: FlagProps) {
  return (
    <svg className={className} viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="24" rx="2" fill="#EDEDED" />
      <rect width="10.67" height="24" fill="#002395" />
      <rect x="10.67" width="10.67" height="24" fill="white" />
      <rect x="21.33" width="10.67" height="24" fill="#ED2939" />
    </svg>
  );
}

// Belgium Flag - Black Yellow Red
function BelgiumFlag({ className = "w-8 h-6" }: FlagProps) {
  return (
    <svg className={className} viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="24" rx="2" fill="#EDEDED" />
      <rect width="10.67" height="24" fill="#2D2926" />
      <rect x="10.67" width="10.67" height="24" fill="#FFD100" />
      <rect x="21.33" width="10.67" height="24" fill="#C8102E" />
    </svg>
  );
}

// Switzerland Flag - Red with white cross
function SwitzerlandFlag({ className = "w-8 h-6" }: FlagProps) {
  return (
    <svg className={className} viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="24" rx="2" fill="#FF0000" />
      <rect x="14" y="5" width="4" height="14" fill="white" />
      <rect x="9" y="10" width="14" height="4" fill="white" />
    </svg>
  );
}

// Spain Flag - Red Yellow Red with coat of arms hint
function SpainFlag({ className = "w-8 h-6" }: FlagProps) {
  return (
    <svg className={className} viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="24" rx="2" fill="#EDEDED" />
      <rect width="32" height="6" fill="#AA151B" />
      <rect y="6" width="32" height="12" fill="#F1BF00" />
      <rect y="18" width="32" height="6" fill="#AA151B" />
      {/* Simplified coat of arms representation */}
      <rect x="6" y="9" width="4" height="6" rx="1" fill="#AA151B" opacity="0.6" />
    </svg>
  );
}

// Estonia Flag - Blue Black White
function EstoniaFlag({ className = "w-8 h-6" }: FlagProps) {
  return (
    <svg className={className} viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="24" rx="2" fill="#EDEDED" />
      <rect width="32" height="8" fill="#0072CE" />
      <rect y="8" width="32" height="8" fill="#000000" />
      <rect y="16" width="32" height="8" fill="#FFFFFF" />
    </svg>
  );
}

// Main component that renders the appropriate flag
export function CountryFlag({
  code,
  className = "w-8 h-6"
}: {
  code: CountryCode;
  className?: string;
}) {
  const flags: Record<CountryCode, JSX.Element> = {
    FR: <FranceFlag className={className} />,
    BE: <BelgiumFlag className={className} />,
    CH: <SwitzerlandFlag className={className} />,
    ES: <SpainFlag className={className} />,
    EE: <EstoniaFlag className={className} />,
  };

  return flags[code] || null;
}

// Large flag variant for prominent display
export function CountryFlagLarge({
  code,
  className = "w-16 h-12"
}: {
  code: CountryCode;
  className?: string;
}) {
  return <CountryFlag code={code} className={className} />;
}
