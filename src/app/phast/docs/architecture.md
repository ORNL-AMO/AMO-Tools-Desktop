# PHAST — Architecture

## Module Folder Layout

```
src/app/phast/
├── phast.module.ts                   NgModule declaration, provider list
├── phast.component.ts/.html/.css     Root container — orchestrates all state and tab routing
├── phast.service.ts                  Tab BehaviorSubjects + all per-loss calculation wrappers
├── phast-results.service.ts          Aggregates PhastResults from all loss calculations
├── phast-valid.service.ts            Produces PhastValid — one boolean per loss category
├── phast-compare.service.ts          Baseline vs. selected-modification comparison state
├── convert-phast.service.ts          Imperial ↔ Metric conversion for all loss data
├── phast-integration.service.ts      Maps PHAST to treasure-hunt / integrated-assessment APIs
├── tabs.ts                           stepTabs[], defaultTabs[], LossTab / StepTab interfaces
│
├── system-basics/                    Step 1 — Assessment Settings form
├── losses/                           Step 2 — Heat Balance; hosts all loss-type sub-components
│   ├── losses.service.ts             Dynamic tab list, loss-form init helpers
│   ├── losses-tabs/                  Tab bar for the heat-balance step
│   ├── atmosphere-losses/
│   ├── auxiliary-power-losses/
│   ├── charge-material/
│   ├── cooling-losses/
│   ├── energy-input/                 EAF energy-input form
│   ├── energy-input-exhaust-gas-losses/
│   ├── exhaust-gas/                  EAF exhaust-gas form
│   ├── extended-surface-losses/
│   ├── fixture-losses/
│   ├── flue-gas-losses/
│   ├── gas-leakage-losses/
│   ├── heat-system-efficiency/
│   ├── opening-losses/
│   ├── operations/                   Operating hours, costs, CO₂ savings data
│   ├── other-losses/
│   ├── slag/
│   └── wall-losses/
├── aux-equipment/                    Step 3 — Auxiliary Equipment
├── designed-energy/                  Step 4 — Design Energy Use
├── metered-energy/                   Step 5 — Metered Energy
│
├── phast-banner/                     Top banner: assessment name, settings button, export
├── phast-tabs/                       Step-tab bar (baseline tabs 1–5)
├── modification-navbar/              Modification selector shown on Assessment main-tab
├── modification-list/                Dropdown list of modifications
├── add-modification/                 Modal form for creating a new modification
├── explore-phast-opportunities/      Simplified "what-if" assessment sub-mode
├── phast-report/                     Report tab; sub-components for charts, sankey, summaries
├── phast-diagram/                    Placeholder diagram component (empty ngOnInit)
├── phast-calculator-tabs/            Integrated calculators tab container
├── help-panel/                       Contextual help sidebar
├── invalid-phast/                    Shown when assessment data is too incomplete to render
├── welcome-screen/                   First-launch modal overlay
└── docs/                             Developer documentation (this folder)
```

## Component Tree

```
PhastComponent  (phast/:id)
├── PhastBannerComponent              always visible; reads PhastService.mainTab
├── PhastTabsComponent                visible when mainTab === 'baseline'
│   └── [step tabs 1–5]
├── ModificationNavbarComponent       visible when mainTab === 'assessment'
│   └── ModificationListComponent
├── LossesTabsComponent               visible on baseline step 2 or assessment (non-explore)
├── PhastCalculatorTabsComponent      visible when mainTab === 'calculators'
│
│   [main content area — conditional on mainTab + stepTab]
│
├── SystemBasicsComponent             baseline / step 1
├── LossesComponent                   baseline / step 2 (and assessment modify-conditions)
│   └── [loss-type child components, one per visible LossTab]
├── AuxEquipmentComponent             baseline / step 3
├── DesignedEnergyComponent           baseline / step 4
├── MeteredEnergyComponent            baseline / step 5
├── ExplorePhastOpportunitiesComponent  assessment / explore-opportunities
├── PhastReportComponent              mainTab === 'report'
│   ├── ExecutiveSummaryComponent
│   ├── EnergyUsedComponent
│   ├── PhastInputSummaryComponent
│   ├── ReportGraphsComponent
│   └── ReportSankeyComponent
├── PhastDiagramComponent             mainTab === 'diagram'  (stub)
├── HelpPanelComponent                always rendered, toggled by flag
├── WelcomeScreenComponent            *ngIf showWelcomeScreen
└── [ngx-bootstrap modals: changeModification, addNew, updateUnits, export]
```

## State Management

**Source of truth:** `assessment.phast` in IndexedDB, surfaced via `AssessmentDbService`.

**Working copy:** On route activation `PhastComponent` deep-clones `assessment.phast` into `this._phast`. All child components receive `_phast` as an `@Input()` and emit changes up or mutate the reference in place. There is no ngrx / signals store — data flows through direct property binding and `@Output()` event emitters.

**Tab state:** `PhastService` owns four `BehaviorSubject`s that drive navigation:

| Subject | Type | Purpose |
|---|---|---|
| `mainTab` | `string` | Top-level tab: `baseline`, `assessment`, `report`, `sankey`, `diagram`, `calculators` |
| `stepTab` | `StepTab` | Active step within Baseline (steps 1–5) |
| `assessmentTab` | `string` | Sub-mode within Assessment: `explore-opportunities` or `modify-conditions` |
| `calcTab` | `string` | Active integrated calculator |

**Comparison state:** `PhastCompareService.selectedModification` (`BehaviorSubject<Modification>`) tracks which modification is being compared. Badge generation methods on the service are called by individual loss components to colour their inputs.

## DB Persistence Pattern

Saves are explicit and user-triggered. `PhastComponent.saveAssessment()` copies `_phast` back to `assessment.phast` then calls `AssessmentDbService.updateWithSettings(assessment)`. There is no debounce or auto-save timer. Navigating away from the route without an explicit save discards all in-progress changes.

Unit conversion is applied at save time when `settings.unitsOfMeasure` differs from `phast.lossDataUnits`: `ConvertPhastService` converts the entire loss tree between Imperial and Metric and updates `lossDataUnits` on the stored object.

## Service Inventory

| Service | Responsibility |
|---|---|
| `PhastService` | Tab navigation BehaviorSubjects; per-loss calculation wrappers that handle unit conversion before delegating to `ProcessHeatingApiService` |
| `PhastResultsService` | Aggregates individual loss results into a single `PhastResults` object for both baseline and each modification |
| `PhastValidService` | Produces `PhastValid` — runs each loss category's form validation and returns one boolean per category plus a composite `isValid` |
| `PhastCompareService` | Holds `selectedModification`; exposes badge-generation methods used by loss form components to highlight changed fields |
| `ConvertPhastService` | Full Imperial ↔ Metric conversion for every field in `PHAST.losses`, `auxEquipment`, `meteredEnergy`, `designedEnergy`, and `operatingCosts` |
| `PhastIntegrationService` | Maps baseline and modifications to the cross-tool `IntegratedAssessment` and `TreasureHuntOpportunity` formats |
| `LossesService` | Computes the dynamic set of visible `LossTab`s based on furnace/energy type; provides form initialisation helpers |
| `AuxEquipmentService` | Calculates total auxiliary power draw from the `AuxEquipment[]` array |
| `PhastReportService` | Assembles report-ready data structures from `PhastResults` for chart/table components |
| `ExecutiveSummaryService` | Derives the executive summary metrics (energy savings, cost savings, payback) across modifications |
| `Co2SavingsPhastService` | Computes CO₂ emissions and savings using user-supplied `PhastCo2SavingsData` |
| `EnergyInputService` | EAF energy-input calculation wrapper |
| `EnergyInputExhaustGasService` | Exhaust-gas losses calculation wrapper for non-EAF electric/fuel combined mode |
| `ExhaustGasService` | EAF exhaust-gas calculation wrapper |

## Shared Modules Consumed

| Module | Purpose |
|---|---|
| `PhastSankeyModule` | Shared sankey diagram — reused inside both the Report tab and the Sankey main-tab |
| `UpdateUnitsModalModule` | Modal for confirming unit-system change on an existing assessment |
| `ImportExportModule` | Assessment-level JSON export modal |
| `SettingsModule` | Settings form used inside the banner |
| `PreAssessmentModule`, `O2EnrichmentModule`, `EnergyEquivalencyModule`, `EnergyUseModule`, `FlueGasModule`, `UtilitiesModule` | Integrated calculators shown on the Calculators tab |

## Angular Patterns in Use

- **Change detection:** default (`CheckAlways`); no `OnPush` on the root component.
- **Standalone components:** `standalone: false` on all PHAST components — they are declared in `PhastModule`.
- **Reactivity:** `BehaviorSubject` / `Subscription` (RxJS). No Angular signals or `inject()` function usage in the core files.
- **Template control flow:** classic `*ngIf` / `*ngFor` structural directives throughout; no `@if` / `@for` block syntax.
- **Modals:** ngx-bootstrap `ModalDirective` with `@ViewChild` references; not Angular CDK Dialog.
- **Forms:** Template-driven (`FormsModule`, `[(ngModel)]`); no reactive forms in the root component.
