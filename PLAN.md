
  Structure & Flow


  7. "Try it yourself" before "Examples" creates an ordering problem. The drag-and-drop zone is the
   first thing after the header, but at that point the visitor hasn't seen what Color Thief does
  yet. They don't know what to expect from dropping an image. On first visit, the Examples section
  is actually more compelling as a starting point because it shows the library's capabilities with
  curated, pre-rendered results.

  Consider: lead with one or two visually striking examples (dominant color grid, the palette, or
  even the video demo), then offer the interactive "Try it yourself." This follows the pattern of
  progressive disclosure — show the best output, then let them play.

  8. The mobile experience hides the best feature. On mobile, the drag-and-drop zone becomes sample
   thumbnails with "Tap an example image to see Color Thief in action." But the drag-and-drop
  section itself is display: none by default and only shown via JS. The drag-drop-desc-desktop /
  drag-drop-desc-mobile swap is handled, but the whole section being hidden until JS runs means
  there's a flash of absent content.

  9. No clear API reference section in v3. v2 has a dedicated "API" section with a proper options
  table and method signatures. v3 relies on the examples to teach the API implicitly. This works
  for browsing, but when someone is building and needs to look up getPaletteSync options, there's
  no quick-reference. The Getting Started section jumps straight to install/import patterns. The
  GitHub README does have API tables — but the site doesn't.


  Individual Examples


  Visual Design

  19. Code blocks don't use Prism syntax highlighting. The v3 code blocks use <div
  class="code-block"><code class="language-javascript"> but Prism expects <pre><code
  class="language-*">. The v2 code blocks use <pre><code class="prism language-javascript"> with
  the prism class. The v3 blocks likely render as unstyled code. This is a significant visual
  regression from v2.

  Competitive Gaps

  20. No "Why Color Thief?" or feature comparison. node-vibrant has a proper docs site now. A
  first-time visitor comparing the two has no quick way to understand why Color Thief v3 is the
  better choice. Even a brief feature comparison table or a few bullet points (zero browser deps,
  OKLCH quantization, video support, progressive extraction) positioned near the top would help.


  ---
  How Color Thief v3 Stacks Up Against Competitors

  ┌───────────────────┬──────────────┬───────────────────┬────────────────────┬────────────────┐
  │                   │ Color Thief  │  node-vibrant v4  │ fast-average-color │ extract-colors │
  │                   │      v3      │                   │                    │                │
  ├───────────────────┼──────────────┼───────────────────┼────────────────────┼────────────────┤
  │ Dominant color    │ Yes          │ Yes               │ Yes                │ Yes            │
  ├───────────────────┼──────────────┼───────────────────┼────────────────────┼────────────────┤
  │ Palette           │ Yes          │ Yes               │ No                 │ Yes            │
  ├───────────────────┼──────────────┼───────────────────┼────────────────────┼────────────────┤
  │ Semantic swatches │ Yes          │ Yes (core         │ No                 │ No             │
  │                   │              │ feature)          │                    │                │
  ├───────────────────┼──────────────┼───────────────────┼────────────────────┼────────────────┤
  │ OKLCH             │ Yes (unique) │ No                │ No                 │ No             │
  │ quantization      │              │                   │                    │                │
  ├───────────────────┼──────────────┼───────────────────┼────────────────────┼────────────────┤
  │ Video observation │ Yes (unique) │ No                │ Yes (via canvas)   │ No             │
  ├───────────────────┼──────────────┼───────────────────┼────────────────────┼────────────────┤
  │ Progressive       │ Yes (unique) │ No                │ No                 │ No             │
  │ extraction        │              │                   │                    │                │
  ├───────────────────┼──────────────┼───────────────────┼────────────────────┼────────────────┤
  │ Web Workers       │ Yes          │ Yes               │ No                 │ Yes            │
  ├───────────────────┼──────────────┼───────────────────┼────────────────────┼────────────────┤
  │ AbortSignal       │ Yes (unique) │ No                │ No                 │ No             │
  ├───────────────────┼──────────────┼───────────────────┼────────────────────┼────────────────┤
  │ Rich Color        │ Yes          │ Yes               │ Partial            │ Partial        │
  │ objects           │              │                   │                    │                │
  ├───────────────────┼──────────────┼───────────────────┼────────────────────┼────────────────┤
  │ WCAG contrast     │ Yes          │ Partial (text     │ No                 │ No             │
  │                   │              │ colors)           │                    │                │
  ├───────────────────┼──────────────┼───────────────────┼────────────────────┼────────────────┤
  │ TypeScript        │ Yes          │ Yes               │ Yes                │ Yes            │
  ├───────────────────┼──────────────┼───────────────────┼────────────────────┼────────────────┤
  │ Zero browser deps │ Yes          │ No (complex dep   │ Yes                │ Yes            │
  │                   │              │ tree)             │                    │                │
  ├───────────────────┼──────────────┼───────────────────┼────────────────────┼────────────────┤
  │ Node.js support   │ Yes (via     │ Yes (via sharp)   │ Limited            │ Yes            │
  │                   │ sharp)       │                   │                    │                │
  ├───────────────────┼──────────────┼───────────────────┼────────────────────┼────────────────┤
  │ Bundle size       │ ?            │ Large             │ Small              │ ~2kB           │
  ├───────────────────┼──────────────┼───────────────────┼────────────────────┼────────────────┤
  │ npm weekly        │ ~370k        │ ~87k              │ ~89k               │ ~22k           │
  │ downloads         │              │                   │                    │                │
  ├───────────────────┼──────────────┼───────────────────┼────────────────────┼────────────────┤
  │ GitHub stars      │ 13.5k        │ 2.4k              │ 1.5k               │ 285            │
  └───────────────────┴──────────────┴───────────────────┴────────────────────┴────────────────┘

  Bottom line: Color Thief v3 is objectively the most feature-complete library in this space. The
  site needs to make that dominance unmistakable at a glance.

  ---
  Top Recommendations (Priority Order)

  1. Add Prism highlighting to v3 code blocks — this is likely a bug, not a design choice. The v3
  blocks use a different markup pattern than v2 and probably aren't getting syntax colored.
  2. Reorder: move one or two visually striking examples above "Try it yourself" — let the library
  make a first impression before asking the visitor to interact.
  3. Add a compact feature/differentiator list near the top — 4-6 key points that say "this is why
  v3 exists." Something a developer skimming can absorb in 5 seconds.
  4. Add an API quick-reference section — port the README's API tables into the site. This is table
   stakes for a library docs page.
  5. Show section numbers — remove display: none from .section-num. They add visual rhythm.
  6. Use different images across examples — variety demonstrates versatility.
  7. Annotate the OKLCH vs RGB comparison — help visitors see what makes OKLCH better.
  8. Consider dropping or deprioritizing Abort (example 10) — it's the weakest visual demo. Move it
   to a note in Getting Started.
  9. Add a bundle size badge — if the number is good, show it.
  10. Animate progressive extraction — make passes appear sequentially for visual impact.

  ---
  Let me know which of these you'd like to act on, or if you want me to dig deeper into any
  specific area.