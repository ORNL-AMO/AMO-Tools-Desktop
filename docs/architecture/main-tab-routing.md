# Main-Tab Routing

How assessments and inventories route their main tabs (for example `baseline`, `assessment`, `report`) through the URL, and the shared code that keeps every module consistent.

## Purpose and Scope

Each main tab has its own URL, such as `/psat/12/report`. Routing the tabs gives Google Analytics a page view per tab, makes tabs deep-linkable, and makes browser back/forward step between tabs.

In scope: main tabs, and nested setup/summary tabs in the inventories. Out of scope: navigation inside a single tab or calculator. The `calculators` tab itself is a routed main view in most modules.

## Standard for New Routing

New modules (PHAST is the remaining unconverted one) follow the Process Cooling shape, with one modernization.

Follow from Process Cooling (`src/app/process-cooling-assessment/process-cooling-assessment.module.ts`, `src/app/process-cooling-assessment/routing/process-cooling-assessment-resolver.resolver.ts`):

- A parent `:id` route with a resolver that loads the assessment and its settings before any tab renders. On a refresh or direct link the resolver reloads IndexedDB into the in-memory cache first, then seeds the module's services.
- One routed component per main tab, declared as a child route.
- An empty-path child that redirects to the first tab.
- Route path strings kept as constants (`src/app/process-cooling-assessment/constants/process-cooling-routes.ts`).

Modernize:

- Write new resolvers and guards as functional `ResolveFn` / `CanActivateFn`, not classes. Examples already in the repo: `src/app/water-process-diagram/diagram.resolver.ts` and `src/app/treasure-hunt/routing/open-calculator.guard.ts`. Process Cooling and FSAT use the class-based `Resolve` interface; it still works in Angular 20 but is the older style, so do not copy that part.
- On a bad id or a missing assessment, redirect (`RedirectCommand` or `UrlTree`, for example to `/not-found`) instead of calling `router.navigate` and throwing.
- Keep the resolver to loading and seeding. Heavy derived work belongs in the services.
- Resolved data is available on `ActivatedRoute` data. The app does not enable `withComponentInputBinding()`, so do not rely on route data binding to component inputs.

Do not copy:

- `AssessmentRedirectGuard` in Process Cooling. It is provided in the module but not applied to any route, and both of its branches redirect to baseline. Gate tabs with the shared rule described below.
- Process Cooling's own `stepIndex` / `STEPPED_ROUTES` ordering. Use the shared helpers.

## Routing File Contract

Each module has a routing file exporting:

| Export | Meaning |
|---|---|
| `<M>_MAIN_VIEWS` | Main tab path segments in banner chevron order, declared `as const` |
| `<M>MainView` | Union type derived from the list: `typeof <M>_MAIN_VIEWS[number]` |
| `<M>_SETUP_GATED_VIEWS` | Main tabs blocked until setup is complete, typed `ReadonlyArray<<M>MainView>` |
| `<m>Routes` | The child routes, built from the lists above |

Inventories with nested tabs also export `<M>_SETUP_VIEWS` and `<M>_SUMMARY_VIEWS`, with `<M>SetupView` and `<M>SummaryView` types derived the same way.

Declare each list once with `as const` and derive the type from it, so the list and the type cannot drift apart. Use the type for the tab service's `BehaviorSubject`, `goToMainTab` and the banner's `changeTab`. A typo such as `goToMainTab('summry')` then fails to compile.

When the routes import the tab components, keep the view lists in a component-free file. A routing file that imports components can create a circular import with the tab service that imports the list. FSAT and Water do this: `src/app/fsat/routing/fsat-main-views.ts`, `src/app/water/routing/water-main-views.ts`.

## Shared Helpers

Location: `src/app/shared/main-tab-routing/main-tab-routing.ts`. Plain TypeScript, no Angular providers.

| Helper | Use |
|---|---|
| `MainTabRouteData<TMain, TSetup, TSummary>` | Route data shape: `mainView`, `setupView`, `summaryView`. The type arguments default to `string`. |
| `buildViewRoutes(views, dataKey, extra)` | Empty-path redirect to `views[0]` plus one componentless child route per view, with `data: { [dataKey]: view }`. `extra` adds properties to every view route, for example `canDeactivate`. |
| `getMergedRouteData<TMain, TSetup, TSummary>(snapshot)` | Merges route data down the `firstChild` chain, so a nested route such as `setup/plant-setup` yields `mainView` and `setupView` together. Route data is untyped, so this is the one place the module's view types are asserted; pass them as type arguments. |
| `getSteppedView(views, current, offset)` (generic over the view type) | Target view of a next (`1`) or back (`-1`) step. Returns `undefined` when `current` is not in the list or the step runs off either end. |
| `isMainTabAllowed(gatedViews, view, setupDone)` (generic over the view type) | The one gating rule: a view is allowed when it is not gated or setup is done. |

## Wiring in a Module

- **Tab service.** Holds `assessmentId` (set by the component after load, cleared on destroy) and `goToMainTab(view)`, which navigates to `['/<base>', id, view]`. `continueMainTab()` and `backMainTab()` call a private `stepMainTab(offset)` built on `getSteppedView`. Only the route sync calls `mainTab.next()`, so banner and footer buttons never set the tab directly.
- **Component sync.** After the assessment loads and on every `NavigationEnd`, read `getMergedRouteData(...)`. If `isMainTabAllowed` is false, navigate to the first view with `{ replaceUrl: true }` so Back does not return to the blocked URL. Otherwise call `mainTab.next(view)`.
- **Banner.** A `canOpenMainTab(view)` method wraps `isMainTabAllowed(<M>_SETUP_GATED_VIEWS, view, setupDone)`. `changeTab(view)` calls `goToMainTab` only when it is true, and the template uses it for each tab link's `disabled` class, so the click, the link state and the URL share one gated list. Chevrons call `continueMainTab` and `backMainTab`; their disabled conditions carry extra rules (for example, no back from baseline) and stay in the template.
- **Sub-tab steps.** Setup and step tabs inside a main tab (for example PSAT `stepTabs`, Waste Water `setupTabs`) step with `getSteppedView`, the same as main tabs.

## Entry Points

`src/app/dashboard/routed-assessment-tabs.ts` exports `getRoutedAssessmentUrl(assessment, requestedTab?)`, the single rule for which tab an assessment opens on. The dashboard (`src/app/dashboard/assessment.service.ts`) and Report Rollup (`src/app/report-rollup/assessment-reports/assessment-reports.component.ts`) both use it.

Rule: a requested tab wins; otherwise the module's setup-done tab when setup is done and the assessment is not an example; otherwise `baseline`. The generic `assessment` request maps to the module's setup-done tab (Treasure Hunt uses `treasure-chest`). Types that do not route main tabs return `undefined` and keep their own navigation. A module can restrict the tabs a link may request (`views`, Water) and append a URL segment to a tab (`getTabSuffix`, Water's diagram id).

Adding a module means adding one entry to `ROUTED_ASSESSMENTS` in that file.

## Adding a Module

1. Create the routing file with `<M>_MAIN_VIEWS`, `<M>_SETUP_GATED_VIEWS` and `<m>Routes` (see the contract above).
2. Add a resolver as a functional `ResolveFn` on the parent `:id` route.
3. Register the routes as children of the module's `:id` route in `src/app/core/core.routing.ts` (or the module's lazy routes).
4. Add `assessmentId`, `goToMainTab`, `continueMainTab`, `backMainTab` and `stepMainTab` to the tab service.
5. Sync `mainTab` from the route in the module component, including the gated redirect.
6. Gate banner `changeTab` with `isMainTabAllowed`.
7. Add the module to `ROUTED_ASSESSMENTS` in `src/app/dashboard/routed-assessment-tabs.ts` and remove any per-type navigation branch it replaces.
8. Update every place that links into the module to include the tab segment (connected inventory, integration URLs).
9. Add specs: routing (redirect, one route per view, data), service (go, step, ends of the list), component (sync, gated redirect with `replaceUrl`), banner (`changeTab`, gated and allowed).
10. Run `npx tsc -p src/tsconfig.app.json --noEmit` and the module's specs.

## Variants in the Codebase Today

| Module | Shape |
|---|---|
| Process Cooling | Routed components, parent resolver, own ordering logic. The reference for new work, apart from the class-based resolver. |
| FSAT | Routed components, resolver, shared helpers. Syncs `mainTab` in `FsatComponent` like the componentless modules. |
| PSAT, SSMT, Waste Water, Treasure Hunt | Componentless child routes. One monolithic component renders every tab and syncs `mainTab` from route data. |
| Pump Inventory, Compressed Air Inventory | Nested setup and summary child routes with `dataKey` per level. |
| Motor Inventory | Main tabs routed; setup and summary sub-tabs still set by `.next()`. |
| Water | Componentless `baseline` and `report` routes plus a routed `diagram/:diagramId` child with `diagramResolver`. Uses the shared route builder, step helper and starting-tab rule; its component keeps a specialized sync that redirects bare `diagram` once the diagram id is known. |
| PHAST | Not converted; still uses `getStartingTab()` and `mainTab.next()`. |

Componentless routes exist where the module already rendered all tabs inside one component. New modules use routed components and a resolver instead.

## Known Gaps

- Water has no setup gate (its assessment tab is not implemented), so it has no gated list and does not use `isMainTabAllowed`.
- Waste Water's banner gates on `isBaselineValid` while its component gates on `setupDone`.
- Treasure Hunt's baseline sub-tab stepping and Motor Inventory's setup and summary tab `if` chains do not use `getSteppedView`; their sequences differ from the uniform pattern.
- Water declares its main-tab union (`WaterMainTabString`) separately from `WATER_MAIN_VIEWS`, which omits the unimplemented `assessment` tab, so the two are not derived from one list.
- Motor Inventory types only its main views; its setup and summary sub-tabs are not routed and stay `string`.
