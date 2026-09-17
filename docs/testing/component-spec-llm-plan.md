# Component Spec Generation Plan (LLM Implementation Guide)

You are generating a `*.component.spec.ts` file for the MEASUR Angular app (Jasmine/Karma, no
ng-mocks/Spectator/Testing Library). Follow this plan as a procedure, in order. It is the
machine-actionable companion to `docs/testing/component-testing-guide.md` — that doc has the human-facing
rationale and CI-cost context; this doc has the steps and templates. Don't read the other doc unless you
need the "why" behind a rule; everything you need to act is here.

## 0. Inputs — read these before writing anything

1. The target component's `.ts` file, in full.
2. The target component's `.html` template, in full.
3. Every dependency injected via constructor params or `inject()` — you need each one's public method
   signatures and any `Signal`/`WritableSignal` properties it exposes. If a dependency is itself a thin
   wrapper around another service (e.g. a `*-form.service.ts` that builds `FormGroup`s), read that too —
   you'll need its return shapes to build mock data.
4. If the component's model types come from `shared/models/*`, read the relevant interface so mock data
   objects are shape-correct — do not guess field names.

## 1. Classify applicability — do this before writing code

For each of the 8 categories below, decide **APPLICABLE** or **N/A**. Do this explicitly for every
category; do not skip one silently.

| # | Category | Applies when |
|---|---|---|
| 1 | Initialization | Component has `ngOnInit`, constructor-time setup, or reads a service/signal to populate its own state on creation. |
| 2 | Reactive observers/effects | Component subscribes to a form control's `valueChanges`, or has an `effect()`. |
| 3 | Validator toggling | Any form control's validators change based on another control's value. |
| 4 | Signal inputs/outputs/computed | Component declares `input()`, `input.required()`, `output()`, or `computed()`. |
| 5 | User-triggered actions | Template has `(click)`/`(change)`/two-way bindings wired to component methods that mutate state or call a service. |
| 6 | Calculation triggers & output rendering | Component calls a calculation/results service (including anything behind `tools-suite-api`) and renders the result. |
| 7 | Template conditional rendering | Template has `@if`/`@switch` blocks gated on component/form state. |
| 8 | Destroy | Component has a manual `.subscribe()` (not `async` pipe, not already using `takeUntilDestroyed`) or an effect/observer that must stop firing after destroy. |

**Never write tests for:**
- Getters that only return `form.get('x')` or similar, with no branching logic.
- Methods that only set a UI-only highlighting/help-text signal.
- Static constant arrays (dropdown options, etc.).
- A method that only forwards to a framework API with no state mutation (e.g.
  `close() { this.dialogRef.close(); }`) — unless it's also the target of a category-5 test, in which case
  cover it there, not separately.

If a category is N/A, do not create a `describe` block for it. Do not invent tests to fill a category that
doesn't apply to this component.

## 2. Mocking strategy per dependency

Apply the first rule that matches each dependency, in this order:

1. If the dependency exposes a `Signal`/`WritableSignal` AND the component reacts to it via `effect()` or
   `computed()` that is itself under test → register the **real service** as a provider and drive it with
   `service.someSignal.set(...)`. A spy signal can't reproduce Angular's `effect()` scheduling. Keep the
   *other* dependencies of that real service mocked (e.g. a converter/formatter it calls internally).
2. Otherwise, for any injected service → `jasmine.createSpyObj('ServiceName', [methods], { signalProp:
   signal(initialValue) })`. List every method the component calls in the array. List every signal
   property the component *reads* in the third-argument property-descriptor object — this is the only way
   to mock a readonly signal property on a spy object.
3. For `DialogRef<T>` or other Angular CDK refs → `jasmine.createSpyObj('DialogRef', ['close'])` (only the
   methods actually called).
4. Never mock `FormBuilder`/`ReactiveFormsModule` internals. Import `ReactiveFormsModule` for real; build
   `FormGroup`/`FormControl` instances directly with real values.
5. Do not add `ng-mocks`, `@ngneat/spectator`, `@testing-library/angular`, or any package not already a
   dependency in `package.json`. Plain `TestBed` + Jasmine spies only.

## 3. Canonical TestBed skeleton

Default shape — service-mocked, forms-driven component:

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { XComponent } from './x.component';
import { SomeService } from '../services/some.service';

describe('XComponent', () => {
  let component: XComponent;
  let fixture: ComponentFixture<XComponent>;
  let someServiceSpy: jasmine.SpyObj<SomeService>;

  beforeEach(async () => {
    someServiceSpy = jasmine.createSpyObj(
      'SomeService',
      ['methodA', 'methodB'],
      { someSignal: signal(MOCK_INITIAL_VALUE) }
    );
    someServiceSpy.methodA.and.returnValue(MOCK_RETURN);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [XComponent],
      providers: [
        { provide: SomeService, useValue: someServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(XComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // describe blocks per Step 4 go here
});
```

Variant — signal-input component with a real service driving an `effect()` (use when Rule 1 in Step 2
applies):

```ts
beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [ReactiveFormsModule],
    declarations: [XComponent],
    providers: [
      RealService,
      { provide: ConverterService, useValue: converterSpy },
    ],
    schemas: [NO_ERRORS_SCHEMA],
  }).compileComponents();

  realService = TestBed.inject(RealService);
  fixture = TestBed.createComponent(XComponent);
  component = fixture.componentInstance;
  fixture.componentRef.setInput('settings', MOCK_SETTINGS); // required signal input — never `component.settings = ...`
});
```

Mock-data builder functions (`makeXForm()`, `makeXInput()`) go **above** the top-level `describe`, not
inside `beforeEach` — they're reused across `it` blocks.

## 4. One `describe` block per APPLICABLE category

Name each `describe` after the category concern (`initialization`, `observeXChange`, `template
visibility`, `destroy`, etc.), matching the style below. Use these exact patterns, substituting real
names/values:

**Initialization**
```ts
describe('initialization', () => {
  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('calls getXForm with the input and current settings', () => {
    expect(formServiceSpy.getXForm).toHaveBeenCalledWith(MOCK_INPUT, MOCK_SETTINGS);
  });

  it('assigns the form returned by the form service', () => {
    expect(component.form).toBe(mockForm);
  });
});
```

**Reactive observers / effects**
```ts
describe('observeXChange', () => {
  it('sets dependentField from dependent values when x changes', () => {
    component.x.setValue(NEW_VALUE);
    expect(component.dependentField.value).toBe(EXPECTED_VALUE);
  });
});
```

**Validator toggling** — always test both directions:
```ts
describe('observeIsRequiredChange', () => {
  it('applies required validator to Y when isRequired becomes true', () => {
    component.isRequired.setValue(true);
    expect(component.y.hasValidator(Validators.required)).toBeTrue();
  });

  it('clears validators from Y when isRequired becomes false', () => {
    component.isRequired.setValue(true);
    component.isRequired.setValue(false);
    expect(component.y.validator).toBeNull();
  });
});
```

**Signal inputs / outputs / computed**
```ts
describe('signal input/output', () => {
  it('rebuilds form when the input signal is set', () => {
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
    expect(component.form).toBeDefined();
  });

  it('emits saved with the updated value when save is triggered', () => {
    const emitted: SomeType[] = [];
    component.saved.subscribe(value => emitted.push(value));

    component.save(); // or invoke the method the click handler calls

    expect(emitted).toEqual([EXPECTED_VALUE]);
  });

  it('computes derivedValue from its inputs', () => {
    fixture.componentRef.setInput('rawValue', 10);
    expect(component.derivedValue()).toBe(EXPECTED_COMPUTED);
  });
});
```
Never call an `output()`'s internal emit by reaching into its implementation — trigger the real action
(the method the click/handler calls) and assert via a subscriber.

**User-triggered actions** — call the component method directly (not by dispatching a raw DOM event
unless the binding itself has logic worth testing):
```ts
describe('confirmDelete', () => {
  it('calls deleteX with the pending id and clears pending state', () => {
    component.deleteId = 'abc';
    component.confirmDelete();

    expect(serviceSpy.deleteX).toHaveBeenCalledWith('abc');
    expect(component.deleteId).toBeUndefined();
  });
});
```

**Calculation triggers & output rendering**
```ts
describe('runCalculation', () => {
  it('renders results returned by the calculation service for the given input', () => {
    calculationServiceSpy.calculate.and.returnValue(MOCK_RESULTS);

    component.runCalculation(MOCK_INPUT);
    fixture.detectChanges();

    expect(calculationServiceSpy.calculate).toHaveBeenCalledWith(MOCK_INPUT);
    expect(component.results).toEqual(MOCK_RESULTS);
  });

  it('updates rendered results when input changes again', () => {
    calculationServiceSpy.calculate.and.returnValue(MOCK_RESULTS_A);
    component.runCalculation(MOCK_INPUT_A);

    calculationServiceSpy.calculate.and.returnValue(MOCK_RESULTS_B);
    component.runCalculation(MOCK_INPUT_B);

    expect(component.results).toEqual(MOCK_RESULTS_B);
  });
});
```
Do not assert the calculation's numeric correctness here — only that the component passes the right
input and renders whatever the (mocked) service returned.

**Template conditional rendering** — test both the hidden and shown state for every `@if`/`@switch`
branch; for nested conditions, test the case where the outer condition is true but the inner is false:
```ts
describe('template visibility', () => {
  it('hides fieldX when conditionY is false', () => {
    expect(fixture.nativeElement.querySelector('[formControlName="fieldX"]')).toBeNull();
  });

  it('shows fieldX when conditionY is true', () => {
    component.conditionY.setValue(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[formControlName="fieldX"]')).not.toBeNull();
  });
});
```

**Destroy**
```ts
describe('destroy', () => {
  it('stops calling updateX after component is destroyed', () => {
    someServiceSpy.methodA.calls.reset();
    fixture.destroy();
    component.someControl.setValue(NEW_VALUE);
    expect(someServiceSpy.methodA).not.toHaveBeenCalled();
  });
});
```

## 5. Selector and structure rules — non-negotiable

- Query the DOM with `fixture.nativeElement.querySelector(...)`. Do **not** use `By.css`.
- Target an attribute the template already exposes: `[formControlName="x"]`, an existing class, an
  `[attr.x]`. Only add a `data-testid` to the template when the element has no other identifying
  attribute at all — and if you add one, edit the `.html` file too, minimally, not as a broad refactor.
- One top-level `describe('ComponentName', () => { ... })` per file, containing the nested `describe`
  blocks from Step 4.
- File path: `x.component.ts` → `x.component.spec.ts`, same directory.
- `fixture.detectChanges()` once in `beforeEach` if initial state doesn't depend on signals set up
  per-test; call it explicitly inside an `it` after setting signal/input state when an `effect()` needs to
  flush before assertions.
- Before a destroy test's assertion, reset relevant spy call counts (`spy.calls.reset()`) so the
  assertion isolates post-destroy behavior from setup-time calls.

## 6. Verify

Run:
```bash
ng test --include='**/path/to/x.component.spec.ts'
```
Iterate until it exits 0. If a test fails because the *component* has an actual bug the spec correctly
caught, stop and report that instead of rewriting the spec to match broken behavior. Do not report the
task complete without having run this command and observed success.

## 7. Self-check before finishing

- [ ] Every constructor/`inject()` dependency has a `TestBed` provider (spy or real) — no `NullInjectorError`.
- [ ] Every category marked APPLICABLE in Step 1 has at least one `it()`; no category was skipped silently.
- [ ] Every `@if`/`@switch` branch in the template has a test for both the shown and hidden state,
      including nested-condition cases.
- [ ] Every `input()`/`input.required()` is driven via `fixture.componentRef.setInput`, never direct
      property assignment.
- [ ] Every `output()` emission is asserted via a subscriber on the real emitting action, not by invoking
      an internal emit call.
- [ ] Every validator-toggle condition is tested in both directions (applied and cleared).
- [ ] No `By.css`, no new testing-library/mocking-package imports, no unjustified `data-testid`.
- [ ] Step 6's verify command was run and passed.

## Reference files (open if you need a full worked example, not just the templates above)

- `src/app/process-cooling-assessment/system-information/tower/tower.component.spec.ts` — default
  service-mocked, forms-driven component: initialization, reactive observers (`observeFormChanges`,
  `observeIsFanTypeKnownChange`), validator toggling driven by a `callFake` mock that varies by argument,
  a user-triggered action that mutates a service signal (`focusField`), nested `@if` template visibility,
  and destroy.
- `src/app/calculator/compressed-air/air-leak-survey/air-leak-survey-form/air-leak-survey-form.component.spec.ts` —
  signal input driven via `setInput`, `effect()` rebuilding form state from a real service's signals.
- `docs/testing/examples/modification-list-testing-plan.md` — a filled-out applicability breakdown (Step
  1 style) for a non-form, click-driven, signal-backed list component.
