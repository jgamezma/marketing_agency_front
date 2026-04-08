"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import {
  getProject,
  getTasks,
  executeTask,
  cancelTask,
  restartTask,
  getProjectId,
  type ProjectResponse,
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
import {
  ClipboardList,
  Play,
  Loader2,
  ArrowRight,
  Ban,
  RotateCcw,
} from "lucide-react";

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  completed: "default",
  in_progress: "secondary",
  in_revision: "secondary",
  awaiting_approval: "secondary",
  failed: "destructive",
  pending: "outline",
  cancelled: "destructive",
};

export default function TasksPage() {
  const params = useParams<{ project_id: string }>();
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [taskError, setTaskError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const cid = user?.user_metadata?.company_id as string | undefined;
      if (!cid || !params.project_id) return;
      setCompanyId(cid);

      try {
        const [projectData, tasksData] = await Promise.all([
          getProject(cid, params.project_id),
          getTasks(cid, params.project_id).catch((err) => {
            setTaskError(err instanceof Error ? err.message : "Failed to load tasks");
            return [] as TaskResponse[];
          }),
        ]);
        setProject(projectData);
        setTasks(tasksData);
      } catch {
        // handled by empty state
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.project_id]);

  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleExecute = async (taskId: string) => {
    if (!companyId) return;
    setExecutingId(taskId);
    try {
      await executeTask(companyId, params.project_id, taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: "in_progress" } : t))
      );
    } catch {
      // keep current state
    } finally {
      setExecutingId(null);
    }
  };

  const handleCancel = async (taskId: string) => {
    if (!companyId) return;
    setCancellingId(taskId);
    try {
      await cancelTask(companyId, params.project_id, taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: "cancelled" } : t))
      );
    } catch {
      // keep current state
    } finally {
      setCancellingId(null);
    }
  };

  const handleRestart = async (taskId: string) => {
    if (!companyId) return;
    setExecutingId(taskId);
    try {
      await restartTask(companyId, params.project_id, taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: "pending" } : t))
      );
    } catch {
      // keep current state
    } finally {
      setExecutingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading tasks...</p>
      </div>
    );
  }

  if (!project) return null;

  const squads = project.associated_squads ?? [];
  const projectId = getProjectId(project);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="text-sm text-muted-foreground">
            Manage and execute tasks for this project
          </p>
        </div>
        {squads.length > 0 && (
          <CreateTaskDialog
            companyId={companyId!}
            projectId={projectId}
            squads={squads}
            onTaskCreated={(task) => setTasks((prev) => [task, ...prev])}
          />
        )}
      </div>

      {tasks.length === 0 ? (
        <Card className={taskError ? "border-destructive" : "border-dashed"}>
          <CardHeader className="items-center text-center">
            <ClipboardList className="size-10 text-muted-foreground" />
            <CardTitle>{taskError ? "Failed to load tasks" : "No tasks yet"}</CardTitle>
            <CardDescription>
              {taskError
                ? taskError
                : squads.length > 0
                  ? "Create your first task to get started."
                  : "Activate squads on the Overview tab before creating tasks."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="text-sm font-medium">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  {task.squad?.name && (
                    <Badge variant="secondary">{task.squad.name}</Badge>
                  )}
                  <Badge variant={statusVariant[task.status] ?? "outline"}>
                    {task.status}
                  </Badge>
                  {task.status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExecute(task.id)}
                      disabled={executingId === task.id}
                    >
                      {executingId === task.id ? (
                        <Loader2 className="mr-1 size-3.5 animate-spin" />
                      ) : (
                        <Play className="mr-1 size-3.5" />
                      )}
                      Execute
                    </Button>
                  )}
                  {(task.status === "pending" || task.status === "in_progress" || task.status === "awaiting_approval" || task.status === "in_revision") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancel(task.id)}
                      disabled={cancellingId === task.id}
                    >
                      {cancellingId === task.id ? (
                        <Loader2 className="mr-1 size-3.5 animate-spin" />
                      ) : (
                        <Ban className="mr-1 size-3.5" />
                      )}
                      Cancel
                    </Button>
                  )}
                  {task.status === "cancelled" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestart(task.id)}
                      disabled={executingId === task.id}
                    >
                      {executingId === task.id ? (
                        <Loader2 className="mr-1 size-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="mr-1 size-3.5" />
                      )}
                      Restart
                    </Button>
                  )}
                  {(task.status === "in_progress" || task.status === "completed" || task.status === "failed" || task.status === "cancelled") && (
                    <Link href={`/dashboard/projects/${projectId}/tasks/${task.id}`}>
                      <Button size="sm" variant="outline">
                        View
                        <ArrowRight className="ml-1 size-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
