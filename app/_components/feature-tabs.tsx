"use client";

import * as Tabs from "@radix-ui/react-tabs";

import { cn } from "@/_lib/utils";

const tabItems = [
  {
    value: "stack",
    label: "Stack",
    title: "Technos principales",
    body: "Next.js, Tailwind, Radix, shadcn/ui, Supabase, Firebase."
  },
  {
    value: "system",
    label: "Design system",
    title: "Tokens et composants",
    body: "Tokens CSS variables, composants customises, et primitives Radix."
  },
  {
    value: "delivery",
    label: "Livraison",
    title: "Vitesse et qualite",
    body: "Structure claire, modules isoles, docs synchronisees."
  }
];

export function FeatureTabs() {
  return (
    <Tabs.Root defaultValue={tabItems[0].value} className="space-y-6">
      <Tabs.List className="inline-flex rounded-full border border-border bg-secondary/60 p-1">
        {tabItems.map((item) => (
          <Tabs.Trigger
            key={item.value}
            value={item.value}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition",
              "data-[state=active]:bg-background data-[state=active]:text-foreground"
            )}
          >
            {item.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabItems.map((item) => (
        <Tabs.Content
          key={item.value}
          value={item.value}
          className="rounded-2xl border border-border bg-white/80 p-6 shadow-soft"
        >
          <h3 className="text-xl font-semibold tracking-tight">{item.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
