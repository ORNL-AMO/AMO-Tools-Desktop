**Date Generated:** May 14, 2026

# Apply System Wastewater Treatment Costs

**Document Scope:** This document describes how Wastewater Treatment (WWT) costs are attributed to water-using systems. This is the fourth and most complex of the four cost attribution sub-routines executed in Step 2 of the True Cost Attribution Algorithm. See *True Cost Algorithm Overview* for context.

---

## 1. Guiding Principle

**A WWT unit's cost is split between the systems that benefit from its recycled output and the systems that generated the wastewater it treated.**

- Systems receiving recycled water pay for the portion of WWT cost corresponding to the volume of water they receive back from the WWT unit.
- Systems that sent effluent into the WWT unit — and whose treated water was subsequently discharged (not recycled) — pay for the remaining WWT cost in proportion to their contribution to the discharged portion.

This ensures that the full WWT block cost is always accounted for, with the recycled and discharged portions summing to 100% of the total.

---

## 2. Two-Pass Approach

The attribution is computed in two sequential passes. **Pass 1 must complete before Pass 2 begins** because Pass 2 depends on knowing what was already attributed in Pass 1.

### Pass 1 — Downstream (Reuse Portion)

**Objective:** Identify water-using systems that receive recycled water from this WWT unit and charge them for their proportional share of the WWT cost.

**Walk direction:** Downstream from the WWT node.

**Stopping rule:** First water-using system encountered on each downstream path.

**Cost calculation:**

    Fraction of path inflow received = min(System inflow / Path inflow, 1.0)
    System flow responsibility = Path inflow × Fraction of path inflow received
    Attribution fraction = System flow responsibility / WWT block cost total flow
    Cost to system = Attribution fraction × WWT total block cost

After each downstream attribution, the system ID and its charged flow portion are recorded in an internal tracking map.

### Pass 2 — Upstream (Discharged Portion)

**Objective:** Identify water-using systems that sent effluent into this WWT unit and charge them for the remaining (non-recycled) portion of the WWT cost.

**Walk direction:** Upstream from the WWT node.

**Stopping rule:** First water-using system encountered on each upstream path. Systems already charged in Pass 1 are excluded from Pass 2 — they have already been accounted for as downstream recipients.

**Cost calculation:**

The key adjustment in Pass 2 is subtracting the flow volume already charged to downstream (reuse) systems:

    System flow responsibility = System upstream edge flow − Total downstream charged portion
    Attribution fraction = System flow responsibility / WWT block cost total flow
    Cost to system = Attribution fraction × WWT total block cost

The "Total downstream charged portion" is the sum of all flow amounts already attributed to downstream systems in Pass 1.

### Pass 2 — RO Reject Path Special Case

When the upstream path from a WWT node contains an RO treatment node (rather than leading directly to a water-using system through a conventional upstream chain), the normal Pass 2 stopping rule is augmented to identify the responsible system and prevent duplicate attributions.

**Detection:** The algorithm checks `graph.systemsWithRODirectDischarge`. If the WWT node is registered as the `wasteTreatmentNode` of a single-system RO configuration, two things happen:

1. **Attribution fraction is forced to 1.0** — the full WWT block cost is assigned to the water-using system that is the sole beneficiary of that RO unit (`ROWasteTreatmentOwner`).
2. **System owner is recorded as visited and the path walk breaks** — `ROWasteTreatmentOwner.id` is pushed to `visitedSystemIds` and the edge loop exits immediately. This ensures the WWT cost is attributed exactly once, even though multiple edges in the upstream path would each satisfy the RO detection check.

This pattern covers two distinct configurations that `assignsystemsWithRODirectDischarge` can detect:

**Configuration A — RO reject stream goes directly to WWT:**

```
  Intake ──► RO ──► System A ──► Discharge 1   (product path)
                └──► WWT ──► Discharge 2        (reject treatment path)
```

WWT upstream path: `[edge(RO→WWT), edge(Intake→RO)]` — two edges. The loop charges System A on the first edge and breaks; the intake edge is never re-processed.

**Configuration B — RO product system sends its effluent to WWT:**

```
  Intake ──► RO ──► System A ──► WWT ──► Discharge 2
                └──► Discharge 1                        (direct reject)
```

WWT upstream path: `[edge(SystemA→WWT), edge(RO→SystemA), edge(Intake→RO)]` — three edges. The loop charges System A on the first edge and breaks; the RO and intake edges are never re-processed.

**Worked example (Configuration A):**

```
  Intake ──► RO Unit ──► (product water, 70 Mgal/yr) ──► System A
                    └──► (reject,  30 Mgal/yr) ──► WWT ($1.00/kgal) ──► Discharge
```

- WWT block cost = 30 Mgal/yr × 1,000 × $1.00/kgal = $30,000/yr
- **Pass 1 of WWT:** no downstream reuse path → downstream attributed portion = 0.
- **Pass 2 of WWT:** upstream walk hits the RO node, not a water-using system.
  - Algorithm detects the RO node is in `systemsWithRODirectDischarge` with System A as the owner (`ROWasteTreatmentOwner`).
  - Attribution fraction overridden to 1.0; cost assigned to System A; loop breaks.
- Cost to System A from WWT = 1.0 × $30,000 = **$30,000/yr**

**Worked example (Configuration B):**

```
  Intake ──► RO Unit ──► (product water, 5 Mgal/yr) ──► System A ──► WWT ($1.00/kgal) ──► Discharge
                    └──► (reject,  5 Mgal/yr) ──► Discharge
```

- WWT block cost = 5 Mgal/yr × 1,000 × $1.00/kgal = $5,000/yr
- **Pass 1 of WWT:** no downstream reuse path → downstream attributed portion = 0.
- **Pass 2 of WWT:** upstream walk hits System A on the first edge.
  - System A is the `water-using-system` in the upstream path; algorithm also detects System A is the `ROWasteTreatmentOwner`.
  - Attribution fraction overridden to 1.0; cost assigned to System A; loop breaks.
- Cost to System A from WWT = 1.0 × $5,000 = **$5,000/yr**

---

## 3. Mass Balance Check

For a WWT unit with no internal volume losses (inflow = outflow), the sum of all Pass 1 and Pass 2 attribution fractions should equal 1.0.

- Pass 1 covers the recycled fraction of the WWT output.
- Pass 2 covers the discharged fraction.
- Together they account for all of the WWT inflow.

For WWT units with volume losses (e.g., evaporation from an aeration pond), the sum may be less than 1.0 because the loss volume is not attributed to any system; it simply exits the water balance.

---

## 4. Series Wastewater Treatment

When WWT units are connected in series (e.g., Screening → Biological Treatment → Clarification), each unit is evaluated independently based on that specific unit's own inputs and outputs. The downstream chaining of WWT units means that earlier units in the chain may have both upstream-to-water-using-system paths and downstream-to-later-WWT-unit paths. Each unit handles its own two-pass attribution separately.

---

## 5. Adjusted Attribution (User Override)

A user may supply an override attribution fraction for a specific system–WWT unit pair. When an override is present:

1. The default computed fraction is still recorded for audit purposes.
2. The cost to the system is calculated using the override fraction:

       Cost to system = Adjusted fraction × WWT total block cost

Adjusted attributions are collected during each pass's path walk and applied as a batch after all paths for that pass are processed.

---

## 6. Worked Example — WWT with Both Reuse and Discharge

**Scenario:** A facility has one WWT unit that receives effluent from two production systems. It returns 60% of the treated water for reuse and sends 40% to discharge. The WWT unit has no internal volume losses.

```
  System A (sends 60 Mgal/yr) ──►
                                  WWT Unit (100 Mgal/yr inflow, $1.20/kgal)
  System B (sends 40 Mgal/yr) ──►
                                       │
                          ┌────────────┴────────────┐
                          │ 60 Mgal/yr reuse         │ 40 Mgal/yr to discharge
                          ▼                          ▼
                       System C                  Discharge Outfall
```

**Block cost of WWT unit:**  
100 Mgal/yr × 1,000 × $1.20/kgal = $120,000/yr

---

**Pass 1 — Downstream (reuse to System C):**

- Path inflow (first edge from WWT to System C) = 60 Mgal/yr
- System C inflow = 60 Mgal/yr
- Fraction = min(60/60, 1.0) = 1.0
- System flow responsibility = 60 Mgal/yr
- Attribution fraction = 60 / 100 = 0.60
- Cost to System C = 0.60 × $120,000 = **$72,000/yr**
- Downstream charged portion recorded = 60 Mgal/yr

---

**Pass 2 — Upstream (discharged portion, to System A and System B):**

Systems already charged in Pass 1 (System C) are excluded from Pass 2.

**Path from WWT upstream to System A:**
- System A's edge flow = 60 Mgal/yr
- System flow responsibility (before deduction) = 60 Mgal/yr
- Total downstream charged portion = 60 Mgal/yr
- Adjusted system flow responsibility = 60 − 60 = 0 Mgal/yr

> In this example, all of the WWT outflow was recycled to System C, so System A bears zero additional WWT cost from the upstream pass. The 40 Mgal/yr that goes to discharge is captured by the Discharge Outfall node's own attribution sub-routine.

**Revised scenario for clarity — Partial discharge:**

Suppose instead the WWT has no reuse path (all 100 Mgal/yr goes to discharge). In that case:

**Pass 1:** No downstream systems found — downstream attributed portion = 0.

**Pass 2 — Upstream to System A:**
- System A's edge flow = 60 Mgal/yr
- Total downstream charged portion = 0
- Adjusted system flow responsibility = 60 − 0 = 60 Mgal/yr
- Attribution fraction = 60 / 100 = 0.60
- Cost to System A = 0.60 × $120,000 = **$72,000/yr**

**Pass 2 — Upstream to System B:**
- System B's edge flow = 40 Mgal/yr
- Total downstream charged portion = 0
- Adjusted system flow responsibility = 40 Mgal/yr
- Attribution fraction = 40 / 100 = 0.40
- Cost to System B = 0.40 × $120,000 = **$48,000/yr**

**Check:** $72,000 + $48,000 = $120,000 = Total WWT block cost ✓

---

## 7. Summary of Attribution Rules

| Rule | Description |
|---|---|
| Walk direction — Pass 1 | Downstream from WWT unit (reuse paths) |
| Walk direction — Pass 2 | Upstream from WWT unit (discharge paths) |
| Stopping point — Pass 1 | First water-using system on each downstream path |
| Stopping point — Pass 2 | First water-using system on each upstream path (excluding Pass 1 systems) |
| Cost basis | Full WWT block cost (unit cost × total WWT inflow) |
| Pass 1 attribution denominator | WWT total inflow |
| Pass 2 attribution denominator | WWT total inflow |
| Pass 2 deduction | Total flow already charged in Pass 1 is subtracted from system flow responsibility |
| Balance check | Sum of all Pass 1 and Pass 2 fractions should equal 1.0 for a lossless WWT unit |
| Series WWT | Each unit in series is evaluated independently |
| RO reject-path WWT | When WWT is on the reject path of a single-system RO configuration, 100% of WWT cost is attributed to the RO system owner regardless of flow fractions |
| Adjusted attribution | User-supplied fraction replaces computed default |
