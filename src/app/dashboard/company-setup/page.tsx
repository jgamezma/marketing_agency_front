"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  createCompanyContext,
  getCompanyContextCategories,
  type CompanyContextCategory,
} from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { GeneralStep } from "@/components/company-context/GeneralStep";
import { BrandAudienceStep } from "@/components/company-context/BrandAudienceStep";
import { GoalsCompetitorsStep } from "@/components/company-context/GoalsCompetitorsStep";
import { Building2 } from "lucide-react";

type Step = "general" | "brand_audience" | "goals_competitors";

const STEPS: Step[] = ["general", "brand_audience", "goals_competitors"];

export default function CompanySetupPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("general");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [general, setGeneral] = useState("");
  const [brand, setBrand] = useState("");
  const [audience, setAudience] = useState("");
  const [goals, setGoals] = useState("");
  const [competitors, setCompetitors] = useState("");

  useEffect(() => {
    async function checkContext() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const cid = user.user_metadata?.company_id as string | undefined;
      if (!cid) {
        setLoading(false);
        return;
      }

      setCompanyId(cid);

      try {
        const categories = await getCompanyContextCategories(cid);
        if (categories.length > 0) {
          // Context already exists, redirect to onboarding or dashboard
          router.replace("/dashboard");
          return;
        }
      } catch {
        // If endpoint fails, proceed with onboarding
      }

      setLoading(false);
    }

    checkContext();
  }, [router]);

  function handleSkip() {
    router.replace("/dashboard/onboarding");
  }

  async function handleSubmit() {
    if (!companyId) return;

    setSubmitting(true);
    setError(null);

    try {
      const entries: { text: string; category: CompanyContextCategory }[] = [];

      if (general.trim().length >= 10) {
        entries.push({ text: general.trim(), category: "general" });
      }
      if (brand.trim().length >= 10) {
        entries.push({ text: brand.trim(), category: "brand" });
      }
      if (audience.trim().length >= 10) {
        entries.push({ text: audience.trim(), category: "audience" });
      }
      if (goals.trim().length >= 10) {
        entries.push({ text: goals.trim(), category: "goals" });
      }
      if (competitors.trim().length >= 10) {
        entries.push({ text: competitors.trim(), category: "competitors" });
      }

      // Send all context requests concurrently
      await Promise.all(
        entries.map((entry) => createCompanyContext(companyId, entry))
      );

      router.replace("/dashboard/onboarding");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save company context. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const currentStepIndex = STEPS.indexOf(step);

  return (
    <div className="mx-auto max-w-2xl py-8">
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="size-8 text-primary" />
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Set Up Your Company Profile
          </h1>
          <p className="text-muted-foreground">
            Help our AI squads understand your business for better results.
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-2 w-16 rounded-full transition-colors ${
              i <= currentStepIndex ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="pt-6">
          {step === "general" && (
            <GeneralStep
              value={general}
              onChange={setGeneral}
              onNext={() => setStep("brand_audience")}
              error={null}
            />
          )}

          {step === "brand_audience" && (
            <BrandAudienceStep
              brand={brand}
              audience={audience}
              onBrandChange={setBrand}
              onAudienceChange={setAudience}
              onNext={() => setStep("goals_competitors")}
              onBack={() => setStep("general")}
            />
          )}

          {step === "goals_competitors" && (
            <GoalsCompetitorsStep
              goals={goals}
              competitors={competitors}
              onGoalsChange={setGoals}
              onCompetitorsChange={setCompetitors}
              onSubmit={handleSubmit}
              onBack={() => setStep("brand_audience")}
              submitting={submitting}
            />
          )}

          {error && (
            <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skip link */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={handleSkip}
          className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
