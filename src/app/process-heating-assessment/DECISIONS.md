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

## Flue Gas and Energy Input Exhaust Gas allow one entry

**Issue:** [#8891](https://github.com/ORNL-AMO/AMO-Tools-Desktop/issues/8891), [#8892](https://github.com/ORNL-AMO/AMO-Tools-Desktop/issues/8892)

**Decision:** The rebuilt Flue Gas and Energy Input Exhaust Gas tabs each hold a single entry. Extra entries in older or imported assessments are left untouched in the saved data and are not shown.

**Why:** Legacy lets users add several rows to either tab and shows a result for each row, but the results only ever read the first one. That is correct for the math: flue gas loss is applied once to the whole heat input, so adding up rows would double count. The extra rows only displayed numbers that nothing used.

**Where it applies:** Rebuilt assessments only. Legacy still allows extra rows and is not changed to block or warn about them.

## Legacy Heat System Efficiency tab formula is not fixed

**Issue:** [#8893](https://github.com/ORNL-AMO/AMO-Tools-Desktop/issues/8893)

**Decision:** The rebuilt Heat System Efficiency tab uses the same gross heat formula as the results. Legacy's tab formula is left as is.

**Why:** When the charge material gives off heat during processing, legacy's tab subtracts that heat in the wrong place and shows a wrong, often negative, gross heat. Legacy's results use the correct formula, so only the number shown on legacy's tab is affected, and legacy is being replaced by the rebuild.

**Where it applies:** The Heat System Efficiency tab. Results in both modules already agree.

## Legacy results bugs are fixed in both modules

**Issue:** [#8987](https://github.com/ORNL-AMO/AMO-Tools-Desktop/issues/8987)

**Decision:** Results bugs found while building the rebuild were fixed in both the legacy and rebuilt modules in one change, so results for some existing assessments change.

- Cooling losses using "Other Gas" or "Other Liquid" now count toward the total cooling loss.
- Extended surface losses now count toward results. They were always counted as 0.
- The auxiliary power total is converted to the assessment's energy unit. It was added without conversion.
- The charge material comparison highlights the correct liquid material fields. Totals don't change.

**Why:** Until this change, the rebuild matched legacy, bugs included, so the two could be checked against each other. Fixing both together keeps them matching, and existing assessments then change only once, with one release note.

**Where it applies:** Legacy and rebuilt results, reports and exports. Sample assessments that change (baseline / modification):

```
123-1363 extended surface loss       0 → 3.43 / 0 → 3.43 MMBtu/hr
123-1363 gross heat input            31.06 → 35.22 / 22.54 → 26.54 MMBtu/hr
Induction melters - With Aux         gross heat input 1573.42 → 1572.50 / 5972.10 → 5971.04 kWh
Induction melters - Energy Exhaust   gross heat input 1813.37 → 1812.34 / 6471.52 → 6470.40 kWh
```

## Tab markers show entry count and invalid state only

**Issue:** [#9016](https://github.com/ORNL-AMO/AMO-Tools-Desktop/issues/9016)

**Decision:** Heat balance loss tabs keep legacy's entry-count badge. The badge turns red, with an "has invalid inputs" tooltip, when the tab has invalid inputs. Baseline step tabs show the same invalid marker. Tabs do not show warnings or whether a modification differs from the baseline. In Expert View, a tab that needs review after an energy source change is marked orange.

**Why:** The markers exist so users can find the errors that block Assessment and Report. Warnings don't block anything and are shown on the form itself. Differences from baseline are already highlighted on each field.

**Where it applies:** Heat balance loss tabs, baseline step tabs and Energy Validation tabs, on large and small screens, and the Expert View tabs.

## Legacy Process Heating stays available after the rebuild ships

**Issue:** [#8471](https://github.com/ORNL-AMO/AMO-Tools-Desktop/issues/8471)

**Decision:** The legacy Process Heating module stays in the app for the first few minor releases after the rebuild ships.

**Why:** It is a fallback in case users run into problems with the rebuild that need to be rolled back.

**Where it applies:** The whole legacy module. Gaps between the two, such as dashboard and rollup support for rebuilt assessments, are tracked as open questions on [#8900](https://github.com/ORNL-AMO/AMO-Tools-Desktop/issues/8900).

## Material lists are shared and reloaded when an assessment opens

**Issue:** [#8940](https://github.com/ORNL-AMO/AMO-Tools-Desktop/issues/8940)

**Decision:** Each material database (solid, liquid and gas charge materials, atmosphere, wall surfaces, and both flue gas fuel databases) has one in-memory list. Every loss entry, both Expert View sides, the add-material dialogs and the Input Summary read that list. The charge material, atmosphere and wall surface lists reload each time an assessment opens; the flue gas fuel lists already load at app start and refresh on every save.

**Why:** Each entry used to load its own copy once, so a material added in one entry was missing from the others, and the Input Summary showed it blank until the app restarted. Restoring a deleted material from two entries could also add it twice. One shared list keeps every view in step. Reloading on open picks up materials added or deleted elsewhere, such as on the Custom Materials page.

**Where it applies:** The rebuilt module. Legacy still reads its materials straight from the database. Writes from legacy, backup import and the Custom Materials page don't refresh the shared lists yet ([#9122](https://github.com/ORNL-AMO/AMO-Tools-Desktop/issues/9122)); until they do, those changes appear the next time an assessment opens.

## The PDF report prints temperature symbols and chemical formulas in plain characters

**Issue:** [#8940](https://github.com/ORNL-AMO/AMO-Tools-Desktop/issues/8940), [#9114](https://github.com/ORNL-AMO/AMO-Tools-Desktop/issues/9114)

**Decision:** In the Process Heating PDF, ℉ and ℃ print as °F and °C, and subscript digits print as plain digits (O₂ as O2). The screen keeps the original symbols.

**Why:** The PDF uses a built-in font that cannot draw ℉, ℃ or subscript digits. A subscript digit also makes the PDF library encode the whole line differently, so every character in it prints wrong, not just the symbol. °F, °C and plain digits print correctly.

**Where it applies:** The rebuilt module's PDF report only. Other modules' reports are tracked on #9114, which should replace this module-level fix with one shared fix.
