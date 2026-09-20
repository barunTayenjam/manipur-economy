---
name: The Price of Conflict — Survey Chapter
description: Economic-survey grammar for a verified data-journalism record of the Manipur conflict
colors:
  paper: "#FAFAF8"
  paper-offset: "#F2F2EF"
  ink: "#1E232A"
  ink-2: "#3C4248"
  ink-3: "#57616B"
  ink-4: "#616B76"
  crimson: "#A31621"
  green: "#1A5C30"
  amber: "#7A4F00"
  rule: "rgba(30,35,42,0.14)"
typography:
  display:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "clamp(2rem, 5vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "clamp(1.3rem, 3.2vw, 1.85rem)"
    fontWeight: 700
    lineHeight: 1.22
  body:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.72
    fontFeature: "onum, kern"
  label:
    fontFamily: "Archivo, Helvetica Neue, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.22em"
  data:
    fontFamily: "Spline Sans Mono, Courier New, monospace"
    fontSize: "1.05rem"
    fontWeight: 600
    fontFeature: "tnum"
rounded:
  none: "0px"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "2.5rem"
components:
  statement-table:
    borderColor: "{colors.rule}"
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
  exhibit:
    borderColor: "{colors.rule}"
    backgroundColor: "{colors.paper}"
  badge-loss:
    backgroundColor: "#FDF2F3"
    textColor: "{colors.crimson}"
  badge-gain:
    backgroundColor: "#F0F7F2"
    textColor: "{colors.green}"
  badge-warn:
    backgroundColor: "#FDF7EC"
    textColor: "{colors.amber}"
---

# Design System: The Price of Conflict — Survey Chapter

## Overview

**Creative North Star: "The Economic Survey chapter that happened to be interactive."**

The page reads as a numbered chapter of an official Indian economic survey volume: cool-white paper, near-black ink, hairline rules, booktabs statement tables, figure references in tabular monospace. Every verified number is presented as document evidence — a statement table row, a boxed exhibit, a footnote marker — never as a dashboard widget. Comprehension and citation outrank expression; the document's own gravity is the design.

The world it replaced (and refuses): cream/gold glass bento cards, pill badges, icon tiles, count-up metric heroes, gradient rules. Those were the category default this grammar exists to avoid.

**Key Characteristics:**
- Booktabs tables (2px top rule, 1px mid rules, 2px bottom rule) carry all key figures
- Chapter numbers fold into headings as mono-crimson prefixes ("1 · Three Phases…") — no kickers, no eyebrows
- Hairline 1px rules only; no shadows; no border radius (document, not app)
- Spline Sans Mono for every figure, date, source line, and footnote marker
- Semantic color is data: crimson = loss/pull-fact, green = gain, amber = warning/estimate; never decoration

## Colors

Cool neutrals with one crimson accent; green and amber appear only as data semantics.

### Primary
- **Crimson** (#A31621): losses, critical badges, links to sources, chapter numbers, scroll progress, NH-2 route. The one accent; rarity is the point.

### Secondary
- **Survey Green** (#1A5C30): gains only — gainer badges and green figures in the war-economy ledger.
- **Amber** (#7A4F00): structural estimates, warning badges, border-post markers.

### Neutral
- **Paper** (#FAFAF8): page ground.
- **Paper Offset** (#F2F2EF): table headers, exhibit caption strips, map ground.
- **Ink** (#1E232A): headings, body emphasis, statement values, NH-37 route.
- **Ink 2/3/4** (#3C4248 / #57616B / #616B76): body soft / labels / metadata. All AA on paper and tinted surfaces.
- **Rule** (rgba(30,35,42,0.14)): every hairline.

### Named Rules
**The Data-Means-Color Rule.** Crimson, green, and amber mark outcomes (loss/gain/estimate). They never appear as decoration, focus states, or chrome.

## Typography

**Display Font:** Spectral 700 (Georgia fallback)
**Body Font:** Spectral 400 (Georgia fallback)
**Label Font:** Archivo 500–700 (condensed grotesque, tracked small caps)
**Data Font:** Spline Sans Mono 400/600, tabular numerals

**Character:** A document serif with genuine book credentials, paired with a workhorse grotesque for the bureaucratic apparatus (labels, tables, badges) and a mono for the machinery of citation (figures, dates, source lines).

### Hierarchy
- **Display** (Spectral 700, clamp(2rem–3rem)): chapter titles only.
- **Headline** (Spectral 700, clamp(1.3–1.85rem)): section h2 with mono-crimson number prefix.
- **Title** (Spectral 600, 1rem): card/entry headings.
- **Body** (Spectral 400, 17px, 1.72): prose; card descriptions sit at 0.875rem Archivo.
- **Label** (Archivo 700, 12px, 0.22em tracked caps): exhibit captions, table headers, badge text.
- **Data** (Mono 600, tnum): every numeric value, date, and footnote marker.

### Named Rules
**The Mono-Means-Measurement Rule.** Spline Sans Mono appears wherever a reader might copy a number or date — figures, dates, source lines, refs. Never for prose.

## Layout

Two-column grid ≥900px: sticky 220px contents rail + single content column (max 1200px). Below 900px the contents become a horizontal wrapped strip. One document column; no bento grids. Sections separate by top hairline; exhibits and statement tables span the column full-width; prose measures ~64ch.

## Elevation & Depth

Flat. Zero shadows, zero radius. Depth is expressed by rule weight only: 2px ink rules open and close statements; 1px neutral rules divide everything else. The map plate is the sole bordered object (1px rule) and gets a single modest popup shadow for platform necessity.

## Shapes

Rectangular. Radius 0 everywhere. Borders are 1px hairlines or 2px booktabs rules. Badges are 1px-outlined rectangles with a 5px dot, not pills.

## Components

### Statement Table (signature)
- **Shape:** booktabs — 2px top rule, 1px header divider, 1px row rules.
- **Header:** Archivo 700 12px tracked caps on paper-offset.
- **Values:** mono 600 tnum; crimson/green/amber by data semantics.
- **Refs:** superscript mono crimson markers with title-attribute source names.

### Exhibit
- 1px rule box; caption strip (paper-offset, Archivo caps); body padding 1rem; footer hairline for sources.

### Badge
- 1px outlined rect, dot + tracked caps, tinted ground; loss/gain/warn variants only.

### Ledger Table
- Full-bleed booktabs table, right-aligned mono scale column, hover paper-offset.

### Timeline
- Horizontal scroller of hairline-divided entries; mono dates, crimson icon strokes, dot pinned to the top rule.

### FAQ
- Numbered `<details>` rows separated by hairlines; `+`/`−` marker; open state tints paper-offset.

## Do's and Don'ts

### Do:
- **Do** present every key figure inside a booktabs statement table or exhibit with a source line.
- **Do** keep all type rectangular and rule-driven; flatness is the material.
- **Do** use crimson for loss data, links, and chapter numbers — nothing else.

### Don't:
- **Don't** add card shadows, border radius, or glass/blur — the incumbent grammar they replaced died for a reason.
- **Don't** introduce kickers/eyebrows above headings; fold identifiers into the heading.
- **Don't** use green, amber, or crimson decoratively; they are data semantics only.
- **Don't** animate layout properties; the page loads like a document.
