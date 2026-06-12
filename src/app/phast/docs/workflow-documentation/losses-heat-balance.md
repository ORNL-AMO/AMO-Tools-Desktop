**Date Generated:** May 31, 2026

# Step 2: Heat Balance (Losses)

The heat balance is the core data-entry section of PHAST. The user enters the physical characteristics of every mechanism by which heat leaves the furnace system — either as useful work or as waste — and PHAST calculates the corresponding energy rate for each category. The sum of all losses compared to total energy input yields the system's heating efficiency.

---

## Purpose

A heat balance answers the question: *where does the energy go?* By accounting for every loss heating system configuration, PHAST can tell the user what fraction of input energy actually heats the charge material (the product) versus what is wasted. This breakdown makes it possible to prioritize improvements.

---

## General Structure

Each loss type is presented as a tab in the Heat Balance tab bar. Most tabs support multiple individual entries (e.g., a furnace with three wall zones can have three separate wall loss entries). Each entry has:

- A **form** with physical parameters as inputs
- An inline **calculated result** (heat loss in BTU/hr or kW) updated live as values are entered
- An optional **notes field** for documentation

The **Results Panel** sidebar (visible alongside the loss forms) continuously accumulates all entered losses and shows running totals for each category and for the overall heat balance.

---

## Universal Loss Types

These tabs appear for every furnace type and energy source combination.

### Fixtures, Trays, etc.

**What it captures:** Heat absorbed by metal fixtures, trays, conveyor parts, baskets, and other reusable hardware that enters the furnace empty and exits heated.

**Inputs required:** Material type (from a lookup), total weight per cycle, number of cycles per hour, initial and final temperatures.

**Typical use:** Continuous furnaces with large fixture inventories that are cycled repeatedly through the furnace.

---

### Wall Losses

**What it captures:** Heat conducted through the furnace walls, roof, and floor by conduction through refractory layers.

**Inputs required:** Surface area, hot-face temperature, cold-face (ambient) temperature, and refractory thickness or insulation type.

**Multiple entries:** Yes — one entry per wall zone or surface type. This allows different wall thicknesses and refractory materials to be modeled separately.

---

### Cooling Losses

**What it captures:** Heat removed by water-cooled structural elements — door frames, hearth plates, electrode holders, or other water-cooled components internal or adjacent to the furnace.

**Inputs required:** Cooling water flow rate, inlet temperature, outlet temperature.

**Multiple entries:** Yes — one per cooled component or zone.

---

### Atmosphere Losses

**What it captures:** Energy required to heat the protective atmosphere gas from ambient temperature to furnace temperature when the furnace is opened or purged.

**Inputs required:** Gas type, flow rate, inlet and outlet temperatures.

**Single entry:** The atmosphere loss is modeled as a single entry (no Add button).

---

### Opening Losses

**What it captures:** Radiation and convection heat escaping through open furnace doors, windows, and other wall penetrations during operation.

**Inputs required:** Opening dimensions (height, width), furnace wall thickness, furnace temperature, time fraction the opening is active.

**Multiple entries:** Yes — one per opening or door.

---

### Gas Leakage Losses

**What it captures:** Heat carried out by gases leaking from the furnace enclosure — hot combustion products or protective atmosphere escaping through cracks, seals, or joints.

**Inputs required:** Leakage flow rate, gas temperature, gas composition.

**Multiple entries:** Yes — one per leakage point if known, or a single aggregate entry.

---

### Extended Surface Losses

**What it captures:** Radiation and convection from external surfaces of pipes, ducts, or other heated structures that extend outside the main furnace enclosure.

**Inputs required:** Surface area, surface temperature, ambient temperature.

**Multiple entries:** Yes — one per external surface type.

---

### Other Losses

**What it captures:** Any heat losses not covered by the other categories. This is a user-labeled miscellaneous entry.

**Inputs required:** A label and a direct heat loss value (the user enters the calculated or estimated loss rate directly).

**Multiple entries:** Yes.

---

## Fuel-Fired Furnace Loss Types

These tabs appear when the energy source is fuel (natural gas, propane, oil, etc.).

### Flue Gas Losses

**What it captures:** Heat carried out of the furnace by hot combustion exhaust gases leaving through the flue or stack. This is typically the largest single loss in a fuel-fired furnace.

**Two calculation methods:**

- **Volume-based:** The user provides flue gas volume flow, temperature, and composition. PHAST calculates heat content from gas properties.
- **Mass-based:** The user provides fuel consumption and excess air percentage. PHAST derives the flue gas mass flow from combustion stoichiometry.

Both methods also compute **available heat** — the fraction of fuel energy available to the load after accounting for flue gas losses. This is a key efficiency metric for combustion systems.

**Single entry per baseline/modification.**

---

### Charge Material

**What it captures:** The useful heat delivered to the product being heated — the energy that actually does the work of the process.

**Three material states:**

- **Solid:** A material heated from one temperature to another. Inputs include mass flow, specific heat, and initial/final temperatures. If the material melts during the process, a melting phase can be added with a heat of fusion.
- **Liquid:** Similar to solid but for already-molten or liquid materials.
- **Gas:** For processes that heat gaseous feedstocks or pass gases through the furnace as a product.

**Multiple entries:** Yes — a furnace may heat multiple materials in a single cycle (e.g., steel parts plus aluminum inserts).

---

### Operations

**What it captures:** The operational and economic context for the heat balance.

**Inputs:**

- **Operating hours** — Annual operating hours (can override the value from Step 1 settings for the heat balance calculation specifically)
- **Charge mass per hour** — The production rate (mass of material processed per hour)
- **CO₂ savings data** — Reference data for calculating emissions reduction in modification scenarios

This tab also contains the modal for viewing operating cost calculations.

---

## Electric Arc Furnace (EAF) Loss Types

These tabs appear when the furnace type is Electric Arc Furnace.

### Energy Input (EAF)

**What it captures:** The total electrical energy input to the EAF, broken down by source type.

**Inputs:** Real power (kW), reactive power (kVAR), power factor, electrode consumption, and the contribution from chemical energy sources (oxygen lancing, carbon combustion) if applicable.

**Single entry.**

---

### Exhaust Gas (EAF)

**What it captures:** Heat carried out in the high-temperature exhaust gases and fumes generated by the EAF process.

**Inputs:** Gas flow rate and temperature, gas composition, combustion air infiltration.

**Single entry.**

---

### Slag

**What it captures:** Heat contained in the molten slag removed from the EAF.

**Inputs:** Slag mass per heat, slag temperature, specific heat, and heat of fusion of the slag.

**Multiple entries:** Yes — in cases with multiple slag types.

---

### Auxiliary Power

**What it captures:** Electrical power consumed by auxiliary systems associated with the EAF — electrode regulation hydraulics, fume extraction fans, auxiliary transformers.

**Inputs:** Number of units, power rating (kW), load fraction, and operating hours fraction.

**Multiple entries:** Yes — one per auxiliary system.

---

## Electrotechnology and Steam Loss Types

### Energy Input Exhaust Gas

**What it captures:** A combined entry for electric resistance heating or similar electrotechnology systems that have both an exhaust gas component and an electrical energy input.

**Inputs:** Electrical power input, exhaust gas flow and temperature.

---

### Heat System Efficiency

**What it captures:** For systems (electrotechnology or steam-heated) where a single overall efficiency value is more appropriate than itemizing individual losses.

**Inputs:** Total system thermal input, system efficiency percentage.

This approach is a simplification used when detailed loss-by-loss data is not available or not meaningful for the technology type.

---

## Results Panel

The Results Panel is a persistent sidebar that shows the accumulated heat balance as the user enters data. It displays:

- Loss subtotals for each entered category (BTU/hr or kW)
- Total input energy from the energy source
- Calculated heating efficiency (%)
- Available heat percentage (for fuel-fired systems)
- A color-coded indication of whether the heat balance is complete

This panel is visible at all times during Step 2, giving the user continuous feedback on how their entries affect the overall energy picture.

---

## Related

- `src/app/phast/losses/` — All loss components and the losses container
- `src/app/phast/losses/losses.service.ts` — Determines which tabs appear for each furnace/energy configuration
- `src/app/phast/phast-results.service.ts` — Aggregates loss values into total results
- See [navigation-and-tabs.md](navigation-and-tabs.md) for the full tab visibility matrix
