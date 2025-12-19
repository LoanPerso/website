import Link from "next/link";
import { ArrowRight, ShieldCheck, Clock, TrendingUp, CheckCircle2 } from "lucide-react";

export default function PublicHome() {
  return (
    <div className="flex flex-col w-full">
      {/* HERO SECTION - Cinematic */}
      <section className="relative h-[90vh] flex items-center justify-center bg-deep-black text-white overflow-hidden">
        {/* Abstract Background Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800/30 via-deep-black to-deep-black" />
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
           {/* Noise texture simulation if possible, or just gradient */}
           <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-50 contrast-150"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center space-y-8 max-w-4xl">
          <span className="inline-block text-gold text-sm tracking-[0.2em] uppercase font-medium animate-in fade-in slide-in-from-bottom-4 duration-1000">
            L'excellence financière
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight leading-[1.1] text-balance animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            L'art de financer <br />
            <span className="italic text-white/90">votre avenir.</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 max-w-xl mx-auto font-sans leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Une approche confidentielle et sur-mesure du crédit pour les particuliers exigeants et les professionnels ambitieux.
          </p>
          <div className="pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 text-sm tracking-widest uppercase bg-white text-deep-black hover:bg-gold hover:text-white transition-all duration-300 ease-out border border-transparent hover:border-gold"
            >
              Simuler mon projet
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST INDICATORS */}
      <section className="py-12 bg-background border-b border-border/50">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Placeholders for regulatory bodies/partners */}
          {["Banque de France", "ACPR", "FBF", "Orias"].map((partner) => (
            <div key={partner} className="text-xl font-serif italic text-foreground/60 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> {partner}
            </div>
          ))}
        </div>
      </section>

      {/* OFFERS SECTION */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-16 md:mb-24 space-y-4 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-serif text-foreground">Solutions exclusives</h2>
            <p className="text-muted-foreground text-lg">Des financements adaptés à chaque étape de votre patrimoine.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Privilège Personnel",
                desc: "Pour vos projets de vie, voyages, ou acquisitions d'exception.",
                icon: Clock,
              },
              {
                title: "Immobilier Prestige",
                desc: "Acquisition de résidence principale, secondaire ou investissement locatif.",
                icon: ShieldCheck,
              },
              {
                title: "Trésorerie Pro",
                desc: "Liquidités pour développer votre activité ou saisir une opportunité.",
                icon: TrendingUp,
              },
            ].map((offer, i) => (
              <div
                key={i}
                className="group p-8 border border-border bg-white/50 hover:bg-white hover:border-gold/50 transition-all duration-500 hover:shadow-soft flex flex-col justify-between min-h-[300px]"
              >
                <div>
                  <offer.icon className="w-8 h-8 text-gold mb-6 stroke-1" />
                  <h3 className="text-2xl font-serif mb-4 text-foreground">{offer.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{offer.desc}</p>
                </div>
                <div className="mt-8 pt-8 border-t border-border/30">
                  <span className="text-sm uppercase tracking-wider text-foreground group-hover:text-gold transition-colors flex items-center gap-2">
                    Découvrir <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIMULATOR SECTION (Minimal) */}
      <section className="py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-background p-8 md:p-16 shadow-soft border border-border">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif mb-4">Estimez votre capacité</h2>
              <p className="text-muted-foreground">Une simulation immédiate, sans engagement.</p>
            </div>

            {/* Mock Simulator UI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-sm uppercase tracking-wide text-muted-foreground">Montant souhaité</label>
                  <div className="text-4xl font-serif border-b border-border pb-2 flex items-baseline gap-2 text-foreground">
                    50 000 <span className="text-xl text-muted-foreground">€</span>
                  </div>
                  <input type="range" className="w-full accent-gold cursor-pointer" />
                </div>
                <div className="space-y-3">
                  <label className="text-sm uppercase tracking-wide text-muted-foreground">Durée</label>
                  <div className="text-4xl font-serif border-b border-border pb-2 flex items-baseline gap-2 text-foreground">
                    24 <span className="text-xl text-muted-foreground">mois</span>
                  </div>
                  <input type="range" className="w-full accent-gold cursor-pointer" />
                </div>
              </div>

              <div className="bg-deep-black text-white p-8 flex flex-col justify-center space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                
                <div>
                  <div className="text-sm text-neutral-400 mb-1">Mensualité estimée</div>
                  <div className="text-5xl font-serif text-white">2 145 €</div>
                </div>
                <div className="space-y-2 text-sm text-neutral-500">
                  <div className="flex justify-between">
                    <span>Taux débiteur fixe</span>
                    <span className="text-white">3.90 %</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TAEG fixe</span>
                    <span className="text-white">4.12 %</span>
                  </div>
                </div>
                <button className="w-full py-4 bg-gold text-deep-black font-medium hover:bg-white transition-colors mt-4">
                  Voir mon offre détaillée
                </button>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-8">
              Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager.
            </p>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
               {/* Abstract visual or placeholder for process */}
               <div className="aspect-square bg-neutral-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-secondary to-transparent opacity-50" />
                  <div className="absolute inset-4 border border-gold/30" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <p className="font-serif text-3xl italic text-foreground/80">"La simplicité est la sophistication suprême."</p>
                  </div>
               </div>
            </div>
            <div className="order-1 md:order-2 space-y-12">
               <h2 className="text-3xl md:text-5xl font-serif">Un parcours d'exception</h2>
               <div className="space-y-8">
                  {[
                    { step: "01", title: "Demande simplifiée", desc: "5 minutes pour définir votre besoin en ligne." },
                    { step: "02", title: "Analyse experte", desc: "Réponse de principe immédiate, validation sous 24h." },
                    { step: "03", title: "Déblocage des fonds", desc: "Virement express dès signature électronique." },
                  ].map((s) => (
                    <div key={s.step} className="flex gap-6 group">
                      <div className="text-sm font-serif text-gold pt-1">{s.step}</div>
                      <div>
                        <h3 className="text-xl font-medium mb-2 group-hover:text-gold transition-colors">{s.title}</h3>
                        <p className="text-muted-foreground">{s.desc}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-deep-black text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-neutral-800/20 via-deep-black to-deep-black" />
        <div className="container mx-auto px-4 relative z-10 space-y-8">
          <h2 className="text-4xl md:text-6xl font-serif">Prêt à concrétiser ?</h2>
          <p className="text-neutral-400 max-w-xl mx-auto">
            Nos conseillers sont à votre disposition pour une étude personnalisée de votre dossier.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
               href="/pricing"
               className="px-8 py-4 bg-gold text-deep-black text-sm tracking-widest uppercase hover:bg-white transition-colors"
            >
              Commencer
            </Link>
            <Link
               href="/contact"
               className="px-8 py-4 bg-transparent border border-white/20 text-white text-sm tracking-widest uppercase hover:bg-white hover:text-deep-black transition-colors"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}