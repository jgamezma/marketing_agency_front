# Project Task Multimedia Workflow Specification

## Overview
This document specifies the updated requirements for managing the execution of tasks that require rich multimedia outputs, specifically video, image, and PDF files. It introduces the frontend implementation details for an explicit user output selection mechanism and delineates the human-in-the-loop workflow necessary for video production (Scene Plan review).

## 1. Explicit Multimedia Output Selection
To improve user experience and ensure reliable generation of the intended media format, the frontend must move away from relying on backend intent-parsing. The user must be provided with an explicit way to select the desired output format prior to task execution.

### UI Implementation
- **Format Selector:** During task creation or editing, provide a clear UI control (e.g., dropdown, toggle buttons, or radio cards) allowing the user to select the primary output format.
- **Available Options:**
  - `Markdown` (Default text-based deliverable)
  - `PDF` (Document rendering)
  - `Image` (Single or composite visual media)
  - `Video` (Full video sequence production)
- **API Payload Expectation:** While the specific schema fields (e.g., `output_format` or `result_type` in `TaskCreate`) will securely communicate this to the backend, the UI is strictly responsible for prompting the user for this explicit choice so the backend agent tools are reliably triggered.

## 2. Video Production Workflow (Human-in-the-Loop)
Generating a video requires a two-phase execution pipeline to ensure high quality and accuracy. A human-in-the-loop review step is inserted after the initial script and scene breakdown (Scene Plan) is generated, but before the costly rendering phase begins.

### Phase 1: Scene Plan Generation
- Upon starting task execution where the format is specified as `Video`, the backend will generate a structured Scene Plan and narrative script.
- The task's execution status will pause and report an `awaiting_approval` state, indicating it requires user interaction.

### Phase 2: Reviewing the Scene Plan
The frontend must provide a specialized review interface when a video task is awaiting approval.

- **Endpoint:** `GET /api/v1/companies/{company_id}/projects/{project_id}/tasks/{task_id}/scene-plan`
- **Behavior:**
  - Retrieve the JSON-structured `scene_plan` and the narrative narrative/script (`result_markdown` or script summary).
  - Render a clear, interactive visual representation of the scene sequence, displaying visuals descriptions, audio cues, overlays, and transitions to the user.

### Phase 3: Approval or Rejection
The UI must present the user with actions to either accept the plan and proceed to final rendering or reject it with specific revision feedback.

#### Option A: Approve Scene Plan
- **Endpoint:** `POST /api/v1/companies/{company_id}/projects/{project_id}/tasks/{task_id}/approve-scene-plan`
- **Flow:**
  - Triggers the backend Phase 2 (Media Asset Generation and Render).
  - The frontend switches back into standard monitoring mode, polling `GET .../execution` to visualize the background rendering progress.

#### Option B: Reject Scene Plan
- **Endpoint:** `POST /api/v1/companies/{company_id}/projects/{project_id}/tasks/{task_id}/reject-scene-plan`
- **Payload:** Requires a JSON body matching the feedback schema:
  ```json
  {
    "feedback_text": "string"
  }
  ```
- **Flow:**
  - Allows the user to provide exact natural language feedback (e.g., "Change the intro scene to a nighttime shot, keep everything else the same").
  - The backend agent will process the feedback and regenerate the Scene Plan. The workflow loops back to Phase 2 (Reviewing the Scene Plan).
