"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import {
  getProject,
  getTasks,
  executeTask,
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
} from "lucide-react";

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  completed: "default",
  in_progress: "secondary",
  failed: "destructive",
  pending: "outline",
};

export default function TasksPage() {
  const params = useParams<{ project_id: string }>();
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [executingId, setExecutingId] = useState<string | null>(null);

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
          getTasks(cid, params.project_id).catch(() => [] as TaskResponse[]),
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
        <Card className="border-dashed">
          <CardHeader className="items-center text-center">
            <ClipboardList className="size-10 text-muted-foreground" />
            <CardTitle>No tasks yet</CardTitle>
            <CardDescription>
              {squads.length > 0
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
                  {task.squad_name && (
                    <Badge variant="secondary">{task.squad_name}</Badge>
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
                  {(task.status === "in_progress" || task.status === "completed" || task.status === "failed") && (
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
