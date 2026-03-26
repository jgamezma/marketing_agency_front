"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProjectDetailsStepProps {
  name: string;
  description: string;
  primaryObjective: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPrimaryObjectiveChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ProjectDetailsStep({
  name,
  description,
  primaryObjective,
  onNameChange,
  onDescriptionChange,
  onPrimaryObjectiveChange,
  onNext,
  onBack,
}: ProjectDetailsStepProps) {
  const canProceed = name.trim().length > 0 && primaryObjective.trim().length >= 10;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Project Details</h2>
        <p className="text-muted-foreground mt-1">
          Give your project a name and describe what you want to achieve.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="project-name">
            Project Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="project-name"
            placeholder="My Marketing Campaign"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-description">Description</Label>
          <Textarea
            id="project-description"
            placeholder="Describe your project..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="primary-objective">
            Primary Objective <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="primary-objective"
            placeholder="A specific, measurable objective for this project (min 10 characters)..."
            value={primaryObjective}
            onChange={(e) => onPrimaryObjectiveChange(e.target.value)}
            rows={3}
          />
          {primaryObjective.length > 0 && primaryObjective.length < 10 && (
            <p className="text-xs text-muted-foreground">
              {10 - primaryObjective.length} more characters needed
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Continue
        </Button>
      </div>
    </div>
  );
}
