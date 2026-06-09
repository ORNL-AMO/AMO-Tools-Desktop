**Date Generated:** May 31, 2026

# PHAST — Process Heating Assessment and Survey Tool

PHAST is a comprehensive furnace and industrial heating system assessment tool. It guides engineers through systematic energy accounting for a heating system, calculates where energy is lost, and enables scenario analysis to identify and quantify efficiency improvement opportunities.

---

## Purpose

Users work through PHAST to:

- Characterize a furnace or heating system (type, energy source, operating parameters, costs)
- Quantify every category of heat loss in the system (the "heat balance")
- Reconcile the PHAST-calculated energy requirement against what was actually designed and metered
- Create "what-if" modification scenarios to test the impact of operational or equipment changes
- Generate reports showing energy use, efficiency, CO₂ emissions, and cost savings

---

## Assessment Lifecycle

A PHAST assessment moves through two distinct phases:

**Setup (Baseline Entry):** The user enters all data about the system as it currently exists. This phase has five sequential steps:

1. **Assessment Settings** — Configure furnace type, energy source, costs, and operating hours
2. **Heat Balance** — Enter each category of heat loss for the furnace
3. **Aux Equipment** — Add auxiliary equipment (motors, fans, blowers) and their power draw
4. **Design Energy Use** — Specify the theoretical designed energy input for comparison
5. **Metered Energy** — Enter actual measured energy consumption for comparison

Once all required data is entered, the assessment is marked complete (`setupDone = true`) and the user can proceed to the analysis phase.

**Analysis (Assessment + Report):** The user explores and quantifies improvements:

- **Explore Opportunities** — An interactive "what-if" panel where individual loss categories can be adjusted to instantly see energy and cost savings
- **Modify Conditions** — Full loss editing for named scenarios (modifications), enabling side-by-side comparison of the baseline against multiple scenarios
- **Report** — A comprehensive output view with charts, sankey diagrams, input summaries, and an executive summary

---

## Module Navigation

The top-level navigation tabs visible to the user are:

| Tab | Available When | Description |
|---|---|---|
| Baseline | Always | Step-by-step setup of the baseline assessment |
| Assessment | After `setupDone = true` | Scenario analysis: Explore Opportunities or Modify Conditions |
| Report | After `setupDone = true` | Full reporting and output |
| Sankey | After `setupDone = true` | Interactive energy-flow diagram |
| Diagram | Always | System diagram (placeholder view) |
| Calculators | Always | Integrated engineering calculators |

---

## Directory Structure

```
src/app/phast/
├── phast.component.ts/.html          Main container — tab routing, save/load, global state
├── phast.service.ts                  Tab state management (mainTab, stepTab, assessmentTab)
├── phast-results.service.ts          Calculation engine — computes all loss totals and efficiency
├── phast-valid.service.ts            Validation — checks data completeness, produces PhastValid
├── phast-compare.service.ts          Baseline vs modification comparison logic and badges
├── convert-phast.service.ts          Unit conversion for all loss data (Imperial ↔ Metric)
├── phast-integration.service.ts      Integration hooks with the broader MEASUR shell
├── tabs.ts                           Tab configuration arrays (stepTabs, lossTabs)
│
├── system-basics/                    Step 1: Assessment Settings form
├── losses/                           Step 2: Heat Balance (all loss types)
│   ├── losses.service.ts             Loss tab configuration by furnace/energy type
│   ├── atmosphere-losses/
│   ├── auxiliary-power-losses/
│   ├── charge-material/
│   ├── cooling-losses/
│   ├── energy-input/
│   ├── energy-input-exhaust-gas-losses/
│   ├── exhaust-gas/
│   ├── extended-surface-losses/
│   ├── fixture-losses/
│   ├── flue-gas-losses/
│   ├── gas-leakage-losses/
│   ├── heat-system-efficiency/
│   ├── opening-losses/
│   ├── operations/
│   ├── other-losses/
│   ├── slag/
│   ├── wall-losses/
│   ├── losses-result-panel/          Running totals sidebar
│   ├── losses-splash-page/           Empty-state prompt before any losses added
│   ├── losses-tabs/                  Tab navigation for each loss type
│   ├── losses-help/                  Context-sensitive help per loss type
│   └── notes/                        Per-loss notes field
│
├── aux-equipment/                    Step 3: Auxiliary Equipment
├── designed-energy/                  Step 4: Design Energy Use
├── metered-energy/                   Step 5: Metered Energy
│
├── explore-phast-opportunities/      Assessment: Explore Opportunities panel
├── modification-list/                Modification management list
├── modification-navbar/              Scenario selector navbar in Assessment mode
├── add-modification/                 Add new modification dialog
│
├── phast-report/                     Report view and all sub-sections
│   ├── energy-used/
│   ├── executive-summary/
│   ├── phast-input-summary/          Read-only display of all entered loss data
│   ├── report-graphs/
│   ├── report-sankey/
│   └── results-data/
│
├── phast-calculator-tabs/            Calculators tab navigation
├── phast-banner/                     Assessment header/title bar
├── phast-tabs/                       Baseline step tab bar
├── help-panel/                       Contextual help sidebar
├── invalid-phast/                    Invalid/incomplete assessment messaging
├── phast-diagram/                    Diagram view placeholder
└── welcome-screen/                   Initial welcome screen
```

---

## Key Concepts

### Furnace Types and Energy Sources

The furnace type and energy source selection in Step 1 drive which loss categories appear in the Heat Balance. Not all loss types apply to all furnace configurations. The two primary dimensions are:

- **Energy source:** Fuel-fired, Electric, Steam
- **Furnace subtype:** Electric Arc Furnace (EAF), Electrotechnology, Custom

This combination determines the complete set of visible loss tabs in Step 2.

### The Heat Balance

The heat balance is the core of a PHAST assessment. For every category of heat loss, the user enters the physical parameters that describe the loss (temperatures, areas, flow rates, material properties). PHAST calculates a heat loss rate from those inputs and accumulates a total energy picture. The sum of all losses compared to total energy input yields the system's heating efficiency.

### Modifications (Scenarios)

A modification is a complete copy of the baseline PHAST data that the user edits independently. Each modification represents a potential improvement scenario. The comparison service tracks which loss categories differ between the baseline and each modification, displaying colored badges ("Wall", "Cool", "Atmo", etc.) to indicate what changed.

### Validation

PHAST tracks two levels of readiness:
- `setupDone` — the minimum required data has been entered for the system to be analyzed
- `PhastValid` — a granular validation object with per-section and per-loss-type status flags

These states drive UI affordances such as whether the "Go to Assessment" button appears and whether the Report tab is accessible.

---

## Companion Documents

| Document | Description |
|---|---|
| [navigation-and-tabs.md](navigation-and-tabs.md) | Complete tab structure and navigation rules |
| [system-basics.md](system-basics.md) | Step 1: Assessment Settings |
| [losses-heat-balance.md](losses-heat-balance.md) | Step 2: All heat loss types and their inputs |
| [aux-equipment.md](aux-equipment.md) | Step 3: Auxiliary equipment |
| [designed-energy.md](designed-energy.md) | Step 4: Design Energy Use |
| [metered-energy.md](metered-energy.md) | Step 5: Metered Energy |
| [modifications-and-scenarios.md](modifications-and-scenarios.md) | Modification system and Explore Opportunities |
| [report.md](report.md) | Report view and all output sections |
| [services.md](services.md) | Service responsibilities reference |
| [validation.md](validation.md) | Validation system and setupDone logic |
