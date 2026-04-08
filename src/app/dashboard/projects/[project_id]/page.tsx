"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  getProject,
  getSquadTypes,
  getTasks,
  activateSquads,
  getProjectId,
  type ProjectResponse,
  type SquadTypeResponse,
  type TaskResponse,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { cn } from "@/lib/utils";
import { Check, ClipboardList, Pencil, Users } from "lucide-react";
import Link from "next/link";

export default function ProjectDetailPage() {
  const params = useParams<{ project_id: string }>();
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [squadTypes, setSquadTypes] = useState<SquadTypeResponse[]>([]);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskError, setTaskError] = useState<string | null>(null);

  const hasSquads =
    project?.associated_squads && project.associated_squads.length > 0;

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const cid = user?.user_metadata?.company_id as string | undefined;
      if (!cid || !params.project_id) return;
      setCompanyId(cid);
      const companyId = cid;

      try {
        const [projectData, types, tasksData] = await Promise.all([
          getProject(companyId, params.project_id),
          getSquadTypes(companyId).catch(() => [] as SquadTypeResponse[]),
          getTasks(companyId, params.project_id).catch((err) => {
            setTaskError(err instanceof Error ? err.message : "Failed to load tasks");
            return [] as TaskResponse[];
          }),
        ]);
        setProject(projectData);
        setSquadTypes(types);
        setTasks(tasksData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load project"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.project_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/projects/${getProjectId(project)}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 size-3.5" />
              Edit
            </Button>
          </Link>
          <Badge variant="outline">{project.status}</Badge>
        </div>
      </div>

      {project.primary_objective && (
        <Card>
          <CardHeader>
            <CardTitle>Primary Objective</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{project.primary_objective}</p>
          </CardContent>
        </Card>
      )}

      {/* Squad activation prompt — shown when no squads are configured */}
      {!hasSquads && (
        <Card className="border-dashed ring-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Activate Your Squads
            </CardTitle>
            <CardDescription>
              Your project doesn&apos;t have any squads configured yet. Activate
              the default squads for your niche, or select only the ones you
              need.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {squadTypes.length > 0 ? (
              <SquadActivationGrid
                squadTypes={squadTypes}
                projectId={getProjectId(project)}
                companyId={companyId!}
                onActivated={setProject}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                No squad types available for your niche.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Show existing squads */}
      {hasSquads && (
        <Card>
          <CardHeader>
            <CardTitle>Active Squads</CardTitle>
            <CardDescription>
              Squads currently assigned to this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {project.associated_squads!.map((squad) => (
                <div
                  key={squad.squad_id}
                  className="flex items-center gap-2 rounded-lg ring-1 ring-foreground/10 p-3"
                >
                  <Users className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{squad.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks */}
      {hasSquads && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="size-5" />
                Tasks
              </CardTitle>
              <CardDescription>
                {taskError
                  ? taskError
                  : tasks.length === 0
                    ? "No tasks yet. Create one to get started."
                    : `${tasks.length} task${tasks.length !== 1 ? "s" : ""} in this project`}
              </CardDescription>
            </div>
            <CreateTaskDialog
              companyId={companyId!}
              projectId={getProjectId(project)}
              squads={project.associated_squads!}
              onTaskCreated={(task) => setTasks((prev) => [task, ...prev])}
            />
          </CardHeader>
          {tasks.length > 0 && (
            <CardContent>
              <div className="divide-y">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {task.squad?.name && (
                        <Badge variant="secondary">{task.squad.name}</Badge>
                      )}
                      <Badge variant="outline">{task.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Assigned agents */}
      {project.assigned_agents && project.assigned_agents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {project.assigned_agents.map((agent) => (
                <Badge key={agent} variant="secondary">
                  {agent}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SquadActivationGrid({
  squadTypes,
  projectId,
  companyId,
  onActivated,
}: {
  squadTypes: SquadTypeResponse[];
  projectId: string;
  companyId: string;
  onActivated: (project: ProjectResponse) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(squadTypes.map((s) => s.squad_id))
  );
  const [activating, setActivating] = useState(false);
  const [activateError, setActivateError] = useState<string | null>(null);

  const toggle = useCallback((key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const handleActivate = useCallback(async () => {
    setActivating(true);
    setActivateError(null);
    try {
      const updatedProject = await activateSquads(
        companyId,
        projectId,
        Array.from(selected)
      );
      onActivated(updatedProject);
    } catch (err) {
      setActivateError(
        err instanceof Error ? err.message : "Failed to activate squads"
      );
    } finally {
      setActivating(false);
    }
  }, [companyId, projectId, selected, onActivated]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {squadTypes.map((squad) => (
          <button
            key={squad.squad_id}
            type="button"
            onClick={() => toggle(squad.squad_id)}
            disabled={activating}
            className={cn(
              "relative flex flex-col items-start gap-1.5 rounded-xl p-4 text-left ring-1 ring-foreground/10 transition-all hover:ring-primary/50",
              selected.has(squad.squad_id) && "ring-2 ring-primary bg-primary/5"
            )}
          >
            {selected.has(squad.squad_id) && (
              <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                <Check className="size-3 text-primary-foreground" />
              </div>
            )}
            <span className="font-medium">{squad.name}</span>
          </button>
        ))}
      </div>
      {activateError && (
        <p className="text-sm text-destructive">{activateError}</p>
      )}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => setSelected(new Set())}
          disabled={selected.size === 0 || activating}
        >
          Clear All
        </Button>
        <Button
          onClick={() => setSelected(new Set(squadTypes.map((s) => s.squad_id)))}
          variant="outline"
          disabled={selected.size === squadTypes.length || activating}
        >
          Select All
        </Button>
        <Button
          disabled={selected.size === 0 || activating}
          onClick={handleActivate}
        >
          {activating ? "Activating..." : `Activate ${selected.size} Squad${selected.size !== 1 ? "s" : ""}`}
        </Button>
      </div>
    </div>
  );
}
