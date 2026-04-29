# Air Leak Module — Prioritized Improvements Plan

Generated: 2026-04-28
Branch: `copilot/upgrade-air-leak-survey`

---

## P0 — Critical Convention Violations (Block Review) ✓ DONE

### 1. Add `ChangeDetectionStrategy.OnPush` to all components ✓ DONE

All 10 components are missing `ChangeDetectionStrategy.OnPush`, which is a hard project requirement and the most impactful performance issue in the module.

**Affected files:**
- `air-leak.component.ts`
- `air-leak-form/air-leak-form.component.ts`
- `air-leak-form/facility-compressor-data-form/facility-compressor-data-form.component.ts`
- `air-leak-form/estimate-method-form/estimate-method-form.component.ts`
- `air-leak-form/bag-method-form/bag-method-form.component.ts`
- `air-leak-form/orifice-method-form/orifice-method-form.component.ts`
- `air-leak-form/decibel-method-form/decibel-method-form.component.ts`
- `air-leak-results/air-leak-results.component.ts`
- `air-leak-results-table/air-leak-results-table.component.ts`
- `air-leak-copy-table/air-leak-copy-table.component.ts`
- `air-leak-help/air-leak-help.component.ts`

**Fix:** Add to each component decorator:
```typescript
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  ...
})
```

**Note:** After adding OnPush, component views will only update when inputs change or async pipe emits. Any properties set from manual subscriptions (`.value` assignments in `ngOnInit`) will not trigger view updates automatically. These will need to be converted to use `async` pipe or `markForCheck()` calls. Address subscription patterns first (see P1 #3).

---

### 2. Replace `@HostListener` with `host` object in decorator ✓ DONE

`@HostListener` is forbidden by project convention. Two components use it for `window:resize`.

**Affected files:**
- `air-leak.component.ts` — listens to `window:resize` to set `containerHeight`
- `air-leak-form/facility-compressor-data-form/facility-compressor-data-form.component.ts` — same resize tracking

**Fix:**
```typescript
// Before
@HostListener('window:resize', ['$event'])
onResize(event) { ... }

// After (in @Component decorator)
@Component({
  host: { '(window:resize)': 'onResize($event)' },
  ...
})
onResize(event: Event) { ... }
```

Also remove any `@HostBinding` imports that are no longer needed.

---

## P1 — High Priority: Type Safety and Form Correctness ✓ DONE

### 3. Fix `updateValueAndValidity()` missing after dynamic validator changes ✓ DONE

In `air-leak-form.service.ts`, `setCompressorDataValidators()` calls `setValidators()` on form controls but never calls `updateValueAndValidity()`. This means the form validity state is stale after validator updates.

**Affected file:** `src/app/calculator/compressed-air/air-leak/air-leak-form/air-leak-form.service.ts`

**Fix:** After each `setValidators()` call in `setCompressorDataValidators()`, add:
```typescript
form.controls.compressorControl.updateValueAndValidity();
form.controls.compressorControlAdjustment.updateValueAndValidity();
```

This is a correctness bug: the form can appear invalid when it is valid or vice versa depending on order of operations.

---

### 4. Replace `UntypedFormGroup` with typed `FormGroup` ✓ DONE

All form groups use `UntypedFormGroup`, losing compile-time safety on control names and values.

**Affected files:**
- `air-leak-form.service.ts` — all form builder calls
- All form components that accept `leakForm: UntypedFormGroup`

**Fix:** Define typed interfaces for each form shape and use `FormGroup<{...}>`. At minimum, replace `UntypedFormGroup` with `FormGroup` using explicit `FormControl<T>` fields. This surface area is large — prioritize the main leak form and facility compressor form first, then method-specific forms.

---

### 5. Remove mixed `ngModel` + reactive form bindings in results table ✓ DONE

`air-leak-results-table.component.html` uses both `[(ngModel)]` and reactive form event bindings simultaneously on the same checkboxes. This creates conflicting state updates.

**Affected file:** `air-leak-results-table/air-leak-results-table.component.html` (lines ~7, 25)

**Fix:** Choose one pattern. Since the parent is reactive-form driven, remove `[(ngModel)]` and use `(change)` with the `leak` object directly. The `allSelected` toggle and per-leak `selected` toggles should both go through a single method that updates the model and triggers recalculation:

```html
<!-- Remove [(ngModel)]="leak.selected" -->
<input type="checkbox" [checked]="leak.selected" (change)="toggleSelected(index, $event)" />
```

---

### 6. Fix `==` strict equality — use `===` throughout ✓ DONE

`air-leak.service.ts` and templates use `==` for comparisons where `===` is required.

**Affected files:**
- `air-leak.service.ts` line ~80: utility type comparison
- Templates: `*ngIf="leakForm.controls.measurementMethod.value == LeakMeasurementMethod.Estimate"` (should be `===`)

**Fix:** Replace all `==` with `===` (and `!=` with `!==`) across all `.ts` and `.html` files in the module.

---

## P2 — Medium Priority: Subscription Management and Async Patterns ✓ DONE

### 7. Convert manual subscriptions to `async` pipe (or `takeUntilDestroyed`) ✓ DONE

All components manually subscribe to BehaviorSubjects in `ngOnInit` and store results in component properties. This is fragile (subscription leaks if `ngOnDestroy` is missed), bypasses `OnPush` change detection, and is verbose.

**Pattern found in:** All 10 components

**Preferred fix:** Use `async` pipe in templates for observable values that drive the view:
```typescript
// Component
airLeakInput$ = this.airLeakService.airLeakInput.asObservable();

// Template
*ngIf="airLeakInput$ | async as airLeakInput"
```

**Alternative (where async pipe is impractical):** Use `takeUntilDestroyed(this.destroyRef)` (Angular 16+) instead of manual `ngOnDestroy` unsubscription:
```typescript
private destroyRef = inject(DestroyRef);

ngOnInit() {
  this.airLeakService.airLeakInput
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(input => this.airLeakInput = input);
}
```

This is required to be done before enabling `OnPush` on components that rely on subscription-set properties (see P0 #1).

---

### 8. Fix `convertInputDataImperialToMetric` dead assignment in `convert-air-leak.service.ts` ✓ DONE

Line ~169 in `convert-air-leak.service.ts` reassigns `inputData =` inside a `forEach` callback, which has no effect on the original array. The object reference is local to the callback.

**Fix:** Either mutate the object's properties in-place (the pattern used elsewhere), or return a mapped array and reassign the result:
```typescript
// Before (bug: reassignment in forEach has no effect)
inputData.forEach((data, index) => {
  inputData = convertInputDataMetricToImperial(data); // no-op
});

// After (correct: mutate in place)
inputData.forEach((data, index) => {
  inputData[index] = convertInputDataMetricToImperial(data);
});
```

---

### 9. Add null guards for `leak.selected` and array index access in `air-leak.service.ts` ✓ DONE

`getResults()` accesses `leak.selected` (line ~153) without null checking. If a leak object is partially initialized (e.g., during copy/delete mid-calculation), this throws.

**Fix:** Add optional chaining:
```typescript
// Before
if (leak.selected) { ... }

// After
if (leak?.selected) { ... }
```

Similarly in `deleteLeak()` and `copyLeak()`, add bounds checks on the index before array splice/push.

---

## P3 — Medium Priority: Control Flow and Template Modernization

### 10. Standardize template control flow syntax — use `@if`/`@for` throughout

The templates mix Angular's legacy `*ngIf`/`*ngFor` structural directives with the new `@if`/`@for` block syntax (Angular 17+). Some templates partially migrated.

**Fix:** Choose one. Since `@if`/`@for` is the current direction, migrate all `*ngIf` and `*ngFor` to block syntax. This also removes the need for `ng-template` wrappers for `else` branches. Run the Angular migration schematic if available:
```bash
ng g @angular/core:control-flow
```
Review generated output before committing.

---

### 11. Replace hardcoded color values with CSS variables

`air-leak-form.component.css` line ~26 uses a hardcoded hex color `#145A32`. All colors should reference CSS custom properties defined in the global theme.

**Fix:**
```css
/* Before */
.some-element { color: #145A32; }

/* After */
.some-element { color: var(--color-success-dark, #145A32); }
```

Audit all `.css` files in the module for hardcoded color values.

---

### 12. Remove unused CSS rules

Two CSS files contain rules with no matching template elements:

- `air-leak.component.css` line 1–4: `.header .fa.fa-lightbulb-o` selector — icon class not present in template
- `air-leak-form.component.css` line 30–33: `.input-group-prepend` — not present in template

**Fix:** Delete these dead rules to reduce stylesheet noise.

---

## P4 — Lower Priority: Code Quality Cleanup

### 13. Remove commented-out dead code

`air-leak-results.component.ts` contains a commented-out block for combining baseline/modification/savings tables. If this approach was abandoned, delete it. If it represents future work, move it to a tracking issue instead.

---

### 14. Standardize subscription property naming

Subscription properties follow inconsistent naming:
- `airLeakOutputSub`, `airLeakInputSub` — explicit pattern
- `generateExampleSub`, `resetDataSub` — abbreviated pattern

**Fix:** Use the explicit `<subject>Sub` suffix pattern throughout. Rename any outliers.

---

### 15. Replace hardcoded hour constant with named constant

`air-leak-form.service.ts` uses `Validators.max(8760)` (hours per year) inline. This magic number should be a named constant:
```typescript
const HOURS_PER_YEAR = 8760;
// ...
Validators.max(HOURS_PER_YEAR)
```

---

## P5 — Test Coverage Expansion ✓ DONE

### 16. Expand `air-leak.service.spec.ts` test cases ✓ DONE

Current: 3 tests. Missing coverage:

| Missing Test | Importance |
|---|---|
| `deleteLeak()` removes correct index from array | High |
| `copyLeak()` duplicates leak at correct position | High |
| `generateExampleData()` produces valid calculable input | High |
| Metric unit system produces equivalent output to Imperial | High |
| `getResults()` with empty leaks array | Medium |
| `setLeakForModification()` toggles state correctly | Medium |

---

### 17. Expand `air-leak-form.service.spec.ts` test cases ✓ DONE

Current: 1 test. Missing coverage:

| Missing Test | Importance |
|---|---|
| `getLeakFormFromObj()` round-trips an object correctly | High |
| `getAirLeakObjFromForm()` maps all method fields | High |
| `setCompressorDataValidators()` marks form invalid when control required | High |
| `getEmptyAirLeakData()` produces a valid-schema object | Medium |
| Dynamic validator update calls `updateValueAndValidity()` | Medium |

---

### 18. Add component-level unit tests for `AirLeakFormComponent` ✓ DONE

No component tests exist. At minimum:
- Renders correct method-specific form when `measurementMethod` changes
- Calls `saveLeak()` on input change events
- Shows/hides compressor form based on facility data toggle

---

## Summary by Category

| Priority | Items | Scope |
|---|---|---|
| P0 — Convention violations | 2 | All components |
| P1 — Type/form correctness bugs | 4 | Services, templates |
| P2 — Subscription/async | 3 | All components, conversion service |
| P3 — Template modernization | 3 | Templates, CSS |
| P4 — Code cleanup | 3 | Services, CSS |
| P5 — Test coverage | 3 | Spec files |

**Suggested sequence:** P0 → P1#3 (validators) → P1#5 (ngModel conflict) → P2#7 (subscriptions, required before OnPush) → P0#1 (OnPush, now safe) → remainder in order.

---

## Addendum — Architectural Reorganization

This addendum describes what a complete reorganization of the module would look like, the problems it would actually solve that the piecemeal items above cannot, and an honest comparison of the two approaches.

---

### Root Architectural Problems

Three structural issues drive a disproportionate share of the bugs in this module. The piecemeal items treat symptoms of each; only a reorganization removes the causes.

**1. The flat mega-form**

`AirLeakFormService.getLeakFormFromObj()` builds a single flat `FormGroup` that contains every field from all four measurement methods simultaneously — bag, decibel, orifice, and estimate fields all exist in the same group regardless of which method is selected. The method-specific form components each receive this single group and bind only to their own slice of it. This is why:
- Typed `FormGroup` (P1 #4) can be introduced but will still describe an awkward all-methods-present shape.
- Validators must be manually toggled via `setCompressorDataValidators()` / `setValidators()` and the `updateValueAndValidity()` bug (P1 #3) exists because the form structure makes dynamic validators necessary.
- `getAirLeakObjFromForm()` unconditionally reads every method's fields back out, regardless of which one is active.

**2. The BehaviorSubject mutation pattern**

`AirLeakService` exposes its state as public `BehaviorSubject` instances. Several methods mutate the `.value` reference directly and then call `.next()` on the same object (e.g., `copyLeak()`, `setLeakForModification()`, `addLeak()` in the form component). This means subscribers are sometimes receiving the same object reference they already hold, making change detection unreliable and `OnPush` unsafe without `markForCheck()` or the `async` pipe. It also makes the state effectively mutable from anywhere that injects the service.

**3. Form rebuilt on every state emission**

`AirLeakFormComponent` subscribes to both `currentLeakIndex` and `airLeakInput`. Both subscriptions call `getLeakFormFromObj()`, which creates a brand new `FormGroup` instance from the model object on every emission. Every user keystroke that triggers `saveLeak()` → `airLeakInput.next()` → subscription fires → form is destroyed and replaced. This means the form loses focus on each save, validators reset, and any in-flight user input is discarded.

---

### Target Architecture

The changes below address the root causes. They assume the existing calculation logic in `getResults()` is correct and is preserved as-is.

#### State as signals in the service

Replace the six BehaviorSubjects in `AirLeakService` with signals. `airLeakOutput` becomes a `computed()` — it derives from `airLeakInput` automatically and the manual `calculate()` call chain disappears:

```typescript
airLeakInput = signal<AirLeakSurveyInput>(undefined);
currentLeakIndex = signal<number>(0);
currentField = signal<string>('default');

airLeakOutput = computed(() => {
  const input = this.airLeakInput();
  if (!input) return this.emptyOutput();
  return this.getResults(input, this.settings);
});
```

`resetData` and `generateExample` as BehaviorSubjects exist only to fire side-effect notifications. These become simple methods that call `airLeakInput.set(...)` directly; consumers react to the input change, not to a separate signal.

#### Per-method form groups instead of a flat mega-form

Split `getLeakFormFromObj()` into one builder per measurement method. Each method-specific form component receives and owns only its own `FormGroup`:

```typescript
getEstimateForm(data: EstimateMethodData): FormGroup<EstimateFormControls>
getBagForm(data: BagMethodInput, hoursPerYear: number): FormGroup<BagFormControls>
getOrificeForm(data: OrificeMethodData): FormGroup<OrificeFormControls>
getDecibelForm(data: DecibelsMethodData): FormGroup<DecibelFormControls>
```

The parent `AirLeakFormComponent` builds the correct form when `currentLeakIndex` changes, not when `airLeakInput` emits. Method switches destroy the old sub-form and create the new one. This makes typed `FormGroup` (P1 #4) natural — each interface maps directly to one method's shape.

#### Build form once, patch on model change

`AirLeakFormComponent` should build its form when the active leak index changes, then `patchValue()` if the model is externally replaced (e.g., reset/example), not rebuild from scratch. Save on `valueChanges` with `debounceTime`:

```typescript
ngOnInit() {
  effect(() => {
    const index = this.airLeakService.currentLeakIndex();
    const leak = this.airLeakService.airLeakInput()?.compressedAirLeakSurveyInputVec[index];
    if (leak) this.buildForm(leak);
  });

  this.leakForm.valueChanges.pipe(
    debounceTime(150),
    takeUntilDestroyed(this.destroyRef)
  ).subscribe(() => this.saveLeak());
}
```

This eliminates the "form rebuilt while typing" problem without requiring `markForCheck()`.

#### Components as pure inputs/outputs

With signals powering the service and per-method forms owned locally, the leaf method form components (`BagMethodFormComponent`, etc.) no longer need to inject `AirLeakService` at all. They receive their `FormGroup` as an `input()` and emit field focus changes as an `output()`. Only `AirLeakFormComponent` and `FacilityCompressorDataFormComponent` need service injection.

#### Validation without form instances

Remove `checkValidInput()` from `AirLeakFormService`. Move the validity check to a standalone pure function that operates on the data model directly, not by recreating a `FormGroup` to interrogate its `.valid` state. Call this from `airLeakOutput`'s `computed()` before running calculations.

---

### Comparison: Complete Reorganization vs. Piecemeal

#### What the piecemeal items fix

The 18 items in P0–P5 address real bugs and real convention violations. Completing them leaves the module:
- Convention-compliant (`OnPush`, `host`, `@if`/`@for`)
- Free of the `updateValueAndValidity` correctness bug
- Free of the `[(ngModel)]` conflict
- Free of the dead assignment in `convertExample()`
- Typed at the `FormGroup` level (though still with the flat shape)
- With meaningful test coverage

This is a legitimate, shippable outcome. Each item is independently reviewable.

#### What the piecemeal items cannot fix

| Problem | Piecemeal result | Reorganization result |
|---|---|---|
| Flat mega-form | Typed, but still flat and all-methods-present | Per-method forms; each typed naturally |
| Dynamic validator fragility | `updateValueAndValidity()` added; still dynamic | Validators are static per form; no dynamic toggling needed |
| Form rebuilt on every save | Subscription converted to `async` pipe or `takeUntilDestroyed`; form still rebuilt | Form built once; patched on external resets only |
| BehaviorSubject mutation | Side effects of mutation remain; `markForCheck()` required after OnPush | Signals are immutable; `OnPush` is safe by default |
| `checkValidInput()` re-creates forms | Still re-creates forms; just cleaner subscriptions elsewhere | Replaced by a pure function on the model |
| Leaf components depend on `AirLeakService` | Still injected in all components | Injected only at the form-coordinator level |

After all piecemeal work is done, the module will have a mixture of BehaviorSubjects (in the service) and signals (new state added to components), `async` pipe in some templates and `takeUntilDestroyed` in others, and a typed `FormGroup` that still describes a flat all-method shape. It will be significantly better but not architecturally clean.

#### Tradeoffs

**Piecemeal approach**
- Lower regression risk — each change is small and independently testable against the existing spec suite.
- Shorter total calendar time if work is incremental and reviewed item-by-item.
- Can stop after P0/P1 and still be in a meaningfully better state.
- Fits the project's contribution model (focused PRs, minimal scope).
- Leaves the module in a "better legacy" state rather than a modern state.

**Complete reorganization**
- Eliminates all three root causes rather than patching their symptoms.
- Results in a module that matches the `process-cooling-assessment` reference pattern outright.
- Test surface for a signals-based service is significantly simpler — no subscription setup or BehaviorSubject initialization in specs.
- Higher upfront risk: the calculation logic in `getResults()` is non-trivial and must be preserved exactly. A rewrite introduces regression surface that the current spec suite (4 tests total) cannot adequately catch.
- Requires a meaningful test suite to be written before or alongside the reorganization, not after. Without it, regressions in calculation results may not be caught until QA.
- Scope is roughly 3–4x the piecemeal work. Realistically a multi-day effort vs. several focused hours.

#### Recommendation

If this module is expected to receive continued feature work, reorganization is the right long-term investment — but only after the P5 test coverage items are completed first. The reorganization changes the service API, the form structure, and the component communication pattern simultaneously; without test coverage of `getResults()` output correctness and form round-trip fidelity, regressions will be caught late.

A practical sequence: complete P0, P1 #3 (correctness bug), and P5 (test coverage) as piecemeal items. Then treat the remaining work as a reorganization rather than continuing to patch, using the new tests as a regression harness. This avoids doing the piecemeal work twice while ensuring the reorganization is safe to ship.
