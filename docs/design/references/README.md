# StudyForge UI Reference Images

## Purpose

Place the supplied UI reference screenshots in this directory.

These images are for **design guidance only**.

Do not import them into the production React bundle.

---

## Recommended Filenames

Rename the six supplied images to:

```text
dashboard.png
board.png
timeline.png
calendar.png
login.png
signup.png
```

Final structure:

```text
docs/design/references/
├── README.md
├── dashboard.png
├── board.png
├── timeline.png
├── calendar.png
├── login.png
└── signup.png
```

---

## Reference Meaning

### `dashboard.png`

Use for:

- authenticated app layout;
- metric cards;
- analytics cards;
- grid spacing;
- sidebar styling;
- light background/surface relationships.

Do not copy e-commerce/business data.

---

### `board.png`

Use for:

- learning board;
- column spacing;
- board cards;
- status pills;
- list/board/timeline segmented controls.

Translate task states into StudyForge learning states.

---

### `timeline.png`

Use for:

- study timeline;
- date strip;
- time grid;
- planned study events;
- compact event cards.

---

### `calendar.png`

Use for:

- study calendar;
- mini calendar;
- day/week/month controls;
- event styling;
- time grid.

Do not copy the people/team section unless collaboration becomes an actual feature.

---

### `login.png`

Use for:

- login composition;
- form spacing;
- split-screen authentication layout;
- visual balance;
- primary button treatment.

Create/use original StudyForge illustration assets instead of copying the exact reference illustration.

---

### `signup.png`

Use for:

- registration composition;
- matching auth visual system;
- field spacing;
- responsive split layout.

---

## Agent Rule

An agent should inspect only the images relevant to the current screen.

Example:

```text
Dashboard redesign
→ inspect dashboard.png

Learning board
→ inspect board.png

Calendar
→ inspect calendar.png

Login
→ inspect login.png
```

Do not repeatedly reinterpret all six screenshots for every small component.

The written rules in:

```text
docs/design/UI_THEME.md
docs/design/DESIGN_SYSTEM.md
docs/design/SCREEN_MAPPING.md
```

remain authoritative for consistency.
