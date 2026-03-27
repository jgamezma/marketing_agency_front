# Project Task and Squad Association Specification

## Overview
This document outlines the requirements and logic for managing tasks within a project and associating them with squads. It covers two primary workflows: the ability for a user to manually associate a task to a specific squad, and the system's ability to automatically suggest a squad for execution when a task is created.

## 1. Manual Task-to-Squad Association
- **Context:** While managing a project, a user can create a task and explicitly assign it to one of the squads associated with that project.
- **Endpoint:** `POST /api/v1/companies/{company_id}/projects/{project_id}/tasks`
- **Payload Structure:**
  ```json
  {
    "title": "string",
    "description": "string",
    "squad_id": "uuid"
  }
  ```
- **Behavior:** 
  - The frontend UI will provide a selection mechanism (e.g., a dropdown menu) listing all squads currently assigned to the project.
  - The user manually selects the appropriate squad responsible for executing the task.
- **Requirements:**
  - The list of available squads must be filtered down to only those that are actively associated with the project.
  - The task creation or update payload must include the selected `squad_id`.

## 2. System-Suggested Squad Assignment
- **Context:** When a user creates a new task without explicitly selecting a squad, the system should intelligently suggest or auto-assign a squad capable of executing it.
- **Endpoint:** `POST /api/v1/companies/{company_id}/projects/{project_id}/tasks/suggest-squad`
- **Request Payload:**
  ```json
  {
    "title": "string",
    "description": "string"
  }
  ```
- **Response Payload:**
  ```json
  {
    "suggested_squad_id": "uuid",
    "squad_name": "string",
    "confidence_score": 0.95,
    "reasoning": "string"
  }
  ```
- **Behavior:**
  - The system analyzes the provided task details (e.g., description, category, or title) using an LLM to match against each squad's purpose and agent roster.
  - Based on the core competencies of the available squads within the project, the system recommends the most suitable squad for the task.
  - The UI will prompt the user with the recommendation (e.g., "Suggested Squad: Content Creation Squad"), which the user can accept, change, or clear.
- **Requirements:**
  - The frontend must be equipped to receive system suggestions for squad assignments and present them intuitively to the user during the task creation flow.
  - Once accepted, the task's corresponding API payload (`POST .../tasks` or `PATCH .../tasks/{task_id}`) must include the suggested `squad_id`.

## 3. Data Integrity and Validation
- **Requirement:** A task cannot be associated with an arbitrary squad that is entirely unrelated to the current project or its defined niche.
- **Validation:** Both the frontend and backend must enforce validation ensuring that any `squad_id` provided for a task is a valid entity assigned to the parent project.
