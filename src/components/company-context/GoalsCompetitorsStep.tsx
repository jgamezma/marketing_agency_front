"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface GoalsCompetitorsStepProps {
  goals: string;
  competitors: string;
  onGoalsChange: (value: string) => void;
  onCompetitorsChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
}

export function GoalsCompetitorsStep({
  goals,
  competitors,
  onGoalsChange,
  onCompetitorsChange,
  onSubmit,
  onBack,
  submitting,
}: GoalsCompetitorsStepProps) {
  const goalsValid = goals.trim().length === 0 || goals.trim().length >= 10;
  const competitorsValid =
    competitors.trim().length === 0 || competitors.trim().length >= 10;
  const isValid = goalsValid && competitorsValid;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Goals & Competitors
        </h2>
        <p className="text-muted-foreground">
          Share your business objectives and competitive landscape so our AI
          can craft more strategic content. These fields are optional but
          recommended.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="business-goals">Business Goals</Label>
          <Textarea
            id="business-goals"
            placeholder="e.g. Increase monthly active users by 30% in Q2, improve customer retention rate..."
            value={goals}
            onChange={(e) => onGoalsChange(e.target.value)}
            rows={4}
          />
          {goals.trim().length > 0 && goals.trim().length < 10 && (
            <p className="text-xs text-destructive">
              Minimum 10 characters required ({goals.trim().length}/10)
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="competitors">Competitor Analysis</Label>
          <Textarea
            id="competitors"
            placeholder="e.g. Main competitors include Acme Corp and XYZ Inc, who focus on enterprise clients..."
            value={competitors}
            onChange={(e) => onCompetitorsChange(e.target.value)}
            rows={4}
          />
          {competitors.trim().length > 0 && competitors.trim().length < 10 && (
            <p className="text-xs text-destructive">
              Minimum 10 characters required ({competitors.trim().length}/10)
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={submitting}>
          Back
        </Button>
        <Button onClick={onSubmit} disabled={!isValid || submitting}>
          {submitting ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </div>
  );
}
