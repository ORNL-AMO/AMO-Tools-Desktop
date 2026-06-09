**Date Generated:** May 31, 2026

# Step 1: Assessment Settings (System Basics)

The first step of baseline data entry. This is where the user describes the furnace or heating system they are assessing, selects the governing energy source, and specifies the economic and operational context for the entire assessment.

---

## Purpose

Assessment Settings establishes the fixed context for all subsequent calculations. The furnace type and energy source selected here control which loss categories appear in Step 2. The cost and operating-hour values entered here are used throughout to convert energy quantities into annual cost and CO₂ impact figures.

---

## What the User Configures

### Application Settings

General MEASUR application-level settings that apply to this assessment:

- **Unit system** — Imperial or Metric. Changing this after loss data has been entered will trigger the unit-conversion flow and prompt the user to confirm data conversion.
- **Currency** — Used for cost display throughout the assessment.

### PHAST Settings

Settings specific to the furnace assessment:

- **Furnace type** — Selects the physical category of the heating system being assessed. The available types are:
  - Fuel-fired (default, most industrial furnaces)
  - Electric Arc Furnace (EAF)
  - Electrotechnology (resistive, induction, infrared)
  - Custom (user-defined)
  
  This selection drives which loss tabs appear in the Heat Balance step and which energy input forms appear in Designed and Metered Energy steps.

- **Energy source** — The primary energy carrier: Fuel, Electricity, or Steam.

- **Fuel type** — If energy source is Fuel, the specific fuel type (natural gas, propane, etc.) and its heating value.

- **Operating hours per year** — The annual hours the furnace is in production. Used to convert instantaneous power losses to annual energy.

- **Fuel cost** ($/MMBtu or $/GJ) — Unit cost for fuel energy, used in cost calculations.

- **Electricity cost** ($/kWh) — Unit cost for electrical energy.

- **Steam cost** ($/1000 lb or $/tonne) — Unit cost for steam, if applicable.

> **Important:** Furnace type and energy source are locked once loss data exists in Step 2. A warning is shown if the user attempts to change these after losses have been entered, since doing so would require re-entering all loss data.

### Equipment Notes and Operating Conditions

Two free-text fields allow the user to record:

- **Equipment Notes** — Descriptive notes about the furnace equipment (model, age, physical characteristics)
- **Operating Conditions at time of Assessment** — Notes capturing the state of the system when measurements were taken (production rate, material throughput, ambient temperature, etc.)

These notes are preserved in the assessment record and appear in the Input Summary section of the Report.

---

## Validation

Assessment Settings is considered complete when:
- Furnace type is selected
- Energy source is selected
- Operating hours are entered (non-zero)
- At least one unit cost is entered for the applicable energy source

An incomplete Step 1 will show a validation warning icon on the Assessment Settings tab. The user can still navigate to Step 2, but the overall assessment will not be considered ready for analysis.

---

## Unit Conversion Behavior

If the user changes the unit system (Imperial ↔ Metric) after loss data has been entered in later steps, a modal prompt appears offering to automatically convert all existing loss data. Accepting triggers `ConvertPhastService` to walk all stored loss objects and apply unit factors to each numeric field. Declining leaves the numeric values unchanged, which will produce incorrect results — the reminder banner on this page will remain visible until the user explicitly dismisses or applies the conversion.

---

## Related

- `src/app/phast/system-basics/` — Component and template
- `src/app/shared/settings/phast-settings/` — PHAST-specific settings sub-form
- `src/app/shared/update-units-modal/` — Unit conversion confirmation modal
- See [losses-heat-balance.md](losses-heat-balance.md) for how furnace type affects available loss categories
