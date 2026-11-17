# Process Heating Development Decisions

Product and data-handling decisions made while building the Process Heating assessment, where the code alone doesn't explain why one option was chosen over another.

## Charge materials with unrelated ids are re-keyed by position

**Issue:** [#9097](https://github.com/ORNL-AMO/AMO-Tools-Desktop/issues/9097)

**Decision:** When an assessment loads, a modification's charge materials are re-keyed to the baseline ids by list position if none of their ids match baseline and both lists have the same length.

**Why:** Older assessments stored charge materials without ids. Before ids were backfilled on load, the baseline and each modification assigned their own random ids, so a material edited on both sides was saved under unrelated ids and Explore Opportunities could no longer pair it with its baseline material. Position is a reliable match because charge materials cannot be added or removed once a modification exists, so both lists always hold the same materials in the same order.

**Where it applies:** Charge materials only. Other loss types can be added or removed in a modification, so unrelated ids there are a real difference and are left alone.

## Custom Electrotechnology electricity is the full gross heat input

**Issue:** [#9097](https://github.com/ORNL-AMO/AMO-Tools-Desktop/issues/9097)

**Decision:** For a Custom Electrotechnology furnace, electricity used is the gross heat input, which includes system losses.

**Why:** Custom Electrotechnology has no energy input entry, so the heat balance never produces an "electrical heat delivered" value for it. Every report that priced or totaled electricity from that value showed a blank or invalid result. All of this furnace's energy is electricity, so the electricity bought is the net heat the furnace needs plus the losses set by the system efficiency. For example, at 90% efficiency:

```
net heat required   = 363.15 kWh/hr
system losses       =  40.35 kWh/hr
gross heat input    = 403.45 kWh/hr  (electricity used)
```

Using the net heat instead would under-count cost by the system losses and disagree with the "Annual Energy Used" row, which already uses gross heat input.

**Where it applies:** Executive Summary electricity cost and savings, the Energy Summary electricity row, CO2 emissions, Treasure Hunt electricity, and report rollups, in both the legacy and rebuilt assessments. Other electrotechnology furnaces keep using the electrical heat delivered from their energy input entry. The "Electrical Heat Delivered" result row itself is unchanged.
