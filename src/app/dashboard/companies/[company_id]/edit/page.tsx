"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getCompany,
  updateCompany,
  getCompanyName,
  getCompanyContextCategories,
  createCompanyContext,
  type CompanyResponse,
  type CompanyContextResponse,
  type CompanyContextCategory,
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const CONTEXT_CATEGORIES: {
  key: CompanyContextCategory;
  label: string;
  description: string;
  placeholder: string;
}[] = [
  {
    key: "general",
    label: "General Business Description",
    description:
      "Describe what your company does, its main products or services, and its core value proposition.",
    placeholder:
      "e.g. We are a SaaS company that provides project management tools for remote teams...",
  },
  {
    key: "brand",
    label: "Brand Voice & Personality",
    description:
      "Describe your brand's tone, personality, and communication style.",
    placeholder:
      "e.g. Professional yet approachable, using clear and concise language...",
  },
  {
    key: "audience",
    label: "Target Audience",
    description:
      "Describe your target audience, personas, and their pain points.",
    placeholder:
      "e.g. Small business owners aged 25-45 who struggle with time management...",
  },
  {
    key: "goals",
    label: "Business Goals & KPIs",
    description:
      "Describe your business objectives, KPIs, and key metrics you want to improve.",
    placeholder:
      "e.g. Increase monthly active users by 30% in Q2, improve customer retention rate...",
  },
  {
    key: "competitors",
    label: "Competitor Analysis",
    description:
      "Describe your competitive landscape and key differentiators.",
    placeholder:
      "e.g. Main competitors include Acme Corp and XYZ Inc, who focus on enterprise clients...",
  },
];

export default function EditCompanyPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.company_id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Company fields
  const [companyName, setCompanyName] = useState("");
  const [originalName, setOriginalName] = useState("");

  // Context fields — keyed by category
  const [contextValues, setContextValues] = useState<
    Record<CompanyContextCategory, string>
  >({
    general: "",
    brand: "",
    audience: "",
    goals: "",
    competitors: "",
  });
  const [originalContext, setOriginalContext] = useState<
    Record<CompanyContextCategory, string>
  >({
    general: "",
    brand: "",
    audience: "",
    goals: "",
    competitors: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const [companyRaw, categoriesRaw] = await Promise.all([
          getCompany(companyId),
          getCompanyContextCategories(companyId),
        ]);

        // Handle possible wrapped responses (e.g. { data: { ... } })
        const company =
          (companyRaw as unknown as { data: CompanyResponse }).data ?? companyRaw;
        const categories: CompanyContextResponse[] = Array.isArray(categoriesRaw)
          ? categoriesRaw
          : Array.isArray((categoriesRaw as unknown as { data: CompanyContextResponse[] }).data)
            ? (categoriesRaw as unknown as { data: CompanyContextResponse[] }).data
            : [];

        console.log("[EditCompany] company response:", companyRaw);
        console.log("[EditCompany] categories response:", categoriesRaw);

        const name = getCompanyName(company);
        setCompanyName(name);
        setOriginalName(name);

        const contextMap: Record<CompanyContextCategory, string> = {
          general: "",
          brand: "",
          audience: "",
          goals: "",
          competitors: "",
        };

        for (const ctx of categories) {
          if (ctx.category in contextMap) {
            contextMap[ctx.category] = ctx.text;
          }
        }

        setContextValues({ ...contextMap });
        setOriginalContext({ ...contextMap });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load company"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [companyId]);

  function setContextValue(category: CompanyContextCategory, value: string) {
    setContextValues((prev) => ({ ...prev, [category]: value }));
  }

  function getValidationError(category: CompanyContextCategory): string | null {
    const val = contextValues[category].trim();
    if (val.length > 0 && val.length < 10) {
      return `Minimum 10 characters required (${val.length}/10)`;
    }
    return null;
  }

  function hasChanges(): boolean {
    if (companyName.trim() !== originalName) return true;
    for (const cat of CONTEXT_CATEGORIES) {
      if (contextValues[cat.key].trim() !== originalContext[cat.key]) {
        return true;
      }
    }
    return false;
  }

  function hasValidationErrors(): boolean {
    for (const cat of CONTEXT_CATEGORIES) {
      if (getValidationError(cat.key)) return true;
    }
    if (!companyName.trim()) return true;
    return false;
  }

  async function handleSave() {
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const promises: Promise<unknown>[] = [];

      // Update company name if changed
      if (companyName.trim() !== originalName) {
        promises.push(
          updateCompany(companyId, {
            name: companyName.trim(),
            company_name: companyName.trim(),
          })
        );
      }

      // Update context categories that changed
      for (const cat of CONTEXT_CATEGORIES) {
        const newVal = contextValues[cat.key].trim();
        const oldVal = originalContext[cat.key];

        if (newVal !== oldVal && (newVal.length >= 10 || newVal.length === 0)) {
          promises.push(
            createCompanyContext(companyId, {
              text: newVal,
              category: cat.key,
            })
          );
        }
      }

      if (promises.length > 0) {
        await Promise.all(promises);
      }

      // Update original values to reflect saved state
      setOriginalName(companyName.trim());
      setOriginalContext({ ...contextValues });
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
        <Link href="/dashboard/companies">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Company</h1>
          <p className="text-muted-foreground">
            Update company details and AI context.
          </p>
        </div>
      </div>

      {/* Company details */}
      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
          <CardDescription>Basic information about the company.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="edit-company-name">Company Name</Label>
            <Input
              id="edit-company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company name"
            />
            {!companyName.trim() && (
              <p className="text-xs text-destructive">
                Company name is required.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Company context */}
      <Card>
        <CardHeader>
          <CardTitle>Company Context</CardTitle>
          <CardDescription>
            This context helps AI agents deliver personalized and accurate
            results. Fill in as much as you can — all fields except General
            are optional.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {CONTEXT_CATEGORIES.map((cat, i) => {
            const validationError = getValidationError(cat.key);
            return (
              <div key={cat.key}>
                {i > 0 && <Separator className="mb-6" />}
                <div className="space-y-2">
                  <Label htmlFor={`context-${cat.key}`}>{cat.label}</Label>
                  <p className="text-xs text-muted-foreground">
                    {cat.description}
                  </p>
                  <Textarea
                    id={`context-${cat.key}`}
                    placeholder={cat.placeholder}
                    value={contextValues[cat.key]}
                    onChange={(e) => setContextValue(cat.key, e.target.value)}
                    rows={4}
                  />
                  {validationError && (
                    <p className="text-xs text-destructive">
                      {validationError}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
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
          Company profile updated successfully!
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link href="/dashboard/companies">
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
