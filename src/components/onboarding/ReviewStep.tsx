"use client";

import { Button } from "@/components/ui/button";

interface ReviewStepProps {
  projectName: string;
  projectDescription: string;
  primaryObjective: string;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
  error: string | null;
}

export function ReviewStep({
  projectName,
  projectDescription,
  primaryObjective,
  onSubmit,
  onBack,
  submitting,
  error,
}: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Review & Launch</h2>
        <p className="text-muted-foreground mt-1">
          Review your project details before launching. You can configure squads
          from the project dashboard after creation.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-4 rounded-xl ring-1 ring-foreground/10 p-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Project Name
          </p>
          <p className="mt-1 font-medium">{projectName}</p>
        </div>

        {projectDescription && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Description
            </p>
            <p className="mt-1 text-sm">{projectDescription}</p>
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Primary Objective
          </p>
          <p className="mt-1 text-sm">{primaryObjective}</p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={submitting}>
          Back
        </Button>
        <Button onClick={onSubmit} disabled={submitting}>
          {submitting ? "Launching..." : "Launch Project"}
        </Button>
      </div>
    </div>
  );
}
