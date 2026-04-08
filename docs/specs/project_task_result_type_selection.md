# Project Task Result Type Selection Specification

## Overview
This document specifies the mechanism for explicitly selecting the desired outcome formats for a task. To ensure reliable generation and to trigger the appropriate toolchains (and workflows like human-in-the-loop review), users must explicitly choose the `result_type` when creating or editing a task.

## 1. Explicit Result Type Selection
To improve user experience and accuracy in task execution, the frontend provides an interface for explicitly selecting the desired output type.

### UI Implementation
- **Result Type Selector:** A clear UI control (e.g., dropdown, toggle buttons, or segmented control) is provided during task creation or configuration, allowing the user to select the task's primary output intent.
- **Available Options:**
  - `pdf`: Used for document rendering and generation.
  - `image`: Direct agentic generation of a single or composite visual media file.
  - `image_pipeline`: A multi-stage pipeline specifically designed for advanced image generation and post-processing.
  - `video`: Direct generation of a single video media file.
  - `video_pipeline`: A multi-stage video production workflow, which includes generating a scene plan, awaiting human-in-the-loop approval, and then executing the final video render.

### API Expectations
- The UI captures the selected `result_type` and includes it in the `TaskCreate` or `TaskUpdate` JSON payload.
- Sending an explicit `result_type` guarantees that the backend agents will have the necessary context to select the right generation tools, rather than relying on natural language interpretation.
- Choosing `video_pipeline` explicitly triggers a two-phase execution lifecycle (as defined in the Multimedia Workflow spec), whereas direct generation choices might skip intermediate review hurdles if continuous generation is supported.
