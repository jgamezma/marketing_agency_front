# Project Multiple Squad Selection Specification

## Overview
This document outlines the requirement for selecting multiple Squad Types when creating a new project. It details the UI/UX expectations and the necessary data handling during the project creation flow.

## 1. Multiple Squad Selection Requirement
- **Scope:** When a user is in the process of creating a new project, they must be able to select **multiple** Squad Types from the available options.
- **Dependency on Niche:** The available Squad Types to select from are determined by the selected Niche for the project.

## 2. UI/UX Implementation
- **Selection Interface:** The frontend application must implement a multi-select component (e.g., a multi-select dropdown, a group of checkboxes, or selectable pill tags) to allow users to easily pick more than one squad.
- **Clear Feedback:** The user interface should clearly display which squads are currently selected and provide an intuitive way to toggle their selection status.
- **Optional vs. Required:** While a user *can* select multiple squads, whether the selection is mandatory or optional during the initial onboarding flow depends on the onboarding requirements (typically optional to reduce friction, but multiple choices must be supported when the user opts to define their team).

## 3. Data Structure and API
- **Payload Handling:** The frontend must submit the selected squads as a collection (e.g., an array of identifiers) in the API request payload when creating or updating the project.
- **Example Payload Structure:**
  ```json
  {
    "name": "Acme Corp Rebranding",
    "niche_id": "marketing",
    "squad_ids": ["design-squad", "content-squad", "seo-squad"],
    "description": "..."
  }
  ```
- **Validation:** The frontend should ideally validate that the selected squad options are relevant and valid for the chosen niche before dispatching the creation request.

## 4. Business Logic and Workflow
- By enabling the selection of multiple squads up front, a project can be immediately scoped to involve several specialized teams or functional groups. 
- The system must correctly associate all chosen squads with the newly created project in the backend, allowing those respective teams to access and manage the project simultaneously.
