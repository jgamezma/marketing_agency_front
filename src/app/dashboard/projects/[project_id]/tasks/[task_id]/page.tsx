"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import {
  getExecutionStatus,
  getTaskResult,
  executeTask,
  submitFeedback,
  listFeedback,
  listVersions,
  getVersion,
  type ExecutionStatusResponse,
  type ExecutionStep,
  type TaskResultResponse,
  type FeedbackEntry,
  type TaskVersion,
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Loader2,
  MessageSquarePlus,
  Play,
  Send,
  XCircle,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

const POLL_INTERVAL = 3000;

const stepStatusConfig: Record<
  string,
  { icon: typeof Circle; className: string }
> = {
  pending: { icon: Circle, className: "text-muted-foreground" },
  in_progress: { icon: Loader2, className: "text-primary animate-spin" },
  completed: { icon: CheckCircle2, className: "text-green-600" },
  failed: { icon: XCircle, className: "text-destructive" },
  done: { icon: CheckCircle2, className: "text-green-600" },
};

const executionStatusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  completed: "default",
  done: "default",
  in_progress: "secondary",
  failed: "destructive",
  pending: "outline",
};

export default function TaskWorkflowPage() {
  const params = useParams<{ project_id: string; task_id: string }>();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [execution, setExecution] = useState<ExecutionStatusResponse | null>(null);
  const [result, setResult] = useState<TaskResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Feedback state
  const [feedbackText, setFeedbackText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackList, setFeedbackList] = useState<FeedbackEntry[]>([]);

  // Versions state
  const [versions, setVersions] = useState<TaskVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [versionResult, setVersionResult] = useState<TaskVersion | null>(null);

  const isTerminal =
    execution?.task_status === "completed" ||
    execution?.task_status === "failed" ||
    execution?.task_status === "done";

  const isCompleted =
    execution?.task_status === "completed" ||
    execution?.task_status === "done";

  // Fetch execution status
  const fetchStatus = useCallback(
    async (cid: string) => {
      try {
        const status = await getExecutionStatus(cid, params.project_id, params.task_id);
        setExecution(status);
        return status;
      } catch {
        return null;
      }
    },
    [params.project_id, params.task_id]
  );

  // Fetch result when terminal
  const fetchResult = useCallback(
    async (cid: string) => {
      try {
        const res = await getTaskResult(cid, params.project_id, params.task_id);
        setResult(res);
      } catch {
        // result may not be ready yet
      }
    },
    [params.project_id, params.task_id]
  );

  // Fetch feedback and versions
  const fetchFeedbackAndVersions = useCallback(
    async (cid: string) => {
      const [fb, ver] = await Promise.all([
        listFeedback(cid, params.project_id, params.task_id).catch(() => []),
        listVersions(cid, params.project_id, params.task_id).catch(() => []),
      ]);
      setFeedbackList(fb);
      setVersions(ver);
    },
    [params.project_id, params.task_id]
  );

  // Initial load
  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const cid = user?.user_metadata?.company_id as string | undefined;
      if (!cid) return;
      setCompanyId(cid);

      const status = await fetchStatus(cid);
      if (
        status?.task_status === "completed" ||
        status?.task_status === "failed" ||
        status?.task_status === "done"
      ) {
        await fetchResult(cid);
        await fetchFeedbackAndVersions(cid);
      }
      setLoading(false);
    }

    load();
  }, [fetchStatus, fetchResult, fetchFeedbackAndVersions]);

  // Polling
  useEffect(() => {
    if (!companyId || isTerminal || loading) return;

    pollingRef.current = setInterval(async () => {
      const status = await fetchStatus(companyId);
      if (
        status?.task_status === "completed" ||
        status?.task_status === "failed" ||
        status?.task_status === "done"
      ) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        await fetchResult(companyId);
        await fetchFeedbackAndVersions(companyId);
      }
    }, POLL_INTERVAL);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [companyId, isTerminal, loading, fetchStatus, fetchResult, fetchFeedbackAndVersions]);

  const handleExecute = async () => {
    if (!companyId) return;
    setExecuting(true);
    setError(null);
    try {
      const status = await executeTask(companyId, params.project_id, params.task_id);
      setExecution(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start execution");
    } finally {
      setExecuting(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!companyId || !feedbackText.trim()) return;
    setSubmittingFeedback(true);
    setError(null);
    try {
      await submitFeedback(companyId, params.project_id, params.task_id, {
        feedback_text: feedbackText.trim(),
      });
      setFeedbackText("");
      // Feedback triggers a new version and re-execution — reset result and poll
      setResult(null);
      setVersionResult(null);
      setSelectedVersion("");
      await fetchFeedbackAndVersions(companyId);
      await fetchStatus(companyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleVersionChange = async (versionNumber: string) => {
    if (!companyId) return;
    setSelectedVersion(versionNumber);
    if (versionNumber === "latest") {
      setVersionResult(null);
      return;
    }
    try {
      const ver = await getVersion(
        companyId,
        params.project_id,
        params.task_id,
        Number(versionNumber)
      );
      setVersionResult(ver);
    } catch {
      setVersionResult(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="mr-2 size-5 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading workflow...</p>
      </div>
    );
  }

  // Decide which result to display
  const displayResult = versionResult
    ? { result_markdown: versionResult.result_markdown, result_assets: versionResult.result_assets }
    : result
      ? { result_markdown: result.result_markdown, result_assets: result.result_assets }
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/projects/${params.project_id}/tasks`}>
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-xl font-bold tracking-tight">Task Workflow</h2>
          <p className="text-sm text-muted-foreground">
            Track execution progress and view results
          </p>
        </div>
        {execution && (
          <Badge variant={executionStatusVariant[execution.task_status] ?? "outline"}>
            {execution.task_status}
          </Badge>
        )}
      </div>

      {/* Not started state */}
      {!execution && (
        <Card className="border-dashed">
          <CardHeader className="items-center text-center">
            <Play className="size-10 text-muted-foreground" />
            <CardTitle>Ready to Execute</CardTitle>
            <CardDescription>
              This task has not been executed yet. Start execution to begin
              processing with the assigned squad.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={handleExecute} disabled={executing}>
              {executing ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Play className="mr-2 size-4" />
              )}
              {executing ? "Starting..." : "Start Execution"}
            </Button>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Workflow steps */}
      {execution && execution.steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Execution Steps</CardTitle>
            <CardDescription>
              {execution.task_status === "in_progress"
                ? "Task is being processed by agents..."
                : execution.task_status === "completed" || execution.task_status === "done"
                  ? "All steps completed successfully"
                  : execution.task_status === "failed"
                    ? "Execution encountered an error"
                    : `Status: ${execution.task_status}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {execution.steps.map((step, index) => {
                const config = stepStatusConfig[step.status] ?? stepStatusConfig.pending;
                const Icon = config.icon;
                const isLast = index === execution.steps.length - 1;

                return (
                  <div key={step.id} className="flex gap-3">
                    {/* Timeline line + icon */}
                    <div className="flex flex-col items-center">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full ring-1 ring-foreground/10 bg-background">
                        <Icon className={cn("size-4", config.className)} />
                      </div>
                      {!isLast && (
                        <div className="w-px flex-1 bg-border my-1" />
                      )}
                    </div>

                    {/* Step content */}
                    <div className={cn("pb-6", isLast && "pb-0")}>
                      <p className="text-sm font-medium leading-7">
                        {step.agent_name || `Step ${step.step_order + 1}`}
                      </p>
                      {step.input_summary && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {step.input_summary}
                        </p>
                      )}
                      {step.output_text && (
                        <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">
                          {step.output_text}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty steps - show a generic progress indicator */}
      {execution && execution.steps.length === 0 && execution.task_status === "in_progress" && (
        <Card>
          <CardContent className="flex items-center justify-center py-10">
            <Loader2 className="mr-3 size-5 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Agents are processing this task...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Version selector */}
      {versions.length > 1 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="size-4 text-muted-foreground" />
              <CardTitle>Versions</CardTitle>
            </div>
            <CardDescription>
              This task has {versions.length} versions. Select one to view its result.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedVersion || "latest"} onValueChange={handleVersionChange}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Latest version" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest version</SelectItem>
                {versions.map((v) => (
                  <SelectItem key={v.version_number} value={String(v.version_number)}>
                    Version {v.version_number} — {new Date(v.created_at).toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {displayResult && (displayResult.result_markdown || (displayResult.result_assets && displayResult.result_assets.length > 0)) && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle>
                {result?.status === "failed" ? "Execution Failed" : "Result"}
              </CardTitle>
              {result?.completed_at && !versionResult && (
                <CardDescription>
                  Completed at{" "}
                  {new Date(result.completed_at).toLocaleString()}
                </CardDescription>
              )}
              {versionResult && (
                <CardDescription>
                  Version {versionResult.version_number} — {new Date(versionResult.created_at).toLocaleString()}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {displayResult.result_markdown && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm whitespace-pre-wrap">{displayResult.result_markdown}</p>
                </div>
              )}
              {displayResult.result_assets && displayResult.result_assets.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Assets</p>
                  <div className="space-y-2">
                    {displayResult.result_assets.map((asset, i) => (
                      <div
                        key={i}
                        className="rounded-lg ring-1 ring-foreground/10 p-3"
                      >
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(asset, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Feedback form — only when task is completed */}
      {isCompleted && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="size-4 text-muted-foreground" />
                <CardTitle>Submit Feedback</CardTitle>
              </div>
              <CardDescription>
                Request refinements or corrections. This will create a new version and agents will resume work.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Describe what needs to be changed or improved..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                disabled={submittingFeedback}
                rows={3}
              />
              <Button
                onClick={handleSubmitFeedback}
                disabled={!feedbackText.trim() || submittingFeedback}
              >
                {submittingFeedback ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Send className="mr-2 size-4" />
                )}
                {submittingFeedback ? "Submitting..." : "Submit Feedback"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Feedback history */}
      {feedbackList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback History</CardTitle>
            <CardDescription>
              {feedbackList.length} feedback {feedbackList.length === 1 ? "entry" : "entries"} submitted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedbackList.map((fb) => (
                <div
                  key={fb.id}
                  className="rounded-lg ring-1 ring-foreground/10 p-3 space-y-1"
                >
                  <p className="text-sm whitespace-pre-wrap">{fb.feedback}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(fb.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
