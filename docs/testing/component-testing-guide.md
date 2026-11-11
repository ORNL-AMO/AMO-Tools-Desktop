# MEASUR Component UI Testing Standard

This is the enforceable standard for `*.component.spec.ts` files across MEASUR. It defines what every
component spec must cover, what it should skip, and the conventions (mocking, `TestBed` setup, selectors)
that keep specs consistent app-wide. While writing or reviewing a spec, check it against
[Mandatory Coverage](#mandatory-coverage) and [Disregard Coverage](#disregard-coverage) below.

## Scope: does this component need a spec?

Write a spec for any component that has at least one of: a reactive form, injected service calls,
conditional (`@if`/`@switch`) template logic driven by state, a signal `input()`/`output()`, or a
user-triggered handler (`(click)`, `(change)`, etc.) that mutates state or calls a service.

Skip pure layout/presentational components with no logic — a wrapper that only projects `<ng-content>`,
a static help-text panel, a component whose class body is empty aside from `@Component` metadata (e.g.
`AssessmentResultsComponent`). If a component is skipped, note it in the module's testing plan as
"disregarded — no logic" rather than silently omitting it.

## Mandatory Coverage

- **Initialization** — Every component spec must verify that `ngOnInit` (or constructor-time setup) wires
  up correctly: the right service methods are called with the right arguments, and the resulting data
  (form, signals, ids) is assigned to the component. This catches broken DI, wrong argument order, and
  missing calls that would silently leave the component in a blank state.

- **Reactive observers** — Any method that subscribes to a form control's `valueChanges` (or an `effect()`
  reacting to a signal) and produces a side effect must be tested. Focus on the output of the
  subscription/effect, not the subscription mechanism itself: assert that the dependent field was updated,
  the service was called, or the validator was changed. Each observer should have at least one test per
  meaningful branch.

- **Validator toggling** — When one field controls whether another field is required or has range
  constraints, test both directions explicitly: validators applied when the condition is true, and
  validators cleared when the condition is false. A broken clear is just as harmful as a broken apply — it
  leaves the form permanently invalid and blocks the user from saving.

- **Signal inputs, outputs, and computed state** — For components using `input()`/`input.required()`,
  drive the input through `fixture.componentRef.setInput(...)`, never by assigning the signal directly.
  For `output()`, trigger the emitting action (a click, a form submit) and assert the emitted payload with
  a subscriber spy — do not call the internal emit method directly, since that bypasses the thing under
  test. For `computed()` values derived from other signals or inputs, assert the derived value for at
  least one representative case per branch; you do not need to re-test the upstream signal's own logic.

- **User-triggered actions** — Any `(click)`/`(change)`/two-way-bound handler that mutates component
  state or calls a service must be tested by invoking the component method directly (not by dispatching a
  DOM event, unless the binding itself has logic worth exercising). Assert the resulting state change or
  service call and its arguments — e.g., selecting a row updates the selected id and closes a dialog;
  confirming a delete calls the service with the correct id and clears the pending-delete state.

- **Calculation triggers and output rendering** — Any component that calls into a calculation/results
  service (including WASM suite calls behind `tools-suite-api`) and renders the result must be tested by
  supplying representative input, invoking the trigger, and asserting the rendered/assigned output. Also
  test that changing the input again produces updated output (proving the component doesn't cache stale
  results). You do not need to verify the calculation's numeric correctness here — that belongs to the
  service/suite-wrapper's own tests — only that the component passes the right input and renders what the
  service returns.

- **Template conditional rendering** — Any `@if`/`@switch` block that shows or hides a field based on
  component state must be tested. For each condition, test the hidden state and the visible state. For
  nested conditions (field A controls field B, which controls field C), test the case where the outer
  condition is true but the inner is false, confirming the innermost field remains hidden.

- **Destroy** — Verify that subscriptions/effects stop firing after the component is destroyed. Test that
  triggering a form change or signal update after `fixture.destroy()` does not invoke service calls or
  update dependent fields. This confirms `takeUntilDestroyed` (or manual `ngOnDestroy` unsubscribe) is
  wired correctly.

## Disregard Coverage

- **Simple getters** — Getters that are thin wrappers around `form.get('fieldName')` carry no logic and do
  not need their own tests. They are implicitly exercised by the observer and template tests.

- **UI-only methods** — Methods like `focusField` that only update a UI signal for sidebar help or
  highlighting carry no business logic. A failure here has no impact on data correctness or form validity.

- **Static dropdown data** — Arrays like `towerTypes`, `fanTypes`, or `orderOptions` sourced directly from
  constants do not need tests. They cannot be broken by component logic.

- **Framework pass-throughs** — A method that only forwards to a framework API with no transformation
  (e.g., `close() { this.dialogRef.close(); }`) does not need its own test unless it also mutates
  component/service state — in which case test the state mutation, not the framework call.

- **Chart/graph rendering internals** — For components wrapping a charting library (d3, ECharts, etc.),
  do not test the library's rendered pixel output or internal config object shape. Test only that the
  component computes and passes the correct *data* into the chart.

## TestBed & Mocking Conventions

These conventions come from the existing reference specs and should be followed for consistency, not
reinvented per component:

- **Module setup**: `declarations: [YourComponent]`, `imports: [ReactiveFormsModule]` when forms are
  involved, and `schemas: [NO_ERRORS_SCHEMA]` so you don't have to declare every child component/directive
  used in the template. This repo does not use `ng-mocks`, Spectator, or Testing Library — stick to plain
  Jasmine/Karma/TestBed.
- **Mocking services**: use `jasmine.createSpyObj('ServiceName', [methods], { signalProp: signal(...) })`
  — the third argument's property descriptor map is how you mock a service's *signal properties*
  alongside its spied methods. Register with `{ provide: ServiceName, useValue: spy }`.
- **When the signal wiring itself is under test** (e.g. an `effect()` reacting to a service signal), prefer
  registering the *real* service as a provider and driving it through its actual signal APIs
  (`service.someSignal.set(...)`) rather than a full spy — a spy can't reproduce `effect()` scheduling.
  Keep unrelated dependencies (converters, formatters) as spies.
- **Signal inputs**: set with `fixture.componentRef.setInput('name', value)`, never
  `component.name = value`.
- **Selectors**: query with `fixture.nativeElement.querySelector(...)` (not `By.css`, for consistency with
  existing specs) using an attribute the template already exposes — `[formControlName="x"]`,
  `.some-existing-class`. Only add a `data-testid` attribute to the template when no such natural hook
  exists (e.g., a plain `<div>` with no distinguishing attribute).
- **Change detection timing**: call `fixture.detectChanges()` once in `beforeEach` for components whose
  initial state doesn't depend on signals set up per-test; call it explicitly per-`it` after setting
  signal/input state when an `effect()` needs to flush before assertions.
- **Destroy tests**: reset any spy call counts right before `fixture.destroy()` so the assertion isolates
  post-destroy behavior from setup-time calls.

## Structure Conventions

- One spec file colocated with its component: `x.component.ts` → `x.component.spec.ts`.
- Nest `describe` blocks by concern (`initialization`, `observeXChange`, `validator toggling`, `template
  visibility`, `destroy`, etc.), matching the mandatory coverage categories that apply. Keep `it` blocks
  small and focused on one assertion path.
- Shared mock builders (`makeXForm()`, `makeXInput()`) go above the top-level `describe`, not inside
  `beforeEach`, so they're reusable across `it` blocks without re-declaration.

## Reference Examples

- [`tower.component.spec.ts`](../../src/app/process-cooling-assessment/system-information/tower/tower.component.spec.ts) —
  forms-driven component: initialization, reactive observers, validator toggling (both directions),
  nested template conditional rendering, destroy.
- [`air-leak-survey-form.component.spec.ts`](../../src/app/calculator/compressed-air/air-leak-survey/air-leak-survey-form/air-leak-survey-form.component.spec.ts) —
  signal-driven component: `fixture.componentRef.setInput()` for a required signal input, an `effect()`
  rebuilding form state from a real service's signals, two-way sync back to the service.
- [`modification-list-testing-plan.md`](examples/modification-list-testing-plan.md) — a filled-out
  applicability breakdown for a non-form, signal-backed list component with click-driven interactions
  (select, rename, delete, copy) and a dialog close — a component shape not covered by the two specs
  above.
