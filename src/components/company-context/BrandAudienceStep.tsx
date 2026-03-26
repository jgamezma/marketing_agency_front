"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface BrandAudienceStepProps {
  brand: string;
  audience: string;
  onBrandChange: (value: string) => void;
  onAudienceChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function BrandAudienceStep({
  brand,
  audience,
  onBrandChange,
  onAudienceChange,
  onNext,
  onBack,
}: BrandAudienceStepProps) {
  const brandValid = brand.trim().length === 0 || brand.trim().length >= 10;
  const audienceValid = audience.trim().length === 0 || audience.trim().length >= 10;
  const isValid = brandValid && audienceValid;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Brand & Audience
        </h2>
        <p className="text-muted-foreground">
          Help our AI understand your brand personality and who you&apos;re
          trying to reach. These fields are optional but recommended.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="brand-voice">Brand Voice</Label>
          <Textarea
            id="brand-voice"
            placeholder="e.g. Professional yet approachable, using clear and concise language..."
            value={brand}
            onChange={(e) => onBrandChange(e.target.value)}
            rows={4}
          />
          {brand.trim().length > 0 && brand.trim().length < 10 && (
            <p className="text-xs text-destructive">
              Minimum 10 characters required ({brand.trim().length}/10)
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="target-audience">Target Audience</Label>
          <Textarea
            id="target-audience"
            placeholder="e.g. Small business owners aged 25-45 who struggle with time management..."
            value={audience}
            onChange={(e) => onAudienceChange(e.target.value)}
            rows={4}
          />
          {audience.trim().length > 0 && audience.trim().length < 10 && (
            <p className="text-xs text-destructive">
              Minimum 10 characters required ({audience.trim().length}/10)
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!isValid}>
          Next
        </Button>
      </div>
    </div>
  );
}
