"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createTask,
  executeTask,
  suggestSquad,
  toResultType,
  type AssociatedSquad,
  type TaskResponse,
  type SuggestSquadResponse,
  type TaskOutputFormat,
} from "@/lib/api";
import { Plus, Sparkles, Loader2, FileDown, ImageIcon, Layers, Video, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateTaskDialogProps {
  companyId: string;
  projectId: string;
  squads: AssociatedSquad[];
  onTaskCreated: (task: TaskResponse) => void;
}

export function CreateTaskDialog({
  companyId,
  projectId,
  squads,
  onTaskCreated,
}: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [squadId, setSquadId] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<TaskOutputFormat>("pdf");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [suggestion, setSuggestion] = useState<SuggestSquadResponse | null>(
    null
  );
  const [suggesting, setSuggesting] = useState(false);

  const reset = useCallback(() => {
    setTitle("");
    setDescription("");
    setSquadId("");
    setOutputFormat("pdf");
    setError(null);
    setSuggestion(null);
    setSuggesting(false);
  }, []);

  const handleSuggest = useCallback(async () => {
    if (!title.trim()) return;
    setSuggesting(true);
    setSuggestion(null);
    try {
      const result = await suggestSquad(companyId, projectId, {
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setSuggestion(result);
    } catch {
      // Silently fail — user can still pick manually
    } finally {
      setSuggesting(false);
    }
  }, [companyId, projectId, title, description]);

  const handleAcceptSuggestion = useCallback(() => {
    if (suggestion) {
      setSquadId(suggestion.suggested_squad_id);
    }
  }, [suggestion]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const task = await createTask(companyId, projectId, {
        title: title.trim(),
        description: description.trim() || undefined,
        squad_id: squadId || undefined,
        result_type: toResultType(outputFormat),
      });

      // Execute task immediately after creation
      try {
        await executeTask(companyId, projectId, task.id);
        onTaskCreated({ ...task, status: "in_progress" });
      } catch {
        // If execution fails, still show the created task
        onTaskCreated(task);
      }

      setOpen(false);
      reset();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create task"
      );
    } finally {
      setSaving(false);
    }
  }, [companyId, projectId, title, description, squadId, outputFormat, onTaskCreated, reset]);

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Plus className="mr-2 size-3.5" />
            New Task
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Add a new task to this project and assign it to a squad.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              placeholder="Describe the task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Result Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: "pdf", label: "PDF", icon: FileDown },
                { value: "image", label: "Image", icon: ImageIcon },
                { value: "image_pipeline", label: "Image Pipeline", icon: Layers },
                { value: "video", label: "Video", icon: Video },
                { value: "video_pipeline", label: "Video Pipeline", icon: Clapperboard },
              ] as const).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setOutputFormat(value)}
                  disabled={saving}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors",
                    outputFormat === value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Squad</Label>
            {squads.length > 0 ? (
              <Select
                value={squadId}
                onValueChange={(v) => setSquadId(v ?? "")}
                disabled={saving}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a squad">
                    {squads.find((s) => s.squad_id === squadId)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {squads.map((squad) => (
                    <SelectItem key={squad.squad_id} value={squad.squad_id}>
                      {squad.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">
                No squads assigned to this project yet.
              </p>
            )}
          </div>

          {/* Squad suggestion */}
          {squads.length > 0 && (
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSuggest}
                disabled={!title.trim() || suggesting || saving}
                className="w-full"
              >
                {suggesting ? (
                  <Loader2 className="mr-2 size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 size-3.5" />
                )}
                {suggesting ? "Analyzing..." : "Suggest Squad"}
              </Button>

              {suggestion && (
                <div className="rounded-lg bg-primary/5 ring-1 ring-primary/20 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      Suggested: {suggestion.squad_name}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(suggestion.confidence_score * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {suggestion.reasoning}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleAcceptSuggestion}
                    disabled={saving}
                  >
                    Accept Suggestion
                  </Button>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || saving}
          >
            {saving ? "Creating & executing..." : "Create & Execute"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
