# Squads and Niches Specification

## Overview
This document defines the relationship between Niches, Squads, and Projects within the Marketing Agency platform. It specifies how squads are allocated to projects based on their associated niche and the behavior during the user onboarding flow.

## 1. Niches and Squads Relationship
- **Niches Define Squads:** Every niche (e.g., Real Estate, E-commerce, Healthcare) has a predefined set of associated squads. A squad represents a specialized team or functional group (e.g., Content Creation, SEO, Ads Management, Social Media).
- The selected niche dictates exactly which squads are available and relevant for any project operating within that niche.

## 2. Project Squad Requirements
- **Default Full Allocation:** By default, a project is designed to require **all** the squads defined by its selected niche. The platform generally assumes a comprehensive marketing approach involving all associated functional teams.
- **Partial Squad Participation:** While all squads are available, sometimes a project may only work with **one squad** or a specific subset of the available squads (e.g., a client only needs Ads Management, ignoring SEO and Content Creation). The platform must support partial squad activation per project.

## 3. Onboarding Flow Behavior
- **Squad Selection is Not Necessary:** During the "First Project Onboarding" flow, **it is not necessary for the user to choose a squad.**
- To reduce friction and help users enter the platform quickly, the onboarding wizard should allow project creation without mandating squad configuration.
- Squad selection and assignment are deferred. The project will be created with its base details, and the user can later activate specific squads from within the project's dashboard.

## 4. UI/UX Implications
- **Dashboard Post-Onboarding:** When a user enters the dashboard for a newly created project (where no squads were selected during onboarding), the UI should prompt or allow them to activate the default squads for their chosen niche, or select only the specific ones they need.
- **Niche Selection:** Selecting a niche is a prerequisite for determining which squads will eventually be available to the project.
