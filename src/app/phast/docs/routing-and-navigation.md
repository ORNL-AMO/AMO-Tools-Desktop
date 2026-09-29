# PHAST — Routing and Navigation

## Route Registration

PHAST has a single flat route registered in [`src/app/core/core.routing.ts`](../../core/core.routing.ts):

```
path: 'phast/:id'  →  PhastComponent
```

There are no child routes, no lazy loading, and no router-outlet inside `PhastComponent`. All within-assessment navigation is managed entirely through `PhastService` `BehaviorSubject`s — the URL stays at `phast/:id` throughout the session.

## No Resolvers or Guards

PHAST uses no route resolver and no `canActivate` / `canDeactivate` guards. The assessment object is loaded synchronously from `AssessmentDbService.findById()` inside `ngOnInit` after the `activatedRoute.params` subscription emits the `id` parameter. If no matching assessment is found, or the type is not `'PHAST'`, `PhastComponent` redirects to `/not-found`:

```typescript
if (!this.assessment || assessment.type !== 'PHAST') {
  this.router.navigate(['/not-found'], { queryParams: { measurItemType: 'assessment' } });
}
```

## In-Module Navigation System

All PHAST navigation is driven by four `BehaviorSubject`s on `PhastService`. There is no URL change when the user moves between tabs.

### Main Tab

`PhastService.mainTab: BehaviorSubject<string>` — controls the top-level context:

| Value | Description |
|---|---|
| `'baseline'` | Setup flow — steps 1–5 |
| `'assessment'` | Scenario analysis (Explore Opportunities or Modify Conditions) |
| `'report'` | Full report view |
| `'sankey'` | Interactive sankey diagram |
| `'diagram'` | System diagram placeholder |
| `'calculators'` | Integrated engineering calculators |

`PhastBannerComponent` reads `mainTab` to highlight the active top-level tab. Switching `mainTab` to `'assessment'` or `'report'` is only meaningful when `phast.setupDone === true`.

### Step Tab (Baseline Flow)

`PhastService.stepTab: BehaviorSubject<StepTab>` — tracks position within the five baseline setup steps. The steps are ordered in [`tabs.ts`](../tabs.ts):

| Step | `tabName` | `next` | `back` |
|---|---|---|---|
| 1 | Assessment Settings | 2 | — |
| 2 | Heat Balance | 3 | 1 |
| 3 | Aux Equipment | 4 | 2 |
| 4 | Design Energy Use | 5 | 3 |
| 5 | Metered Energy | — | 4 |

`PhastTabsComponent` renders a tab bar that calls `PhastService.goToStep(n)` when the user clicks a numbered tab. `PhastService.continue()` advances to `stepTab.next`; when called on step 5 (Metered Energy, no `next`), it transitions `mainTab` to `'assessment'`. `PhastService.back()` retreats to `stepTab.back`; when called from step 1 or from the Assessment main-tab, it moves back to `mainTab === 'baseline'`.

Forward progression has **no validity gate** — the user can click any step tab at any time. There is no "Continue" lock based on form validity. Validity state is surfaced as badge colours on tabs (via `PhastValidService`) but does not block navigation.

### Assessment Sub-Tab

`PhastService.assessmentTab: BehaviorSubject<string>` — controls which view renders when `mainTab === 'assessment'`:

| Value | Renders |
|---|---|
| `'explore-opportunities'` | `ExplorePhastOpportunitiesComponent` |
| `'modify-conditions'` | `LossesComponent` for the selected modification |

The initial value is `'explore-opportunities'`. If the first modification has `exploreOpportunities === false` (legacy data), `ngOnInit` sets `assessmentTab` to `'modify-conditions'` directly.

### Loss Tab (Heat Balance)

`LossesService.lossesTab: BehaviorSubject<string>` — tracks which loss category tab is active within the Heat Balance step (and also in `modify-conditions` mode). The available tabs are computed dynamically by `LossesService` from the furnace and energy type; `PhastComponent` subscribes and updates `selectedLossTab`.

## How the Banner Reads Navigation State

`PhastBannerComponent` receives `assessment` and `settings` as `@Input()`. It subscribes to `PhastService.mainTab` to highlight the current main-tab button. It does not parse the URL — all state comes from the service subjects.

## Modification Navigation

When `mainTab === 'assessment'`, `ModificationNavbarComponent` is rendered in the header. It displays the list of modifications via `PhastCompareService.selectedModification`. Selecting a different modification calls `PhastCompareService.setCompareVals()`, which broadcasts the new selection. The `ModificationListComponent` dropdown and the "Change Modification" ngx-bootstrap modal (opened via `LossesService.openModificationModal`) are both in-component UI — no URL change occurs.

## Starting Tab Override

`AssessmentService.getStartingTab()` may return a pre-configured starting tab (set by the dashboard when opening a specific assessment context). If it returns a value, `PhastComponent.ngOnInit` calls `PhastService.mainTab.next(startingTab)` before the user interacts. This is the only external caller that overrides the default `'baseline'` starting state.

## Sub-Modules with Their Own Routing

`ExplorePhastOpportunitiesModule` and `PhastReportModule` are feature modules imported eagerly into `PhastModule`. They do not define their own routes — they are rendered by `*ngIf` in `phast.component.html` based on `mainTab` and `assessmentTab` values.

The integrated calculators shown on the Calculators tab (`O2EnrichmentModule`, `EnergyEquivalencyModule`, `EnergyUseModule`, `FlueGasModule`, `PreAssessmentModule`) are also rendered inside `PhastComponent` by component selector, not by router-outlet or child routes.
