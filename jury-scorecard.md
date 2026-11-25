# Manipur Economy: jury score

Estimate, not affiliated with Awwwards. Self-score, from 1 pages on 2026-11-25.

**The idea, as the critic read it:** An interactive data-journalism chapter on the economic cost of the 2023–2026 Manipur ethnic conflict, presented as a numbered economic-survey document with verified figures and sourced data.

**Critic overall: 6.7** (0.4 Design + 0.3 Usability + 0.2 Creativity + 0.1 Content)

**Jury estimate: about 7.8** (critic + 1.1, measured on two recent Sites of the Day; gap on weaker sites not measured)

**Band: Site of the Day range (7.2 and up)** — above the recent winner average of 7.2–7.6, but the calibration gap holds primarily for award-winning sites.

| Criterion | Score | Evidence |
|---|---|---|
| **Design (40%)** | **7** | Clear typographic system (Spectral display/body, Archivo labels), intentional palette (crimson #A31621 for losses, green #1A5C30 for gains, amber #7A4F00 for warnings), good hierarchy (chap-title structure, 11 numbered sections), distinctive document/chapter format that refuses the category default of bento cards and metric heroes. No evidence: "d-01-hero: static frame works as a poster; type used as image with optically aligned grid." |
| **Usability (30%)** | **6** | Mobile LCP 1936 ms (under 2.5 s threshold), CLS 0.003 (under 0.05), FPS 60, skip link present, no visible focus issues, no hidden text under reduced motion. But 8 mobile tap targets below 24 px (7×14 and 8×16), 2 interactive links with noHoverChange (hover produces no style change), 1 primary link with colorOnly hover. No evidence earns every point above 6: the small targets keep mobile from fully "working" per the rubric. |
| **Creativity (20%)** | **7** | One idea specific to the subject: the economic-survey chapter format applied to the Manipur conflict analysis. Carried through the entire 11-chapter structure with the "who loses, who gains" framing specific to this conflict data. Not a new interaction idea, but the conceptual framing is original to this subject. |
| **Content (10%)** | **7** | Specific copy with real figures and sources (346 deaths + 11 fn links, 28,899 displaced + sources, ₹1,200+ crore GST + source, 523 shutdown days + source), honest imagery (data visualizations, maps, charts based on sourced data), clear 11-chapter story structure. Minor warnings: 2× repeated sentences, 17 em/en dashes flagged as AI-tell. |

## Developer areas (each 1–10, not weighted into overall)

| Area | Score | Evidence |
|---|---|---|
| Semantics/SEO | **7** | Single h1, heading hierarchy OK, canonical link, OG/Twitter tags, sitemap, manifest, llms.txt, 404 present. WARNs: meta description 258 chars (aim 50–160), 17 em/en dashes, 2× sentence repetition. |
| Animations/Transitions | **6** | Minimal motion: JS-gated scroll reveals after 3 s timeout; reduced motion yields settled screen (moving: false). No continuous page transitions; desktop.idleMotion: false is not a fault for a static concept. |
| Accessibility | **7** | 0 serious/critical axe violations on home page, skipLinkFirst: true, noVisibleFocus: 0, invisibleFocus: 0, hiddenText: 0, movingReduced: false. 404 has 1 serious color-contrast violation (btn: #0f2422 on #0a7d70, 3.22:1 needs 4.5:1) and 5 contrastNeedsReview. |
| WPO | **7** | Mobile LCP 1936 ms (under 2.5 s), CLS 0.003 (under 0.05), no loader (null), page under 3 MB (~299 KB gzipped: html 47 + JS 2 + CSS 10 + fonts 240 + images 0). No evidence earns 8: the "loader or intro within 2.6 s" criterion is borderline (intro after 3 s). |
| Responsive | **6** | Layout composes from 1440 to 390 px with no overflowX, but 8 tap targets below 24 px prevent a higher score. |
| Markup/Meta-data | **7** | JSON-LD Person/WebPage/Event/Article/Dataset complete; OG image loads; favicon; viewport; speakable present; single h1; canonical; sitemap. |

## Fixes, most score first

1. **[Usability]** Increase mobile tap target sizes to at least 24×24 px for all primary interactive elements (currently 8 targets at 7×14 or 8×16 px on mobile). This alone would raise Usability from 6 to 7, making the weighted overall 7.0.

2. **[Design]** Add meaningful hover treatments to the 2 interactive links currently in `noHoverChange` (the "Zoom in" link and the "01 Conflict phases" nav link). Their hover currently produces no style change; a full fill or inversion treatment would earn Design points toward 8.

3. **[Content]** Remove the duplicated sentences: "Foreign arrivals fell from 12,102 to 1,325." appears twice; "Scroll sideways to read the full table" appears twice. Deduplication would strengthen Content integrity.

4. **[404 / Accessibility]** Fix the serious color-contrast violation on the 404 page button (#0f2422 on #0a7d70, 3.22:1; needs 4.5:1). Increase contrast or adjust background/foreground colors.

5. **[Design / Developer]** Address the color-only hover on the "Zoom out" primary link (h-02). Its hover changes only color (`color`, `borderColor`, `textDecorationColor`), not a full treatment; a more substantial visual change would reduce the `colorOnly` finding.

---

*Self-score: the critic scored from evidence alone (screenshots + audit reports), without knowledge of the site's intent. The jury estimate of ~7.8 assumes the typical +1.1 gap between critic and real juries; on weaker sites the gap may differ.*