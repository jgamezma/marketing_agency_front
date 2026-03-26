# Frontend Integration Specification

## Overview
This document outlines the frontend structure, API integration layer, and user authentication flow for the Marketing Agency platform. The application is built with Next.js and integrates with a FastAPI backend and Supabase for auth.

## 1. Authentication Flow (Supabase)
Users will authenticate using Supabase's authentication service. 
- **Login/Register:** Users log in using their email and password through Supabase.
- **Session Management:** Supabase manages the session tokens.
- **API Requests:** The frontend will intercept requests to attach the Supabase JWT token as a Bearer token in the `Authorization` header for all requests to the FastAPI backend.

## 2. API Integration Layer
The frontend will communicate with the backend (`http://127.0.0.1:8000`) for the following domains:

### 2.1 Company Management
- `POST /api/v1/auth/register-company`: Register a new company and user.
- `GET /api/v1/companies/{company_id}/plan`: Retrieve or fetch company plan details.
- `GET /api/v1/companies/{company_id}/context`: Retrieve company AI context.

### 2.2 Project Management
- `GET /api/v1/companies/{company_id}/projects`: List all projects for a company.
- `POST /api/v1/companies/{company_id}/projects`: Create a new project.
- `GET /api/v1/companies/{company_id}/projects/{project_id}`: Get specific project details.
- `GET /api/v1/companies/{company_id}/projects/squad-types`: List available squad types for projects.

### 2.3 Subscription Plans
- `GET /api/v1/plans`: List all available subscription plans.
- `GET /api/v1/plans/{plan_id}`: Get plan details.

## 3. Frontend Architecture

### 3.1 Tech Stack
- Framework: Next.js 16.2.1 (App Router)
- UI/Styling: TailwindCSS, Shadcn, Base UI
- Auth: Supabase (`@supabase/supabase-js`)
- API Fetching: Native `fetch` with custom utility wrappers.

### 3.2 Directory Structure
- `src/app/(auth)/login` - Login page
- `src/app/(auth)/register` - Company registration
- `src/app/dashboard` - Main secured dashboard showing projects and plans
- `src/app/dashboard/projects` - Project listing
- `src/app/dashboard/projects/new` - Project creation
- `src/lib/api.ts` - Centralized API fetch wrapper attaching JWT tokens
- `src/lib/supabase.ts` - Supabase client configuration
- `src/components/` - Reusable UI components

## 4. Security Considerations
- JWT tokens should only be transmitted over HTTPS (or localhost for dev).
- Protected pages should redirect to `/login` if no active Supabase session is detected using Next.js middleware.
