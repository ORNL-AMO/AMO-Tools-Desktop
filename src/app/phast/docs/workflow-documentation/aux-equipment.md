**Date Generated:** May 31, 2026

# Step 3: Aux Equipment

The Aux Equipment step captures the electrical power consumed by auxiliary systems associated with the furnace that are not already modeled in the Heat Balance step. This data is used to compute total facility energy input to the heating process, including infrastructure beyond the furnace itself.

---

## Purpose

Many furnace installations include peripheral equipment whose energy use is part of the overall system footprint but not part of the furnace heat balance: combustion air blowers, cooling water pumps, material handling drives, exhaust fans, and control systems. The Aux Equipment step accounts for these loads so that total energy use and efficiency metrics reflect the whole system, not just the furnace enclosure.

---

## What the User Configures

The user builds a list of auxiliary equipment items. For each item:

| Field | Description |
|---|---|
| Equipment name | A label for the item (e.g., "Combustion Air Blower", "Cooling Water Pump") |
| No. of units | Count of identical units |
| Motor power (hp or kW) | Rated power of the motor driving the equipment |
| Load factor | Fraction of rated power at which the motor typically operates (0–1) |
| Motor efficiency | Motor nameplate efficiency (fraction) |
| Hours per year | Annual operating hours for this piece of equipment |

PHAST uses these values to calculate the annual kWh consumed by each item and accumulates a total auxiliary power load.

---

## Relationship to the Heat Balance

The auxiliary equipment power does not appear as a loss in the Heat Balance section. It is added to the total system energy input on top of the fuel or primary electrical energy used in the furnace itself. This allows the report to show:

- **Furnace efficiency** — heat delivered to the charge divided by furnace energy input alone
- **System efficiency** — heat delivered to the charge divided by total site energy (furnace + auxiliaries)

Both metrics appear in the Report section, giving users visibility into how much auxiliary infrastructure affects overall system efficiency.

---

## Multiple Entries

Any number of equipment items can be added. If the furnace has no significant auxiliary loads, this step can be left empty — it does not block the `setupDone` flag.

---

## Related

- `src/app/phast/aux-equipment/` — Component, form, results, and help
- `src/app/phast/phast-results.service.ts` — Incorporates aux equipment load into total energy calculations
