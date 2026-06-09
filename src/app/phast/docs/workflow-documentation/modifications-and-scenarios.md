**Date Generated:** May 31, 2026

# Modifications and Scenario Analysis

After baseline data entry is complete, PHAST shifts into its analysis phase. The assessment tab offers two complementary approaches for evaluating improvement opportunities: **Explore Opportunities** (a guided, toggleable what-if panel) and **Modify Conditions** (full access to the heat balance for a named scenario).

---

## The Modification System

A **modification** (also called a **scenario**) is a complete, independent copy of the baseline PHAST data. Users create modifications to model potential improvements — replacing insulation, reducing excess air, closing doors more often, changing material temperatures — and compare the resulting energy use and costs against the baseline.

### Creating a Modification

Modifications are created in two ways:

1. **From Explore Opportunities** — when a user saves an opportunity scenario, it is stored as a named modification.
2. **From the Add New Modification button** — in the modification navbar, the user can create a blank modification initialized from the current baseline. Modifications are auto-named "Scenario 1", "Scenario 2", etc. (the user can rename them).

There is no practical limit on the number of modifications.

### Selecting a Modification

The **modification navbar** (shown when `mainTab == 'assessment'`) displays all modifications as selectable items. The currently active modification determines which data is shown in both the Explore Opportunities and Modify Conditions sub-tabs.

### What a Modification Stores

Each modification is a full copy of the `PHAST` data object, including all loss entries from the baseline. Additionally, each modification stores:

- `notes` — per-loss-category text notes documenting the proposed change
- `exploreOpportunities` flag — whether this modification was created through the Explore panel
- Individual `exploreOppsShow*` flags (one per opportunity type) — which opportunity toggles are active

---

## Explore Opportunities

The Explore Opportunities panel provides a simplified, high-level interface for quickly evaluating common improvement opportunities without manually editing every loss form.

### How It Works

The panel shows a list of improvement opportunities grouped by loss category. Each opportunity has a toggle. When toggled on, an inline form appears with key adjustable parameters (simpler than the full loss form) and the panel immediately calculates and displays the estimated energy savings and annual cost savings for that change.

### Available Opportunity Areas

| Opportunity | What It Adjusts |
|---|---|
| Flue Gas | Excess air percentage, flue gas temperature |
| Charge Material | Charge inlet temperature (preheat opportunity) |
| Atmosphere | Atmosphere flow rate reduction |
| Cooling | Cooling water temperature differential |
| Wall | Wall insulation or temperature improvement |
| Opening | Reduce door-open time or opening area |
| Gas Leakage | Reduce leakage rate |
| Fixture/Tray | Reduce fixture weight or improve fixture management |
| Extended Surface | Improve insulation on external surfaces |
| Heat System Efficiency | Overall efficiency improvement (for electrotechnology) |
| Slag | Reduce slag temperature or quantity |
| Operations | Adjust operating hours or production rate |
| System Efficiency | Overall system efficiency target |

Each opportunity shown in the panel corresponds to a loss category from the baseline. Toggling an opportunity creates a modified version of that loss's data for the scenario.

### Comparison Display

The Explore panel shows results side-by-side:

- **Baseline values** on the left (read-only)
- **Modification values** on the right (editable via the simplified forms)
- **Savings calculated** in the results area: annual energy saved (MMBtu/yr or GJ/yr), annual cost saved ($/yr), and percentage improvement

### Saving Explore Opportunities

When the user is satisfied with an explored scenario, it is saved as the active modification. The individual opportunity toggles and their adjusted values are preserved so the modification reflects exactly what was explored.

---

## Modify Conditions

The Modify Conditions sub-tab gives full access to the heat balance forms for the selected modification. It renders the same loss tab interface as Baseline Step 2, but operates on the modification's data rather than the baseline.

### Editing Modifications

Any loss value can be edited in the modification without affecting the baseline. Changes are saved back to the modification's copy of the data. The baseline always remains unchanged as the reference point.

### Comparison Badges

When viewing a modification in Modify Conditions, the **comparison badges** feature highlights which loss categories differ from the baseline. Colored pills appear on each loss tab that has at least one changed value. Badge labels match the loss category name ("Wall", "Cool", "Atmo", etc.). This gives the user a quick visual summary of what changed in each scenario.

The `PhastCompareService` computes these badges by comparing corresponding loss entries between the baseline and the modification, field by field.

### Notes

Each loss tab in Modify Conditions includes a **notes field** specific to the modification. This allows users to document the rationale for each change (e.g., "Proposed: add 2" of ceramic fiber insulation to north wall").

---

## Scenario Comparison in Reports

All modifications created for an assessment are included in the Report view. The Executive Summary and Results Data tabs show baseline and all modifications side-by-side. See [report.md](report.md) for details on how comparison data is displayed.

---

## Related

- `src/app/phast/explore-phast-opportunities/` — Explore Opportunities panel and all sub-forms
- `src/app/phast/modification-list/` — Modification management UI
- `src/app/phast/modification-navbar/` — Scenario selector in Assessment mode
- `src/app/phast/add-modification/` — New modification dialog
- `src/app/phast/phast-compare.service.ts` — Badge generation and baseline-vs-modification comparison
- See [losses-heat-balance.md](losses-heat-balance.md) for descriptions of each loss category
