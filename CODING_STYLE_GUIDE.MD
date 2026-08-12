# MEASUR Coding & Style Guide

This guide describes ideal practices for contributing to MEASUR. It is intended to help all contributors—team and open source—improve the codebase with clear, maintainable code. These guidelines are not absolute rules; use your best judgment and prioritize consistency with the existing codebase. Use [Angular’s official style guide](https://angular.io/guide/styleguide) as a baseline.

## Usage Examples
For details on existing patterns and usage examples, contributors may reference code first in the `process-cooling-assessment` module and additionally in the `compressed-air-assessment` module.

## General Principles
- **Consistency:** Follow existing patterns for file structure, naming, and code organization.
- **Type Safety:** Always use TypeScript types and interfaces. Avoid `any`; use `unknown` if uncertain.
- **Readability:** Use descriptive variable and function names. Prefer clarity over brevity.

## Types

Let TypeScript inference work for you. Annotate where it adds information a reader couldn't get from the code itself; skip it when the type is already expressed in the initializer or signature.

**Must have:**
- Return types on public methods when the return is non-trivial (e.g., `getMonthControl(index: number): FormControl`, `deleteChiller(id: string): ChillerInventoryItem[]`)
- Class properties declared without an initializer (e.g., `form: FormGroup<OperationsForm>`)
- Concrete type in place of `any` — use `unknown` if the type is genuinely unknown

**Optional / skip:**
- Local variables with a clear initializer — `const label = 'Baseline'` already tells you the type
- `inject()` calls — the generic is self-documenting (`inject(MyService)` returns `MyService`)
- Properties initialized from a literal — `isCollapsed = false` is unambiguously `boolean`
- `void` return types — TypeScript infers these; the annotation adds no signal
- Lambda parameters in array methods (`map`, `filter`, `forEach`, `reduce`, etc.) — TypeScript infers the parameter type from the array's element type through contextual typing, so `inventory.forEach((chiller: ChillerInventoryItem) => ...)` is redundant when `inventory` is already typed

## Commenting
- Comment to explain *why* something is done, not *what* (if the code can't be made self-explanatory through descriptive naming).
- Comment static numbers/constants with their meaning and units.
- Document domain-specific logic, calculations, or scientific data.
- Use JSDoc for methods/classes when context is not obvious.

## Templates
- Keep templates simple; avoid complex logic.
- Use Angular’s native control flow (`@if`, `@for`, `@switch`) instead of structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`).
- Use the async pipe for observables when no side-effects are needed.

## Components
- Check `/shared` and `helperFunctions.ts` for reusable components and methods before creating new ones.
- Keep components focused on a single responsibility.
- Use `input()` and `output()` functions (not decorators) for data flow.
- Use setters/getters for input logic instead of lifecycle hooks.
- Use `computed()` for derived state.
- Use `class` bindings (not `ngClass`) and `style` bindings (not `ngStyle`).

## Forms
- Use Reactive Forms for anything beyond trivial forms.
- Follow patterns from existing modules (e.g., `process-cooling-assessment`).
    - MEASUR assessment modules consistently use and are designed around the reactive forms APIs

## State Management
- Use signals for simple state management cases. For example: dynamic template variables, strings, and primitive data types
- Use `computed()` for derived state.
- Use BehaviorSubjects or Observables for complex or shared state.
- Prefer immutable state updates.

## Routing
- Prefer lazy-loaded routes for new feature modules.

## Architecture & Services
- For large features, use NgModules (standalone: false).
- For small/shared features, use standalone components (in `/shared`).
- Design services for a single responsibility (e.g., a form or calculation set).
- Use `inject()` for dependency injection unless a constructor is already present.

## Legacy Code Improvement
The MEASUR team encourages contributors to use the above guide as a means to leave any legacy code better than they found it. However, contributors should determine whether style and pattern changes fall within the scope of the immediate work. 

- Leave legacy code better than you found it, but only if it fits the scope of your work.
- Replace `any` with defined types or `unknown`.
- Modernize components to use signals instead of Input/Output decorators.
- Refactor state handling to avoid mixing Input/Output with service Observables.
- Use type literals for string types with discrete values.
- Define object types as interfaces.
- Use the `ConvertValue` class instead of `ConvertUnitsService` where possible.