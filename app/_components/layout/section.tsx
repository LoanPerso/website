"use client";

import { forwardRef, type ReactNode, type HTMLAttributes } from "react";
import { cn } from "@/_lib/utils";

type SectionTheme = "light" | "dark" | "accent";
type SectionSize = "sm" | "md" | "lg" | "xl" | "full";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  theme?: SectionTheme;
  size?: SectionSize;
  noPadding?: boolean;
  id?: string;
}

const sizeClasses: Record<SectionSize, string> = {
  sm: "py-16 md:py-20",
  md: "py-20 md:py-28",
  lg: "py-28 md:py-40",
  xl: "py-40 md:py-56",
  full: "min-h-screen",
};

const themeClasses: Record<SectionTheme, string> = {
  light: "bg-background text-foreground",
  dark: "bg-deep-black text-white",
  accent: "bg-accent/10 text-foreground",
};

export const Section = forwardRef<HTMLElement, SectionProps>(
  (
    {
      children,
      className,
      containerClassName,
      theme = "light",
      size = "md",
      noPadding = false,
      id,
      ...props
    },
    ref
  ) => {
    return (
      <section
        ref={ref}
        id={id}
        className={cn(
          "relative w-full overflow-hidden",
          themeClasses[theme],
          !noPadding && sizeClasses[size],
          className
        )}
        {...props}
      >
        <div className={cn("container mx-auto px-6 md:px-8", containerClassName)}>
          {children}
        </div>
      </section>
    );
  }
);

Section.displayName = "Section";

// Full-width section (no container)
interface FullWidthSectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
  theme?: SectionTheme;
  size?: SectionSize;
  noPadding?: boolean;
  id?: string;
}

export const FullWidthSection = forwardRef<HTMLElement, FullWidthSectionProps>(
  (
    {
      children,
      className,
      theme = "light",
      size = "md",
      noPadding = false,
      id,
      ...props
    },
    ref
  ) => {
    return (
      <section
        ref={ref}
        id={id}
        className={cn(
          "relative w-full overflow-hidden",
          themeClasses[theme],
          !noPadding && sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </section>
    );
  }
);

FullWidthSection.displayName = "FullWidthSection";

// Hero section (full viewport height)
interface HeroSectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  theme?: SectionTheme;
  centered?: boolean;
}

export const HeroSection = forwardRef<HTMLElement, HeroSectionProps>(
  (
    {
      children,
      className,
      containerClassName,
      theme = "light",
      centered = true,
      ...props
    },
    ref
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          "relative min-h-screen w-full overflow-hidden",
          themeClasses[theme],
          centered && "flex items-center justify-center",
          className
        )}
        {...props}
      >
        <div className={cn("container mx-auto px-6 md:px-8", containerClassName)}>
          {children}
        </div>
      </section>
    );
  }
);

HeroSection.displayName = "HeroSection";

// Container component for consistent spacing
interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const containerSizes: Record<string, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-none",
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, className, size = "lg", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mx-auto w-full px-6 md:px-8",
          containerSizes[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";

// Grid layout helper
interface GridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: "sm" | "md" | "lg" | "xl";
}

const gridCols: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  12: "grid-cols-4 md:grid-cols-6 lg:grid-cols-12",
};

const gridGaps: Record<string, string> = {
  sm: "gap-4",
  md: "gap-6 md:gap-8",
  lg: "gap-8 md:gap-12",
  xl: "gap-12 md:gap-16",
};

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ children, className, cols = 3, gap = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("grid", gridCols[cols], gridGaps[gap], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = "Grid";
