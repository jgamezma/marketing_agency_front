"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getScenePlan,
  approveScenePlan,
  rejectScenePlan,
  type ScenePlanResponse,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Film,
  Mic,
  Music,
  Clock,
  Eye,
} from "lucide-react";

interface ScenePlanReviewProps {
  companyId: string;
  projectId: string;
  taskId: string;
  onApproved: () => void;
  onRejected: () => void;
}

export function ScenePlanReview({
  companyId,
  projectId,
  taskId,
  onApproved,
  onRejected,
}: ScenePlanReviewProps) {
  const [scenePlan, setScenePlan] = useState<ScenePlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  const fetchScenePlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const plan = await getScenePlan(companyId, projectId, taskId);
      setScenePlan(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load scene plan");
    } finally {
      setLoading(false);
    }
  }, [companyId, projectId, taskId]);

  useEffect(() => {
    fetchScenePlan();
  }, [fetchScenePlan]);

  const handleApprove = async () => {
    setApproving(true);
    setError(null);
    try {
      await approveScenePlan(companyId, projectId, taskId);
      onApproved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve scene plan");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!feedbackText.trim()) return;
    setRejecting(true);
    setError(null);
    try {
      await rejectScenePlan(companyId, projectId, taskId, {
        feedback_text: feedbackText.trim(),
      });
      setFeedbackText("");
      setShowRejectForm(false);
      onRejected();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject scene plan");
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="mr-3 size-5 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading scene plan...</p>
        </CardContent>
      </Card>
    );
  }

  if (!scenePlan) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-sm text-muted-foreground">
            {error || "Scene plan not available."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const scenes = scenePlan.scenes ?? [];
  const busy = approving || rejecting;

  return (
    <div className="space-y-4">
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Film className="size-5 text-amber-600" />
            <CardTitle>Scene Plan Review</CardTitle>
          </div>
          <CardDescription>
            Review the generated scene plan before proceeding to video rendering. You can approve it or request changes.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Plan overview */}
      {(scenePlan.title || scenePlan.duration_seconds || scenePlan.voice || scenePlan.music_style) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{scenePlan.title || "Video Plan"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {scenePlan.duration_seconds && (
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {scenePlan.duration_seconds}s total
                </span>
              )}
              {scenePlan.voice && (
                <span className="flex items-center gap-1">
                  <Mic className="size-3" />
                  {scenePlan.voice}
                </span>
              )}
              {scenePlan.music_style && (
                <span className="flex items-center gap-1">
                  <Music className="size-3" />
                  {scenePlan.music_style}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scene sequence */}
      {scenes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Scenes ({scenes.length})
            </CardTitle>
            <CardDescription>
              Visual sequence breakdown for the video
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scenes.map((scene, index) => (
                <div
                  key={scene.scene_number}
                  className="rounded-lg ring-1 ring-foreground/10 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Scene {scene.scene_number}</Badge>
                      {scene.visual_type && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="size-3" />
                          {scene.visual_type}
                        </span>
                      )}
                    </div>
                    {scene.duration_seconds && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {scene.duration_seconds}s
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Film className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      <p className="text-sm">{scene.description}</p>
                    </div>

                    {scene.narration_text && (
                      <div className="flex items-start gap-2">
                        <Mic className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{scene.narration_text}</p>
                      </div>
                    )}

                    {scene.music_mood && (
                      <div className="flex items-start gap-2">
                        <Music className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          Mood: {scene.music_mood}
                        </p>
                      </div>
                    )}
                  </div>

                  {index < scenes.length - 1 && (
                    <div className="pt-1 flex justify-center">
                      <div className="w-px h-3 bg-border" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Reject feedback form */}
      {showRejectForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revision Feedback</CardTitle>
            <CardDescription>
              Describe the changes you want. The plan will be regenerated based on your feedback.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="e.g., Change the intro scene to a nighttime shot, keep everything else the same..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              disabled={busy}
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleReject}
                disabled={!feedbackText.trim() || busy}
                variant="destructive"
              >
                {rejecting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 size-4" />
                )}
                {rejecting ? "Submitting..." : "Submit & Regenerate"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowRejectForm(false);
                  setFeedbackText("");
                }}
                disabled={busy}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      {!showRejectForm && (
        <div className="flex gap-3">
          <Button onClick={handleApprove} disabled={busy}>
            {approving ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 size-4" />
            )}
            {approving ? "Approving..." : "Approve & Render"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowRejectForm(true)}
            disabled={busy}
          >
            <XCircle className="mr-2 size-4" />
            Request Changes
          </Button>
        </div>
      )}
    </div>
  );
}
