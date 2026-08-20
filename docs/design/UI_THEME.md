# StudyForge UI Theme

## 1. Theme Name

**StudyForge Light Productivity Theme**

The reference UI is a clean, light SaaS/productivity dashboard. StudyForge should preserve that visual character while expressing a technical learning product.

---

## 2. Visual Direction

The interface should communicate:

- focus;
- structure;
- progress;
- clarity;
- calm;
- technical professionalism.

The UI should avoid:

- heavy gradients;
- glassmorphism;
- large drop shadows;
- excessive borders;
- neon colors;
- overly dense dashboards;
- decorative animation;
- oversized typography;
- dark sidebar themes unless a future dark mode is intentionally designed.

---

## 3. Primary Palette

Use a consistent indigo/purple as the core product color.

Recommended values:

```css
--color-primary-50:  #f5f4ff;
--color-primary-100: #efefff;
--color-primary-200: #dedcff;
--color-primary-300: #c4c0ff;
--color-primary-400: #918aff;
--color-primary-500: #5f5cff;
--color-primary-600: #514df0;
--color-primary-700: #4440d8;
--color-primary-800: #3936ad;
--color-primary-900: #302f88;
```

Main application primary:

```css
--color-primary: #5f5cff;
```

Use primary color for:

- primary buttons;
- active navigation;
- active tabs;
- selected calendar state;
- key progress;
- focused input highlights;
- important learning actions.

Do not use primary purple as large background blocks throughout the product.

---

## 4. Neutral Palette

Recommended light theme:

```css
--color-bg: #f8f9fc;
--color-bg-subtle: #fbfbfd;

--color-surface: #ffffff;
--color-surface-soft: #fafbfe;

--color-border: #ececf4;
--color-border-strong: #ddddec;

--color-text-primary: #15162f;
--color-text-secondary: #62657f;
--color-text-muted: #999caf;
--color-text-disabled: #b9bbc8;
```

The primary background should feel almost white.

Use white cards over the subtle page background.

---

## 5. Semantic Colors

StudyForge uses semantic colors for learning state.

```css
--color-info: #28c0df;
--color-success: #35a35a;
--color-warning: #ffd668;
--color-orange: #ff9068;
--color-danger: #ff6878;
```

Recommended learning meaning:

| Color | Meaning |
|---|---|
| Gray | Not started |
| Purple | Selected / primary action |
| Blue/Cyan | Learning / in progress |
| Yellow | Review due / attention |
| Orange | Medium concern / intermediate priority |
| Red | Needs work / weak / failed |
| Green | Mastered / completed |

Status text must accompany color.

---

## 6. Typography

Preferred font:

**Inter**

Fallback stack:

```css
font-family:
  Inter,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

Recommended weights:

```text
400 — body
500 — labels and navigation
600 — buttons and card headings
700 — page headings and key metrics
```

Recommended scale:

```css
--font-size-xs: 12px;
--font-size-sm: 13px;
--font-size-base: 15px;
--font-size-md: 16px;
--font-size-lg: 18px;
--font-size-xl: 22px;
--font-size-2xl: 28px;
--font-size-3xl: 32px;
```

Do not use extreme heading sizes in application screens.

---

## 7. Spacing

Use a consistent 4px/8px-based spacing system.

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

Typical usage:

```text
Button horizontal padding     16–20px
Card padding                  20–24px
Page padding                  24–32px
Dashboard grid gap            20–24px
Section separation            32px
Form field gap                16px
```

---

## 8. Radius

Recommended:

```css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 14px;
--radius-xl: 18px;
--radius-pill: 999px;
```

Typical use:

```text
Input             8–10px
Button            8–10px
Card              12–14px
Modal             14–18px
Status badge      pill
```

Avoid excessive 24–32px rounding across standard cards.

---

## 9. Shadows

The design should rely primarily on:

- white surfaces;
- subtle borders;
- spacing;
- hierarchy.

Default card:

```css
border: 1px solid #ececf4;
box-shadow: none;
```

Elevated overlay:

```css
box-shadow: 0 8px 30px rgba(20, 20, 60, 0.08);
```

Optional light card elevation:

```css
box-shadow: 0 2px 12px rgba(20, 20, 60, 0.04);
```

Do not add heavy shadows to every card.

---

## 10. Buttons

### Primary

```text
Background: primary purple
Text: white
Radius: medium
Height: ~42–46px
Weight: 600
```

### Secondary

```text
Background: white or primary-soft
Border: subtle
Text: primary/navy
```

### Ghost

For toolbar actions and low-emphasis navigation.

### Destructive

Use only for destructive actions such as deleting learning paths or notes.

---

## 11. Inputs

Inputs should use:

- light neutral fill or white surface;
- subtle border;
- medium radius;
- clear focus state;
- comfortable vertical padding.

Recommended focus:

```css
border-color: #5f5cff;
box-shadow: 0 0 0 3px rgba(95, 92, 255, 0.10);
```

Never rely only on placeholder text as the label.

---

## 12. Navigation

Desktop sidebar:

```css
width: 240px;
background: #ffffff;
border-right: 1px solid #f0f0f5;
```

Active navigation state:

```css
background: #f1f0ff;
color: #5f5cff;
```

Suggested StudyForge navigation:

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

Keep primary navigation stable.

Do not add navigation items simply because they exist in reference images.

---

## 13. Cards

Cards should be:

- white;
- lightly bordered;
- clean;
- spacious;
- consistent in radius;
- simple in hierarchy.

Avoid nested cards unless visually necessary.

A card should generally contain:

```text
Heading
Optional supporting text
Core content
Optional action/status
```

---

## 14. Progress

StudyForge relies heavily on progress and mastery.

Use:

- horizontal progress bars for course/path completion;
- circular progress only for important summary metrics;
- simple counts for completed topics/labs;
- mastery labels with numeric/semantic meaning.

Example:

```text
Linux for DevOps
68% complete
██████████████░░░░░░
```

---

## 15. Motion

Use restrained transitions:

```text
150–200ms
ease-out
```

Suitable for:

- hover;
- sidebar state;
- dropdowns;
- tabs;
- modals;
- progress updates.

Avoid decorative animation during study.

---

## 16. Authentication Theme

Login and registration screens should follow a split layout on desktop:

```text
Form panel | Illustration panel
```

On mobile:

```text
Form
Illustration hidden or moved below
```

StudyForge copy should be learning-oriented.

Example:

```text
Welcome back
Continue your learning journey.
```

and:

```text
Create your StudyForge account
Build a smarter system for learning technical skills.
```

Use StudyForge-specific illustrations instead of copying the exact artwork from the reference.

---

## 17. StudyForge Personality

The product should feel more like:

- Linear;
- modern LMS;
- developer productivity tool;
- focused personal knowledge workspace;

and less like:

- social network;
- enterprise ERP;
- e-commerce dashboard;
- generic admin template.

---

## 18. Final Theme Rule

If a visual choice is not specified, prefer:

**simple > decorative**

**consistent > unique**

**readable > compact**

**calm > flashy**

**StudyForge domain > reference content**
