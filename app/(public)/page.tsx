import Link from "next/link";

import { Card } from "@/_components/card";
import { FeatureTabs } from "@/_components/feature-tabs";
import { Section } from "@/_components/section";
import { VisualStack } from "@/_components/visual-stack";
import { Button } from "@/_components/ui/button";

export default function PublicHome() {
  return (
    <div className="container space-y-16 py-12">
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-secondary/60 px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <span>public</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground" />
            <span>design system ready</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
              Une landing solide, customisable, et deja connectee aux bons
              outils.
            </h1>
            <p className="max-w-xl text-base text-muted-foreground md:text-lg">
              Structure Next.js pro, tokens Tailwind, composants Radix/shadcn
              adaptables, et socle data Supabase + Firebase.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/dashboard">Acceder a l'admin</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/features">Voir les modules</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="rounded-full border border-border px-3 py-1">
              Supabase dynamique
            </span>
            <span className="rounded-full border border-border px-3 py-1">
              Firebase long terme
            </span>
            <span className="rounded-full border border-border px-3 py-1">
              Tokens design
            </span>
          </div>
        </div>
        <div className="rounded-[32px] border border-border bg-white/80 p-6 shadow-soft">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Interface preview
            </p>
            <div className="space-y-3 rounded-2xl border border-border bg-secondary/30 p-4">
              <div className="h-3 w-24 rounded-full bg-foreground/10" />
              <div className="h-3 w-40 rounded-full bg-foreground/10" />
              <div className="h-3 w-32 rounded-full bg-foreground/10" />
              <div className="mt-6 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-foreground/10" />
                <div className="space-y-2">
                  <div className="h-3 w-20 rounded-full bg-foreground/10" />
                  <div className="h-3 w-28 rounded-full bg-foreground/10" />
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
              Design system en cours d'iteration, composants customisables.
            </div>
          </div>
        </div>
      </section>

      <Section
        title="Ce qui est deja en place"
        description="Architecture claire, modules internes, et documentation au propre."
      >
        <div className="grid gap-6 md:grid-cols-3">
          <Card
            title="Public + Admin"
            body="Deux espaces distincts pour le site et l'application."
          />
          <Card
            title="Design system"
            body="Tokens Tailwind et composants shadcn modifies pour votre charte."
          />
          <Card
            title="Data stack"
            body="Supabase pour le dynamisme, Firebase pour la duree."
          />
        </div>
      </Section>

      <Section
        title="Comportements UI"
        description="Radix pour les interactions, shadcn pour accelerer."
      >
        <FeatureTabs />
      </Section>

      <Section
        title="Visuels interactifs"
        description="Three.js pour enrichir l'experience."
      >
        <VisualStack />
      </Section>

      <section className="rounded-[32px] border border-border bg-secondary/50 p-10 text-center shadow-crisp">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          On valide la charte et on pousse le design ?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
          L'infrastructure est en place. On peut maintenant definir les tokens
          finaux, poser les composants shadcn customises, et brancher les
          premiers flux de donnees.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/pricing">Demarrer</Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href="/about">Voir l'equipe</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
