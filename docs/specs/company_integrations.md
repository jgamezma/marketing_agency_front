# Company Integrations Specification

## Overview

This document outlines the technical specification for managing external integrations at the company level within the Marketing Agency platform. Specifically, it details the workflow, API endpoints, and frontend requirements for connecting and managing a company's integrations, starting with Cloudinary for media asset management.

## 1. Triggers & Conditions

- **Location:** Company Settings or a dedicated "Integrations" page within the application.
- **Condition:** Users with administrative privileges (e.g., Company Admin) need the ability to connect third-party services to their company profile to enable enhanced features, such as custom media hosting.

## 2. Supported Integrations

### 2.1 Cloudinary

Cloudinary integration allows a company to securely store and serve media assets (like generated images and videos) using their own designated Cloudinary account instead of the platform's default storage.

## 3. Workflow & API Endpoints

The frontend must provide a UI that interacts with the following REST API endpoints grouped under the `Company Integrations` tag.

### A. Checking Integration Status

Before showing the connection form, the frontend must determine if the company already has an active integration.

- **Endpoint:** `GET /api/v1/companies/{company_id}/integrations/cloudinary`
- **Response Schema:**
  ```json
  {
    "connected": true,
    "cloud_name": "example_cloud"
  }
  ```
- **UI Behavior:**
  - If `connected` is `true`, display the active status along with the `cloud_name`. Do NOT display the `api_key` or `api_secret` as these are securely stored and never returned.
  - Provide a "Disconnect" or "Remove Integration" button.
  - If `connected` is `false`, display a form to initiate a new connection.

### B. Connecting the Integration

To connect Cloudinary, the user must provide their Cloudinary credentials.

- **Endpoint:** `POST /api/v1/companies/{company_id}/integrations/cloudinary`
- **Request Body Payload:**
  ```json
  {
    "cloud_name": "string (min 1, max 100)",
    "api_key": "string (min 1, max 255)",
    "api_secret": "string (min 1, max 512)"
  }
  ```
- **Response Schema:**
  ```json
  {
    "status": "success",
    "message": "Cloudinary credentials securely stored."
  }
  ```
- **UI Behavior:**
  - The form should clearly label the required fields: Cloud Name, API Key, and API Secret.
  - Ensure the API Secret field uses a masked password input (`type="password"`) to protect sensitive data during entry.
  - Display success notifications upon a `200 OK` response or handle validation errors (`422 Unprocessable Entity`) gracefully.

### C. Disconnecting the Integration

Users must be able to remove their credentials and sever the integration.

- **Endpoint:** `DELETE /api/v1/companies/{company_id}/integrations/cloudinary`
- **Response Schema:**
  ```json
  {
    "status": "success",
    "message": "Cloudinary credentials removed."
  }
  ```
- **UI Behavior:**
  - When the user clicks the disconnect button, optionally display a confirmation modal (e.g., "Are you sure you want to disconnect Cloudinary?").
  - Upon a successful response, update the UI state to reflect that the integration is no longer active, revealing the connection form again.

## 4. UI/UX Considerations

- **Security Focus:** Treat API keys and secrets with the same level of security as passwords. They must only be transmitted over HTTPS and never logged or exposed in client-side state beyond the explicit submission process.
- **Empty States:** When navigating to the integrations tab for the first time, present a clear, empty-state UI explaining the benefits of connecting Cloudinary (e.g., "Connect your Cloudinary account to manage your AI generated media securely").
- **Error Handling:** Anticipate authorization errors (e.g., users without admin rights attempting to modify integrations) and provide appropriate barrier messaging.

## 5. Potential Future Enhancements

The architectural pattern established for the Cloudinary integration should serve as a template for future company-wide integrations (e.g., social media accounts, CRM platforms, email marketing tools). The base URI space (`/api/v1/companies/{company_id}/integrations/...`) is designed to expand laterally as new services are introduced.
