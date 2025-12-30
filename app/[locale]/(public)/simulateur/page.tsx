"use client";

import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import Link from "next/link";

// Types de crédit
const CREDIT_TYPES = [
  { id: "micro", label: "Micro-crédit", range: "20€ – 500€", description: "Petits besoins urgents" },
  { id: "conso", label: "Crédit Conso", range: "500€ – 5 000€", description: "Projets personnels" },
  { id: "pro", label: "Crédit Pro", range: "1 000€ – 10 000€", description: "Freelances & TPE" },
];

// Durées disponibles
const DURATIONS = [3, 6, 12, 24, 36];

// Étapes du parcours
const JOURNEY_STEPS = [
  { label: "Simulation", number: "01" },
  { label: "Vérification", number: "02" },
  { label: "Décision 24h", number: "03" },
  { label: "Virement", number: "04" },
];

export default function SimulateurPage() {
  // État du formulaire
  const [step, setStep] = useState(0); // 0: montant, 1: durée, 2: type, 3: parcours animation, 4: résultat
  const [amount, setAmount] = useState(1000);
  const [duration, setDuration] = useState(12);
  const [creditType, setCreditType] = useState<string | null>(null);
  const [journeyStep, setJourneyStep] = useState(0);

  // Refs pour animations
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Calcul mensualité
  const rate = 0.05;
  const monthlyRate = rate / 12;
  const monthlyPayment = Math.round(
    (amount * monthlyRate * Math.pow(1 + monthlyRate, duration)) /
    (Math.pow(1 + monthlyRate, duration) - 1)
  );

  // Animation de transition entre étapes
  const animateTransition = (direction: "next" | "prev" = "next") => {
    if (contentRef.current) {
      const xFrom = direction === "next" ? 50 : -50;
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, x: xFrom },
        { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }
      );
    }
  };

  // Passer à l'étape suivante
  const nextStep = () => {
    if (step < 4) {
      gsap.to(contentRef.current, {
        opacity: 0,
        x: -50,
        duration: 0.3,
        ease: "power3.in",
        onComplete: () => {
          setStep(step + 1);
          animateTransition("next");
        },
      });
    }
  };

  // Revenir à l'étape précédente
  const prevStep = () => {
    if (step > 0) {
      gsap.to(contentRef.current, {
        opacity: 0,
        x: 50,
        duration: 0.3,
        ease: "power3.in",
        onComplete: () => {
          setStep(step - 1);
          animateTransition("prev");
        },
      });
    }
  };

  // Animation du parcours (étape 3)
  useEffect(() => {
    if (step === 3) {
      const interval = setInterval(() => {
        setJourneyStep((prev) => {
          if (prev < JOURNEY_STEPS.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            // Passer au résultat après l'animation
            setTimeout(() => {
              gsap.to(contentRef.current, {
                opacity: 0,
                x: -50,
                duration: 0.3,
                onComplete: () => {
                  setStep(4);
                  animateTransition("next");
                },
              });
            }, 800);
            return prev;
          }
        });
      }, 600);

      return () => clearInterval(interval);
    }
  }, [step]);

  // Animation initiale
  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  // Progress bar width
  const progressWidth = step === 4 ? 100 : (step / 4) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="py-6 px-8 flex items-center justify-between border-b border-foreground/5">
        <Link href="/" className="font-serif text-xl tracking-tight">
          ← Retour
        </Link>
        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Simulation de crédit
        </span>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div
          ref={containerRef}
          className="w-full max-w-md"
        >
          {/* Progress bar */}
          <div className="mb-10">
            <div className="flex justify-between mb-3">
              {["Montant", "Durée", "Type", "Résultat"].map((label, i) => (
                <span
                  key={label}
                  className={`text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 ${
                    (i === 0 && step >= 0) ||
                    (i === 1 && step >= 1) ||
                    (i === 2 && step >= 2) ||
                    (i === 3 && step >= 4)
                      ? "text-accent"
                      : "text-muted-foreground/50"
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="h-[1px] bg-foreground/10 relative">
              <div
                ref={progressRef}
                className="absolute top-0 left-0 h-full bg-accent transition-all duration-700 ease-out"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          </div>

          {/* Card principale */}
          <div className="relative">
            {/* Glow effect subtil */}
            <div
              className="absolute -inset-px rounded-sm pointer-events-none opacity-30"
              style={{
                background: "linear-gradient(135deg, rgba(200, 169, 106, 0.1) 0%, transparent 50%)",
              }}
            />

            <div className="bg-foreground/[0.015] border border-foreground/[0.06] rounded-sm p-8 md:p-10 relative">
              {/* Contenu dynamique */}
              <div ref={contentRef} className="relative">
            {/* Étape 0: Montant */}
            {step === 0 && (
              <div>
                <h2 className="font-serif text-3xl font-light mb-2">
                  Quel montant souhaitez-vous ?
                </h2>
                <p className="text-sm text-muted-foreground mb-8">
                  De 20€ à 10 000€, choisissez selon vos besoins.
                </p>

                {/* Montant affiché */}
                <div className="text-center mb-6">
                  <span className="font-serif text-6xl font-light">{amount}</span>
                  <span className="text-accent text-2xl ml-2">€</span>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-2 bg-foreground/10 rounded-full appearance-none cursor-pointer mb-3
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-5
                    [&::-webkit-slider-thumb]:h-5
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-accent
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:hover:scale-110
                    [&::-webkit-slider-thumb]:shadow-lg"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>100 €</span>
                  <span>10 000 €</span>
                </div>

                {/* Bouton suivant */}
                <button
                  onClick={nextStep}
                  className="w-full mt-8 py-4 bg-foreground text-background font-medium rounded-sm hover:bg-foreground/90 transition-colors"
                >
                  Suivant →
                </button>
              </div>
            )}

            {/* Étape 1: Durée */}
            {step === 1 && (
              <div>
                <h2 className="font-serif text-3xl font-light mb-2">
                  Sur quelle durée ?
                </h2>
                <p className="text-sm text-muted-foreground mb-8">
                  Choisissez la durée de remboursement.
                </p>

                {/* Durée affichée */}
                <div className="text-center mb-8">
                  <span className="font-serif text-6xl font-light">{duration}</span>
                  <span className="text-accent text-2xl ml-2">mois</span>
                </div>

                {/* Sélecteur snap */}
                <div className="grid grid-cols-5 gap-3 mb-8">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`py-4 text-lg font-medium rounded-sm transition-all duration-300 ${
                        duration === d
                          ? "bg-accent text-deep-black scale-105"
                          : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                  <button
                    onClick={prevStep}
                    className="flex-1 py-4 border border-foreground/20 text-foreground font-medium rounded-sm hover:border-foreground/40 transition-colors"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={nextStep}
                    className="flex-1 py-4 bg-foreground text-background font-medium rounded-sm hover:bg-foreground/90 transition-colors"
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            )}

            {/* Étape 2: Type de crédit */}
            {step === 2 && (
              <div>
                <h2 className="font-serif text-3xl font-light mb-2">
                  Quel type de crédit ?
                </h2>
                <p className="text-sm text-muted-foreground mb-8">
                  Sélectionnez l'offre adaptée à votre besoin.
                </p>

                {/* Types de crédit */}
                <div className="space-y-3 mb-8">
                  {CREDIT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setCreditType(type.id)}
                      className={`w-full p-5 text-left rounded-sm border transition-all duration-300 ${
                        creditType === type.id
                          ? "border-accent bg-accent/5"
                          : "border-foreground/10 hover:border-foreground/20"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-lg">{type.label}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {type.description}
                          </div>
                        </div>
                        <div className="text-accent text-sm font-medium">
                          {type.range}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                  <button
                    onClick={prevStep}
                    className="flex-1 py-4 border border-foreground/20 text-foreground font-medium rounded-sm hover:border-foreground/40 transition-colors"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!creditType}
                    className={`flex-1 py-4 font-medium rounded-sm transition-colors ${
                      creditType
                        ? "bg-foreground text-background hover:bg-foreground/90"
                        : "bg-foreground/20 text-muted-foreground cursor-not-allowed"
                    }`}
                  >
                    Voir mon estimation →
                  </button>
                </div>
              </div>
            )}

            {/* Étape 3: Animation du parcours */}
            {step === 3 && (
              <div className="py-8">
                <h2 className="font-serif text-2xl font-light text-center mb-12">
                  Votre parcours avec nous
                </h2>

                {/* Timeline */}
                <div className="relative">
                  {/* Ligne de fond */}
                  <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-foreground/10" />

                  {/* Ligne de progression */}
                  <div
                    className="absolute left-6 top-0 w-[2px] bg-accent transition-all duration-500"
                    style={{
                      height: `${(journeyStep / (JOURNEY_STEPS.length - 1)) * 100}%`,
                    }}
                  />

                  {/* Étapes */}
                  <div className="space-y-8">
                    {JOURNEY_STEPS.map((s, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-6 transition-all duration-500 ${
                          index <= journeyStep ? "opacity-100" : "opacity-30"
                        }`}
                      >
                        {/* Dot */}
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-serif text-lg transition-all duration-500 ${
                            index <= journeyStep
                              ? "bg-accent text-deep-black scale-110"
                              : "bg-foreground/5 border border-foreground/10"
                          }`}
                        >
                          {s.number}
                        </div>

                        {/* Label */}
                        <div
                          className={`font-medium text-lg transition-all duration-500 ${
                            index === journeyStep ? "text-accent" : ""
                          }`}
                        >
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Étape 4: Résultat */}
            {step === 4 && (
              <div>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border border-accent/30 mb-4">
                    <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="font-serif text-3xl font-light mb-2">
                    Votre estimation
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Pour {amount}€ sur {duration} mois
                  </p>
                </div>

                {/* Résultat principal */}
                <div className="bg-deep-black text-white rounded-lg p-8 text-center mb-6">
                  <div className="text-xs text-white/50 uppercase tracking-wider mb-2">
                    Mensualité estimée
                  </div>
                  <div className="font-serif text-5xl font-light mb-1">
                    {monthlyPayment} €
                  </div>
                  <div className="text-white/60">par mois</div>
                  <div className="text-xs text-white/40 mt-4">
                    TAEG indicatif : {(rate * 100).toFixed(1)}%
                  </div>
                </div>

                {/* Récapitulatif */}
                <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                  <div className="p-4 bg-foreground/[0.03] rounded-sm">
                    <div className="font-serif text-2xl font-light">{amount}€</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                      Montant
                    </div>
                  </div>
                  <div className="p-4 bg-foreground/[0.03] rounded-sm">
                    <div className="font-serif text-2xl font-light">{duration}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                      Mois
                    </div>
                  </div>
                  <div className="p-4 bg-foreground/[0.03] rounded-sm">
                    <div className="font-serif text-2xl font-light">24h</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                      Réponse
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <button className="w-full py-4 bg-accent text-deep-black font-medium rounded-sm hover:bg-dark-gold transition-colors mb-3">
                  Faire ma demande
                </button>

                <button
                  onClick={() => {
                    setStep(0);
                    setJourneyStep(0);
                    setCreditType(null);
                  }}
                  className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Refaire une simulation
                </button>
              </div>
            )}
              </div>
            </div>
          </div>

          {/* Indicateur d'étape */}
          <div className="text-center mt-8 text-[11px] text-muted-foreground/70">
            {step < 3 && `Étape ${step + 1} sur 3`}
            {step === 3 && "Préparation de votre estimation..."}
            {step === 4 && "Estimation terminée"}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-8 border-t border-foreground/5">
        <p className="text-center text-[10px] text-muted-foreground/60">
          Simulation non contractuelle. Sous réserve d'acceptation de votre dossier.
        </p>
      </footer>
    </div>
  );
}
