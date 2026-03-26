"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  createProject,
  updateProject,
  getSquadTypes,
  getProjectId,
  type SquadTypeResponse,
  type ProjectResponse,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

type Step = "basic" | "details";

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("basic");
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Basic info (Step 1 — POST)
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Details (Step 2 — PATCH)
  const [primaryObjective, setPrimaryObjective] = useState("");
  const [selectedSquadIds, setSelectedSquadIds] = useState<string[]>([]);
  const [squadTypes, setSquadTypes] = useState<SquadTypeResponse[]>([]);

  // State
  const [createdProject, setCreatedProject] = useState<ProjectResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const cid = user?.user_metadata?.company_id as string | undefined;
      if (!cid) return;

      setCompanyId(cid);

      try {
        const types = await getSquadTypes(cid);
        setSquadTypes(types);
      } catch {
        // Squad types may not be available
      }
    }

    load();
  }, []);

  function toggleSquad(squadId: string) {
    setSelectedSquadIds((prev) =>
      prev.includes(squadId)
        ? prev.filter((id) => id !== squadId)
        : [...prev, squadId]
    );
  }

  async function handleCreateBasic(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) return;

    setError(null);
    setLoading(true);

    try {
      const project = await createProject(companyId, {
        name,
        description: description || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setCreatedProject(project);
      setStep("details");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId || !createdProject) return;

    const projectId = getProjectId(createdProject);
    const hasDetails =
      primaryObjective.trim().length >= 10 || selectedSquadIds.length > 0;

    if (!hasDetails) {
      router.push(`/dashboard/projects/${projectId}`);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await updateProject(companyId, projectId, {
        primary_objective: primaryObjective.trim() || undefined,
        squad_ids: selectedSquadIds.length > 0 ? selectedSquadIds : undefined,
      });
      router.push(`/dashboard/projects/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project details");
      setLoading(false);
    }
  }

  function handleSkipDetails() {
    if (!createdProject) return;
    router.push(`/dashboard/projects/${getProjectId(createdProject)}`);
  }

  const stepIndex = step === "basic" ? 0 : 1;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress indicator */}
      <div className="mb-6 flex items-center gap-2">
        {["basic", "details"].map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= stepIndex ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {step === "basic" && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
            <CardDescription>
              Start by entering the basic information for your project.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateBasic}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Project Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="My Marketing Campaign"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !companyId || !name.trim()}>
                {loading ? "Creating..." : "Next"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {step === "details" && (
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Add objectives and assign squads to your project. You can also skip
              this and add them later.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSaveDetails}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="primary-objective">Primary Objective</Label>
                <Textarea
                  id="primary-objective"
                  placeholder="A specific, measurable objective for this project (min 10 characters)..."
                  value={primaryObjective}
                  onChange={(e) => setPrimaryObjective(e.target.value)}
                  rows={3}
                />
                {primaryObjective.trim().length > 0 &&
                  primaryObjective.trim().length < 10 && (
                    <p className="text-xs text-destructive">
                      Minimum 10 characters required ({primaryObjective.trim().length}/10)
                    </p>
                  )}
              </div>
              {squadTypes.length > 0 && (
                <div className="space-y-2">
                  <Label>Squad Types</Label>
                  <p className="text-xs text-muted-foreground">
                    Select one or more squads to assign to this project.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {squadTypes.map((st) => {
                      const selected = selectedSquadIds.includes(st.squad_id);
                      return (
                        <button
                          key={st.squad_id}
                          type="button"
                          onClick={() => toggleSquad(st.squad_id)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                          }`}
                        >
                          {selected && <Check className="size-3.5" />}
                          {st.name}
                        </button>
                      );
                    })}
                  </div>
                  {selectedSquadIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {selectedSquadIds.length} squad{selectedSquadIds.length > 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleSkipDetails}>
                Skip for now
              </Button>
              <Button
                type="submit"
                disabled={
                  loading ||
                  (primaryObjective.trim().length > 0 &&
                    primaryObjective.trim().length < 10)
                }
              >
                {loading ? "Saving..." : "Finish"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
