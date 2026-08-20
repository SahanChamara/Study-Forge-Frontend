# StudyForge UI Design Documentation

## Purpose

This directory is the visual design source of truth for the StudyForge frontend.

StudyForge is a structured self-learning application for software engineers, DevOps engineers, and other technical learners. The application must not look like a generic note-taking app or a copied project-management dashboard. The supplied reference images define the **visual language only**.

The StudyForge product model remains:

**Learn → Understand → Note → Practice → Verify → Review → Master**

---

## Design Source Priority

When implementing or reviewing UI, use the following priority:

1. `docs/design/DESIGN_SYSTEM.md`
2. `docs/design/UI_THEME.md`
3. `docs/design/SCREEN_MAPPING.md`
4. Images under `docs/design/references/`
5. Existing StudyForge product requirements
6. Existing implementation

If an existing screen conflicts with the design system, update the implementation instead of creating a second visual style.

---

## Directory Structure

```text
docs/
└── design/
    ├── README.md
    ├── UI_THEME.md
    ├── DESIGN_SYSTEM.md
    ├── SCREEN_MAPPING.md
    ├── IMPLEMENTATION_PLAN.md
    └── references/
        ├── README.md
        ├── dashboard.png
        ├── board.png
        ├── timeline.png
        ├── calendar.png
        ├── login.png
        └── signup.png
```

The filenames above are recommended normalized names. Rename the supplied screenshots to these names after copying them into the project.

---

## Core Rule

Reference screenshots are **design references**, not application assets.

Do not import files from `docs/design/references/` into production React components.

Production assets belong under:

```text
src/assets/
```

Design references belong under:

```text
docs/design/references/
```

---

## StudyForge Visual Identity

StudyForge should feel like:

- a modern technical learning workspace;
- a focused productivity application;
- calm and structured;
- clean enough for long study sessions;
- professional enough for software and DevOps users;
- lightweight rather than visually noisy.

The UI should use:

- light neutral backgrounds;
- white surfaces;
- indigo/purple primary actions;
- dark navy typography;
- subtle borders;
- restrained shadows;
- generous whitespace;
- simple navigation;
- rounded cards;
- semantic status pills;
- clear progress indicators;
- consistent reusable components.

---

## Do Not Copy

Do not reproduce business concepts visible in the reference application.

Examples that must not appear simply because they are in the screenshots:

- invoices;
- sales;
- stock products;
- orders;
- job applications;
- generic project team members;
- upgrade advertising;
- message counters;
- unrelated business analytics.

Translate the visual patterns into StudyForge concepts.

Example:

```text
Reference "Task Board"
        ↓
StudyForge "Learning Board"

Reference "Sales Analytics"
        ↓
StudyForge "Learning Activity"

Reference "Task Timeline"
        ↓
StudyForge "Study Timeline"
```

---

## Required Shared UI

Before feature pages are redesigned, establish reusable primitives for:

- Button
- IconButton
- Input
- Textarea
- Select
- SearchInput
- Card
- Badge
- StatusPill
- Tabs
- SegmentedControl
- ProgressBar
- CircularProgress
- Avatar
- EmptyState
- Skeleton
- Modal / Dialog
- DropdownMenu
- Tooltip
- Toast
- PageHeader
- Sidebar
- AppShell

Avoid page-specific duplicate implementations.

---

## Responsive Requirement

Every redesigned screen must support:

- Desktop: `>= 1280px`
- Tablet: `768px–1279px`
- Mobile: `< 768px`

Desktop screenshots are references, not permission to make the application desktop-only.

---

## Accessibility Requirement

At minimum:

- visible keyboard focus states;
- correct labels for inputs;
- keyboard-accessible navigation;
- semantic buttons instead of clickable `div`s;
- adequate text/background contrast;
- status must not be communicated by color alone;
- icons with accessible labels where meaning is not obvious;
- reduced-motion friendly interactions.

---

## Antigravity Usage

The dedicated UI skill is located at:

```text
.agents/skills/studyforge-ui/SKILL.md
```

Before implementing a design phase, the agent should read:

```text
docs/design/UI_THEME.md
docs/design/DESIGN_SYSTEM.md
docs/design/SCREEN_MAPPING.md
docs/design/IMPLEMENTATION_PLAN.md
```

The agent should then inspect only the reference images relevant to the screen being implemented.

Do not redesign the entire application in one uncontrolled pass.
