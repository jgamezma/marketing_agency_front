"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getCompanies,
  getCompanyId,
  getCompanyName,
  getProjects,
  getProjectId,
  type ProjectResponse,
} from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [companyNames, setCompanyNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const companies = await getCompanies();

        // Build company name lookup map
        const nameMap: Record<string, string> = {};
        for (const company of companies) {
          const id = getCompanyId(company);
          nameMap[id] = getCompanyName(company);
        }
        setCompanyNames(nameMap);

        // Fetch projects for all companies
        const allProjects = await Promise.all(
          companies.map((company) => getProjects(getCompanyId(company)))
        );
        setProjects(allProjects.flat());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load projects");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your marketing projects
          </p>
        </div>
        <Link href="/dashboard/projects/new" className={buttonVariants()}>
          New Project
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-muted-foreground">
              No projects yet. Create your first project to get started.
            </p>
            <Link href="/dashboard/projects/new" className={buttonVariants()}>
              Create Project
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={getProjectId(project)}
              href={`/dashboard/projects/${getProjectId(project)}`}
              className="block"
            >
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    {project.status && (
                      <Badge variant="outline">{project.status}</Badge>
                    )}
                  </div>
                  {companyNames[project.company_id] && (
                    <CardDescription className="flex items-center gap-1">
                      <Building2 className="size-3" />
                      <span className="truncate">
                        {companyNames[project.company_id]}
                      </span>
                    </CardDescription>
                  )}
                  {project.squad_name && (
                    <CardDescription>Squad: {project.squad_name}</CardDescription>
                  )}
                </CardHeader>
                {project.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
