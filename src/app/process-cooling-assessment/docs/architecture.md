# Process Cooling Assessment — Architecture

## Module Layout

```
process-cooling-assessment/
├── constants/          # Enums, defaults, dropdown options, validation rules
├── docs/               # This documentation
├── explore-opportunities/  # EEM components (one folder per EEM type)
├── models/             # View enums and navigation types
├── pipes/              # Template-layer transforms
├── report/             # Report section components + data adapter
├── results-panel/      # Side panel: results, chiller inventory table, help text
├── routing/            # Route resolver and assessment redirect guard
├── services/           # All business logic services
├── system-information/ # System config sub-forms (operations, pump, condenser, tower)
├── [feature]/          # All other top-level form/view components
└── process-cooling-assessment.module.ts
```

---

## Component Tree

```
ProcessCoolingAssessmentComponent  (root outlet)
├── ProcessCoolingBannerComponent  (header: tabs, import/export, save state)
├── BaselineComponent
│   ├── BaselineTabsComponent      (Assessment Settings / System Information / ... tabs)
│   ├── ResultsPanelComponent      (right sidebar)
│   │   ├── InventoryTableComponent
│   │   ├── AssessmentResultsComponent
│   │   └── HelpPanelComponent     (context-sensitive help, one per baseline step)
│   └── [router-outlet]
│       ├── SystemBasicsComponent
│       ├── SystemInformationComponent
│       │   └── [router-outlet]
│       │       ├── OperationsComponent
│       │       ├── WeatherDataModule  (lazy-loaded)
│       │       ├── PumpWrapperComponent → WaterPumpComponent (×2)
│       │       ├── CondenserCoolingSystemComponent → AirCooledComponent | WaterCooledComponent
│       │       └── TowerComponent
│       ├── ChillerInventoryComponent
│       │   └── ChillerLoadScheduleComponent
│       ├── OperatingScheduleComponent
│       │   ├── WeeklyOperatingScheduleComponent
│       │   └── MonthlyOperatingScheduleComponent
│       └── LoadScheduleComponent
├── AssessmentComponent
│   ├── [router-outlet] → ExploreOpportunitiesComponent
│   │   └── [selected EEM component]
│   └── AddModificationComponent (modal)
│       ModificationListComponent  (modal)
└── ReportComponent
    └── [router-outlet]
        ├── ExecutiveSummaryComponent
        ├── PerformanceProfileComponent → ChillerProfileChartComponent (×N)
        ├── SystemProfileComponent
        ├── PumpSummaryComponent
        ├── TowerSummaryComponent → TowerEnergyHistogramComponent
        ├── InputSummaryComponent → (6 sub-section components)
        └── FacilityInfoComponent
```

---

## State Management

State flows through a **BehaviorSubject + Signal** hybrid pattern. The authoritative source is `ProcessCoolingAssessmentService`, which holds two top-level subjects:

```
assessment$            (Assessment — the full IndexedDB record)
  └── processCooling$  (ProcessCoolingAssessment — the nested domain data)
settings$              (Settings — unit system, costs, etc.)
```

### Update Pattern

Components never mutate the current state object. All updates go through a named method on `ProcessCoolingAssessmentService`:

```typescript
// update a top-level property
service.updateProcessCoolingProperty('systemInformation', updatedSystemInfo);

// update a systemInformation sub-property
service.updateSystemInformationProperty('operations', updatedOperations);

// specialized updaters for inventory and schedules
service.updateAssessmentChiller(itemId, partialFields);
service.updateWeeklyOperatingSchedule(schedule);
service.updateMonthlyOperatingSchedule(schedule);
```

Each call creates a new object via spread (`{ ...current, key: value }`) before calling `setProcessCooling()`, which in turn calls `setAssessment()` to keep the outer record in sync.

### DB Persistence

`ProcessCoolingAssessmentService` self-manages persistence in its constructor. It watches `assessment$` with a 300ms debounce and writes to IndexedDB on every change:

```typescript
this.assessment$.pipe(
  debounceTime(300),
  switchMap(assessment => this.assessmentDbService.updateWithObservable(assessment))
).subscribe();
```

After each write, it also refreshes the in-memory assessment list (`getAllAssessments → setAll`) to satisfy legacy directory components that read from that list.

### Signals

`processCooling$` is converted to a signal (`processCoolingSignal`) via `toSignal()`. UI service validation state (form validity per step) is also exposed as signals derived from observables, allowing components that use `ChangeDetectionStrategy.OnPush` to react without zone triggers.

---

## Services

### Core Services

| Service | Responsibility |
|---|---|
| `ProcessCoolingAssessmentService` | Central state owner. Holds assessment + settings. All writes go through this service. Manages debounced DB persistence. |
| `ProcessCoolingUiService` | Navigation state. Tracks current route segment, manages stepped routing, exposes `canContinue` / `canGoBack` signals, owns UI-only signals (focused field, modal open state, selected modification). |
| `ProcessCoolingResultsService` | Calls the WASM Suite API with the current assessment data. Returns `ProcessCoolingResults[]` — one entry per baseline/modification. |

### Form/Data Services

| Service | Responsibility |
|---|---|
| `SystemInformationFormService` | Builds and validates all system-information reactive forms. Contains `isPumpValid`, `isCondenserSystemInputValid`, `isTowerValid`, and the aggregate `isSystemInformationValid`. |
| `ChillerInventoryService` | Manages the selected chiller signal, `inventoryValidState` signal, and helpers for setting defaults. |
| `ChillerLoadScheduleService` | Manages the load schedule form for the currently selected chiller. |
| `ModificationService` | CRUD for EEM modifications on the assessment. Manages `selectedModificationId` in localStorage + as a signal. |
| `ExploreOpportunitiesFormService` | Builds reactive forms for each EEM type. |
| `ConvertProcessCoolingService` | Converts all numeric fields in a `ProcessCoolingAssessment` between Imperial and Metric using the `ConvertValue` utility. |
| `MonthlyOperatingScheduleService` | Manages the monthly operating schedule form and helpers. |
| `WeeklyOperatingScheduleService` | Manages the weekly operating schedule form and helpers (implied, part of operating-schedule folder). |

### Report Services

| Service | Responsibility |
|---|---|
| `ExecutiveSummaryResultsService` | Transforms raw `ProcessCoolingResults[]` into the executive summary table/chart model. |
| `SystemProfileService` | Builds the per-chiller system profile view model. |
| `PumpSummaryResultsService` | Extracts pump energy data for the pump summary section. |
| `TowerSummaryService` | Extracts tower energy and histogram data. |
| `InputSummaryService` | Builds the input summary review model from the raw assessment data. |
| `ProcessCoolingReportAdapter` | Orchestrates all report data — instantiated per report view, coordinates the five result services above. |

---

## Weather Data Integration

Weather data is handled by a **shared module** (`WeatherDataModule`) that is lazy-loaded under the `system-information/weather` route. The module communicates with the rest of the assessment through the `WEATHER_CONTEXT` injection token:

```typescript
{ provide: WEATHER_CONTEXT, useClass: ProcessCoolingWeatherContextService }
```

`ProcessCoolingWeatherContextService` implements the `WeatherContext` interface. It exposes `weatherContextData$` and `isValidWeatherData()`. `ProcessCoolingAssessmentService` subscribes to `weatherContextData$` in its constructor and writes new weather data to the assessment when valid data arrives.

The resolver pre-populates the weather context from saved assessment data so the weather step loads correctly on re-entry.

---

## WASM / Suite API Integration

`ProcessCoolingResultsService` is the only service that calls the Suite API. It receives the `ProcessCoolingAssessment` and `Settings`, assembles the Suite API input shape, invokes `ProcessCoolingSuiteApiService.getResults()` (injected from the shared WASM loader), and maps the output to `ProcessCoolingResults[]`.

All Suite API calls must receive data in **Imperial units**. The `existingDataUnits` field on `ProcessCoolingAssessment` tracks the original storage units, and `ConvertProcessCoolingService` handles any necessary conversion before results are computed.

---

## Angular Patterns Used

- **NgModule** (not standalone) — declared in `process-cooling-assessment.module.ts`
- **ChangeDetectionStrategy.OnPush** — required on all components
- **`inject()` function** — preferred over constructor injection (use constructor only where already present)
- **`@if` / `@for`** — Angular 17+ control flow syntax in templates (not `*ngIf`/`*ngFor`)
- **`host` object in decorator** — used instead of `@HostBinding` / `@HostListener`
- **`takeUntilDestroyed()`** — for automatic subscription cleanup in services
- **`toSignal()`** — for converting observables to signals in the UI service layer
- **Immutable updates** — all state changes spread the current object rather than mutating it
