# Assess Leak Survey Calculator

## Scope
This assessment reviews the current Air Leak Survey calculator implementation and integration touchpoints with:
- `compressed-air-assessment`
- `treasure-hunt`

Primary files reviewed:
- `src/app/calculator/compressed-air/air-leak/air-leak.service.ts`
- `src/app/calculator/compressed-air/air-leak/air-leak.component.ts`
- `src/app/calculator/compressed-air/air-leak/air-leak-form/air-leak-form.service.ts`
- `src/app/calculator/compressed-air/air-leak/convert-air-leak.service.ts`
- `src/app/treasure-hunt/treasure-hunt-calculator-services/air-leak-treasure-hunt.service.ts`
- `src/app/tools-suite-api/calculator-suite-api.service.ts` (`compressedAirLeakSurvey`)

## Current Strengths
- Core calculation responsibility is mostly centralized in `AirLeakService.getResults`.
- Unit conversion responsibilities are separated into `ConvertAirLeakService`.
- Treasure Hunt integration already reuses `AirLeakService.getResults`, reducing duplicated formula logic.
- Form helpers exist and are centralized in `AirLeakFormService`.

## Gaps / Upgrade Opportunities

### 1) Validation and control-flow correctness
- `AirLeakFormService.checkValidInput()` uses `forEach` with `return false` inside callback, which does not break outer function logic; invalid leak rows can still report as valid.
- `AirLeakService.getResults()` calls `initDefaultEmptyOutputs()` when invalid but does not `return`, so calculation continues on potentially invalid data.

**Impact:** correctness risk across calculator, Treasure Hunt, and any future multi-equipment support.

### 2) Mutable shared state and cloning patterns
- Multiple `BehaviorSubject` values are mutated in place before `.next(...)` (e.g., `copyLeak`, `setLeakForModification`).
- Deep-copy logic is mixed (`JSON.parse(JSON.stringify(...))` and `lodash.cloneDeep`).

**Impact:** harder change detection behavior, testability friction, and inconsistent update patterns.

### 3) Service responsibility boundaries
- `AirLeakService` combines: state store, orchestration, conversion prep, and aggregation math.
- `air-leak.component.ts` persists assessment calculator data during every calculation call, coupling UI update cadence with persistence I/O.

**Impact:** increased coupling makes multi-equipment extension harder.

### 4) DRY and readability issues
- Repeated zero-value object literals (`baseline`, `modification`, `savings`, defaults).
- Conversion code repeats per-field patterns in `convert-air-leak.service.ts`.
- Null conversion in suite API is verbose and field-by-field.

**Impact:** higher maintenance cost and error surface for future equipment types.

### 5) Integration-level technical debt
- Treasure Hunt service includes a temporary patch block (`// 7419 temporary patch results`) that rewrites baseline/modification outputs.
- `calculator-suite-api.service.ts` comments indicate known TODOs and backwards-compatibility workaround for bag method operating time.

**Impact:** behavior differences across modules and unclear domain contracts.

## Recommended Upgrade Plan (Incremental, low-risk)

### Phase 1: Correctness + contract hardening (do first)
1. Fix validity checks (`checkValidInput`) and short-circuit return in `getResults` on invalid input.
2. Add targeted tests around invalid input behavior and expected zero-output fallback.
3. Add explicit type-safe helper factories for empty/default result objects.

### Phase 2: DRY + maintainability improvements
1. Introduce shared helper utilities for:
   - immutable leak list updates
   - repeated aggregate initializers
   - repeated field conversion maps
2. Normalize cloning approach (`cloneDeep` utility or typed mapper) and remove JSON stringify/parse cloning in business paths.
3. Reduce repetitive null-conversion boilerplate in suite API using field-map helper functions.

### Phase 3: Integration contract alignment
1. Define a stable, module-agnostic `AirLeakCalculationResult` contract used by calculator + Treasure Hunt.
2. Remove temporary Treasure Hunt patch once contract/accounting behavior is aligned.
3. Explicitly document units contract per measurement method and where conversions occur.

## Should we upgrade incrementally or fully refactor now?

### Recommendation: **Incremental upgrade first, then targeted refactor extraction**
A complete refactor now would be higher risk because this calculator already integrates with assessment and Treasure Hunt flows. The safer path is:
1. Deliver correctness and contract fixes first (Phase 1).
2. Extract reusable calculation engine interfaces in small slices (Phases 2-3).
3. After interfaces stabilize, introduce multi-equipment abstractions (adapter/strategy pattern) without destabilizing current modules.

### Refactor trigger criteria
A broader refactor becomes justified when either is true:
- More than one additional equipment type is actively being implemented, or
- Integration logic in calculator + Treasure Hunt requires repeated conditional branching by equipment type.

At that point, extract:
- `LeakInputAdapter` per equipment type
- shared `LeakComputationEngine`
- per-module presentation/state wrappers

## Alignment with repository guidance
- Follows the repository guidance to prioritize consistency and focused, minimal-scope changes.
- Uses compressed-air modules as reference architecture.
- Keeps recommendation scoped to maintainability and integration-readiness without destabilizing existing behavior.

## Notes on local validation
Attempted baseline validation before edits:
- `npm ci` failed in sandbox due blocked dependency host: `cdn.sheetjs.com` (`ENOTFOUND`).
- Because dependencies could not be installed, lint/build/test commands could not be executed locally in this environment.
