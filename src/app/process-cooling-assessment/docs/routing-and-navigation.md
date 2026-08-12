# Process Cooling Assessment — Routing & Navigation

## Route Tree

The module mounts at `/process-cooling/:assessmentId/` and is registered as a lazy-loaded child in the app routing. All routes are defined in `process-cooling-assessment.module.ts`.

```
/process-cooling/:assessmentId/
├── (redirect → baseline)
├── baseline/
│   ├── (redirect → assessment-settings)
│   ├── assessment-settings          SystemBasicsComponent
│   ├── system-information/
│   │   ├── (redirect → operations)
│   │   ├── operations               OperationsComponent
│   │   ├── weather/                 WeatherDataModule  ← lazy-loaded
│   │   ├── pump                     PumpWrapperComponent
│   │   ├── condenser-cooling-system CondenserCoolingSystemComponent
│   │   └── tower                    TowerComponent
│   ├── chiller-inventory            ChillerInventoryComponent
│   ├── operating-schedule           OperatingScheduleComponent
│   └── load-schedule                LoadScheduleComponent
├── assessment/
│   ├── (redirect → explore-opportunities)
│   └── explore-opportunities        ExploreOpportunitiesComponent
└── report/
    ├── (redirect → executive-summary)
    ├── facility-info                FacilityInfoComponent
    ├── executive-summary            ExecutiveSummaryComponent
    ├── performance-profile          PerformanceProfileComponent
    ├── system-profile               SystemProfileComponent
    ├── pump-summary                 PumpSummaryComponent
    ├── input-summary                InputSummaryComponent
    └── tower-summary                TowerSummaryComponent
```

Route token strings are defined in [constants/process-cooling-routes.ts](../constants/process-cooling-routes.ts) and used throughout as `ROUTE_TOKENS.<key>` to avoid hardcoded strings.

---

## Resolver: ProcessCoolingAssessmentResolver

Registered on the root `''` route (the `ProcessCoolingAssessmentComponent`). It runs on every navigation into the module and handles two cases:

**Case 1 — Assessment already in memory (normal navigation within the module)**
The resolver checks if `ProcessCoolingAssessmentService.assessmentValue` exists and matches the route `:assessmentId`. If so, it returns immediately with the cached data — no DB hit.

**Case 2 — First load or page refresh**
The resolver loads the assessment from IndexedDB (`AssessmentDbService.findById`). If the record isn't in the in-memory list (e.g., after a page refresh), it forces a full `setAll()` from IndexedDB before attempting the lookup.

**After loading**, the resolver always:
1. Calls `setAssessment()` and `setProcessCooling()` on the assessment service
2. Initializes the chiller inventory selection state (`ChillerInventoryService.setDefaultSelectedChiller`, `setInventoryValidState`)
3. Restores weather data to `ProcessCoolingWeatherContextService` (or pre-populates the zipcode as a starting point)
4. Restores the selected modification ID from `localStorage` (key: `PC_SELECTED_MODIFICATION_KEY`)
5. Calls `ProcessCoolingAssessmentService.initAssessmentSettings()` to load or create assessment-level settings and handle Imperial→Metric conversion if needed
6. Passes the resolved `Settings` to the weather context service so unit-aware weather validation works

The resolver returns `ProcessCoolingResolverData: { assessment, settings }`.

---

## Guard: AssessmentRedirectGuard

Applied to the `assessment/` route. Reads `processCooling.setupDone` from `ProcessCoolingAssessmentService`. If `false`, redirects to `baseline/assessment-settings`. This prevents users from accessing the Explore Opportunities view before the baseline is configured.

---

## Stepped Navigation

`ProcessCoolingUiService` manages a linear 11-step progression through the Baseline phase plus the Assessment and Report top-level views. The full ordered sequence:

| Index | View | Path |
|---|---|---|
| 0 | assessment-settings | `baseline/assessment-settings` |
| 1 | operations | `baseline/system-information/operations` |
| 2 | weather | `baseline/system-information/weather` |
| 3 | pump | `baseline/system-information/pump` |
| 4 | condenser-cooling-system | `baseline/system-information/condenser-cooling-system` |
| 5 | tower | `baseline/system-information/tower` |
| 6 | chiller-inventory | `baseline/chiller-inventory` |
| 7 | operating-schedule | `baseline/operating-schedule` |
| 8 | load-schedule | `baseline/load-schedule` |
| 9 | assessment | `assessment/explore-opportunities` |
| 10 | report | `report` |

### Progression Rules

`canVisitSteppedView(index)` enforces forward progression gates:

| To reach step | Requires |
|---|---|
| 0, 1, 2 | Always accessible |
| 3 (pump) | Weather data valid |
| 4 (condenser) | Weather data valid + pump valid |
| 5 (tower) | Weather data valid + condenser valid |
| 6 (chiller inventory) | Full system information valid |
| 7 (operating schedule) | System info valid + chiller inventory valid |
| 8, 9, 10 | System info + chiller inventory + operating schedule all valid |

`ProcessCoolingUiService` exposes two computed signals consumed by the banner navigation:

```typescript
canContinue: Signal<boolean>  // = canVisitSteppedView(currentStepIndex + 1)
canGoBack: Signal<boolean>    // = currentStepIndex > 0
```

`continue()` and `back()` navigate by absolute URL using `router.navigateByUrl()`.

### Route Detection

`ProcessCoolingUiService` derives view state by parsing the current URL:

```
/process-cooling / :id / main / setup / subview
     [0]           [1]   [2]    [3]      [4]
```

Four signals are derived from `router.events` (filtered to `NavigationEnd`):

| Signal | Source segment | Example value |
|---|---|---|
| `mainView` | index 2 | `'baseline'` |
| `childView` | index 3 | `'system-information'` |
| `setupSubView` | index 4 | `'operations'` |
| `fullSubroute` | segments 2+ joined | `'baseline/system-information/operations'` |

`currentStepIndex` is a `computed()` that finds the matching entry in `STEPPED_ROUTES` by comparing `fullSubroute`. Weather routes receive special matching because the lazy-loaded weather module adds sub-segments beyond `weather/`.

---

## Navigation from Tab Components

The banner and tab components call `ProcessCoolingUiService` methods rather than navigating directly:

- `navigateSystemInformationTab(link: ViewLink)` — handles the weather sub-route specially (navigates to `weather/stations` or `weather/annual-station` depending on whether valid weather data exists)
- `canVisitView(view: ProcessCoolingView)` — used by tab components to disable/enable tabs without navigating

---

## Lazy-Loaded Weather Module

The `WeatherDataModule` is loaded at `system-information/weather`. It communicates back through the `WEATHER_CONTEXT` token (`ProcessCoolingWeatherContextService`), so the lazy boundary doesn't break the assessment's reactive state. The module has its own internal routing (`stations`, `annual-station`, etc.) handled within its own `RouterModule.forChild`.
