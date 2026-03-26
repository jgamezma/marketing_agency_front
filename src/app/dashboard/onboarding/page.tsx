"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { createProject, updateProject, getProjectId } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { ProjectDetailsStep } from "@/components/onboarding/ProjectDetailsStep";
import { ReviewStep } from "@/components/onboarding/ReviewStep";

type Step = "welcome" | "details" | "review";

const STEPS: Step[] = ["welcome", "details", "review"];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Form state
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [primaryObjective, setPrimaryObjective] = useState("");
  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const cid = user?.user_metadata?.company_id as string | undefined;
      if (!cid) return;

      setCompanyId(cid);

    }

    init();
  }, []);

  const goToStep = useCallback((step: Step) => {
    setError(null);
    setCurrentStep(step);
  }, []);

  const handleSkip = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  const handleSubmit = useCallback(async () => {
    if (!companyId) return;

    setError(null);
    setSubmitting(true);

    try {
      const result = await createProject(companyId, {
        name: projectName,
        description: projectDescription || undefined,
      });

      const projectId = getProjectId(result);

      if (primaryObjective.trim()) {
        await updateProject(companyId, projectId, {
          primary_objective: primaryObjective,
        });
      }

      router.push(`/dashboard/projects/${projectId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create project"
      );
      setSubmitting(false);
    }
  }, [companyId, projectName, projectDescription, primaryObjective, router]);

  const stepIndex = STEPS.indexOf(currentStep);

  return (
    <div className="mx-auto max-w-2xl py-8">
      {/* Progress indicator */}
      {currentStep !== "welcome" && (
        <div className="mb-8 flex items-center gap-2">
          {STEPS.slice(1).map((step, i) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div
                className={`h-1.5 w-full rounded-full transition-colors ${
                  i < stepIndex ? "bg-primary" : "bg-muted"
                }`}
              />
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          {currentStep === "welcome" && (
            <WelcomeStep
              onNext={() => goToStep("details")}
              onSkip={handleSkip}
            />
          )}

          {currentStep === "details" && (
            <ProjectDetailsStep
              name={projectName}
              description={projectDescription}
              primaryObjective={primaryObjective}
              onNameChange={setProjectName}
              onDescriptionChange={setProjectDescription}
              onPrimaryObjectiveChange={setPrimaryObjective}
              onNext={() => goToStep("review")}
              onBack={() => goToStep("welcome")}
            />
          )}

          {currentStep === "review" && (
            <ReviewStep
              projectName={projectName}
              projectDescription={projectDescription}
              primaryObjective={primaryObjective}
              onSubmit={handleSubmit}
              onBack={() => goToStep("details")}
              submitting={submitting}
              error={error}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
