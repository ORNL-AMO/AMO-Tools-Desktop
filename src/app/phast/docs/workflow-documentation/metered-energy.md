**Date Generated:** May 31, 2026

# Step 5: Metered Energy

The Metered Energy step captures actual measured energy consumption data from utility meters, flow meters, or plant historians. This grounds the PHAST analysis in real-world observations and reveals any discrepancy between what the heat balance model calculates and what the facility actually consumes.

---

## Purpose

The PHAST heat balance in Step 2 is a model — it calculates energy from the physical parameters of losses. Metered Energy is reality — it is what the meter actually recorded. Comparing the two answers the question: *does our model agree with the real-world measurement?*

Significant disagreement between the PHAST-calculated value and the metered value may indicate:

- Missing loss entries (a loss category was not modeled)
- Incorrectly measured physical parameters in the heat balance
- Unmeasured gains or losses (air infiltration, unaccounted heat generation)
- Meter inaccuracies

This check helps users validate their heat balance before drawing conclusions or identifying improvements.

---

## Energy Source Forms

The user sees one or more sub-forms based on the energy sources configured in Step 1.

### Metered Fuel

| Field | Description |
|---|---|
| Fuel type | The fuel being measured |
| Hourly fuel consumption | Measured fuel flow rate (e.g., MCF/hr, MMBtu/hr) |
| Heating value | The measured or specified heating value of the fuel |
| Collected fuel data | Option to enter total consumption over a data collection period rather than an hourly rate |

If a collection-period total is entered, PHAST normalizes it to an hourly rate using the specified collection duration.

### Metered Electricity

| Field | Description |
|---|---|
| Energy demand (kW) | Average measured electrical demand |
| Hours collected | Duration of the data collection period |
| Total electricity used (kWh) | Total measured consumption for the period |

PHAST derives hourly kW from total kWh ÷ hours.

### Metered Steam

| Field | Description |
|---|---|
| Steam flow rate | Measured steam mass flow (lb/hr or kg/hr) |
| Steam pressure and temperature | Conditions at the meter location |
| Total heat delivered | Calculated from mass flow and steam enthalpy |

---

## Results Display

After entering metered values, PHAST shows the three-way energy comparison:

| Column | Source |
|---|---|
| PHAST | Calculated from the heat balance (Steps 2–3) |
| Designed | Entered in Step 4 |
| Metered | Entered in this step |

Metrics compared include hourly energy input, annual energy, and specific energy intensity. A percentage difference between PHAST and Metered helps the user judge the quality of their model.

---

## Optional Step

Metered Energy does not contribute to the `setupDone` check. The step can be left blank if measured data is not available. In that case, the Metered column in the report will be empty and no PHAST-vs-Metered comparison will appear.

---

## Related

- `src/app/phast/metered-energy/` — Component, forms (fuel, electricity, steam), results, and help
- See [designed-energy.md](designed-energy.md) for the design-point counterpart
- See [report.md](report.md) for how all three values appear in the Energy Used report tab
