# Project Constitution (Memory Bank)

This file serves as the "Memory Bank" or "Constitution" for all AI agents and human developers working on this project. It defines the immutable architectural constraints, coding standards, and project goals that must be respected across all features and changes.

**All agents (Product Owner, Architect, Backend, etc.) MUST read this file to understand the global context before executing their tasks.**

## Core Principles
1. **Spec-Driven Development (SDD):**
   - We follow a Spec-Anchored development approach. 
   - Code is not the primary source of truth; the `spec.md` for a feature or component is.
   - Any changes to functionality must first be documented and updated in the respective `spec.md` file before code is generated or modified.
2. **Repository Pattern:**
   - Strict adherence to the Repository Pattern is required for all data access layers.
3. **Documentation:**
   - Every repository/module must contain a `README.md` defining its technical stack.
   - SDD specs should be stored in the `docs/specs/` directory, organized by feature.

## Architectural Guidelines
*   **Decoupling:** Maintain loose coupling and high cohesion between system components.
*   **Security by Design:** Embed security at the architecture level (Zero Trust, least privilege, protect data).
*   **Design Patterns:** Favor SOLID, DRY, and KISS principles.

## Workflow Rules
*   **Product Owner:** Responsible for translating business needs into unambiguous, structural `spec.md` files (spec-first).
*   **Architect:** Responsible for injecting technical constraints and system design into the feature `spec.md` (spec-anchored).
*   **Developer (e.g., Backend):** Responsible for taking the finalized `spec.md` and generating code exactly conforming to it. If the spec is ambiguous or the code must deviate for technical reasons, the developer MUST first halt and update the `spec.md` to reflect the new reality.
