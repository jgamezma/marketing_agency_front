"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { SquadTypeResponse } from "@/lib/api";

interface SquadSelectionStepProps {
  squadTypes: SquadTypeResponse[];
  selectedSquadType: string;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
}

export function SquadSelectionStep({
  squadTypes,
  selectedSquadType,
  onSelect,
  onNext,
  onBack,
  loading,
}: SquadSelectionStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Choose Your Squad</h2>
        <p className="text-muted-foreground mt-1">
          Select the type of AI marketing squad that best fits your project.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading squad types...</p>
        </div>
      ) : squadTypes.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            No squad types available. You can continue without one.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {squadTypes.map((squad) => (
            <button
              key={squad.squad_id}
              type="button"
              onClick={() => onSelect(squad.squad_id)}
              className={cn(
                "relative flex flex-col items-start gap-1.5 rounded-xl p-4 text-left ring-1 ring-foreground/10 transition-all hover:ring-primary/50",
                selectedSquadType === squad.squad_id &&
                  "ring-2 ring-primary bg-primary/5"
              )}
            >
              {selectedSquadType === squad.squad_id && (
                <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Check className="size-3 text-primary-foreground" />
                </div>
              )}
              <span className="font-medium">{squad.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!selectedSquadType && squadTypes.length > 0}>
          Continue
        </Button>
      </div>
    </div>
  );
}
