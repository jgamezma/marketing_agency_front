# Project List Company Display Specification

## Overview

This document specifies the requirement to display the associated company for each project within the project list view. Because projects are inherently linked to companies in the Marketing Agency platform, users must be able to easily identify which company a project belongs to at a glance when viewing their dashboard or project lists.

## 1. Triggers & Conditions

- **Location:** Project List Page, Dashboard, or any view rendering a collection of projects.
- **Condition:** Whenever a list or grid of projects is rendered, each project's card or row must present the name of the associated company.

## 2. UI Integration

### Project List Elements
- **Company Name Display:** The company name should be clearly visible. In a card layout, it could be positioned under the project title as a subtitle. In a table layout, there should be a dedicated "Company" column.
- **Visual Hierarchy:** The project name should remain the primary, most emphasized element. The company name acts as secondary context (e.g., slightly smaller font, lighter color, or a subtle UI badge).
- **Navigation (Optional):** If applicable, the company name can be a clickable link that directs the user to the company's detail or settings page.

## 3. Data Fetching

To display the company information efficiently, the frontend needs the project data to include company details.
- **API Response:** The project list endpoint (e.g., `GET /api/v1/projects`) must populate the `company` object or provide a `company_name` field directly within the project payload.
- **Data Resolution:** If the backend only returns a `company_id` for each project, the frontend should ideally maintain a cached dictionary/map of the user's accessible companies to resolve the corresponding IDs into names, preventing the need to make individual API calls for each project row. Working with the backend team to ensure the `projects` API returns the populated company details is heavily preferred.

## 4. Edge Cases & Considerations

- **Orphaned Projects:** If the system supports projects that are not linked to a company, the UI must handle this gracefully. It should display a fallback text like "No Company Assigned" or simply omit the company section.
- **Long Names:** The UI must account for extremely long company names. Text overflow should be handled cleanly with truncation (ellipses) or wrapping to avoid breaking the layout of the project card or data table.
- **Loading States:** While resolving company data, standard loading indicators or skeleton UI elements should be displayed to prevent layout jumping.

## 5. Components Impacted

- **ProjectList / Dashboard Components:** Requires updates to map and pass down company data to child components.
- **ProjectCard / ProjectTableRow Components:** Layout adjustments are required to incorporate and style the new company name field.
- **Frontend Types & Interfaces:** The standard `Project` type definition must be updated to expect the `company` or `company_name` field.
