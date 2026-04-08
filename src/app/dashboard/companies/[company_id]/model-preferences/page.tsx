"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  getModelPreferences,
  setModelPreference,
  deleteModelPreference,
  type ModelPreferenceResponse,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2, BrainCircuit } from "lucide-react";

const RESULT_TYPES = [
  { value: "markdown", label: "Markdown" },
  { value: "pdf", label: "PDF" },
  { value: "image", label: "Image" },
  { value: "image_pipeline", label: "Image Pipeline" },
  { value: "video", label: "Video" },
  { value: "video_pipeline", label: "Video Pipeline" },
];

export default function ModelPreferencesPage() {
  const params = useParams<{ company_id: string }>();
  const companyId = params.company_id;

  const [preferences, setPreferences] = useState<ModelPreferenceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [resultType, setResultType] = useState("");
  const [aiModel, setAiModel] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    try {
      const data = await getModelPreferences(companyId);
      setPreferences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preferences");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleSave = async () => {
    if (!resultType || !aiModel.trim()) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await setModelPreference(companyId, {
        result_type: resultType,
        ai_model: aiModel.trim(),
      });
      setAiModel("");
      setResultType("");
      setSuccess("Model preference saved successfully.");
      await fetchPreferences();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preference");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (preferenceId: string) => {
    setDeletingId(preferenceId);
    setError(null);
    setSuccess(null);
    try {
      await deleteModelPreference(companyId, preferenceId);
      setSuccess("Preference removed. Global default will be used.");
      setPreferences((prev) => prev.filter((p) => p.id !== preferenceId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete preference");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter out result types that already have a preference (unless editing)
  const availableTypes = RESULT_TYPES.filter(
    (rt) => !preferences.some((p) => p.result_type === rt.value)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="mr-2 size-5 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Model Preferences</h2>
        <p className="text-sm text-muted-foreground">
          Override the default AI model for specific result types. Unset types use the global default.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
          {success}
        </div>
      )}

      {/* Current preferences */}
      {preferences.length > 0 ? (
        <div className="space-y-3">
          {preferences.map((pref) => {
            const label = RESULT_TYPES.find((rt) => rt.value === pref.result_type)?.label ?? pref.result_type;
            return (
              <Card key={pref.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <BrainCircuit className="size-5 text-muted-foreground shrink-0" />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{label}</Badge>
                        <span className="text-sm font-medium">{pref.ai_model}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Updated {new Date(pref.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(pref.id)}
                    disabled={deletingId === pref.id}
                  >
                    {deletingId === pref.id ? (
                      <Loader2 className="mr-1 size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="mr-1 size-3.5" />
                    )}
                    Remove
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardHeader className="items-center text-center">
            <BrainCircuit className="size-10 text-muted-foreground" />
            <CardTitle>No custom preferences</CardTitle>
            <CardDescription>
              All result types are using the global default model. Add an override below.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Add / update preference form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="size-4" />
            Set Model Override
          </CardTitle>
          <CardDescription>
            Choose a result type and specify the model in <code>provider:model</code> format (e.g., <code>openai:gpt-4o</code>).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Result Type</Label>
              <Select value={resultType} onValueChange={setResultType} disabled={saving}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select result type" />
                </SelectTrigger>
                <SelectContent>
                  {(availableTypes.length > 0 ? availableTypes : RESULT_TYPES).map((rt) => (
                    <SelectItem key={rt.value} value={rt.value}>
                      {rt.label}
                      {preferences.some((p) => p.result_type === rt.value) && " (update)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>AI Model</Label>
              <Input
                placeholder="e.g. openai:gpt-4o"
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={!resultType || aiModel.trim().length < 3 || saving}
          >
            {saving ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Plus className="mr-2 size-4" />
            )}
            {saving ? "Saving..." : "Save Preference"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
