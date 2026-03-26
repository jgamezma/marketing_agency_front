import { createClient } from "@/lib/supabase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type RequestOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return {};
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    const detail = error.detail;
    const message =
      typeof detail === "string"
        ? detail
        : detail != null
          ? JSON.stringify(detail)
          : `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PATCH", body: JSON.stringify(body) }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};

// ── Types ──

export interface RegisterCompanyRequest {
  email: string;
  password: string;
  company_name: string;
  niche_id?: string | null;
}

export interface CompanyPlanResponse {
  plan_id: string | null;
  plan_name: string | null;
  status: string;
  renews_at: string | null;
  usage: Record<string, unknown>;
}

export interface SquadTypeResponse {
  squad_id: string;
  name: string;
}

export interface ProjectCreate {
  name: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface ProjectUpdate {
  name?: string;
  description?: string | null;
  status?: string;
  primary_objective?: string;
  start_date?: string | null;
  end_date?: string | null;
  squad_ids?: string[];
  metadata?: Record<string, unknown> | null;
  brand?: Record<string, unknown> | null;
  audience?: Record<string, unknown> | null;
  like_companies?: Record<string, unknown>[] | null;
}

export interface AssociatedSquad {
  squad_id: string;
  name: string;
}

export interface ProjectResponse {
  id?: string;
  project_id?: string;
  company_id: string;
  name: string;
  description: string | null;
  status: string;
  squad_type: string | null;
  squad_name: string | null;
  primary_objective: string | null;
  assigned_agents: string[] | null;
  associated_squads: AssociatedSquad[] | null;
  start_date: string | null;
  end_date: string | null;
  metadata: Record<string, unknown> | null;
  brand: Record<string, unknown> | null;
  audience: Record<string, unknown> | null;
  like_companies: Record<string, unknown>[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanResponse {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billing_cycle: string;
  features_json: Record<string, unknown>[];
  created_at: string;
  updated_at: string;
}

export function getProjectId(project: ProjectResponse): string {
  return (project.project_id ?? project.id)!;
}

// ── Company types ──

export interface CompanyResponse {
  id?: string;
  company_id?: string;
  name?: string;
  company_name?: string;
  niche_id: string | null;
  created_at: string;
  updated_at: string;
}

export function getCompanyId(company: CompanyResponse): string {
  return (company.company_id ?? company.id)!;
}

export function getCompanyName(company: CompanyResponse): string {
  return (company.company_name ?? company.name) ?? "";
}

export interface CompanyUpdate {
  name?: string;
  company_name?: string;
  niche_id?: string | null;
}

export interface CompanyCreate {
  name?: string;
  company_name?: string;
  niche_id?: string | null;
}

// ── Company endpoints ──
export function registerCompany(data: RegisterCompanyRequest) {
  return api.post("/api/v1/auth/register-company", data);
}

export function getCompanies() {
  return api.get<CompanyResponse[]>("/api/v1/companies");
}

export function getCompany(companyId: string) {
  return api.get<CompanyResponse>(`/api/v1/companies/${companyId}`);
}

export function createCompany(data: CompanyCreate) {
  return api.post<CompanyResponse>("/api/v1/companies", data);
}

export function updateCompany(companyId: string, data: CompanyUpdate) {
  return api.patch<CompanyResponse>(`/api/v1/companies/${companyId}`, data);
}

export function deleteCompany(companyId: string) {
  return api.delete(`/api/v1/companies/${companyId}`);
}

export function getCompanyPlan(companyId: string) {
  return api.get<CompanyPlanResponse>(`/api/v1/companies/${companyId}/plan`);
}

// ── Project endpoints ──
export function getProjects(companyId: string) {
  return api.get<ProjectResponse[]>(`/api/v1/companies/${companyId}/projects`);
}

export function createProject(companyId: string, data: ProjectCreate) {
  return api.post<ProjectResponse>(`/api/v1/companies/${companyId}/projects`, data);
}

export function getProject(companyId: string, projectId: string) {
  return api.get<ProjectResponse>(`/api/v1/companies/${companyId}/projects/${projectId}`);
}

export function updateProject(companyId: string, projectId: string, data: ProjectUpdate) {
  return api.patch<ProjectResponse>(`/api/v1/companies/${companyId}/projects/${projectId}`, data);
}

export function getSquadTypes(companyId: string) {
  return api.get<SquadTypeResponse[]>(`/api/v1/companies/${companyId}/projects/squad-types`);
}

export function activateSquads(
  companyId: string,
  projectId: string,
  squadIds: string[]
) {
  return api.patch<ProjectResponse>(
    `/api/v1/companies/${companyId}/projects/${projectId}/squads`,
    { squad_ids: squadIds }
  );
}

// ── Company context endpoints ──

export type CompanyContextCategory =
  | "general"
  | "brand"
  | "audience"
  | "goals"
  | "competitors";

export interface CompanyContextRequest {
  text: string;
  category: CompanyContextCategory;
}

export interface CompanyContextResponse {
  id: string;
  company_id: string;
  text: string;
  category: CompanyContextCategory;
  created_at: string;
  updated_at: string;
}

export function getCompanyContextCategories(companyId: string) {
  return api.get<CompanyContextResponse[]>(
    `/api/v1/companies/${companyId}/context/categories`
  );
}

export function createCompanyContext(
  companyId: string,
  data: CompanyContextRequest
) {
  return api.post<CompanyContextResponse>(
    `/api/v1/companies/${companyId}/context`,
    data
  );
}

// ── Plan endpoints ──
export function getPlans() {
  return api.get<PlanResponse[]>("/api/v1/plans");
}

export function getPlan(planId: string) {
  return api.get<PlanResponse>(`/api/v1/plans/${planId}`);
}
