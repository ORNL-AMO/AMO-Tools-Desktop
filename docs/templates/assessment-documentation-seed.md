# Prompt: Create Feature Module Documentation

Use this prompt to generate documentation for a feature module. Paste the prompt below into a new conversation, replacing `[MODULE_PATH]` and `[MODULE_NAME]` with the target module.

---

## Prompt to Paste

```
I need comprehensive documentation for the Angular feature module at `[MODULE_PATH]`.

Please explore the module thoroughly before writing anything:

1. List the full directory tree
2. Read the module file (`*.module.ts`)
3. Read the routing configuration (inline or separate routing file)
4. Read the root/container component
5. Read all service files
6. Read all model/type files
7. Read the routing resolver and any route guards
8. Read the constants files (defaults, validation rules, enums)
9. Read top-level feature component `.ts` files (not HTML/CSS)

Then create a `/docs` folder inside the module and write the following documents:

---

### 1. `overview.md`

Audience: a developer making their first change in this module.

Begin with a **Purpose** section (2–3 sentences) that states what the document covers, what it assumes the reader already knows (i.e., they can navigate the app themselves), and links to the other three docs for concerns not covered here.

The rest of the document should cover things that cannot be learned by using the app for 10 minutes. Do not list tabs, steps, or features visible in the UI. Instead focus on:
- The single most important architectural concept a developer must understand before touching the code (e.g., how the core data pattern works under the hood)
- Non-obvious constraints that shape the code (e.g., external engine requirements, unit storage conventions, required field ordering)
- Patterns or flags that have a non-obvious activation mechanism (e.g., a boolean that must be explicitly set to enable a feature)
- Special cases or exceptions where one piece of the system works differently from everything else around it
- A step-by-step guide for the most common extension task (e.g., adding a new item to a list-driven system), listing every file that must be touched
- Side effects or overhead that would surprise a developer (e.g., extra DB calls, legacy patterns with a comment explaining why they exist)
- Stored-vs-computed fields: any field that looks derived but is actually persisted and must be explicitly recalculated
- Cross-session persistence outside the main data store (e.g., localStorage keys)
- Timing of any one-time initialization (e.g., when conversion or migration runs and what triggers it)

One short paragraph per topic is enough. If a topic doesn't apply to this module, omit it.

---

### 2. `architecture.md`

Audience: a developer implementing new features or debugging.

Include:
- Module folder layout (brief annotated directory tree)
- Component tree (indented, showing parent→child relationships and router-outlets)
- State management approach (how data flows, what holds the source of truth, how components write vs. read)
- DB persistence pattern (when/how data is saved, any debounce behavior)
- Full service inventory with one-line responsibility descriptions
- Any injection tokens, shared modules, or lazy-loaded modules and how they connect
- Angular patterns in use (OnPush, inject(), @if/@for, signals vs observables, etc.)

---

### 3. `data-model.md`

Audience: a developer working on forms, validation, or integration with the calculation engine.

Include:
- Top-level data structure tree (nested shape of the main domain model)
- Key sub-models with their TypeScript-shaped fields and notes on purpose/units
- Enum values with their display labels
- How units of measure affect storage vs. display (if applicable)
- Validation approach (where min/max rules live, how they're applied)
- Default values and where they're defined

---

### 4. `routing-and-navigation.md`

Audience: a developer adding a new route, debugging navigation, or understanding progression gates.

Include:
- Full annotated route tree (path → component, with redirect notes)
- Resolver: what it does on first load vs. subsequent navigations
- Any route guards: what they protect and under what condition they redirect
- If the module has a stepped/linear navigation system: the ordered step list, the forward-progression rules (what validity is required to advance), and the signals/methods that drive "Continue" and "Back"
- How the UI service or banner component reads current route state (URL parsing, signals)
- Any lazy-loaded sub-modules and how they communicate across the lazy boundary

---

## Style guidance

- Write in present tense
- Use tables where there are 3+ items with consistent attributes
- Include TypeScript interface shapes for key data structures (simplified, not full source)
- Use relative markdown links to reference source files: `[filename.ts](../path/to/file.ts)`
- Do not summarize what you just wrote at the end of each document
- Do not add a "last updated" date — the git log is the history
```

---

## After writing the docs

Verify:
- [ ] All four documents created in `[MODULE_PATH]/docs/`
- [ ] Component tree reflects actual router-outlet nesting in templates
- [ ] Service table accounts for every `providers: []` entry in the module file
- [ ] Route tree matches the actual `ROUTES` constant in the module file
- [ ] Data model shapes match the actual TypeScript interfaces (not just the Explore agent's summary)
