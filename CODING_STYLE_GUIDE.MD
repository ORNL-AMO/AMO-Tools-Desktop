# MEASUR Coding & Style Guide

This guide describes ideal practices for contributing to MEASUR. It is intended to help all contributors—team and open source—improve the codebase with clear, maintainable code. These guidelines are not absolute rules; use your best judgment and prioritize consistency with the existing codebase. Use [Angular’s official style guide](https://angular.io/guide/styleguide) as a baseline.

## Usage Examples
For details on usage examples, contributors may reference code in the `process-cooling-assessment` module. 

NOTE: this code is currently on feature branch `process-cooling`

## General Principles
- **Consistency:** Follow existing patterns for file structure, naming, and code organization.
- **Type Safety:** Always use TypeScript types and interfaces. Avoid `any`; use `unknown` if uncertain.
- **Readability:** Use descriptive variable and function names. Prefer clarity over brevity.

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
- Check `/shared` for reusable components before creating new ones.
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