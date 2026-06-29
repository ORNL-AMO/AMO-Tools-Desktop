# MEASUR Coding Test Guide

This guide describes ideal practices for testing components across MEASUR. It is intended as a template for understanding what to prioritize when describing a testing block for a component set. The goal is for coverage of user action progressions through the forms, testing failure points where problems or niche entries can cause issues for them.

## Usage Examples
For details on existing patterns and isage examples, contributors may reference code first in the `process-cooling-assessment` module.

## General Principles

### Mandatory Coverage

- **Initialization** — Every component spec must verify that `ngOnInit` wires up correctly: the right service methods are called with the right arguments, and the resulting data (form, signals, ids) is assigned to the component. This catches broken DI, wrong argument order, and missing calls that would silently leave the component in a blank state.

- **Reactive observers** — Any method that subscribes to a form control's `valueChanges` and produces a side effect must be tested. Focus on the output of the subscription, not the subscription itself: assert that the dependent field was updated, the service was called, or the validator was changed. Each observer should have at least one test per meaningful branch.

- **Validator toggling** — When one field controls whether another field is required or has range constraints, test both directions explicitly: validators applied when the condition is true, and validators cleared when the condition is false. A broken clear is just as harmful as a broken apply — it leaves the form permanently invalid and blocks the user from saving.

- **Template conditional rendering** — Any `@if` block that shows or hides a field based on form state must be tested. For each condition, test the hidden state and the visible state. For nested conditions (field A controls field B, which controls field C), test the case where the outer condition is true but the inner is false, confirming the innermost field remains hidden.

- **Destroy** — Verify that subscriptions stop firing after the component is destroyed. Test that triggering a form change after `fixture.destroy()` does not invoke service calls or update dependent fields. This confirms `takeUntilDestroyed` (or equivalent cleanup) is wired to the correct `DestroyRef`.

### Disregard Coverage

- **Simple getters** — Getters that are thin wrappers around `form.get('fieldName')` carry no logic and do not need their own tests. They are implicitly exercised by the observer and template tests.

- **UI-only methods** — Methods like `focusField` that only update a UI signal for sidebar help or highlighting carry no business logic. A failure here has no impact on data correctness or form validity.

- **Static dropdown data** — Arrays like `towerTypes`, `fanTypes`, or `towerSizeMetrics` sourced directly from constants do not need tests. They cannot be broken by component logic.

## Reference Example

`src/app/process-cooling-assessment/system-information/tower/tower.component.spec.ts` demonstrates all mandatory principles:

- **Initialization** — asserts `getTowerForm` is called with the correct `towerInput` and `settings`, and the returned form is assigned.
- **Reactive observers** — asserts that a tower type change propagates dependent values (`numberOfFans`, `fanSpeedType`) from the form service.
- **Validator toggling** — asserts that `HEXApproachTemp` gains `Validators.required` when `isHEXRequired` is true and has a null validator when false; asserts that `towerSize` validators are refreshed when `towerSizeMetric` changes.
- **Template conditional rendering** — asserts presence/absence of `numberOfFans`, `towerSize`, `fanType`, `isHEXRequired`, and `HEXApproachTemp` in the DOM across all controlling field states, including the nested `usesFreeCooling → isHEXRequired → HEXApproachTemp` chain.
- **Destroy** — asserts that form changes and tower type changes produce no service calls or field updates after `fixture.destroy()`.
