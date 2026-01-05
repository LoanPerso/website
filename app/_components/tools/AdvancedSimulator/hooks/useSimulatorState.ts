"use client";

import { useState, useCallback, useMemo } from "react";
import {
  CreditType,
  CountryCode,
  SimulatorStep,
  SimulatorFormData,
  SimulationResult,
  BaseFormData,
} from "../types";
import { getCountryConfig, getProductLimits, DEFAULT_COUNTRY } from "../countries";
import { getProductConfig, calculateLoanResult, getProductQuestions } from "../products";

const getInitialFormData = (): BaseFormData => ({
  country: null,
  creditType: null,
  amount: 1000,
  duration: 12,
  age: null,
});

export function useSimulatorState() {
  const [currentStep, setCurrentStep] = useState<SimulatorStep>("country");
  const [formData, setFormData] = useState<SimulatorFormData>(getInitialFormData());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [customRate, setCustomRate] = useState<number | null>(null);

  // Get country config
  const countryConfig = useMemo(() => {
    if (!formData.country) return null;
    return getCountryConfig(formData.country);
  }, [formData.country]);

  // Get current product config with country-specific limits
  const productConfig = useMemo(() => {
    if (!formData.creditType) return null;
    const config = getProductConfig(formData.creditType);

    // If country is set, merge with country-specific limits
    if (formData.country) {
      const countryLimits = getProductLimits(formData.country, formData.creditType);
      return {
        id: config.id,
        icon: config.icon,
        color: config.color,
        minAmount: countryLimits.minAmount,
        maxAmount: countryLimits.maxAmount,
        minDuration: countryLimits.minDuration,
        maxDuration: countryLimits.maxDuration,
        minRate: countryLimits.minRate,
        maxRate: countryLimits.maxRate,
        step: config.id === "micro-credit" ? 10 : config.id === "salary-advance" ? 50 : 100,
      };
    }

    return {
      id: config.id,
      icon: config.icon,
      color: config.color,
      minAmount: 100,
      maxAmount: 5000,
      minDuration: 1,
      maxDuration: 36,
      minRate: 5,
      maxRate: 20,
      step: 100,
    };
  }, [formData.creditType, formData.country]);

  // Update form data
  const updateFormData = useCallback((updates: Partial<SimulatorFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Set country
  const selectCountry = useCallback((country: CountryCode) => {
    setFormData((prev) => ({
      ...prev,
      country,
      // Reset credit type when changing country
      creditType: null,
    }));
  }, []);

  // Set credit type and initialize type-specific fields
  const selectCreditType = useCallback((type: CreditType) => {
    // Use country-specific limits if available
    const country = formData.country || DEFAULT_COUNTRY;
    const countryLimits = getProductLimits(country, type);

    // Initialize with base data
    const baseData: Record<string, unknown> = {
      country: formData.country,
      creditType: type,
      amount: Math.max(countryLimits.minAmount, Math.min(1000, countryLimits.maxAmount)),
      duration: Math.max(countryLimits.minDuration, Math.min(12, countryLimits.maxDuration)),
      age: null,
    };

    // Get product questions and initialize slider fields with their minimum values
    const questions = getProductQuestions(type, country);
    for (const question of questions) {
      if (question.type === "slider" && question.min !== undefined) {
        // Initialize slider fields with their minimum value
        baseData[question.id] = question.min;
      } else if (baseData[question.id] === undefined) {
        // Initialize other fields as null
        baseData[question.id] = null;
      }
    }

    setFormData(baseData as SimulatorFormData);
  }, [formData.country]);

  // Navigate steps with transition - faster
  const goToStep = useCallback((step: SimulatorStep) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(step);
      setIsTransitioning(false);
    }, 150);
  }, []);

  const steps: SimulatorStep[] = [
    "country",
    "credit-type",
    "amount-duration",
    "specific-questions",
    "results",
  ];

  const nextStep = useCallback(() => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      goToStep(steps[currentIndex + 1]);
    }
  }, [currentStep, goToStep]);

  const prevStep = useCallback(() => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      goToStep(steps[currentIndex - 1]);
    }
  }, [currentStep, goToStep]);

  // Reset simulator
  const reset = useCallback(() => {
    setFormData(getInitialFormData());
    goToStep("country");
  }, [goToStep]);

  // Calculate result using product config
  const calculateResult = useCallback((): SimulationResult | null => {
    if (!formData.creditType || !formData.country) return null;

    return calculateLoanResult(
      formData.creditType,
      formData,
      formData.country,
      customRate
    );
  }, [formData, customRate]);

  // Handle custom rate change
  const handleCustomRateChange = useCallback((rate: number | null) => {
    setCustomRate(rate);
  }, []);

  return {
    currentStep,
    formData,
    productConfig,
    countryConfig,
    isTransitioning,
    customRate,
    updateFormData,
    selectCountry,
    selectCreditType,
    nextStep,
    prevStep,
    goToStep,
    reset,
    calculateResult,
    setCustomRate: handleCustomRateChange,
  };
}
