# Edit Company Context Specification

## Overview

This document specifies the requirement for editing a company's profile within the Marketing Agency platform. Currently, users can create a company and subsequently provide company context (general business description, brand, audience, etc.) during the onboarding flow. However, as a business evolves, its context may change. Therefore, the system must allow users to edit the company context whenever they edit the company's general details.

## 1. Triggers & Conditions

The ability to edit company context should be integrated into the existing "Edit Company" flow.
- **Location:** Company Settings or Edit Company Page.
- **Trigger:** When a user navigates to edit their company profile, the form should not only display the standard company fields (name, logo, etc.) but also seamlessly include fields for editing the company's context categories.

## 2. Edit Flow & UI Integration

The context fields should be presented alongside or within the same form as the basic company details.

### Context Fields Present in Edit View
The following context categories must be editable:
- **General Business Description** (`general`)
- **Brand Voice & Personality** (`brand`)
- **Target Audience** (`audience`)
- **Business Goals & KPIs** (`goals`)
- **Competitor Analysis** (`competitors`)

### Fetching Existing Context
Upon loading the Edit Company view, the frontend must retrieve the existing company data along with its current context.
- **API Call:** Calculate or retrieve the existing context by calling `GET /api/v1/companies/{company_id}/context` or `GET /api/v1/companies/{company_id}/context/categories`.
- **UI Population:** Populate the respective context textareas with the retrieved data. If a specific category does not exist for the company, its textarea should be empty but available for input.

## 3. Data Submission

When the user saves their changes to the company, the frontend must submit both the basic company updates and the context updates.

### Updating Context
- **API Call:** Send updates for the context data using the appropriate endpoints (e.g., `POST` or `PUT` to `/api/v1/companies/{company_id}/context`).
- **Data Handling:** 
  - For each context category modified (whether updating existing text or adding new text to a previously empty category), a request must be sent with the corresponding `text` and `category` payload.
  ```json
  {
    "text": "Updated user inputted text here...",
    "category": "general"
  }
  ```
  - The system should efficiently handle these updates, either through a bulk update endpoint (if available) or by resolving concurrent requests when the generic "Save" button is clicked.

## 4. Edge Cases & Considerations

- **Partial Updates:** If the user updates the company name but leaves the context fields unchanged, the system should only submit the company name update, minimizing unnecessary API calls for the context.
- **Clearing Context:** If a user deletes all text from a context category textarea, the system should handle this gracefully, for instance, by soft-deleting or updating the given category context with an empty string, depending on backend constraints.
- **Loading States:** Ensure proper loading and error states are implemented, as fetching and saving multiple context categories concurrently might take slightly longer than a simple profile update.

## 5. Components Impacted

- **Edit Company Form/Page:** This component requires expansion to accommodate the context textareas and handle the additional fetching and saving logic.
- **Context API Service/Hook:** Reusable frontend hooks or service methods for fetching and updating context should be utilized or created to support this flow.
