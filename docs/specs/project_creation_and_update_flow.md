# Project Creation and Update Flow Specification

## Overview
This document outlines the requirements and API integration flow for creating and editing projects. It defines a multi-step process for project creation and details how existing project data should be preloaded when editing.

## 1. Project Creation (Initial Step)
- **Endpoint:** `POST /api/v1/companies/{company_id}/projects`
- **Behavior:** The initial project creation step only requires basic information to establish the project record.
- **Payload Structure:**
  ```json
  {
    "name": "string",
    "description": "string",
    "start_date": "string",
    "end_date": "string"
  }
  ```

## 2. Project Update / Subsequent Steps
- **Endpoint:** `PATCH /api/v1/companies/{company_id}/projects/{project_id}`
- **Behavior:** Once the initial project is created, subsequent steps in the creation flow (or standard project edits) use the PATCH endpoint to add or modify detailed information, such as objectives, metadata, branding, audience, squads, and similar companies.
- **Payload Structure:**
  ```json
  {
    "name": "string",
    "description": "string",
    "status": "string",
    "primary_objective": "string",
    "start_date": "string",
    "end_date": "string",
    "squad_ids": ["string"],
    "metadata": {
      "additionalProp1": {}
    },
    "brand": {
      "additionalProp1": {}
    },
    "audience": {
      "additionalProp1": {}
    },
    "like_companies": [
      {
        "additionalProp1": {}
      }
    ]
  }
  ```

## 3. Editing an Existing Project
- **Preloading Information:** When a user clicks on an existing project to edit it, the frontend must fetch and preload all existing project data into the form. This ensures the user sees the current state (including brand, audience, and metadata) before making changes.
- **Update Mechanism:** Any modifications made to the preloaded data will be saved using the same `PATCH /api/v1/companies/{company_id}/projects/{project_id}` endpoint.
