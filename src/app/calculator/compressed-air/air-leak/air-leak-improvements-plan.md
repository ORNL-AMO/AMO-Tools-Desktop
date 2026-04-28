# Air Leak Module — Prioritized Improvements Plan

Generated: 2026-04-28
Branch: `copilot/upgrade-air-leak-survey`

---

## P0 — Critical Convention Violations (Block Review)

### 1. Add `ChangeDetectionStrategy.OnPush` to all components

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

### 2. Replace `@HostListener` with `host` object in decorator

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

## P1 — High Priority: Type Safety and Form Correctness

### 3. Fix `updateValueAndValidity()` missing after dynamic validator changes

In `air-leak-form.service.ts`, `setCompressorDataValidators()` calls `setValidators()` on form controls but never calls `updateValueAndValidity()`. This means the form validity state is stale after validator updates.

**Affected file:** `src/app/calculator/compressed-air/air-leak/air-leak-form/air-leak-form.service.ts`

**Fix:** After each `setValidators()` call in `setCompressorDataValidators()`, add:
```typescript
form.controls.compressorControl.updateValueAndValidity();
form.controls.compressorControlAdjustment.updateValueAndValidity();
```

This is a correctness bug: the form can appear invalid when it is valid or vice versa depending on order of operations.

---

### 4. Replace `UntypedFormGroup` with typed `FormGroup`

All form groups use `UntypedFormGroup`, losing compile-time safety on control names and values.

**Affected files:**
- `air-leak-form.service.ts` — all form builder calls
- All form components that accept `leakForm: UntypedFormGroup`

**Fix:** Define typed interfaces for each form shape and use `FormGroup<{...}>`. At minimum, replace `UntypedFormGroup` with `FormGroup` using explicit `FormControl<T>` fields. This surface area is large — prioritize the main leak form and facility compressor form first, then method-specific forms.

---

### 5. Remove mixed `ngModel` + reactive form bindings in results table

`air-leak-results-table.component.html` uses both `[(ngModel)]` and reactive form event bindings simultaneously on the same checkboxes. This creates conflicting state updates.

**Affected file:** `air-leak-results-table/air-leak-results-table.component.html` (lines ~7, 25)

**Fix:** Choose one pattern. Since the parent is reactive-form driven, remove `[(ngModel)]` and use `(change)` with the `leak` object directly. The `allSelected` toggle and per-leak `selected` toggles should both go through a single method that updates the model and triggers recalculation:

```html
<!-- Remove [(ngModel)]="leak.selected" -->
<input type="checkbox" [checked]="leak.selected" (change)="toggleSelected(index, $event)" />
```

---

### 6. Fix `==` strict equality — use `===` throughout

`air-leak.service.ts` and templates use `==` for comparisons where `===` is required.

**Affected files:**
- `air-leak.service.ts` line ~80: utility type comparison
- Templates: `*ngIf="leakForm.controls.measurementMethod.value == LeakMeasurementMethod.Estimate"` (should be `===`)

**Fix:** Replace all `==` with `===` (and `!=` with `!==`) across all `.ts` and `.html` files in the module.

---

## P2 — Medium Priority: Subscription Management and Async Patterns

### 7. Convert manual subscriptions to `async` pipe (or `takeUntilDestroyed`)

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

### 8. Fix `convertInputDataImperialToMetric` dead assignment in `convert-air-leak.service.ts`

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

### 9. Add null guards for `leak.selected` and array index access in `air-leak.service.ts`

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

## P5 — Test Coverage Expansion

### 16. Expand `air-leak.service.spec.ts` test cases

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

### 17. Expand `air-leak-form.service.spec.ts` test cases

Current: 1 test. Missing coverage:

| Missing Test | Importance |
|---|---|
| `getLeakFormFromObj()` round-trips an object correctly | High |
| `getAirLeakObjFromForm()` maps all method fields | High |
| `setCompressorDataValidators()` marks form invalid when control required | High |
| `getEmptyAirLeakData()` produces a valid-schema object | Medium |
| Dynamic validator update calls `updateValueAndValidity()` | Medium |

---

### 18. Add component-level unit tests for `AirLeakFormComponent`

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
