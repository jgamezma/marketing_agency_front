"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import {
  getProject,
  updateProject,
  getSquadTypes,
  getProjectId,
  type ProjectResponse,
  type SquadTypeResponse,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Check } from "lucide-react";

export default function EditProjectPage() {
  const params = useParams<{ project_id: string }>();
  const router = useRouter();
  const projectId = params.project_id;

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [primaryObjective, setPrimaryObjective] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSquadIds, setSelectedSquadIds] = useState<string[]>([]);

  // Original values for change detection
  const [original, setOriginal] = useState({
    name: "",
    description: "",
    primaryObjective: "",
    startDate: "",
    endDate: "",
    squadIds: [] as string[],
  });

  const [squadTypes, setSquadTypes] = useState<SquadTypeResponse[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const cid = user?.user_metadata?.company_id as string | undefined;
      if (!cid || !projectId) return;
      setCompanyId(cid);

      try {
        const [project, types] = await Promise.all([
          getProject(cid, projectId),
          getSquadTypes(cid).catch(() => [] as SquadTypeResponse[]),
        ]);

        const squadIds =
          project.associated_squads?.map((s) => s.squad_id) ?? [];

        setName(project.name);
        setDescription(project.description ?? "");
        setPrimaryObjective(project.primary_objective ?? "");
        setStartDate(project.start_date?.slice(0, 10) ?? "");
        setEndDate(project.end_date?.slice(0, 10) ?? "");
        setSelectedSquadIds(squadIds);
        setSquadTypes(types);

        setOriginal({
          name: project.name,
          description: project.description ?? "",
          primaryObjective: project.primary_objective ?? "",
          startDate: project.start_date?.slice(0, 10) ?? "",
          endDate: project.end_date?.slice(0, 10) ?? "",
          squadIds,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load project"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [projectId]);

  function toggleSquad(squadId: string) {
    setSelectedSquadIds((prev) =>
      prev.includes(squadId)
        ? prev.filter((id) => id !== squadId)
        : [...prev, squadId]
    );
  }

  function hasChanges(): boolean {
    if (name.trim() !== original.name) return true;
    if (description.trim() !== original.description) return true;
    if (primaryObjective.trim() !== original.primaryObjective) return true;
    if (startDate !== original.startDate) return true;
    if (endDate !== original.endDate) return true;
    const sortedCurrent = [...selectedSquadIds].sort();
    const sortedOriginal = [...original.squadIds].sort();
    if (sortedCurrent.length !== sortedOriginal.length) return true;
    if (sortedCurrent.some((id, i) => id !== sortedOriginal[i])) return true;
    return false;
  }

  function hasValidationErrors(): boolean {
    if (!name.trim()) return true;
    if (
      primaryObjective.trim().length > 0 &&
      primaryObjective.trim().length < 10
    )
      return true;
    return false;
  }

  async function handleSave() {
    if (!companyId || !projectId) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await updateProject(companyId, projectId, {
        name: name.trim(),
        description: description.trim() || null,
        primary_objective: primaryObjective.trim() || undefined,
        start_date: startDate || null,
        end_date: endDate || null,
        squad_ids: selectedSquadIds,
      });

      setOriginal({
        name: name.trim(),
        description: description.trim(),
        primaryObjective: primaryObjective.trim(),
        startDate,
        endDate,
        squadIds: [...selectedSquadIds],
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save changes"
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/projects/${projectId}`}>
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
          <p className="text-muted-foreground">
            Update project details, objectives, and squads.
          </p>
        </div>
      </div>

      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Basic information about the project.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">
              Project Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
            />
            {!name.trim() && (
              <p className="text-xs text-destructive">
                Project name is required.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project..."
              rows={3}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-start-date">Start Date</Label>
              <Input
                id="edit-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-end-date">End Date</Label>
              <Input
                id="edit-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Objective & Squads */}
      <Card>
        <CardHeader>
          <CardTitle>Objective & Squads</CardTitle>
          <CardDescription>
            Define the primary objective and assign squads to the project.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-objective">Primary Objective</Label>
            <Textarea
              id="edit-objective"
              value={primaryObjective}
              onChange={(e) => setPrimaryObjective(e.target.value)}
              placeholder="A specific, measurable objective for this project (min 10 characters)..."
              rows={3}
            />
            {primaryObjective.trim().length > 0 &&
              primaryObjective.trim().length < 10 && (
                <p className="text-xs text-destructive">
                  Minimum 10 characters required (
                  {primaryObjective.trim().length}/10)
                </p>
              )}
          </div>

          {squadTypes.length > 0 && (
            <>
              <Separator />
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
                    {selectedSquadIds.length} squad
                    {selectedSquadIds.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Feedback & actions */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
          Project updated successfully!
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link href={`/dashboard/projects/${projectId}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button
          onClick={handleSave}
          disabled={submitting || !hasChanges() || hasValidationErrors()}
        >
          {submitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
