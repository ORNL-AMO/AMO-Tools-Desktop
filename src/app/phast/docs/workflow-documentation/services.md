**Date Generated:** May 31, 2026

# Services Reference

This document describes the responsibilities of each service in the PHAST module. Services are provided at the `PhastModule` level and injected throughout the component tree.

---

## PhastService

**File:** `phast.service.ts`

The primary state-management service for the PHAST module. It owns the navigation state and broadcasts changes to interested components.

**Responsibilities:**

- Tracks the currently active **main tab** (`baseline`, `assessment`, `report`, `sankey`, `diagram`, `calculators`)
- Tracks the currently active **step tab** (which of the five baseline steps is shown)
- Tracks the currently active **assessment sub-tab** (`explore-opportunities`, `modify-conditions`)
- Tracks the currently active **calculator sub-tab**
- Tracks the currently active **loss tab** (which loss category is shown within the Heat Balance)
- Manages the **modification index** (which scenario is currently selected for editing)
- Emits observables consumed by the banner, tab bars, and loss components to synchronize navigation state
- Coordinates modal open/close state (e.g., the operating costs modal)

---

## PhastResultsService

**File:** `phast-results.service.ts`

The calculation engine. This service receives the raw loss data and computes the complete heat balance results.

**Responsibilities:**

- Aggregates all individual loss entries into per-category heat loss totals (BTU/hr or kW)
- Calculates total energy input from the configured energy source
- Computes **heating system efficiency** — useful heat (charge material energy) divided by total energy input
- Computes **available heat percentage** for fuel-fired systems — the fraction of fuel energy not leaving through the flue gas
- Calculates annual energy (hourly rate × operating hours)
- Calculates annual energy cost (annual energy × unit cost)
- Computes CO₂ emissions from energy use and fuel/electricity emission factors
- Produces `PhastResults` objects for the baseline and each modification, consumed by the report and executive summary

---

## PhastValidService

**File:** `phast-valid.service.ts`

Validates the completeness of assessment data and determines whether the `setupDone` threshold has been met.

**Responsibilities:**

- Validates each loss type's entries for required fields and numeric completeness
- Validates that at least one loss entry exists for each required loss category (given the furnace/energy type)
- Validates Operations data (operating hours, charge mass)
- Validates energy costs and unit configuration
- Produces a `PhastValid` object with per-section boolean flags — consumed by the banner, tab status indicators, and the "Go to Assessment" gate
- Sets the `setupDone` flag on the PHAST data object when the minimum viable assessment is complete

---

## PhastCompareService

**File:** `phast-compare.service.ts`

Compares the baseline PHAST data against each modification to identify what changed.

**Responsibilities:**

- Compares corresponding loss entries field-by-field between baseline and a given modification
- Determines which loss categories have at least one differing value
- Produces the set of **comparison badges** (e.g., "Wall", "Cool", "Atmo") shown on loss tabs in Modify Conditions view
- Provides methods that components query to check whether a specific loss type has any differences
- Drives the visual differentiation in the modification navbar and loss tab headers

---

## ConvertPhastService

**File:** `convert-phast.service.ts`

Handles unit system conversion of all persisted PHAST data.

**Responsibilities:**

- Converts every numeric field in every loss entry from one unit system to another (Imperial → Metric or Metric → Imperial)
- Applies the correct conversion factor for each physical quantity (temperature, area, mass flow, heat rate, etc.)
- Converts data for both the baseline and all modifications in a single pass
- Called when the user confirms a unit system change in the Assessment Settings step
- Does not affect string or categorical fields (material type selections, fuel type labels)

---

## LossesService

**File:** `losses/losses.service.ts`

Configures which loss categories are applicable for the current furnace type and energy source.

**Responsibilities:**

- Reads the furnace type and energy source from the PHAST settings
- Returns the ordered list of loss tabs to display in the Heat Balance step and in Modify Conditions
- Determines which loss types are "required" (must have at least one entry for `setupDone`)
- Evaluates `checkSetupDone()` — whether the entered losses meet the minimum data requirements for the given furnace configuration

---

## Individual Loss Services

Each loss category has its own service (e.g., `WallLossesService`, `CoolingLossesService`, `FlueGasService`, etc.) located inside its corresponding component folder.

**Common responsibilities across all loss services:**

- Generate the reactive form group for a single loss entry, including default values and validators
- Calculate the heat loss rate from the form values using the appropriate physical formula
- Provide helper methods for form state (checking validity, getting display labels)

Loss services are not provided at the module level — they are provided at the component level and scoped to the individual loss tab they serve.

---

## DesignedEnergyService

**File:** `designed-energy/designed-energy.service.ts`

**Responsibilities:**

- Calculates the designed hourly and annual energy values from the user's design-point inputs
- Computes the comparison result object (PHAST vs Designed) displayed in Step 4
- Handles form initialization for fuel, electricity, and steam design energy forms

---

## MeteredEnergyService

**File:** `metered-energy/metered-energy.service.ts`

**Responsibilities:**

- Calculates hourly energy rate from total collected energy over a metering period
- Computes the comparison result object (PHAST vs Metered) displayed in Step 5
- Handles form initialization and normalization for each metered energy type (fuel, electricity, steam)

---

## AuxEquipmentService

**File:** `aux-equipment/aux-equipment.service.ts`

**Responsibilities:**

- Generates the form group for an individual auxiliary equipment entry
- Calculates annual energy consumption for each item (hp × load factor × efficiency × hours × 0.746 kW/hp)
- Aggregates total auxiliary power demand across all items
- Results are incorporated into PhastResults by PhastResultsService

---

## OperationsService

**File:** `losses/operations/operations.service.ts`

**Responsibilities:**

- Manages the operations data form (operating hours, charge mass per hour, CO₂ reference data)
- Calculates operating cost summary (annual fuel/electricity/steam cost with operating context)
- Manages CO₂ savings calculation data used in modification comparison reports
