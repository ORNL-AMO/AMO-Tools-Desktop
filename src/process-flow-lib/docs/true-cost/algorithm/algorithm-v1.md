# True Cost Algorithm — Version 1

This is the original algorithm specification. It is preserved verbatim as the v1 design reference. All subsequent fixes and refinements are documented under `algorithm-coverage/` relative to this text.

---

## Core Rules

1. 100% of every cost component needs to be allocated between the water using systems (not more or less).

2. To determine water using systems associated with cost components: trace flows upstream or downstream. Use outlet flow when tracing downstream. If there are branching flows, the cost will be split accordingly weighted by flow.

3. **Losses:** During tracing (upstream or downstream), there could be losses in intermediate systems — e.g., when tracing intake source costs to the individual water using systems, water treatment steps in between can have losses. This should not affect the percentage ratios.

---

## Cost Attribution

### 1. Intake Cost Components (e.g., City Water, Well Water)

- **What to follow:** Start at the intake node; go downstream through any water treatment units.
- **Where to stop:** At the first water using systems reached on each path. Do not continue into other users even if they later receive recycled water.
- **How to split:** Split the intake's cost among those first users by the volume each receives from that intake.
- **Example:** City Water → RO → Process (5 MGY) and City Water → CT (3 MGY).
  City Water row = Process 62.5%, CT 37.5%.

### 2. Water Treatment Cost Components (e.g., RO, CT Chlorination)

- **What to follow:** Start at the water treatment unit; go downstream (through any additional treatment) until you reach the first water using systems.
- **Where to stop:** At the first users consuming the treated water.
- **How to split:** Split the treatment unit's cost across those users by the volume of treated water they receive from this unit.
- **Series note:** If RO → Chlorination → Process, then both RO and Chlorination each create a row, and each row goes 100% to Process (because all of that unit's output reaches Process). No duplication occurs because each row is its own cost component.
- **Example:** RO → Process (5 MGY) and RO → CT (2 MGY).
  RO row = Process 71.4%, CT 28.6%.

### 3. Wastewater Treatment (WWT) Cost Components (e.g., Filtration, Flotation, pH)

- **What to follow:** Start at the WWT unit.
  - **Downstream:** Identify how much of its treated water goes to users (reuse) vs. to discharge (sewer/storm/losses), possibly through a WWT chain.
  - **Upstream:** Identify which users sent water into this WWT unit (the dischargers).
- **Where to allocate:**
  - Reuse portion → allocate to the downstream user(s) who receive the treated water, by volume.
  - Discharged portion → allocate back to the upstream discharger(s) that fed the WWT unit, in proportion to their contributions.
- **Series note:** For chains like Filter → Flotation, handle each unit separately based on that unit's own outputs.
- **Example:** WWT2 outputs 6 MGY to User B and 4 MGY to Municipal Sewer.
  All 6 MGY reuse → User B pays 60% of WWT2's cost.
  The 4 MGY discharge → charged back to the original dischargers that fed WWT2 (e.g., User A) in proportion to their inflows to the WWT chain (40% in this example).

### 4. Discharge Cost Components (e.g., Municipal Sewer, Storm Sewer, Discharge Fees)

- **What to follow:** Start at the discharge node; go upstream until you hit water using systems.
- **Where to stop:** At the first user encountered on each path (the final user causing the discharge). Do not charge upstream users whose water was reused before discharging.
- **How to split:** Split the discharge cost by how much final discharge each user causes to that discharge node.
- **Example:** CT HVAC sends 7 MGY to Municipal Sewer; Wash Bay sends 3 MGY.
  "Municipal Sewer fee" row = CT HVAC 70%, Wash Bay 30%.

---

## Recycled and Reused Water

### Recycled Water

Water is considered **recycled** if it flows from a wastewater treatment system to a water-using system.

- All upstream costs are attributed to the first water-using system.
- The second system (the one using the recycled water) is assigned the cost of wastewater treatment and all downstream processes, because this second system is the reason the treatment occurred in the first place.

### Reused Water

Water is considered **reused** if it flows directly from one water-using system to another.

- The first system is responsible for all upstream costs (intake source, water treatment, pumping, etc.).
- The last water user is responsible for all downstream costs (discharge, wastewater treatment, etc.).
- Any intermediate systems (in cases where three or more water-using systems are connected in series) have zero cost components.
