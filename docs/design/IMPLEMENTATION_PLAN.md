# StudyForge UI Redesign Implementation Plan

## Objective

Redesign the StudyForge frontend around the supplied clean productivity/SaaS visual reference while preserving StudyForge's learning-domain architecture and mock-first frontend development strategy.

Do not perform the redesign as one large uncontrolled change.

---

# Phase UI-0 — Audit and Baseline

## Goal

Understand the current frontend before changing visual architecture.

## Tasks

- inspect current routes;
- inspect current components;
- inspect existing CSS/styling strategy;
- identify reusable components;
- identify duplicated components;
- identify pages already implemented;
- confirm mock mode still works;
- capture current build/lint/typecheck status.

## Deliverable

A short implementation note in the agent artifact or task output containing:

```text
Current styling approach
Reusable components
Pages affected
Risks
Planned migration order
```

## Exit Gate

Do not start large UI changes until the audit is complete.

---

# Phase UI-1 — Foundations

## Goal

Create the design system foundation without redesigning every page.

## Tasks

Create or update:

```text
src/styles/tokens.css
src/styles/globals.css
src/styles/typography.css
```

Establish:

- color tokens;
- spacing;
- radius;
- typography;
- shadows;
- focus rings;
- page background;
- base controls.

Install/use Inter only through an appropriate project method.

Do not bundle unauthorized reference assets into production.

## Exit Gate

- project compiles;
- tokens are centralized;
- current screens remain usable.

---

# Phase UI-2 — UI Primitives

## Goal

Build reusable components.

Priority:

```text
Button
IconButton
Input
Textarea
Select
SearchInput
Card
Badge
StatusPill
Tabs
SegmentedControl
ProgressBar
Avatar
Dialog
Dropdown
Tooltip
Toast
Skeleton
EmptyState
```

## Rule

Do not redesign a feature page by creating one-off components if a shared primitive should exist.

## Exit Gate

Shared components are ready for feature migration.

---

# Phase UI-3 — Application Shell

## Goal

Implement the visual foundation visible across authenticated screens.

Build/update:

```text
AppShell
Sidebar
PageHeader
Header / toolbar
Responsive navigation
User account area
```

Recommended StudyForge navigation:

```text
Dashboard
My Learning
Learning Paths
Practice
Notes
Reviews
Calendar
Analytics
Settings
```

## Exit Gate

- desktop sidebar matches theme;
- tablet behavior works;
- mobile navigation works;
- active route is clear;
- keyboard navigation works.

---

# Phase UI-4 — Authentication

## Goal

Redesign:

```text
Login
Register
Forgot Password
```

Use split-screen desktop layout inspired by references.

Keep mock authentication functional.

Use StudyForge copy.

Do not add Facebook login unless it is an actual authentication requirement.

## Exit Gate

Auth screens work on:

```text
desktop
tablet
mobile
```

---

# Phase UI-5 — Dashboard

## Goal

Build the new StudyForge dashboard.

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

Use realistic mock learning data.

## Exit Gate

Dashboard communicates meaningful learning state at a glance.

---

# Phase UI-6 — Learning Paths

## Goal

Redesign:

```text
Learning Path List
Learning Path Detail
Module List
Topic List
```

Focus on:

- clear progress;
- next action;
- module hierarchy;
- completion state;
- mastery.

Avoid overcrowded cards.

---

# Phase UI-7 — Topic Workspace

## Goal

Create the core focused study workspace.

Recommended tabs:

```text
Overview
Notes
Practice
Resources
Review
```

The workspace must prioritize reading, writing, and practice over dashboard widgets.

## Exit Gate

A learner can understand:

- what to learn;
- why it matters;
- current progress;
- notes;
- practice;
- next review.

---

# Phase UI-8 — Board and Timeline

## Goal

Implement alternate learning views.

Shared control:

```text
List | Board | Timeline
```

Board:

```text
Not Started
Learning
Practicing
Mastered
```

Timeline:

```text
time-based planned/completed study sessions
```

Do not implement drag-and-drop unless required.

---

# Phase UI-9 — Study Calendar

## Goal

Apply calendar reference style.

Support:

```text
Day
Week
Month
```

Year is optional.

Event types:

```text
Study Session
Practice Lab
Review
Milestone
```

Use responsive behavior appropriate for mobile.

---

# Phase UI-10 — Notes, Practice and Review

## Notes

Focused knowledge workspace.

## Practice

Clear lab/task cards with completion state.

## Review

Review queue, recall questions, mastery evidence.

Use the same design system.

---

# Phase UI-11 — Analytics

## Goal

Translate the reference dashboard analytics into meaningful learning insight.

Potential metrics:

```text
Study time
Completion trend
Practice rate
Review accuracy
Mastery distribution
Learning streak
```

Avoid analytics that do not help the learner decide what to do next.

---

# Phase UI-12 — Responsive and Accessibility Pass

## Test widths

```text
1440px
1280px
1024px
768px
390px
360px
```

## Verify

- no horizontal page overflow;
- sidebar collapses correctly;
- forms remain usable;
- boards/timelines have deliberate mobile behavior;
- tables adapt or become cards;
- focus states visible;
- contrast acceptable;
- navigation keyboard accessible.

---

# Phase UI-13 — Consistency Cleanup

Search for:

- duplicated color literals;
- duplicated button styles;
- inconsistent radius;
- inconsistent typography;
- page-specific shadows;
- unused legacy CSS;
- copied reference content;
- mock data unrelated to learning.

Replace with design-system equivalents.

---

# Phase UI-14 — Final Verification

Required checks:

```text
npm run typecheck
npm run lint
npm run test
npm run build
```

Use the scripts that actually exist in the project.

Do not invent scripts.

Also manually verify core routes in mock mode.

---

# Agent Working Rule

For each phase:

1. read relevant design docs;
2. inspect relevant reference image(s);
3. inspect current implementation;
4. make a small plan;
5. implement;
6. verify;
7. report changed files;
8. stop at the phase boundary unless explicitly instructed to continue.

---

# Definition of Done

The redesign is complete when:

- all major screens use one visual system;
- mock-first frontend still works;
- StudyForge domain language is preserved;
- no business-dashboard content remains;
- responsive layouts work;
- accessibility basics are handled;
- reusable UI primitives are used;
- build/typecheck/lint are clean or all pre-existing failures are clearly documented.
