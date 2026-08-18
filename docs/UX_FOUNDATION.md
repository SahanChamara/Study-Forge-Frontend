# StudyForge UX & Product Foundation

## 1. Agent Personas & Ownership

- **@product**: Defines user journeys, acceptance criteria, problem definition, and scope boundaries.
- **@learning**: Manages curriculum structure, mastery scales (0-5), the L-N-P-V-R framework (Learn → Note → Practice → Verify → Review), and retention workflows.
- **@ux**: Controls Information Architecture (IA), screen hierarchy, design tokens, interaction feedback (loading/empty/error/success), and responsive layout rules.
- **@frontend**: Builds React components, TypeScript interfaces, router setup, accessibility, and service adapter layers.
- **@qa**: Verifies responsive breakpoints, keyboard navigation, state edge cases, accessibility standards, and build/type safety.
- **@architect**: Enforces strict separation of UI from data access, mock vs. remote service boundaries, and parity with `docs/API_CONTRACT.md`.

---

## 2. Information Architecture (IA) & Screen Inventory

### Navigation Structure
```
StudyForge Shell
│
├── Public / Unauthenticated
│   └── /login — Login, Register & Password Recovery
│
└── Private / Authenticated (Protected App Shell)
    ├── / — Dashboard (Overview, active study path, review queue summary, progress metrics)
    ├── /paths — Learning Paths Directory (Catalog, path creator, search & filter)
    ├── /paths/:pathId — Path Overview & Module Hierarchy (Ordered modules, topics, progress tree)
    ├── /paths/:pathId/topics/:topicId — Topic Learning Workspace (Focus layout, resources, notes, practice)
    ├── /notes — Global Smart Notes Hub (Searchable Markdown notes across all topics)
    ├── /practice — Hands-on Practice Queue (Active tasks, lab instructions, evidence submission)
    └── /review — Spaced Review & Retention (Weak topics, recall question cards, mastery scale 0-5)
```

### Screen Inventory & Responsibilities
1. **Auth View (`/login`)**:
   - Single panel card toggle between Login, Registration, and Password Reset.
   - Validation states, error handling, loading spinners, and demo login buttons.
2. **Dashboard View (`/`)**:
   - Welcome header with daily streak and current session objective.
   - Quick stats: Total paths, topics mastered, notes written, pending reviews.
   - "Continue Learning" primary action card directing to the active topic.
   - Review queue alert card listing topics ready for recall.
3. **Paths Directory View (`/paths`)**:
   - Grid & List view of learning paths (e.g. Linux DevOps, Docker Mastery, Kubernetes).
   - "Create New Path" form (title, goal, description, seed template options).
   - Path progress indicators (% completed, estimated hours remaining).
4. **Path Detail View (`/paths/:pathId`)**:
   - Header with path goals, target level, and completion stats.
   - Accordion/nested list of Modules and Topics.
   - Topic status badges: `not_started`, `learning`, `practicing`, `review`, `mastered`.
   - Mastery level indicator (0 to 5 dots/stars).
5. **Topic Learning Workspace View (`/paths/:pathId/topics/:topicId`)**:
   - Two-column focus layout: Left = Objectives, Resources & Markdown Note Editor; Right = Practice Tasks & Mastery Control.
   - Breadcrumb navigation (`Paths > Path Title > Module Title > Topic`).
   - Previous/Next topic quick switcher.
6. **Smart Notes Hub (`/notes`)**:
   - Structured Markdown editor with live preview side-by-side or tabbed.
   - Standard 9-section template support (Why this matters, Mental model, Key concepts, Commands, Worked example, Pitfalls, Practice completed, Recall questions, 5-line summary).
   - Tag filter & search bar.
7. **Practice Queue (`/practice`)**:
   - List of hands-on lab tasks categorized by path/topic.
   - Evidence submission input (command outputs, screenshots, logs, text proof).
   - Task completion toggle and verification status.
8. **Review & Retention View (`/review`)**:
   - Cards displaying recall questions for topics needing review.
   - Self-assessment buttons to update mastery scale (0 to 5).

---

## 3. Core User Flows (L-N-P-V-R Framework)

```
1. Learn ────> 2. Note ────> 3. Practice ────> 4. Verify ────> 5. Review
                                                                   │
                                                                   ├── (Mastery < 4) ──> Revisit Note/Practice
                                                                   └── (Mastery >= 4) ─> Topic Mastered!
```

1. **Learn**: Learner opens Topic Workspace, reviews explicit objectives, estimated duration, and study resources.
2. **Note**: Learner fills out the Smart Note template from memory, summarizing mental models, commands, and key concepts.
3. **Practice**: Learner executes hands-on lab instructions in their local shell/environment and inputs verification evidence into StudyForge.
4. **Verify**: Learner checks task evidence against criteria and updates status from `practicing` to `review`.
5. **Review**: Learner evaluates recall questions, self-rates mastery scale (0–5), and schedules automated future review cycles if mastery is below 4.

---

## 4. Design System Tokens & Component Rules

### Color Palette (Nature / Engineering Dark-Light Theme)
- **Canvas / Background**: `#f4f6f1` (Soft sage tint)
- **Surface Card**: `#ffffff` (Pure white card background)
- **Primary Text / Dark Accent**: `#182019` (Deep forest slate)
- **Primary Accent**: `#c7f06a` (Vibrant electric lime)
- **Secondary Accent**: `#486451` (Muted emerald slate)
- **Border / Divider**: `#e0e5dc` (Subtle grey-green border)
- **Muted Text**: `#5f6d61` (Medium slate)
- **Status Indicators**:
  - `not_started`: `#8a958b` (Neutral grey)
  - `learning`: `#2563eb` (Focus blue)
  - `practicing`: `#d97706` (Active amber)
  - `review`: `#9333ea` (Review purple)
  - `mastered`: `#16a34a` (Success green)

### Typography Rules
- Base Font Family: `Inter, system-ui, -apple-system, sans-serif`
- Monospace Font Family: `'JetBrains Mono', 'Fira Code', monospace` (for code, terminal commands, markdown notes)
- Font Scale:
  - Display Title: `clamp(2rem, 4vw, 3rem)`, font-weight 800, letter-spacing `-0.04em`
  - Section Heading `h2`: `1.5rem` (24px), font-weight 700, letter-spacing `-0.02em`
  - Subheading `h3`: `1.125rem` (18px), font-weight 600
  - Body Text: `1rem` (16px), line-height `1.5`
  - Caption / Eyebrow: `0.75rem` (12px), font-weight 800, letter-spacing `0.12em`, uppercase

### Component Rules & Interaction States
- **Buttons**:
  - Primary (`.btn-primary`): Deep slate `#182019` background, white text, 10px radius, hover effect.
  - Accent (`.btn-accent`): Electric lime `#c7f06a` background, slate `#182019` text, bold font.
  - Secondary (`.btn-secondary`): Light tint `#eef1eb`, slate text.
- **Card Primitives**:
  - `16px` border-radius, `1px solid #e0e5dc` border, white background, `20px-24px` internal padding.
- **Required Interaction States**:
  - **Loading**: Skeleton placeholders with shimmer animation.
  - **Empty**: Context-specific empty state card with clear CTA (e.g. "No learning paths found. Create your first path").
  - **Error**: Destructive alert box `#fff0ef` with red border `#ffd1cd` and actionable retry button.
  - **Validation**: Inline field error text below inputs for auth and path creation forms.
  - **Responsive Breakpoint**: Single-column layout under `800px` screen width. Sidebar transforms into top navigation bar.

---

## 5. Service Adapter & Data Architecture

To prevent direct API backend coupling in components, all data operations route through abstract service interfaces defined in `src/services/api.ts`.

- **Mock Adapter Mode (`src/services/mockAdapter.ts`)**: Default implementation using local state / `localStorage` / seed fixtures.
- **Remote Adapter Mode (`src/services/remoteAdapter.ts`)**: Future Phase 6 implementation calling `/api/v1` endpoints with Firebase Bearer Tokens.
