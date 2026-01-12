"use client";

import { useRef, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { gsap } from "gsap";
import Link from "next/link";
import {
  User,
  FileText,
  Upload,
  X,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Scan,
  CheckCircle2,
} from "lucide-react";

type ApplicationStep = "info" | "document" | "analyzing" | "result";

interface ApplicationFormData {
  firstName: string;
  lastName: string;
  email: string;
  idDocument: File | null;
}

const INITIAL_FORM_DATA: ApplicationFormData = {
  firstName: "",
  lastName: "",
  email: "",
  idDocument: null,
};

// Analysis steps for the loading animation
const ANALYSIS_STEPS = [
  { key: "uploading", icon: Upload, duration: 1500 },
  { key: "verifying", icon: ShieldCheck, duration: 2000 },
  { key: "scanning", icon: Scan, duration: 2500 },
  { key: "analyzing", icon: FileText, duration: 2000 },
];

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder = "",
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium block">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 rounded-xl border border-foreground/20 bg-background text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
      />
    </div>
  );
}

function FileUploadZone({
  file,
  onFileChange,
  t,
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
  t: (key: string) => string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onFileChange(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0] || null;
    if (droppedFile && (droppedFile.type.startsWith("image/") || droppedFile.type === "application/pdf")) {
      onFileChange(droppedFile);
    }
  };

  const handleRemove = () => {
    onFileChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  if (file) {
    return (
      <div className="relative p-6 bg-accent/5 border-2 border-accent/30 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
            <FileText className="w-7 h-7 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-2 hover:bg-foreground/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
        isDragging
          ? "border-accent bg-accent/5"
          : "border-foreground/20 hover:border-accent/50 hover:bg-accent/5"
      }`}
    >
      <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center">
        <Upload className="w-8 h-8 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="font-medium mb-1">{t("application.document.upload")}</p>
        <p className="text-sm text-muted-foreground">
          {t("application.document.formats")}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}

function AnalyzingStep({
  currentAnalysisStep,
  t,
}: {
  currentAnalysisStep: number;
  t: (key: string) => string;
}) {
  return (
    <div className="text-center py-12">
      {/* Main loader */}
      <div className="relative w-32 h-32 mx-auto mb-8">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-foreground/10" />
        {/* Animated ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent animate-spin" />
        {/* Inner icon */}
        <div className="absolute inset-4 rounded-full bg-accent/10 flex items-center justify-center">
          <Scan className="w-12 h-12 text-accent animate-pulse" />
        </div>
      </div>

      <h2 className="font-serif text-2xl mb-3">
        {t("application.analyzing.title")}
      </h2>
      <p className="text-muted-foreground mb-8">
        {t("application.analyzing.subtitle")}
      </p>

      {/* Progress steps */}
      <div className="max-w-md mx-auto space-y-3">
        {ANALYSIS_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentAnalysisStep;
          const isCompleted = index < currentAnalysisStep;

          return (
            <div
              key={step.key}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isActive
                  ? "bg-accent/10 border border-accent/30"
                  : isCompleted
                  ? "bg-green-500/10 border border-green-500/30"
                  : "bg-foreground/5 border border-transparent"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isActive
                    ? "bg-accent text-white"
                    : isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-foreground/10 text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={`text-sm ${
                  isActive
                    ? "font-medium text-foreground"
                    : isCompleted
                    ? "text-green-600"
                    : "text-muted-foreground"
                }`}
              >
                {t(`application.analyzing.steps.${step.key}`)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ErrorResult({
  error,
  onRetry,
  t,
  locale,
}: {
  error: { code: string; message: string };
  onRetry: () => void;
  t: (key: string) => string;
  locale: string;
}) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/30 mb-6">
        <AlertTriangle className="w-10 h-10 text-orange-500" />
      </div>

      <h2 className="font-serif text-2xl mb-3">
        {t("application.error.title")}
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {error.message}
      </p>

      <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 mb-8 max-w-md mx-auto">
        <p className="text-sm text-orange-700 dark:text-orange-300">
          {t("application.error.countryNotSupported")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onRetry}
          className="px-6 py-3 border border-foreground/20 rounded-xl text-sm font-medium hover:bg-foreground/5 transition-colors"
        >
          {t("application.error.retry")}
        </button>
        <Link
          href={`/${locale}`}
          className="px-6 py-3 bg-accent text-white rounded-xl text-sm font-medium hover:bg-dark-gold transition-colors"
        >
          {t("application.error.backHome")}
        </Link>
      </div>
    </div>
  );
}

export default function ApplicationPage() {
  const t = useTranslations("tools");
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentStep, setCurrentStep] = useState<ApplicationStep>("info");
  const [formData, setFormData] = useState<ApplicationFormData>(INITIAL_FORM_DATA);
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState(0);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);

  // Animation on mount
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, idDocument: file }));
  };

  const isInfoValid = formData.firstName && formData.lastName && formData.email;
  const isDocumentValid = formData.idDocument !== null;

  const goToDocument = () => {
    if (isInfoValid) {
      setCurrentStep("document");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const submitApplication = async () => {
    setCurrentStep("analyzing");
    setCurrentAnalysisStep(0);

    // Simulate analysis steps with delays
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, ANALYSIS_STEPS[i].duration));
      setCurrentAnalysisStep(i + 1);
    }

    // Call API for analysis
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("email", formData.email);
      if (formData.idDocument) {
        formDataToSend.append("idDocument", formData.idDocument);
      }

      const response = await fetch("/api/application/analyze", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        setError({
          code: result.code || "UNKNOWN_ERROR",
          message: result.message || t("application.error.generic"),
        });
        setCurrentStep("result");
      } else {
        // Success case (not implemented yet - always returns error for now)
        setCurrentStep("result");
      }
    } catch {
      setError({
        code: "NETWORK_ERROR",
        message: t("application.error.network"),
      });
      setCurrentStep("result");
    }
  };

  const handleRetry = () => {
    setError(null);
    setCurrentStep("info");
    setFormData(INITIAL_FORM_DATA);
  };

  return (
    <main className="bg-background min-h-screen">
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="container">
          <div ref={containerRef} className="max-w-xl mx-auto">
            {/* Header */}
            {currentStep !== "analyzing" && currentStep !== "result" && (
              <div className="text-center mb-10">
                <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
                  {t("application.eyebrow")}
                </p>
                <h1 className="font-serif text-3xl sm:text-4xl leading-tight mb-4">
                  {t("application.title")}
                </h1>
                <p className="text-muted-foreground">
                  {t("application.subtitle")}
                </p>
              </div>
            )}

            {/* Step indicator */}
            {(currentStep === "info" || currentStep === "document") && (
              <div className="flex items-center justify-center gap-2 mb-8">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    currentStep === "info"
                      ? "bg-accent text-white"
                      : "bg-accent/20 text-accent"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">1. {t("application.steps.info")}</span>
                </div>
                <div className="w-8 h-0.5 bg-foreground/20" />
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    currentStep === "document"
                      ? "bg-accent text-white"
                      : "bg-foreground/10 text-muted-foreground"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">2. {t("application.steps.document")}</span>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="bg-background border border-foreground/10 rounded-2xl p-6 sm:p-8">
              {/* Step 1: Info */}
              {currentStep === "info" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-xl mb-2">
                      {t("application.info.title")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t("application.info.subtitle")}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <InputField
                      label={t("application.info.firstName")}
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      placeholder="Jean"
                    />
                    <InputField
                      label={t("application.info.lastName")}
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Dupont"
                    />
                  </div>

                  <InputField
                    label={t("application.info.email")}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="jean.dupont@email.com"
                  />

                  <button
                    onClick={goToDocument}
                    disabled={!isInfoValid}
                    className="w-full py-4 bg-accent text-white rounded-xl font-medium hover:bg-dark-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t("application.continue")}
                  </button>
                </div>
              )}

              {/* Step 2: Document */}
              {currentStep === "document" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-xl mb-2">
                      {t("application.document.title")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t("application.document.subtitle")}
                    </p>
                  </div>

                  <FileUploadZone
                    file={formData.idDocument}
                    onFileChange={handleFileChange}
                    t={t}
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentStep("info")}
                      className="flex-1 py-4 border border-foreground/20 rounded-xl font-medium hover:bg-foreground/5 transition-colors"
                    >
                      {t("application.back")}
                    </button>
                    <button
                      onClick={submitApplication}
                      disabled={!isDocumentValid}
                      className="flex-1 py-4 bg-accent text-white rounded-xl font-medium hover:bg-dark-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t("application.submit")}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Analyzing */}
              {currentStep === "analyzing" && (
                <AnalyzingStep
                  currentAnalysisStep={currentAnalysisStep}
                  t={t}
                />
              )}

              {/* Step 4: Result (Error) */}
              {currentStep === "result" && error && (
                <ErrorResult
                  error={error}
                  onRetry={handleRetry}
                  t={t}
                  locale={locale}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
