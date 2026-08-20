---
name: studyforge-ui
description: Design and implement StudyForge frontend UI using the approved light productivity theme and the reference images under docs/design/references.
---

# StudyForge UI Skill

## Purpose

Use this skill whenever implementing, redesigning, reviewing, or refactoring StudyForge frontend UI.

The goal is to produce a consistent StudyForge interface based on the supplied clean SaaS/productivity references without copying the reference application's business domain or branding.

---

# Required Reading

Before making significant UI changes, read:

```text
docs/design/README.md
docs/design/UI_THEME.md
docs/design/DESIGN_SYSTEM.md
docs/design/SCREEN_MAPPING.md
docs/design/IMPLEMENTATION_PLAN.md
```

When relevant, inspect the matching image under:

```text
docs/design/references/
```

---

# Source of Truth Order

Use this order when instructions conflict:

1. Current explicit user instruction
2. StudyForge product requirements
3. `docs/design/DESIGN_SYSTEM.md`
4. `docs/design/UI_THEME.md`
5. `docs/design/SCREEN_MAPPING.md`
6. Reference images
7. Existing frontend implementation

Reference images define visual inspiration, not product behavior.

---

# Product Context

StudyForge is a structured technical-learning application.

Core journey:

```text
Learn
→ Understand
→ Note
→ Practice
→ Verify
→ Review
→ Master
```

Core domain hierarchy:

```text
Learning Path
→ Module
→ Topic
→ Objectives
→ Notes
→ Practice
→ Review
→ Mastery
```

Do not turn StudyForge into a generic project-management application.

---

# Visual Rules

Use:

- light neutral app background;
- white surfaces;
- indigo/purple primary;
- dark navy text;
- subtle borders;
- minimal shadows;
- medium rounded corners;
- generous whitespace;
- clear page hierarchy;
- simple line icons;
- soft semantic status colors.

Avoid:

- heavy glassmorphism;
- neon gradients;
- oversized shadows;
- random color values;
- inconsistent corner radii;
- dense admin-template layouts;
- decorative clutter.

---

# Reference Translation Rules

Never copy irrelevant reference content.

Examples:

```text
Sales
→ Learning Activity

Products
→ Learning Paths

Task Board
→ Learning Board

Task Timeline
→ Study Timeline

Transactions
→ Mastery Overview

Recent Orders
→ Recent Learning Activity
```

Remove UI elements that have no legitimate StudyForge equivalent.

Do not invent fake collaboration, invoices, messages, products, or billing simply to match a screenshot.

---

# Design Tokens

Prefer existing centralized tokens.

Recommended location:

```text
src/styles/tokens.css
```

Do not hard-code new one-off colors unless a missing semantic token is intentionally added to the design system.

---

# Component Reuse

Before creating a new visual component:

1. search for an existing shared component;
2. extend it if appropriate;
3. create a new reusable primitive only if genuinely needed.

Preferred shared areas:

```text
src/components/ui/
src/components/layout/
```

Do not create slightly different versions of Button, Card, Badge, Tabs, or Input inside multiple features.

---

# Page Implementation Workflow

For each screen:

## Step 1 — Inspect

Inspect:

- current route;
- current component tree;
- current state/data contract;
- relevant design documentation;
- relevant screenshot.

## Step 2 — Plan

Identify:

- layout changes;
- reusable components;
- responsive behavior;
- states;
- data that already exists;
- mock data requirements.

## Step 3 — Implement

Use existing architecture.

Do not change backend/API contracts only to make styling easier.

Keep frontend mock mode functional.

## Step 4 — Handle States

Every meaningful data screen should consider:

```text
loading
empty
error
success
```

## Step 5 — Responsive

Test:

```text
desktop
tablet
mobile
```

## Step 6 — Accessibility

Verify:

- headings;
- labels;
- button semantics;
- keyboard access;
- focus state;
- icon labels;
- color contrast.

## Step 7 — Verify

Run only scripts that exist in the project, typically:

```text
typecheck
lint
test
build
```

Report pre-existing failures separately.

---

# Screen-Specific Guidance

## Authentication

Reference:

```text
login.png
signup.png
```

Use split layout on desktop.

Mobile should prioritize the form.

Do not require username without a product need.

Google + email/password is sufficient for initial design unless requirements say otherwise.

---

## Dashboard

Reference:

```text
dashboard.png
```

Recommended content:

```text
Active Learning Paths
Topics Completed
Labs Completed
Reviews Due
Learning Activity
Mastery Overview
Recent Learning Activity
Continue Learning
```

Avoid vanity metrics.

---

## Learning Board

Reference:

```text
board.png
```

Preferred columns:

```text
Not Started
Learning
Practicing
Mastered
```

Cards should be compact and learning-focused.

---

## Study Timeline

Reference:

```text
timeline.png
```

Use scheduled/planned learning entries, not generic project tasks.

---

## Calendar

Reference:

```text
calendar.png
```

Use event types:

```text
Study Session
Practice Lab
Review
Milestone
```

---

## Topic Workspace

No direct screenshot exists.

Derive it from the same design system.

Recommended structure:

```text
Breadcrumb
Topic Header
Status / Mastery
Overview | Notes | Practice | Resources | Review
```

This screen should feel calmer and more focused than the dashboard.

---

# Mock-First Requirement

The frontend is developed before the NestJS backend.

Therefore:

- UI work must not require a running backend;
- preserve the mock data adapter;
- use realistic learning-domain mock data;
- do not bypass the service/repository abstraction by hard-coding mock values directly in components.

The future backend should replace the data adapter, not require a UI rewrite.

---

# Do Not

Do not:

- redesign the whole frontend in one uncontrolled task;
- rewrite unrelated business logic;
- change routes without a reason;
- alter API contracts for visual convenience;
- remove working mock mode;
- duplicate design primitives;
- import reference screenshots into production;
- copy logos or illustration artwork from the reference;
- add dependencies without explaining why;
- claim verification passed when commands were not run.

---

# Completion Output

After completing a UI task, report:

```text
Summary
Changed files
Design decisions
Responsive behavior
Accessibility considerations
Verification performed
Remaining issues
```

Keep the report concise and factual.
