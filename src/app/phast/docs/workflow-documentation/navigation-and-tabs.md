**Date Generated:** May 31, 2026

# Navigation and Tab Structure

PHAST uses a three-level tab hierarchy to organize the user experience: the main tab selects the current view mode, step tabs sequence the user through baseline data entry, and loss tabs (in the Heat Balance step) navigate between individual loss categories.

---

## Main Tabs

The banner navigation exposes the top-level views. Tabs that require a completed baseline are gated behind the `setupDone` flag.

| Tab ID | Label | Gated | Description |
|---|---|---|---|
| `baseline` | Baseline | No | Five-step sequential data entry for the current system |
| `assessment` | Assessment | Yes | Scenario analysis — Explore Opportunities or Modify Conditions |
| `report` | Report | Yes | Full output: energy breakdown, executive summary, graphs |
| `sankey` | Sankey | Yes | Interactive energy-flow diagram |
| `diagram` | Diagram | No | System diagram placeholder |
| `calculators` | Calculators | No | Embedded standalone calculators |

---

## Baseline Step Tabs

When `mainTab == 'baseline'`, a horizontal step-tab bar appears beneath the banner. The five steps must be completed in order; navigation back to any previous step is always available.

| Step | Tab Name | Component |
|---|---|---|
| 1 | Assessment Settings | `SystemBasicsComponent` |
| 2 | Heat Balance | `LossesComponent` |
| 3 | Aux Equipment | `AuxEquipmentComponent` |
| 4 | Design Energy Use | `DesignedEnergyComponent` |
| 5 | Metered Energy | `MeteredEnergyComponent` |

A **Back** and **Next** button in the footer drive sequential navigation between steps. Step 2 (Heat Balance) additionally shows the loss-type tab bar directly below the step tabs.

---

## Heat Balance Loss Tabs

When the user is on Baseline Step 2, or in Assessment mode viewing **Modify Conditions**, a secondary tab bar appears listing the applicable loss types. The visible tabs depend on the furnace type and energy source configured in Step 1.

### Always-visible Tabs

These tabs appear for all furnace configurations:

| Tab | Description |
|---|---|
| Fixtures, Trays, etc. | Losses from fixtures, trays, and other heated objects inside the furnace |
| Wall | Heat conducted through furnace walls and roof |
| Cooling | Heat removed by water-cooled components |
| Atmosphere | Energy required to heat the furnace atmosphere gas |
| Opening | Radiation and convection loss through door and wall openings |
| Gas Leakage | Heat carried out by leaking gases |
| Extended Surface | Losses from pipes, ducts, and other surfaces outside the furnace |
| Other | Catch-all for losses not covered by other categories |

### Fuel-Fired Furnace Tabs

Additional tabs shown when the energy source is fuel:

| Tab | Description |
|---|---|
| Flue Gas | Heat carried out by combustion flue gases (can be calculated by mass or volume) |
| Charge Material | Energy needed to heat the material being processed (solid, liquid, or gas) |
| Operations | Operating hours and cost data; CO₂ savings settings |

### Electric Arc Furnace (EAF) Tabs

Additional tabs shown for EAF configurations:

| Tab | Description |
|---|---|
| Energy Input | Electrical energy input and real/reactive power data |
| Exhaust Gas | Heat carried out by EAF exhaust gases |
| Slag | Heat carried out in the slag |
| Charge Material | Energy to heat charge materials |
| Auxiliary Power | Energy consumed by auxiliary electrical equipment |
| Operations | Operating hours and cost data |

### Electrotechnology and Steam Tabs

Additional tabs shown for resistive electric heaters and steam-heated systems:

| Tab | Description |
|---|---|
| Energy Input Exhaust Gas | Combined energy input and exhaust gas losses for electric heating |
| Heat System Efficiency | Overall system efficiency for electrotechnology or steam inputs |
| Charge Material | Energy to heat charge materials |
| Operations | Operating hours and cost data |

### Loss Tab Behaviors

- Tabs that support multiple individual loss entries (e.g., Wall, Cooling, Opening) show an **Add** button that appends a new entry.
- Atmosphere losses have a fixed single entry (no Add).
- Each tab entry shows inline calculated results next to the form inputs.
- A **Results Panel** sidebar running the length of the loss section shows cumulative totals across all categories.
- A help panel (shown as a second column or toggled on small screens) provides field-level explanations for the active tab.

---

## Assessment Sub-Tabs

When `mainTab == 'assessment'`, a modification navbar replaces the step tabs. It displays:

- A dropdown or button list of all saved modifications (scenarios) by name
- An **Add New Modification** button
- The two assessment sub-tabs: **Explore Opportunities** and **Modify Conditions**

| Sub-Tab ID | Description |
|---|---|
| `explore-opportunities` | Interactive opportunity panel; no loss tabs shown |
| `modify-conditions` | Full loss tab bar; edits the selected modification's data |

---

## Report Sub-Tabs

When `mainTab == 'report'`, the report view has its own internal tab structure:

| Tab | Description |
|---|---|
| Energy Used | Annual and hourly energy consumption by fuel/electricity/steam type |
| Executive Summary | High-level efficiency and savings comparison across all scenarios |
| Input Summary | Read-only display of all entered data for each loss category |
| Graphs | Loss distribution bar charts and comparison graphs |
| Results Data | Detailed numerical results table for baseline and all modifications |

---

## Calculator Sub-Tabs

When `mainTab == 'calculators'`, the following standalone tools are available:

| Tab | Tool |
|---|---|
| Energy Equivalency | Convert between energy units and fuel types |
| Energy Use | Calculate energy consumption from operating parameters |
| O₂ Enrichment | Combustion air enrichment analysis |
| Pre-Assessment | Quick furnace efficiency pre-assessment |
| Unit Converter | General engineering unit conversion |

---

## Small-Screen Behavior

On small screens, Step 1 (Assessment Settings) collapses into two sub-tabs: **Assessment Settings** (the form) and **Help** (the help panel). The loss step similarly collapses the help panel to a toggle. This ensures the forms remain usable on narrower viewports.
