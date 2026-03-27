# Project Task Feedback and Versions Specification

## Overview
This document specifies the requirements and API endpoints for providing feedback on completed tasks and managing task versioning. When a task is completed, a user can submit feedback. This feedback automatically generates a new version of the task, allowing backend agents to continue working and iterating using both the new feedback and the previous context of the task.

## 1. Submit Feedback
- **Context:** Once a task is marked as completed, users can review the output and submit feedback if further refinements or corrections are needed. Submitting feedback triggers the creation of a new task version for the agents to process.
- **Endpoint:** `POST /api/v1/companies/{company_id}/projects/{project_id}/tasks/{task_id}/feedback`
- **Behavior:**
  - Accepts the user's feedback payload.
  - Automatically generates a new version of the task.
  - Agents resume work on the task, incorporating the new feedback alongside the existing task context.

## 2. List Feedback
- **Context:** Users or the system may need to review the history of feedback provided for a specific task across its lifecycle.
- **Endpoint:** `GET /api/v1/companies/{company_id}/projects/{project_id}/tasks/{task_id}/feedback`
- **Behavior:**
  - Retrieves a list of all feedback entries submitted for the given task.
  - Useful for displaying a timeline or history of user requests and agent iterations.

## 3. List Versions
- **Context:** Because each feedback submission creates a new iteration of the task, the system must track and expose all available versions of a task's output.
- **Endpoint:** `GET /api/v1/companies/{company_id}/projects/{project_id}/tasks/{task_id}/versions`
- **Behavior:**
  - Returns a list of all versions generated for the task.
  - Allows the frontend to display a version history, letting users see how the task evolved over multiple feedback cycles.

## 4. Get Version
- **Context:** Users may want to view the specific output and details of a particular historical or current version of the task.
- **Endpoint:** `GET /api/v1/companies/{company_id}/projects/{project_id}/tasks/{task_id}/versions/{version_number}`
- **Behavior:**
  - Retrieves the detailed result and context of the specified task version.
  - Useful for comparing different iterations or reverting to a previous state if necessary.
