"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  getCompanies,
  createCompany,
  createCompanyContext,
  deleteCompany,
  getCompanyId,
  getCompanyName,
  type CompanyResponse,
  type CompanyContextCategory,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";

type CreateStep = "info" | "general" | "details";

const WIZARD_STEPS: CreateStep[] = ["info", "general", "details"];

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create wizard state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createStep, setCreateStep] = useState<CreateStep>("info");
  const [formName, setFormName] = useState("");
  const [formGeneral, setFormGeneral] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formAudience, setFormAudience] = useState("");
  const [formGoals, setFormGoals] = useState("");
  const [formCompetitors, setFormCompetitors] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<CompanyResponse | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function loadCompanies() {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const data = await getCompanies();
      setCompanies(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load companies"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  function openCreate() {
    setFormName("");
    setFormGeneral("");
    setFormBrand("");
    setFormAudience("");
    setFormGoals("");
    setFormCompetitors("");
    setFormError(null);
    setCreateStep("info");
    setCreateDialogOpen(true);
  }

  function openDelete(company: CompanyResponse) {
    setDeleting(company);
    setDeleteError(null);
    setDeleteDialogOpen(true);
  }

  // Validation helpers
  const nameValid = formName.trim().length > 0;
  const generalValid =
    formGeneral.trim().length === 0 || formGeneral.trim().length >= 10;
  const brandValid =
    formBrand.trim().length === 0 || formBrand.trim().length >= 10;
  const audienceValid =
    formAudience.trim().length === 0 || formAudience.trim().length >= 10;
  const goalsValid =
    formGoals.trim().length === 0 || formGoals.trim().length >= 10;
  const competitorsValid =
    formCompetitors.trim().length === 0 || formCompetitors.trim().length >= 10;

  function canProceedFromStep(step: CreateStep): boolean {
    switch (step) {
      case "info":
        return nameValid;
      case "general":
        return generalValid;
      case "details":
        return brandValid && audienceValid && goalsValid && competitorsValid;
    }
  }

  async function handleCreateSubmit() {
    if (!nameValid) return;

    setSubmitting(true);
    setFormError(null);

    try {
      // 1. Create the company
      const company = await createCompany({
        name: formName.trim(),
        company_name: formName.trim(),
      });
      const newCompanyId = getCompanyId(company);

      // 2. Submit all non-empty context categories concurrently
      const entries: { text: string; category: CompanyContextCategory }[] = [];

      if (formGeneral.trim().length >= 10) {
        entries.push({ text: formGeneral.trim(), category: "general" });
      }
      if (formBrand.trim().length >= 10) {
        entries.push({ text: formBrand.trim(), category: "brand" });
      }
      if (formAudience.trim().length >= 10) {
        entries.push({ text: formAudience.trim(), category: "audience" });
      }
      if (formGoals.trim().length >= 10) {
        entries.push({ text: formGoals.trim(), category: "goals" });
      }
      if (formCompetitors.trim().length >= 10) {
        entries.push({ text: formCompetitors.trim(), category: "competitors" });
      }

      if (entries.length > 0) {
        await Promise.all(
          entries.map((entry) => createCompanyContext(newCompanyId, entry))
        );
      }

      setCreateDialogOpen(false);
      await loadCompanies();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to create company"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;

    setSubmitting(true);
    setDeleteError(null);
    try {
      await deleteCompany(getCompanyId(deleting));
      setDeleteDialogOpen(false);
      setDeleting(null);
      await loadCompanies();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete company"
      );
    } finally {
      setSubmitting(false);
    }
  }

  const currentStepIndex = WIZARD_STEPS.indexOf(createStep);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">
            Manage your companies and their profiles.
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger
            render={
              <Button onClick={openCreate}>
                <Plus className="mr-2 size-4" />
                Add Company
              </Button>
            }
          />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {createStep === "info" && "New Company"}
                {createStep === "general" && "Business Description"}
                {createStep === "details" && "Brand, Audience & Goals"}
              </DialogTitle>
              <DialogDescription>
                {createStep === "info" &&
                  "Enter the basic information for your new company."}
                {createStep === "general" &&
                  "Describe your company so AI agents can deliver personalized results."}
                {createStep === "details" &&
                  "Optional details to further enrich AI understanding."}
              </DialogDescription>
            </DialogHeader>

            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              {WIZARD_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i <= currentStepIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Step 1: Basic info */}
            {createStep === "info" && (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name *</Label>
                  <Input
                    id="company-name"
                    placeholder="e.g. Acme Corp"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Step 2: General description */}
            {createStep === "general" && (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="create-general">
                    General Business Description
                  </Label>
                  <Textarea
                    id="create-general"
                    placeholder="e.g. We are a SaaS company that provides project management tools for remote teams..."
                    value={formGeneral}
                    onChange={(e) => setFormGeneral(e.target.value)}
                    rows={5}
                    autoFocus
                  />
                  {formGeneral.trim().length > 0 &&
                    formGeneral.trim().length < 10 && (
                      <p className="text-xs text-destructive">
                        Minimum 10 characters required (
                        {formGeneral.trim().length}/10)
                      </p>
                    )}
                </div>
              </div>
            )}

            {/* Step 3: Brand, Audience, Goals, Competitors */}
            {createStep === "details" && (
              <div className="space-y-4 py-2 max-h-[50vh] overflow-y-auto pr-1">
                <div className="space-y-2">
                  <Label htmlFor="create-brand">Brand Voice & Personality</Label>
                  <Textarea
                    id="create-brand"
                    placeholder="e.g. Professional yet approachable, using clear and concise language..."
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    rows={3}
                  />
                  {formBrand.trim().length > 0 &&
                    formBrand.trim().length < 10 && (
                      <p className="text-xs text-destructive">
                        Minimum 10 characters ({formBrand.trim().length}/10)
                      </p>
                    )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-audience">Target Audience</Label>
                  <Textarea
                    id="create-audience"
                    placeholder="e.g. Small business owners aged 25-45 who struggle with time management..."
                    value={formAudience}
                    onChange={(e) => setFormAudience(e.target.value)}
                    rows={3}
                  />
                  {formAudience.trim().length > 0 &&
                    formAudience.trim().length < 10 && (
                      <p className="text-xs text-destructive">
                        Minimum 10 characters ({formAudience.trim().length}/10)
                      </p>
                    )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-goals">Business Goals & KPIs</Label>
                  <Textarea
                    id="create-goals"
                    placeholder="e.g. Increase monthly active users by 30% in Q2, improve customer retention rate..."
                    value={formGoals}
                    onChange={(e) => setFormGoals(e.target.value)}
                    rows={3}
                  />
                  {formGoals.trim().length > 0 &&
                    formGoals.trim().length < 10 && (
                      <p className="text-xs text-destructive">
                        Minimum 10 characters ({formGoals.trim().length}/10)
                      </p>
                    )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-competitors">
                    Competitor Analysis
                  </Label>
                  <Textarea
                    id="create-competitors"
                    placeholder="e.g. Main competitors include Acme Corp and XYZ Inc, who focus on enterprise clients..."
                    value={formCompetitors}
                    onChange={(e) => setFormCompetitors(e.target.value)}
                    rows={3}
                  />
                  {formCompetitors.trim().length > 0 &&
                    formCompetitors.trim().length < 10 && (
                      <p className="text-xs text-destructive">
                        Minimum 10 characters (
                        {formCompetitors.trim().length}/10)
                      </p>
                    )}
                </div>
              </div>
            )}

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}

            <DialogFooter>
              {createStep === "info" ? (
                <DialogClose render={<Button variant="outline" />}>
                  Cancel
                </DialogClose>
              ) : (
                <Button
                  variant="outline"
                  onClick={() =>
                    setCreateStep(
                      WIZARD_STEPS[currentStepIndex - 1] as CreateStep
                    )
                  }
                  disabled={submitting}
                >
                  Back
                </Button>
              )}

              {createStep !== "details" ? (
                <Button
                  onClick={() =>
                    setCreateStep(
                      WIZARD_STEPS[currentStepIndex + 1] as CreateStep
                    )
                  }
                  disabled={!canProceedFromStep(createStep)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleCreateSubmit}
                  disabled={
                    submitting || !canProceedFromStep("details") || !nameValid
                  }
                >
                  {submitting ? "Creating..." : "Create Company"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {companies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Building2 className="size-8 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">No companies yet</CardTitle>
            <CardDescription className="mb-4">
              Create your first company to get started.
            </CardDescription>
            <Button onClick={openCreate}>
              <Plus className="mr-2 size-4" />
              Add Company
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={getCompanyId(company)}>
                  <TableCell className="font-medium">
                    {getCompanyName(company)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(company.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          router.push(
                            `/dashboard/companies/${getCompanyId(company)}/edit`
                          )
                        }
                      >
                        <Pencil className="size-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openDelete(company)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleting ? getCompanyName(deleting) : ""}</strong>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive">{deleteError}</p>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
