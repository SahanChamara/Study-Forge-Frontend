# StudyForge Screen Mapping

## Purpose

This document maps the supplied UI references to StudyForge screens.

The references define layout patterns and visual language. They do not define StudyForge information architecture.

---

# 1. Reference: Dashboard

Recommended reference file:

```text
docs/design/references/dashboard.png
```

## Preserve

- light page background;
- narrow or full sidebar pattern;
- page title;
- metric cards;
- large analytics card;
- circular analytics card;
- lower content cards;
- subtle card borders;
- generous spacing.

## Convert to StudyForge

Reference metrics:

```text
Save Products
Stock Products
Sales Products
Job Application
```

StudyForge metrics:

```text
Active Learning Paths
Topics Completed
Labs Completed
Reviews Due
```

Reference report chart:

```text
Reports / Sales
```

StudyForge:

```text
Learning Activity
```

Possible chart dimensions:

```text
study minutes
topics completed
practice sessions
```

Reference circular chart:

```text
Transactions
```

StudyForge:

```text
Mastery Overview
```

Suggested segments:

```text
Mastered
Learning
Needs Review
```

Reference bottom table:

```text
Recent Orders
```

StudyForge:

```text
Recent Learning Activity
```

Reference product area:

```text
Top Selling Products
```

StudyForge:

```text
Continue Learning
```

---

# 2. Reference: Board

Recommended reference file:

```text
docs/design/references/board.png
```

## Preserve

- top segmented view switcher;
- column-based board;
- clean cards;
- status pills;
- compact metadata;
- search/filter placement;
- white cards on neutral background.

## Convert to StudyForge

Reference columns:

```text
To Do
In Progress
In Review
Done
```

StudyForge columns:

```text
Not Started
Learning
Practicing
Mastered
```

Example cards:

```text
Linux Filesystem
Bash Variables
File Permissions
SSH Hardening
Docker Networking
Kubernetes Services
```

Card metadata may include:

```text
Module
Difficulty
Mastery
Practice count
Review state
```

Do not add fake team-member avatars unless StudyForge introduces collaboration as a real feature.

---

# 3. Reference: Timeline

Recommended reference file:

```text
docs/design/references/timeline.png
```

## Preserve

- `List | Board | Timeline` control;
- horizontal date header;
- vertical time scale;
- clean event cards;
- restrained colored badges;
- open whitespace.

## Convert to StudyForge

Reference task timeline becomes:

```text
Study Timeline
```

Example entries:

```text
09:00 — Linux Permissions
11:00 — Bash Practice
13:00 — Docker Networking
16:00 — Kubernetes Notes
```

Left-side status filtering may become:

```text
Planned
Completed
Skipped
```

or:

```text
Learning
Practice
Review
```

Choose whichever matches the final study-planning data model.

---

# 4. Reference: Calendar

Recommended reference file:

```text
docs/design/references/calendar.png
```

## Preserve

- left mini-calendar;
- large day schedule;
- `Day | Week | Month | Year` selector;
- simple event blocks;
- clean time grid;
- strong active purple state.

## Convert to StudyForge

Primary action:

```text
Create Study Session
```

Event types:

```text
Study Session
Practice Lab
Review
Milestone
```

Possible left-side content:

```text
Upcoming Reviews
Upcoming Labs
Today's Goal
```

Do not show irrelevant people/team lists unless collaboration becomes part of the product.

---

# 5. Reference: Login

Recommended reference file:

```text
docs/design/references/login.png
```

## Preserve

- split desktop layout;
- focused form panel;
- large calm illustration panel;
- simple inputs;
- purple primary CTA;
- social login treatment;
- spacious composition.

## Convert to StudyForge

Heading:

```text
Welcome back
```

Supporting copy:

```text
Continue your learning journey.
```

Recommended authentication:

```text
Google
Email + Password
```

Facebook is not required for the initial StudyForge product.

Fields:

```text
Email Address
Password
```

Actions:

```text
Remember me
Forgot password?
Log in
Create account
```

The illustration should represent technical learning rather than copying the reference artwork.

---

# 6. Reference: Sign Up

Recommended reference file:

```text
docs/design/references/signup.png
```

## Preserve

- same auth visual system as Login;
- matching form dimensions;
- illustration on large screens;
- clear primary CTA.

## Convert to StudyForge

Heading:

```text
Create your StudyForge account
```

Supporting copy:

```text
Build a smarter system for learning technical skills.
```

Recommended fields:

```text
Full Name
Email Address
Password
Confirm Password
```

Do not require username unless a real product requirement depends on it.

Recommended account data for MVP:

```text
Firebase UID
Full Name
Email
```

---

# 7. StudyForge Screen Inventory

## Authentication

```text
/login
/register
/forgot-password
```

## Core

```text
/dashboard
/learning
/learning-paths
/learning-paths/:pathId
/modules/:moduleId
/topics/:topicId
```

## Study Tools

```text
/board
/timeline
/calendar
/practice
/notes
/reviews
```

## Insight

```text
/analytics
```

## Account

```text
/settings
```

Routes are recommendations. Preserve existing routes when changing them would create unnecessary churn.

---

# 8. Recommended Sidebar Mapping

```text
Dashboard       → Dashboard
My Learning     → Current learning overview
Learning Paths  → All structured paths
Practice        → Labs and exercises
Notes           → Knowledge notes
Reviews         → Recall/review queue
Calendar        → Study schedule
Analytics       → Learning analytics
Settings        → Account/preferences
```

---

# 9. Dashboard Layout

Recommended desktop structure:

```text
Page Header
│
├── Stat Card
├── Stat Card
├── Stat Card
└── Stat Card

Learning Activity      Mastery Overview

Recent Activity        Continue Learning
```

Tablet:

```text
2 x 2 stats
Learning Activity
Mastery Overview
Recent Activity
Continue Learning
```

Mobile:

```text
Single column
```

---

# 10. Learning Path Detail

Use reference card and navigation language, but build a dedicated StudyForge structure:

```text
Linux for DevOps

Progress: 68%

Overview | Modules | Practice | Resources

Module 1 — Linux Fundamentals
Module 2 — Users & Permissions
Module 3 — Processes
Module 4 — Networking
...
```

Each module can expand or navigate to its topic list.

---

# 11. Topic Workspace

This screen does not directly exist in the supplied references, so it must be designed from the same visual system.

Recommended:

```text
Breadcrumb
Linux for DevOps / Users & Permissions

Linux File Permissions
Intermediate
Learning
Mastery 3/5

Overview | Notes | Practice | Resources | Review
```

Use white cards and strong whitespace.

Do not make the note editor feel like a dashboard full of widgets.

---

# 12. Learning Board

Use the Board reference as the closest source.

```text
List | Board | Timeline
```

Board:

```text
Not Started | Learning | Practicing | Mastered
```

Cards should show only useful information.

---

# 13. Analytics

Use the Dashboard reference.

Suggested sections:

```text
Study Time
Topics Completed
Practice Completion
Review Accuracy
Mastery Distribution
Learning Streak
Activity Trend
```

Avoid vanity metrics.

---

# 14. StudyForge Domain Translation Table

| Reference concept | StudyForge concept |
|---|---|
| Task | Topic / Study task |
| Project | Learning Path |
| Board | Learning Board |
| Timeline | Study Timeline |
| Schedule | Study Plan |
| Calendar | Study Calendar |
| Analytics | Learning Analytics |
| Sales chart | Learning Activity |
| Transactions donut | Mastery Overview |
| Order table | Recent Learning Activity |
| Products | Learning Paths |
| Team avatars | Remove unless collaboration exists |
| Upgrade ad | Remove for MVP |
| Invoice | Notes / not applicable |
| Messages | Remove unless real messaging exists |

---

# 15. Final Mapping Rule

When a reference component has no meaningful StudyForge equivalent:

**remove it instead of inventing a fake feature.**
