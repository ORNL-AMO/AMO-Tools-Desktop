**Date Generated:** May 31, 2026

# Step 4: Design Energy Use

The Design Energy Use step lets the user specify the theoretical energy input the furnace was designed for. This creates a comparison point between the original design intent and what PHAST calculates from the actual heat balance, revealing how far current operation has drifted from the designed operating point.

---

## Purpose

Furnaces are designed to operate at a specific throughput and energy input. Over time, operational changes — different material mixes, modified schedules, equipment wear — may cause the furnace to operate differently than designed. By recording the design parameters, PHAST can answer: *is this furnace running near its design point, or has it drifted significantly?*

This comparison is informational. It does not affect the heat balance calculation or the modification analysis. It is one of three energy "lenses" PHAST provides alongside the heat balance (PHAST-calculated) and measured (metered) values.

---

## Energy Source Forms

The user sees one or more sub-forms depending on the energy sources configured in Step 1. For each applicable energy type, the user enters the design-point data.

### Fuel (Design)

| Field | Description |
|---|---|
| Fuel type | The fuel the furnace was designed to use |
| Fuel flow rate | Design-point fuel consumption (e.g., MMBtu/hr or GJ/hr) |
| Available heat | The fraction of fuel energy available to the load at design conditions |
| Hourly heat input | Calculated from flow rate and heating value |

PHAST computes annual energy (hourly × operating hours) and compares it to the PHAST-calculated heat requirement.

### Electricity (Design)

| Field | Description |
|---|---|
| Electrical power | Designed electrical power input (kW) |
| Demand charge | Applicable demand charge ($/kW-month), if relevant |

### Steam (Design)

| Field | Description |
|---|---|
| Steam flow rate | Design-point steam consumption (lb/hr or kg/hr) |
| Steam pressure and temperature | Steam conditions at the design point |
| Total heat in steam | Enthalpy of the steam at design conditions |

---

## Results Display

After entering design values, PHAST shows a side-by-side comparison:

| Column | Source |
|---|---|
| PHAST | Calculated from the heat balance entries in Step 2 |
| Designed | The values just entered in this step |
| Metered | Measured values entered in Step 5 (shown if already entered) |

Metrics shown in the comparison include hourly heat input, annual energy consumption, and energy intensity (energy per unit of production).

---

## Optional Step

Design Energy Use does not contribute to the `setupDone` check. The step can be left blank if the original design data is unavailable. In that case, the Designed column in the report will simply be empty.

---

## Related

- `src/app/phast/designed-energy/` — Component, forms (fuel, electricity, steam), results, and help
- See [metered-energy.md](metered-energy.md) for the measured counterpart
- See [report.md](report.md) for how Designed, PHAST, and Metered are presented together
