# Add Company Context Specification

## Overview

This document outlines the requirement for capturing company context during the company creation path. Currently, when a user adds a new company from the dashboard, the system displays a simple modal with a single input for the company name. To ensure immediately accurate and personalized AI interactions, the system must collect foundational business and brand context (the "Company Context") from the user at the point of company creation.

## 1. Triggers & Conditions

The enhanced creation flow is triggered under the following conditions:
- **Location:** The "Add Company" button on the dashboard or top navigation in a multi-company environment.
- **Trigger:** When the user initiates the creation of a new company, instead of the basic modal, they should be presented with a more comprehensive flow to define their company details.

## 2. Creation Flow Steps

The enhanced "Add Company" flow should combine basic company details with context collection. This can be structured as an expanded modal or a multi-step modal wizard.

### Step 1: Basic Information
- **UI Elements:** 
  - Input field for Company Name (Required).
  - Optional logo upload.

### Step 2: General Business Description
- **Category:** `general`
- **UI Elements:** A large textarea for the user to describe what their company does, its main products or services, and its core value proposition.
- **Validation:** Minimum 10 characters required to proceed or save (if made a required field).

### Step 3: Brand, Audience, Goals & Competitors
To mirror the thoroughness of the onboarding and editing flows, the creation process should ideally collect additional context:
- **Brand Voice & Personality** (`brand`)
- **Target Audience** (`audience`)
- **Business Goals & KPIs** (`goals`)
- **Competitor Analysis** (`competitors`)

*Note: Depending on UX considerations, these additional fields can be optional or separated into a subsequent "Setup Profile" step immediately following creation.*

## 3. Data Submission

Upon finalizing the creation flow, the frontend must submit both the core company object and the associated context data.

### Request Sequence
1. **Create Company:**
   - **API Call:** Send a request to create the company (e.g., `POST /api/v1/companies`).
   - Extract the generated `company_id` from the successful response.

2. **Submit Context Categories:**
   - **API Call:** Immediately after receiving the `company_id`, iterate through all non-empty context fields filled by the user in the creation flow.
   - For each field, issue a request to save the context (e.g., `POST /api/v1/companies/{company_id}/context`) with the corresponding `text` and `category`.

### Alternative Bulk Endpoint (if backend supported)
If the backend provides a unified endpoint for creating a company along with its initial context, the frontend should format a combined payload, reducing the sequence to a single API call for better performance and atomicity.

## 4. Edge Cases & Considerations

- **Failure during Context Submission:** If the company is successfully created but one or more context submission requests fail due to network errors, the user should still be navigated to the dashboard/company view. A persistent banner should prompt them to complete their company profile.
- **UX Friction:** If filling out multiple text areas during creation is considered too high-friction, the flow could accept just the Company Name and General Description initially, deferring the rest to the 'Edit Company' screen or a post-creation prompt.
- **Loading States:** Ensure a clear loading indicator is present while the potentially multiple API requests are being processed to maintain user confidence.

## 5. Components Impacted

- **Add Company Modal/Component:** This component needs to be significantly expanded from a single-input modal to optionally a multi-step component that accepts multiple text areas and manages local state for each context category before submission.
- **API Services:** Integrate the context API methods into the company creation submission logic to handle the multi-step request sequence reliably.
