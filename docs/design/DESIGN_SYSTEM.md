# StudyForge Design System

## 1. Purpose

This document defines reusable UI rules and component behavior for the StudyForge frontend.

Agents must build reusable primitives before duplicating patterns inside feature pages.

---

## 2. Token Source

Implementation tokens should live at:

```text
src/styles/tokens.css
```

Recommended initial token set:

```css
:root {
  --color-primary-50: #f5f4ff;
  --color-primary-100: #efefff;
  --color-primary-500: #5f5cff;
  --color-primary-600: #514df0;

  --color-bg: #f8f9fc;
  --color-surface: #ffffff;
  --color-surface-soft: #fafbfe;

  --color-text-primary: #15162f;
  --color-text-secondary: #62657f;
  --color-text-muted: #999caf;

  --color-border: #ececf4;
  --color-border-strong: #ddddec;

  --color-info: #28c0df;
  --color-success: #35a35a;
  --color-warning: #ffd668;
  --color-orange: #ff9068;
  --color-danger: #ff6878;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;
  --radius-pill: 999px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  --sidebar-width: 240px;
  --page-max-width: 1600px;
  --page-padding: 32px;
}
```

Do not hard-code random colors or spacing values inside every feature.

---

## 3. Component Locations

Recommended structure:

```text
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── IconButton.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── SearchInput.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── StatusPill.tsx
│   │   ├── Tabs.tsx
│   │   ├── SegmentedControl.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── CircularProgress.tsx
│   │   ├── Avatar.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Dialog.tsx
│   │   ├── DropdownMenu.tsx
│   │   ├── Tooltip.tsx
│   │   └── Toast.tsx
│   │
│   └── layout/
│       ├── AppShell.tsx
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       ├── PageHeader.tsx
│       └── MobileNavigation.tsx
│
└── styles/
    ├── tokens.css
    ├── globals.css
    └── typography.css
```

Use the existing project structure when it already follows an equivalent pattern. Do not reorganize purely for aesthetics.

---

## 4. Button

Required variants:

```text
primary
secondary
ghost
danger
```

Required sizes:

```text
sm
md
lg
```

Required states:

```text
default
hover
focus
disabled
loading
```

Rules:

- no page-specific primary button colors;
- one primary action per major page area when practical;
- icon-only actions must use accessible labels;
- disabled buttons must remain readable.

---

## 5. Card

Recommended API concept:

```text
<Card>
  <CardHeader />
  <CardContent />
  <CardFooter />
</Card>
```

Card variants:

```text
default
interactive
selected
```

Interactive cards must have:

- hover state;
- keyboard focus;
- semantic clickable element.

---

## 6. StatusPill

StudyForge statuses should be normalized.

Suggested learning path/topic statuses:

```text
not_started
learning
practicing
review_due
mastered
blocked
```

Suggested mapping:

```text
not_started → gray
learning    → cyan/blue
practicing  → purple
review_due  → yellow
mastered    → green
blocked     → red
```

Display user-friendly labels.

Never render internal enum names to users.

---

## 7. ProgressBar

Use for:

- learning path completion;
- module completion;
- practice completion;
- review progress.

Properties should support:

```text
value
max
label
showPercentage
size
```

Do not use red/green progress purely to judge learner performance unless semantic meaning is clear.

---

## 8. Tabs

Tabs should visually resemble the reference segmented controls.

Use for content views such as:

```text
Overview
Notes
Practice
Resources
Review
```

Do not use tabs as a replacement for main application navigation.

---

## 9. Segmented Control

Use for alternate views of the same information.

Example:

```text
List | Board | Timeline
```

or:

```text
Day | Week | Month | Year
```

Only one option is active.

---

## 10. Sidebar

StudyForge recommended navigation:

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

Behavior:

### Desktop

- fixed or sticky left sidebar;
- approximately 240px;
- icon + label;
- user profile at bottom when appropriate.

### Tablet

- collapsed rail or overlay drawer.

### Mobile

- drawer or compact bottom navigation;
- do not retain a 240px permanent sidebar.

---

## 11. PageHeader

Standard page header should support:

```text
title
description
breadcrumb
primary action
secondary actions
filters
```

Keep titles left aligned.

Avoid creating a completely different header layout on every page.

---

## 12. Dashboard Stat Card

Standard pattern:

```text
icon
metric
label
optional trend/supporting text
```

Recommended StudyForge metrics:

```text
Active Learning Paths
Topics Completed
Labs Completed
Reviews Due
Study Streak
Study Time
```

Use a maximum of four high-priority stat cards in the first desktop row unless the design specifically requires more.

---

## 13. Learning Path Card

A learning-path card should be able to show:

```text
title
description
category
progress
completed topics / total topics
last activity
next recommended action
```

Optional:

```text
difficulty
estimated duration
```

Primary action:

```text
Continue
```

Avoid filling cards with too many badges.

---

## 14. Topic Card

Recommended topic information:

```text
title
module
status
mastery
practice progress
review state
```

Board cards may display less detail than list cards.

---

## 15. Learning Board

Recommended columns:

```text
Not Started
Learning
Practicing
Mastered
```

Optional review indicator may appear on cards rather than creating too many columns.

Drag-and-drop is optional. The UI must remain usable without it.

---

## 16. Study Timeline

Recommended display:

```text
time
study session / topic
duration
status
```

Suggested controls:

```text
List | Board | Timeline
```

The timeline should visualize planned or completed study activity, not generic project tasks.

---

## 17. Study Calendar

Required views where implemented:

```text
Day
Week
Month
```

Year view is optional for MVP.

Calendar event types:

```text
Study Session
Practice Lab
Review
Milestone
```

Provide textual labels in addition to event colors.

---

## 18. Topic Workspace

This is a core StudyForge experience.

Recommended structure:

```text
Topic header
Breadcrumb
Status / mastery

Tabs:
Overview
Notes
Practice
Resources
Review
```

Overview should support:

```text
Learning objective
Why this matters
Prerequisites
Key concepts
Current progress
Next action
```

Notes should support structured Markdown.

Practice should support tasks/labs.

Review should show recall questions and mastery evidence.

---

## 19. Notes Editor

Notes structure may encourage:

```markdown
# Topic

## Why this matters

## Mental model

## Key concepts

## Commands / Syntax

## Worked example

## Pitfalls / Debugging

## Practice I completed

## Recall questions

## Summary
```

The editor must remain focused and readable.

Avoid excessive toolbars.

---

## 20. Empty States

Empty states should explain:

1. what is empty;
2. why it matters;
3. what the user can do next.

Example:

```text
No learning paths yet.

Create your first learning path to organize a technology from fundamentals to mastery.

[Create Learning Path]
```

---

## 21. Loading States

Prefer skeletons for content-heavy screens.

Use spinners only for small localized operations.

Avoid blank white screens during loading.

---

## 22. Errors

Errors should be actionable.

Bad:

```text
Something went wrong.
```

Better:

```text
We couldn't load your learning paths.
Check your connection and try again.

[Retry]
```

---

## 23. Accessibility

Components must support:

- keyboard navigation;
- focus indicators;
- semantic structure;
- labels;
- ARIA only where necessary;
- usable target sizes;
- no color-only meaning.

---

## 24. Responsive Grid

Recommended desktop dashboard:

```text
12-column layout
```

Suggested behavior:

```text
Desktop: 4 stat cards in one row
Tablet:  2 x 2
Mobile:  1 per row
```

Content sections should collapse naturally instead of horizontally overflowing.

---

## 25. Design Review Checklist

Before considering a screen finished, verify:

- shared tokens are used;
- shared components are reused;
- spacing matches the system;
- heading hierarchy is correct;
- primary action is clear;
- loading state exists;
- empty state exists where necessary;
- error state exists where necessary;
- desktop/tablet/mobile work;
- keyboard focus is visible;
- no reference-product business content leaked into StudyForge;
- mock data represents realistic learning content.
