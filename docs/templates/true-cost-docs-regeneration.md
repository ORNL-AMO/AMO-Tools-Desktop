# Prompt: Regenerate True Cost Documentation

Use this prompt to regenerate the `src/process-flow-lib/docs/true-cost/` documentation suite, including the `developer/` subfolder. Paste the prompt below into a new conversation. Replace `[TODAY]` with today's date before pasting.

---

## Prompt to Paste

```
I need to regenerate the True Cost Attribution documentation suite at
`src/process-flow-lib/docs/true-cost/`. Read the source files listed below
before writing anything. Then regenerate each document described in this prompt,
keeping all existing filenames.

---

### Files to Read

**Primary implementation:**
- `src/process-flow-lib/water/logic/results.ts` — full file; this is the authoritative source for all algorithm behavior
- `src/process-flow-lib/graph.ts` — graph index construction and DFS traversal utilities
- `src/process-flow-lib/types/results.ts` — result type definitions

**Test suite:**
- `process-flow-diagram-component/src/__tests__/plant-summary.test.ts`

**UI (for adjusted attribution only):**
- `src/app/water/water-report/true-cost-editable-table/true-cost-editable-table.component.ts`

Read the existing docs before overwriting them — they contain test case tables,
known-bug descriptions, and snapshot notes that must be preserved or updated accurately.

---

### Document Index

All files live under `src/process-flow-lib/docs/true-cost/` unless noted.

#### Top-level docs
1. `true-cost-complete-reference.md` — begins with `**Date Generated:** [TODAY]`
2. `true-cost-algorithm-quick-reference.md` — begins with `**Date Generated:** [TODAY]`
3. `true-cost-algorithm-stages.md` — begins with `**Date Generated:** [TODAY]`
4. `supported-diagram-configurations.md` — begins with `**Date Generated:** [TODAY]`

#### Cost component attribution docs (live in `cost-component-attribution/` subfolder, no "Date Generated" header)
5. `cost-component-attribution/cost-attribution-rules.md`
6. `cost-component-attribution/apply-system-intake-costs.md`
7. `cost-component-attribution/apply-system-discharge-costs.md`
8. `cost-component-attribution/apply-system-treatment-costs.md`
9. `cost-component-attribution/apply-system-waste-water-treatment-costs.md`

#### Developer docs (begin each file with `**Date Generated:** [TODAY]`)
10. `developer/general-implementation-notes.md`
11. `developer/waste-treatment-implementation-notes.md`
12. `developer/plant-summary-test-cases.md`

---

### Content Requirements — Top-Level Docs

#### `true-cost-complete-reference.md`
Begin with `**Date Generated:** [TODAY]`.
The unified team reference covering the complete algorithm end-to-end. Sections to include:
The Big Picture (what the algorithm produces and why), Glossary (all domain terms), Inputs
Required (diagram structure, flow values, unit costs, energy inputs, adjusted attribution
overrides), all five stages in order (Stage 1: build graph index, Stage 2: identify
single-system RO configurations, Stage 3: compute block costs and flow paths, Stage 4:
attribute costs to systems via all four sub-routines, Stage 5: finalize per-system results),
Outputs (per-system and plant summary result structure), Full Calculation Sequence summary
table, and a Companion Documents section pointing to the other files in this suite.
This document is comprehensive — it does not defer detail to companion docs except for the
attribution sub-routine internals.

#### `true-cost-algorithm-quick-reference.md`
Begin with `**Date Generated:** [TODAY]`.
Cover: glossary, the three-step structure (preprocessing + Steps 1–3), data flow from raw
inputs through `trueCostOfSystems` to final plant-level results. Include the ordering
invariant (why steps cannot be resequenced). No implementation gotchas — those belong in
the developer docs.

#### `cost-component-attribution/cost-attribution-rules.md`
A reference table document. For each cost component type (intake, discharge, water
treatment, waste water treatment), document: which systems are eligible, walk direction,
denominator, attribution fraction formula, block cost formula, and adjusted attribution
behavior. Keep it prescriptive and free of implementation caveats.

#### `true-cost-algorithm-stages.md`
A numbered, prose-annotated walk through the algorithm in execution order. Each major
decision or branch should have a brief "why" explanation. ASCII-art flow diagram at the
end is acceptable but not required.

#### `cost-component-attribution/apply-system-intake-costs.md`
Covers `applySystemIntakeCosts`. Document: the two-denominator switch (intake-flow-volume
vs. delivered-flow-volume), the `hasUpstreamTreatmentLoss` flag purpose, the
`pathsAttributed` de-duplication guard, and the edge-based (not node-based) de-duplication
rationale. Include a worked example with numbers.

#### `cost-component-attribution/apply-system-discharge-costs.md`
Covers `applySystemDischargeCosts`. Document: upstream walk stopping rule, how the RO
override applies, the motor energy accumulation that Step 3 later overwrites. Include a
worked example.

#### `cost-component-attribution/apply-system-treatment-costs.md`
Covers `applySystemTreatmentCosts`. Document: the loss-adjusted vs. no-loss formula
branches, the RO 100% override (why it fires even when math already gives 1.0), chained
treatment passthrough behavior. Include a worked example.

#### `cost-component-attribution/apply-system-waste-water-treatment-costs.md`
Covers `applySystemWasteTreatmentCosts`. Document: the two-pass model (Pass 1 downstream
reuse, Pass 2 upstream discharge), what the `downstreamTreatmentAttributionMap` carries
and why Pass 1 must complete before Pass 2, the RO reject WWT special case. Include a
worked example for both a pure-discharge config and a reuse-split config.

#### `developer/plant-summary-test-cases.md`
Document every test case in `plant-summary.test.ts` in a human-readable format:
configuration diagram (ASCII), block cost inputs, expected per-system attributions,
and a note for any snapshot-only assertion explaining what it locks in and what the
correct value should be when the underlying bug is fixed. Group cases by theme
(intake, discharge, treatment, WWT, RO, mass-balance invariants, blocked cases).

#### `supported-diagram-configurations.md`
A matrix of diagram configurations and whether they are fully supported, partially
supported (known limitation), or unsupported (will crash or produce garbage). Include
the workaround for each partial case.

---

### Content Requirements — Developer Docs

Developer docs capture the *why* behind implementation decisions, gotchas that aren't
visible from the algorithm docs, and pointers to known broken behavior. They do not
repeat what the algorithm docs already say. Style guide:

- Open each section with the mechanism or decision, then explain why it exists.
- Flag gotchas with a bold label: **Gotcha:**, **Known bug:**, **Side effect:**.
- Code snippets should be short excerpts — just enough to anchor the explanation.
- No audience/purpose preamble. Start directly with the first section heading.

#### `developer/general-implementation-notes.md`
Cover the full `results.ts` and `graph.ts` surface (not WWT-specific). Sections to
include at minimum:
- Step ordering hard dependency chain
- `systemsWithRODirectDischarge` index: what it contains, how it's keyed, why the check
  pattern references the node ID not the type
- Delivered-flow-volume denominator switch for intake costs
- WWT two-pass ordering constraint (all Pass 1s before any Pass 2)
- WWT Pass 2 flat deduction bug
- RO reject WWT double-attribution bug
- Motor energy overwrite in Step 3 (intentional but incomplete)
- `setWaterUsingSystemFlows`: do not trust, do not extend
- Cycle detection missing in graph traversal
- De-duplication: edge-based not node-based, and the diamond test case
- RO override: why it fires even when math gives 1.0

#### `developer/waste-treatment-implementation-notes.md`
Cover `applySystemWasteTreatmentCosts` exclusively. Sections to include at minimum:
- Why two separate `forEach` loops (not one): all Pass 1s must complete before Pass 2
- `visitedSystemIds` pre-population in Pass 2 and what it prevents
- `ROWasteTreatmentOwner` walk: no `break`, no `push` — why, and how this causes
  double-attribution
- Flat deduction bug geometry: concrete numbers showing the error with multiple upstream
  systems
- Block cost uses inflow (`getInflowBlockCosts`), not outflow — fraction math implications
- `fractionPathInflowReceived` cap at 1.0 — what it handles, why not to remove it
- `adjustedAttributions` deferred write — why cost is not set inside the path loop,
  and the deletion-vs-undefined signal for revert
- Chained WWT units pass through silently in Pass 1 — the `water-using-system` check
- `path[0]` always refers to the WWT node's direct edge
- `attributeROCostsToSystem` is a path-level flag, not a node-level flag
- Test coverage reference table (wwt-discharge-only, wwt-reuse, wwt-two-upstream-with-reuse,
  ro-single-system-wwt, wwt-recycled-back-to-same-system)

---

### Style Rules (apply to all documents)

- No audience or purpose preamble in any document.
- Developer docs: begin with `**Date Generated:** [TODAY]` then the `#` title.
- All top-level docs carry a `**Date Generated:**` header — update each to `[TODAY]`.
- Section headings use `##`. Sub-sections use `###`.
- Tables for reference material (rules, test cases, file maps). Prose for explanations.
- Code snippets in fenced blocks with `ts` language tag.
- ASCII diagrams in plain fenced blocks (no language tag).
- Do not add content that is derivable from using the app — document only what is
  non-obvious from the code or algorithm description.
- After writing all documents, scan every file in the folder for cross-references
  (section numbers, file names, test case IDs) and fix any that became stale.
```
