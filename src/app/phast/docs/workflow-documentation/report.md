**Date Generated:** May 31, 2026

# Report View

The Report view presents the complete output of a PHAST assessment. It is available once the baseline is marked complete (`setupDone = true`). The report includes both the baseline results and the results for every modification (scenario) created during the analysis.

---

## Purpose

The Report answers the following questions for the user:

- How much energy does this system use today, and what does it cost?
- Where does the energy go? (The heat balance breakdown)
- How does each proposed improvement scenario compare to the baseline?
- What are the projected energy and cost savings?
- What are the CO₂ emissions, and how much can be reduced?
- What were the exact inputs that produced these results?

The report is designed to be printable and exportable as a summary of the assessment.

---

## Report Tabs

### Energy Used

A summary of all energy inputs for the system, presented in a three-column layout:

| Column | Source |
|---|---|
| PHAST Calculated | Derived from the heat balance (Steps 2–3) |
| Designed | From Design Energy Use (Step 4), if entered |
| Metered | From Metered Energy (Step 5), if entered |

**Rows shown:**

- Hourly energy input (MMBtu/hr or GJ/hr)
- Annual energy input (MMBtu/yr or GJ/yr)
- Annual energy cost ($)
- Specific energy intensity (MMBtu/ton or GJ/tonne of charge)
- Available heat percentage (fuel-fired systems)
- Heating system efficiency (%)

If fuel, electricity, and steam are all in use, each energy type is reported separately with appropriate units.

---

### Executive Summary

A high-level comparison of the baseline against each modification scenario. For each scenario, the table shows:

| Metric | Description |
|---|---|
| Annual energy (MMBtu/yr or GJ/yr) | Total energy consumed |
| Annual energy cost ($/yr) | Total energy cost |
| Heating efficiency (%) | Energy delivered to charge ÷ total input |
| Energy savings vs. baseline (MMBtu/yr) | Reduction from baseline |
| Cost savings vs. baseline ($/yr) | Annual dollar savings |
| % improvement | Percentage reduction in energy |
| CO₂ emissions (tonnes/yr) | Calculated from energy consumption and emission factors |
| CO₂ reduction vs. baseline | Emissions saved by the scenario |

This tab is intended as a one-page executive-level summary suitable for presenting to management or including in a facility energy audit report.

---

### Input Summary

A read-only, organized display of all data entered during the baseline setup. This tab is structured to mirror the data entry flow, showing one section per loss type.

**Purpose:** To allow reviewers to verify the inputs used in the assessment, and to provide a permanent record of what was measured or estimated.

**Sections (same structure as the loss tabs in Step 2):**

- Assessment Settings (furnace type, energy source, operating hours, costs)
- Operating Conditions and Equipment Notes
- Charge Material (one row per material entry)
- Flue Gas (with flue gas analysis data)
- Wall Losses (one row per wall entry)
- Fixture/Tray Losses
- Opening Losses
- Cooling Losses
- Atmosphere Losses
- Gas Leakage Losses
- Extended Surface Losses
- Slag Losses (EAF)
- Exhaust Gas (EAF)
- Energy Input (EAF)
- Auxiliary Power
- Other Losses

Each section shows field labels and entered values in the current unit system.

---

### Graphs

Visual representations of the energy breakdown and scenario comparisons.

**Charts included:**

- **Loss category bar chart** — Shows each loss type as a horizontal bar, proportional to the heat loss rate. The baseline and each modification are overlaid or shown side-by-side.
- **Energy intensity comparison** — Bar chart comparing specific energy intensity across baseline and all scenarios.
- **Annual energy cost comparison** — Bar chart of total annual cost for each scenario.

These charts are automatically generated from the calculated results and do not require additional user input.

---

### Report Sankey

A Sankey energy-flow diagram specific to the report context. This view mirrors the standalone Sankey tab but is embedded within the report for print inclusion.

The Sankey shows:
- Total energy input entering from the left
- Energy distributed across all loss categories as parallel flows
- A final "useful heat" flow representing energy delivered to the charge
- Percentage labels on each flow branch

Users can select which scenario's Sankey to display (baseline or any modification) via a dropdown.

---

### Results Data

A detailed numerical table of all calculated results. This tab is designed for engineers who need the specific heat loss values for each category, not just the totals.

**Rows (one per loss type):**
- Heat loss rate (BTU/hr or kW) for each entered item
- Subtotal per category
- Total all losses
- Total input energy
- Heating efficiency
- Available heat (fuel-fired)

**Columns:** Baseline + one column per modification

This table can be used to audit or spot-check the heat balance, and to understand exactly how much each loss category contributes to the overall energy picture.

---

## Sankey Visualization (Standalone Tab)

The **Sankey** main tab (accessible via the top navigation, separate from the Report view) provides an interactive standalone version of the energy-flow diagram.

### Controls

- **Scenario selector** — If multiple modifications exist, a dropdown lets the user choose which scenario's Sankey to view. The dropdown appears only when more than one option (baseline + modifications) is available.
- **Label style** — A button group toggles the label content displayed on each flow segment:
  - **Loss Percent** — Shows each loss as a percentage of total input
  - **Loss Power** — Shows the absolute heat loss rate (BTU/hr or kW)
  - **Both** — Shows both values

### Reading the Sankey

- The leftmost block represents total energy input.
- Each horizontal band flowing out to the right is one loss category.
- The width of each band is proportional to the energy in that loss.
- The bottom-most band is "useful heat" — energy delivered to the charge.
- The efficiency percentage is displayed prominently.

---

## Print and Export

The report view includes a **Print** action that renders the report in a print-friendly format, suppressing navigation and control elements. The print layout includes:

- Assessment name and date
- Executive Summary table
- Input Summary sections
- Energy Used table
- Sankey diagram (rendered for print)
- Graphs

---

## Related

- `src/app/phast/phast-report/` — Report container component and all sub-sections
- `src/app/shared/phast-sankey/` — Sankey diagram component (shared, used by both standalone and report)
- `src/app/phast/phast-results.service.ts` — Source of all calculated values shown in the report
- See [modifications-and-scenarios.md](modifications-and-scenarios.md) for how modification data feeds into the report
