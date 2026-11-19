# MEASUR Conventions for New Code

This guide describes the direction for new code in MEASUR. Much of the existing codebase predates it, so consistency with the surrounding code wins when the two conflict. Use [Angular's style guide](https://angular.dev/style-guide) as the general baseline; this file only covers what is specific to MEASUR.

Developers using AI agents should have them use the `angular-developer` skill to follow current Angular best practices. Most of those practices overlap with this guide. The skill is published by the Angular team: see [angular.dev/ai/agent-skills](https://angular.dev/ai/agent-skills) or the [angular/skills](https://github.com/angular/skills) repository.

## Reference Modules
For patterns and usage examples, look first at `process-cooling-assessment`, then `compressed-air-assessment`.

## Types
- Never use `any`; use a concrete type, or `unknown` if the type is genuinely unknown.
- Annotate where it adds information a reader can't get from the code: non-trivial return types on public methods, and class properties declared without an initializer.
- Skip annotations TypeScript already infers: initialized locals and properties, `inject()` calls, `void` returns, and lambda parameters in array methods.

## Components and Templates
- Check `/shared` and `helperFunctions.ts` for reusable components and methods before creating new ones.
- Use `input()`/`output()` instead of decorators, `computed()` for derived state, and native control flow (`@if`, `@for`, `@switch`) instead of structural directives.
- Use `class` and `style` bindings instead of `ngClass` and `ngStyle`.
- Use Reactive Forms for anything beyond trivial forms.

## State
- Use signals for simple state (template variables, primitives); use BehaviorSubjects or Observables for complex or shared state.
- Prefer immutable updates, and don't mix Input/Output with service Observables for the same state.

## Architecture
- Large features use NgModules (`standalone: false`); small shared features are standalone components in `/shared`.
- Services have a single responsibility (e.g., one form or one calculation set). Use `inject()` unless a constructor is already present.
- Prefer lazy-loaded routes for new feature modules.
- Use `ConvertValue` instead of `ConvertUnitsService` where possible.

## Comments
Comment *why*, not *what*. Document domain-specific logic and calculations, and give constants their meaning and units.

## Legacy Code
Leave legacy code better than you found it, but only when the change fits the scope of your work: replace `any`, use string-literal types for discrete values, and define object types as interfaces.
