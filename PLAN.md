Color Thief v3 Site Review — Deep Dive

  Overall Verdict

  This is a strong v3 launch page. The feature set is genuinely impressive — v3 doesn't just match
  node-vibrant (previously the feature leader), it surpasses it with OKLCH quantization, observe(),
   progressive extraction, and AbortSignal support. The site communicates this well through a
  code-first, example-heavy format. But there are meaningful opportunities to make it more
  compelling, clearer, and higher-wow-factor.

  ---
  What's Working Well

  1. The "show, don't tell" structure. Ten numbered examples with real code + live output is the
  right approach. You're not just describing features — visitors see them working immediately. This
   is better than node-vibrant's docs site (which has a good interactive demo but thin guides), and
   better than every other competitor.

  2. The feature coverage is a competitive knockout. No other library in this space offers all of:
  semantic swatches, OKLCH quantization, progressive extraction, video observation, Web Workers,
  rich Color objects, and AbortSignal support. The site makes this range visible.

  3. The video observe demo is the strongest moment. The ambient glow effect with live palette
  updates is genuinely eye-catching. This is the kind of thing that makes someone think "I want to
  build with this."

  4. Drag-and-drop at the top is the right call. Letting people test their own images before
  scrolling through docs follows the best practice of "experience before install."

  5. The Color Object section (03) is smart. Showing the full property table makes the DX upgrade
  from v2's raw [r,g,b] arrays immediately tangible. This directly addresses the #1 ergonomic
  complaint about v2.

  ---
  What Could Be Stronger

  Structure & Flow

  6. The hero/header undersells the moment. The tagline "Extract colors from images and video" is
  accurate but flat. Compare to how the competitors position: fast-average-color leans into "Fast",
   extract-colors emphasizes "Performant, TypeScript, Fine-grained control." The v3 launch is a
  major event for a 15-year-old library with 13.5k stars and 7M yearly npm downloads. The header
  doesn't convey that gravity.

  Consider a brief credibility signal — something like the npm download count or the star count
  positioned more prominently. GSAP opens with "Used on 11 million sites." You have real numbers to
   flex.

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

  10. Getting Started is buried at the bottom. For someone who's sold and wants to start using the
  library, they have to scroll past all 10 examples. A sticky "Install" button or a more prominent
  CTA near the top would reduce friction.

  Individual Examples

  11. Example 01 (Dominant color) — the grid of images is a good start, but the images aren't shown
   yet. The imageUrls are loaded via import.meta.glob('../images/*.jpg') — I can't see what they
  look like, but the diversity of the source images matters a lot. Choose images that show range: a
   portrait, a landscape, a product shot, something with muted tones, something vibrant. The
  dominant color extraction is only as visually impressive as the source material.

  12. Example 03 (Color Object) uses the same image as 01 and 02. imageUrls[0] is reused for
  dominant, palette, and color object. Using different images for each example would feel more
  varied and show that the library handles diverse inputs.

  13. Example 05 (OKLCH vs RGB) — this is a differentiator that needs more visual explanation. The
  side-by-side comparison is there, but there's no annotation about what to look for. The
  description says "colors that 'feel' evenly spaced to the human eye" — but with just two rows of
  swatches, a casual visitor might not see the difference. Consider choosing an image where the
  difference is dramatic, or adding a brief label like "Notice the RGB palette has two very similar
   greens, while OKLCH spreads the range."

  14. Example 06 (Quality) could show timing more prominently. The speed difference between
  quality: 1 and quality: 50 is a real practical concern. The timing values are there but styled as
   secondary text. Making the ms timing the visual focus (maybe a small bar chart or bold number)
  would make the tradeoff more tangible.

  15. Example 09 (Progressive) would be more impressive if animated. Right now, all three passes
  render at once after the async iterator completes. If the passes appeared sequentially with a
  visible delay (even artificial), it would demonstrate the "show rough results first, then refine"
   pattern more effectively.

  16. Example 10 (Abort) is niche and low-impact as a visual demo. It shows a red error box.
  Developers who need AbortSignal will find it in the README — it doesn't need premium real estate
  as example #10 on the site. Consider dropping it from the visual demos and just mentioning it in
  the Getting Started or API section.

  Visual Design

  17. The section numbers (01–10) are hidden. .section-num { display: none; } — but they're in the
  HTML. If they were shown, they'd add structure and a sense of progression. Library docs like GSAP
   use numbered steps to good effect.

  18. The swatch hex labels only show on hover. This is a nice touch for cleanliness, but it means
  screenshots of the page (which drive social sharing) don't show the hex values. Consider always
  showing hex for at least the dominant color and the first palette example.

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

  21. No bundle size callout. extract-colors leads with "< 6kB." fast-average-color emphasizes
  minimalism. If Color Thief v3's bundle is competitive, highlighting it would address a common
  concern for frontend developers.

  22. No framework integration examples. Motion.dev shows React, Vue, and vanilla JS examples. A
  brief React or Vue snippet showing observe() with a component would resonate with the majority of
   frontend developers who work in those frameworks.

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