# Company Context Onboarding Specification

## Overview
This document outlines the onboarding experience for users immediately after registering or creating a new company on the Marketing Agency platform. To ensure AI agents provide accurate and personalized outputs, the system must collect foundational business and brand context (the "Company Context") before the user begins creating projects and squads.

## 1. Triggers & Conditions
The company context onboarding flow is triggered under the following conditions:
- **Condition:** After successful registration (`POST /api/v1/auth/register-company`) or upon first login for a newly created company.
- **Trigger:** The system checks if the company has any existing context by calling `GET /api/v1/companies/{company_id}/context/categories`. If no categories are returned (empty array), the user is prompted to complete the context onboarding.

## 2. Onboarding Flow Steps
The onboarding flow should gather essential context categories to enrich the AI's understanding of the company. It can be structured as a multi-step wizard or a single consolidated form.

### Step 1: General Business Description
- **Category:** `general`
- **UI Elements:** A large textarea for the user to describe what their company does, its main products or services, and its core value proposition.
- **Validation:** Minimum 10 characters required.

### Step 2: Brand & Audience (Optional but Recommended)
- **Category:** `brand` and `audience`
- **UI Elements:** 
  - Textarea for Brand Voice (tone, personality).
  - Textarea for Target Audience (personas, pain points).
- **Validation:** Minimum 10 characters if filled.

### Step 3: Goals & Competitors (Optional but Recommended)
- **Category:** `goals` and `competitors`
- **UI Elements:** 
  - Textarea for Business Goals (KPIs, objectives).
  - Textarea for Competitor Analysis.
- **Validation:** Minimum 10 characters if filled.

### Data Submission
- **API Call:** For each non-empty textarea, send a separate `POST /api/v1/companies/{company_id}/context` request with the corresponding `text` and `category` payload.
  ```json
  {
    "text": "User inputted text here...",
    "category": "general" // or brand, audience, etc.
  }
  ```
- **Concurrency:** These requests can be sent concurrently when the user clicks "Save & Continue" at the end of the flow, or sequentially as they progress through steps.

## 3. Post-Onboarding Routing
Upon successful submission of the company context:
1. **State Update:** Mark the context onboarding as complete in the application state.
2. **Redirection:** Redirect the user to the Project Onboarding flow (`src/app/dashboard/onboarding` or similar) if they have no projects, or directly to the main dashboard.
3. **Feedback:** Show a success notification (e.g., "Company profile setup complete! Your AI squads are ready to learn.").

## 4. Edge Cases & Considerations
- **Skipping Onboarding:** Users should have the option to "Skip for now" to reduce friction. If skipped, the dashboard should display a persistent banner or widget encouraging them to "Complete Company Profile" for better AI results.
- **Partial Submission:** If a user fills out `general` but skips `audience`, the system should successfully save what was provided.
- **Network Failures:** In case of API errors during the `POST /context` requests, the UI should retain the entered text and allow the user to retry.

## 5. Directory Updates
New routes/components required:
- `src/app/dashboard/company-setup` - The main company context onboarding wizard wrapper.
- `src/components/company-context/` - Presentation components for the context input forms.
