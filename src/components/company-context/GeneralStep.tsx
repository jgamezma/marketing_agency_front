"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface GeneralStepProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  error: string | null;
}

export function GeneralStep({ value, onChange, onNext, error }: GeneralStepProps) {
  const isValid = value.trim().length >= 10;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Tell us about your business
        </h2>
        <p className="text-muted-foreground">
          Describe what your company does, its main products or services, and
          its core value proposition. This helps our AI agents deliver
          personalized results.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="general-description">Business Description *</Label>
        <Textarea
          id="general-description"
          placeholder="e.g. We are a SaaS company that provides project management tools for remote teams..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
        />
        <p className="text-xs text-muted-foreground">
          {value.trim().length}/10 characters minimum
        </p>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!isValid}>
          Next
        </Button>
      </div>
    </div>
  );
}
