# First Project Onboarding Specification

## Overview
This document specifies the user onboarding experience for the Marketing Agency platform. Specifically, it details the flow for newly registered users, or existing users who log in but have not yet created their first project. The goal is to guide them seamlessly into creating their first project so they can begin using the platform's core features immediately.

## 1. Triggers & Conditions
The onboarding flow is triggered under the following conditions:
- **Condition:** After successful login or registration, the application fetches the company's existing projects (`GET /api/v1/companies/{company_id}/projects`).
- **Trigger:** If the returned list of projects is empty (length === 0), the user is redirected to the onboarding flow instead of the generic dashboard.

## 2. Onboarding Flow Steps
The onboarding component should be a guided, step-by-step wizard to reduce friction. 

### Step 1: Welcome & Introduction
- **UI Element:** A welcoming screen that briefly explains the value proposition (e.g., "Let's set up your first AI marketing squad to boost your campaigns").
- **Action:** A "Get Started" or "Create My First Project" button.

### Step 2: Project Details
- **UI Elements:** 
  - Text input for Project Name.
  - Textarea for a brief Project Description or Goal.
- **Validation:** Project Name is required.

### Step 3: Squad Selection (Optional or Required based on business logic)
- **Data Fetching:** Fetch available squad types from `GET /api/v1/companies/{company_id}/projects/squad-types`.
- **UI Element:** Cards or a list selecting the type of squad (e.g., Content Creation, SEO, Ads Management) that best fits the project.
- **Action:** Select a squad type and proceed.

### Step 4: Review and Create
- **UI Element:** Summary of the project details and the selected squad.
- **Action:** "Launch Project" button to submit the data.
- **API Call:** Sends a `POST /api/v1/companies/{company_id}/projects` request with the collected onboarding data.

## 3. Post-Onboarding Routing
Upon successful creation of the first project:
1. **State Update:** Update the global state/cache to reflect the newly created project.
2. **Redirection:** Redirect the user from the onboarding flow to the project's detail dashboard at `src/app/dashboard/projects/{project_id}`.
3. **Feedback:** Show a success toast notification (e.g., "Project successfully launched!").

## 4. Edge Cases & Considerations
- **User Skips Onboarding:** If the business logic allows skipping, provide a "Skip for now" link. Skipping should redirect them to the empty dashboard state (`src/app/dashboard`), which must include a prominent empty state CTA to "Create your first project".
- **Network Errors:** Handle failures during the `POST` request securely, allowing the user to retry without losing their inputted data.
- **Mid-Flow Abandonment:** If the user abandons the application mid-flow and logs back in later, the trigger condition will catch them again since they still have 0 projects.

## 5. Directory Updates
New routes/components required:
- `src/app/dashboard/onboarding` - The main onboarding wizard wrapper.
- `src/components/onboarding/` - Presentation components for the steps (WelcomeStep, ProjectDetailsStep, SquadSelectionStep, etc.).
