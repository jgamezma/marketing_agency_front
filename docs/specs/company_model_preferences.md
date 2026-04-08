# Company Model Preferences Specification

## Overview
This document outlines the architecture and workflow for managing AI model preferences at the company level. This feature allows company administrators to override the global system default AI models by explicitly specifying which model should be used for specific task `result_type` outputs (e.g., `markdown`, `pdf`, `video`, `image`, `video_pipeline`).

## 1. Listing Model Preferences
- **Context:** An administrator or authorized user needs to view all custom model overrides configured for their company to understand which AI models will be utilized during task execution.
- **Endpoint:** `GET /api/v1/companies/{company_id}/model-preferences`
- **Response Payload:**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "uuid",
        "company_id": "uuid",
        "result_type": "markdown",
        "ai_model": "openai:gpt-4o",
        "created_at": "2026-04-08T12:00:00Z",
        "updated_at": "2026-04-08T12:00:00Z"
      }
    ]
  }
  ```
- **Behavior:**
  - Returns a list of all model overrides specifically configured for the given `company_id`.
  - The frontend UI can leverage this to display the company's current active overrides, potentially alongside the standard global defaults for context.

## 2. Setting or Updating a Model Preference
- **Context:** A company admin decides to assign a specific model for a particular output format. For example, changing the generation model for the `markdown` format to `anthropic:claude-3-opus`.
- **Endpoint:** `POST /api/v1/companies/{company_id}/model-preferences`
- **Request Payload:**
  ```json
  {
    "result_type": "markdown",
    "ai_model": "anthropic:claude-3-opus"
  }
  ```
- **Response Payload:**
  ```json
  {
    "id": "uuid",
    "company_id": "uuid",
    "result_type": "markdown",
    "ai_model": "anthropic:claude-3-opus",
    "created_at": "2026-04-08T12:05:00Z",
    "updated_at": "2026-04-08T12:05:00Z"
  }
  ```
- **Behavior:**
  - The admin provides the destination `result_type` and the desired `ai_model` string.
  - The system validates that the requested model format is supported (e.g., typically a `provider:model` syntax).
  - If a preference for this exact `result_type` already exists for the company, it is seamlessly overwritten/updated. Otherwise, a new model preference record is inserted.
  - **Permissions:** This endpoint is restricted and requires the user to possess an applicable `admin` role for the associated company.

## 3. Removing a Model Preference
- **Context:** A company no longer requires a custom model override for a specific `result_type` and prefers to revert to utilizing the global platform default.
- **Endpoint:** `DELETE /api/v1/companies/{company_id}/model-preferences/{preference_id}`
- **Behavior:**
  - Deletes the specified model preference record.
  - Returns a standard `204 No Content` HTTP status upon successful deletion.
  - **Permissions:** Must be performed by a company administrator.
  - Future platform tasks executed under this company that request this `result_type` will automatically fall back to utilizing the system-wide global default AI model.

## 4. Execution Workflow Integration
- **Context:** Determining the active AI model during the task execution and tool triggering phase.
- **Behavior:**
  - When a task execution is initiated, the backend orchestrator evaluates the requested `result_type` for the task outcome.
  - The system queries the `model-preferences` table for the executing task's `company_id` to look up the matched `result_type`.
  - **Resolution Logic:**
    1. **Company Override Evaluated First:** If a matching override is located, the defined `ai_model` string is directly passed to the AI driver environment (e.g., CrewAI or LangGraph) to use as the primary Large Language Model for generation.
    2. **Global Fallback:** If no custom company override is registered for the given result type, the execution engine retrieves the global default AI model assigned to that `result_type` within the environment configurations.
