"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  getCompanyPlan,
  getCompanyContextCategories,
  getProjects,
  type CompanyPlanResponse,
} from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<CompanyPlanResponse | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const cid = user.user_metadata?.company_id as string | undefined;
      if (!cid) {
        setLoading(false);
        return;
      }

      setCompanyId(cid);

      try {
        // Check if company context exists — redirect to company setup if none
        const categories = await getCompanyContextCategories(cid);
        if (categories.length === 0) {
          router.replace("/dashboard/company-setup");
          return;
        }

        // Check if user has any projects — redirect to onboarding if none
        const projects = await getProjects(cid);
        if (projects.length === 0) {
          router.replace("/dashboard/onboarding");
          return;
        }

        const planData = await getCompanyPlan(cid);
        setPlan(planData);
      } catch {
        // API may not be available yet
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your Marketing Agency dashboard.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your active subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            {plan ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {plan.plan_name ?? "No plan"}
                  </span>
                  <Badge variant="secondary">{plan.status}</Badge>
                </div>
                {plan.renews_at && (
                  <p className="text-sm text-muted-foreground">
                    Renews at: {plan.renews_at}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {companyId
                  ? "No plan information available."
                  : "Company not configured yet."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
