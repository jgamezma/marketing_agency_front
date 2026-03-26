"use client";

import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export function WelcomeStep({ onNext, onSkip }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-8 py-12">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Rocket className="size-10 text-primary" />
      </div>

      <div className="space-y-3 max-w-md">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to Marketing Agency
        </h1>
        <p className="text-muted-foreground text-base">
          Let&apos;s set up your first AI marketing squad to boost your
          campaigns. It only takes a minute.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button size="lg" onClick={onNext}>
          Create My First Project
        </Button>
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
