**Date Generated:** May 19, 2026

# Plant Summary Test Cases

**Document Scope:** Human-readable reference for every fixture in `process-flow-diagram-component/src/__tests__/plant-summary.test.ts`. Each entry shows the facility layout in plain language, the key numbers configured in the test, and the expected cost attribution results. Use this document to understand what a failing test is actually checking without reading the test code.

Flow values are in **Mgal/yr**. Costs are in **$/kgal**. Dollar amounts are annual totals computed as `$/kgal × flow × 1,000`.

---

## Node type legend

| Symbol | Node type | Role in algorithm |
|---|---|---|
| **INTAKE** | Water Intake | Source of fresh water; cost attributed downstream |
| **SYSTEM** | Water-Using System | Receives attributed costs; the unit of true cost reporting |
| **DISCHARGE** | Water Discharge | Effluent destination; cost attributed upstream |
| **TREATMENT** | Water Treatment | Shared pretreatment unit; cost attributed downstream |
| **WWT** | Wastewater Treatment | Effluent treatment; cost split between reuse recipients (Pass 1) and upstream dischargers (Pass 2) |
| **RO** | Reverse Osmosis Treatment | Water Treatment with `treatmentType = 6`; triggers the single-system override when exactly two downstream paths exist |
| **SUMMING** | Summing Node | Transparent pass-through; does not carry a cost |

---

## Part 1 — Basic Single-Path Configurations

### 1.1 `simple-linear`

**What it tests:** The baseline case. One intake, one system, one discharge — all costs go to the single system.

```
INTAKE ($1/kgal)
  │ 100 Mgal/yr
  ▼
SYSTEM
  │ 80 Mgal/yr  ← system uses 20 Mgal/yr internally (not routed to discharge)
  ▼
DISCHARGE ($2/kgal)
```

**Node costs**

| Node | Unit cost | Flow basis | Block cost |
|---|---|---|---|
| Intake | $1/kgal | 100 Mgal/yr out | **$100,000** |
| Discharge | $2/kgal | 80 Mgal/yr in | **$160,000** |

**Expected attribution — System**

| Intake | Discharge | Total |
|---|---|---|
| $100,000 (100%) | $160,000 (100%) | **$260,000** |

---

### 1.2 `shared-intake`

**What it tests:** One intake feeding two systems directly. The intake cost splits in proportion to each system's share of the total flow.

```
              ┌─── 60 Mgal/yr ──► SYSTEM A
INTAKE        │
($1/kgal) │
  100 Mgal/yr └─── 40 Mgal/yr ──► SYSTEM B
```

**Node costs**

| Node | Unit cost | Flow basis | Block cost |
|---|---|---|---|
| Intake | $1/kgal | 100 Mgal/yr out | **$100,000** |

**Expected attribution**

| System | Intake share | Intake $ |
|---|---|---|
| System A | 60 / 100 = 60% | **$60,000** |
| System B | 40 / 100 = 40% | **$40,000** |
| **Total** | 100% | **$100,000** ✓ |

---

### 1.3 `shared-discharge`

**What it tests:** Two systems draining to one discharge point. The discharge cost splits by each system's contribution to total discharge flow.

```
SYSTEM A ──── 60 Mgal/yr ───┐
                              ├──► DISCHARGE ($2/kgal, 100 Mgal/yr in)
SYSTEM B ──── 40 Mgal/yr ───┘
```

**Node costs**

| Node | Unit cost | Flow basis | Block cost |
|---|---|---|---|
| Discharge | $2/kgal | 100 Mgal/yr in | **$200,000** |

**Expected attribution**

| System | Discharge share | Discharge $ |
|---|---|---|
| System A | 60 / 100 = 60% | **$120,000** |
| System B | 40 / 100 = 40% | **$80,000** |
| **Total** | 100% | **$200,000** ✓ |

---

## Part 2 — Water Treatment Configurations

### 2.1 `treatment-no-loss`

**What it tests:** One treatment unit with no losses (all input volume exits) feeding two systems. Both intake and treatment costs split proportionally by flow.

```
INTAKE ($1/kgal)
  │ 100 Mgal/yr
  ▼
TREATMENT ($5/kgal)   ← 100 Mgal/yr in, 100 Mgal/yr out (lossless)
  ├─── 60 Mgal/yr ──► SYSTEM A
  └─── 40 Mgal/yr ──► SYSTEM B
```

**Node costs**

| Node | Unit cost | Flow basis | Block cost |
|---|---|---|---|
| Intake | $1/kgal | 100 Mgal/yr | **$100,000** |
| Treatment | $5/kgal | 100 Mgal/yr | **$500,000** |

**Expected attribution**

| System | Intake % | Intake $ | Treatment % | Treatment $ |
|---|---|---|---|---|
| System A | 60% | **$60,000** | 60% | **$300,000** |
| System B | 40% | **$40,000** | 40% | **$200,000** |
| **Total** | 100% | **$100,000** ✓ | 100% | **$500,000** ✓ |

---

### 2.2 `treatment-with-loss`

**What it tests:** A treatment unit that loses 20% of its input volume (100 in, 80 out). The algorithm switches to the **delivered-flow-volume basis**: the single downstream system is responsible for 100% of both block costs, even though it receives only 80 units. The system bears the cost of the lost water.

```
INTAKE ($1/kgal)
  │ 100 Mgal/yr
  ▼
TREATMENT ($5/kgal)   ← 100 Mgal/yr in, 80 Mgal/yr out (20 Mgal/yr lost)
  │ 80 Mgal/yr
  ▼
SYSTEM
```

**Node costs**

| Node | Unit cost | Flow basis | Block cost |
|---|---|---|---|
| Intake | $1/kgal | 100 Mgal/yr | **$100,000** |
| Treatment | $5/kgal | 100 Mgal/yr in | **$500,000** |

**Expected attribution — System**

| Intake | Treatment | Total |
|---|---|---|
| $100,000 (100%) | $500,000 (100%) | **$600,000** |

> **Why the system gets 100% despite receiving only 80 units:** When there is a single outflow path from the intake and treatment losses exist, the algorithm uses the treatment node's *outflow* as the attribution denominator. The system receives all 80 units of outflow, so its fraction is 80/80 = 1.0. The intake block cost is based on the original 100 units drawn from the source.

---

### 2.3 `treatment-chain`

**What it tests:** Two treatment units in series where the first is lossy (100 in → 80 out). Each treatment unit independently accumulates 100% attribution to the single downstream system. The intake detects the upstream loss via `hasUpstreamTreatmentLoss` and also applies the delivered-flow-volume basis.

```
INTAKE ($1/kgal)
  │ 100 Mgal/yr
  ▼
TREATMENT A ($5/kgal)   ← 100 in, 80 out (20 Mgal/yr lost)
  │ 80 Mgal/yr
  ▼
TREATMENT B ($4/kgal)   ← 80 in, 80 out (lossless)
  │ 80 Mgal/yr
  ▼
SYSTEM
```

**Node costs**

| Node | Unit cost | Flow basis | Block cost |
|---|---|---|---|
| Intake | $1/kgal | 100 Mgal/yr | **$100,000** |
| Treatment A | $5/kgal | 100 Mgal/yr in | **$500,000** |
| Treatment B | $4/kgal | 80 Mgal/yr in | **$320,000** |

**Expected attribution — System**

| Intake | Treatment (A + B) | Total |
|---|---|---|
| $100,000 (100%) | $820,000 (100% of each) | **$920,000** |

> Treatment B is lossless on its own, but Treatment A's upstream losses are detected when computing the intake's attribution path. The entire chain uses the delivered-flow basis for the intake.

---

### 2.4 `diamond-treatment`

**What it tests:** An intake that splits into two parallel treatment units, both of which deliver to the same single system. Verifies that the de-duplication guard in the algorithm correctly recognises these as **distinct paths** (different first edges) and does not suppress one of them. The system accumulates intake cost from both paths (60% + 40% = 100%) and treatment cost from both nodes independently.

```
                ┌─── 60 Mgal/yr ──► TREATMENT A ($3/kgal) ───┐
INTAKE          │                                                   ├──► SYSTEM A
($1/kgal)   │                                                   │
  100 Mgal/yr   └─── 40 Mgal/yr ──► TREATMENT B ($3/kgal) ───┘
```

**Node costs**

| Node | Unit cost | Flow basis | Block cost |
|---|---|---|---|
| Intake | $1/kgal | 100 Mgal/yr | **$100,000** |
| Treatment A | $3/kgal | 60 Mgal/yr | **$180,000** |
| Treatment B | $3/kgal | 40 Mgal/yr | **$120,000** |

**Expected attribution — System A**

| Intake (path A 60% + path B 40%) | Treatment (A + B) | Total |
|---|---|---|
| $100,000 (100%) | $300,000 (100% of each) | **$400,000** |

> The key regression this guards: if the de-duplication logic incorrectly matched the two paths, Treatment B's attribution would be silently suppressed and the system would receive only $280,000 instead of $400,000.

---

## Part 3 — Reverse Osmosis Configurations

### 3.1 `ro-single-system`

**What it tests:** An RO unit with exactly two downstream branches — one leading to a system (product water) and one going directly to discharge (reject/brine). The algorithm detects this pattern and applies the **RO single-system override**: all intake, RO treatment, and product-path discharge costs are attributed 100% to the single system, regardless of the actual product/reject flow split.

```
INTAKE ($1/kgal)
  │ 100 Mgal/yr
  ▼
RO TREATMENT ($5/kgal)   ← treatmentType = 6
  ├─── 70 Mgal/yr ──► SYSTEM A ──► DISCHARGE 1 ($1/kgal)   ← product path
  └─── 30 Mgal/yr ──► DISCHARGE 2 ($0/kgal)                    ← reject path
```

**Node costs**

| Node | Unit cost | Flow basis | Block cost |
|---|---|---|---|
| Intake | $1/kgal | 100 Mgal/yr | **$100,000** |
| RO | $5/kgal | 100 Mgal/yr | **$500,000** |
| Discharge 1 (product) | $1/kgal | 70 Mgal/yr | **$70,000** |
| Discharge 2 (reject) | $0/kgal | 30 Mgal/yr | **$0** |

**Expected attribution — System A**

| Intake | RO Treatment | Discharge (product) | Total |
|---|---|---|---|
| $100,000 (100%) | $500,000 (100%) | $70,000 (100%) | **$670,000** |

> System A bears 100% of the intake and RO cost even though it only receives 70% of the RO output. The reject stream cost (Discharge 2) is $0 because it has no unit cost; no system is charged for it.

---

### 3.2 `ro-multi-system`

**What it tests:** An RO unit with **three** downstream branches (two systems and one discharge). The single-system override requires *exactly* two children, so it does **not** apply here. Standard flow-fraction attribution is used instead.

```
INTAKE ($1/kgal)
  │ 100 Mgal/yr
  ▼
RO TREATMENT ($5/kgal)   ← treatmentType = 6, but 3 children → no override
  ├─── 40 Mgal/yr ──► SYSTEM A
  ├─── 40 Mgal/yr ──► SYSTEM B
  └─── 20 Mgal/yr ──► DISCHARGE ($0/kgal)
```

**Node costs**

| Node | Unit cost | Flow basis | Block cost |
|---|---|---|---|
| Intake | $1/kgal | 100 Mgal/yr | **$100,000** |
| RO | $5/kgal | 100 Mgal/yr | **$500,000** |

**Expected attribution**

| System | Intake share | Intake $ | RO Treatment share | RO $ |
|---|---|---|---|---|
| System A | 40 / 100 = 40% | **$40,000** | 40% | **$200,000** |
| System B | 40 / 100 = 40% | **$40,000** | 40% | **$200,000** |
| **Total** | 80% | **$80,000** | 80% | **$400** |

> The 20% reject fraction is unattributed to any system (the discharge has no cost). This is correct — the reject path represents water leaving the facility, not consumed by any system.

---

### 3.3 `ro-single-system-wwt`

**What it tests:** An RO single-system configuration where the reject path flows through a Wastewater Treatment unit before reaching discharge. The RO override still assigns all intake and RO costs to System A. The WWT costs exhibit a **known double-attribution bug** and are captured by snapshot rather than a specific value.

```
INTAKE ($1/kgal)
  │ 100 Mgal/yr
  ▼
RO TREATMENT ($5/kgal)   ← single-system override applies (2 children)
  ├─── 70 Mgal/yr ──► SYSTEM A ──► DISCHARGE 1 ($1/kgal)   ← product path
  └─── 30 Mgal/yr ──► WWT ($3/kgal) ──► DISCHARGE 2 ($0)   ← reject path with treatment
```

**Node costs**

| Node | Unit cost | Flow basis | Block cost |
|---|---|---|---|
| Intake | $1/kgal | 100 Mgal/yr | **$100,000** |
| RO | $5/kgal | 100 Mgal/yr | **$500,000** |
| Discharge 1 (product) | $1/kgal | 70 Mgal/yr | **$70,000** |
| WWT (reject) | $3/kgal | 30 Mgal/yr | **$90,000** |

**Expected attribution — System A**

| Intake | RO Treatment | Discharge (product) | WWT |
|---|---|---|---|
| $100,000 (100%) | $500,000 (100%) | $70,000 (100%) | **(snapshot — see note)** |

> **Known limitation:** The WWT upstream path (`RO → WWT → Intake`) causes the WWT cost to be attributed to System A twice — once when processing the RO edge and once when processing the intake edge. The snapshot records the current (over-attributed) dollar amount. Update the snapshot when this is intentionally fixed, and verify the corrected value equals $90,000 (100% of WWT block cost, once).

---

## Part 4 — Wastewater Treatment Configurations

### 4.1 `wwt-discharge-only`

**What it tests:** A system that sends all its effluent to a WWT unit, which then discharges everything (no reuse output). Pass 1 finds no downstream systems, so it charges nothing. Pass 2 walks upstream from the WWT and attributes 100% of the WWT cost to the single upstream system.

```
SYSTEM
  │ 100 Mgal/yr
  ▼
WWT ($3/kgal)   ← 100 in, 100 out (lossless)
  │ 100 Mgal/yr
  ▼
DISCHARGE ($0/kgal)
```

**Node costs**

| Node | Unit cost | Flow basis | Block cost |
|---|---|---|---|
| WWT | $3/kgal | 100 Mgal/yr | **$300,000** |

**Expected attribution — System**

| WWT (Pass 2 — upstream discharger) |
|---|
| $300,000 (100%) |

---

### 4.2 `wwt-reuse`

**What it tests:** A WWT unit that returns some treated water for reuse and sends the rest to discharge. The cost splits between the reuse recipient (Pass 1, downstream) and the original upstream discharger (Pass 2, upstream). The two passes together account for 100% of the WWT block cost.

```
SYSTEM A
  │ 100 Mgal/yr
  ▼
WWT ($3/kgal)   ← 100 in, 100 out
  ├─── 60 Mgal/yr ──► SYSTEM B   ← recycled water (reuse recipient)
  └─── 40 Mgal/yr ──► DISCHARGE ($0/kgal)
```

**Node costs**

| Node | Unit cost | Flow basis | Block cost |
|---|---|---|---|
| WWT | $3/kgal | 100 Mgal/yr | **$300,000** |

**Expected attribution**

| System | Pass | WWT share | WWT $ |
|---|---|---|---|
| System B | Pass 1 (reuse recipient) | 60 / 100 = 60% | **$180,000** |
| System A | Pass 2 (upstream discharger) | 40 / 100 = 40% | **$120,000** |
| **Total** | | 100% | **$300,000** ✓ |

> System B pays for the recycled water it receives. System A pays for the portion of its effluent that ended up being discharged rather than recycled.

---

### 4.3 `wwt-two-upstream-with-reuse`  ⚠ Known algorithm limitation

**What it tests:** Two systems both feed into one WWT unit, which returns some treated water for reuse (System C) and sends the rest to discharge. This is the worked example from `apply-system-waste-water-treatment-costs.md §6`. The test documents a known algorithm bug in the Pass 2 deduction logic.

```
SYSTEM A ──── 60 Mgal/yr ───┐
                              ├──► WWT ($1/kgal, 100 Mgal/yr in)
SYSTEM B ──── 40 Mgal/yr ───┘       ├─── 60 Mgal/yr ──► SYSTEM C   ← recycled
                                      └─── 40 Mgal/yr ──► DISCHARGE ($0/kgal)
```

**Node costs**

| Node | Unit cost | Flow basis | Block cost |
|---|---|---|---|
| WWT | $1/kgal | 100 Mgal/yr | **$100,000** |

**Current (actual) attribution**

| System | Pass | Responsibility | WWT $ |
|---|---|---|---|
| System C | Pass 1 (reuse) | 60 / 100 = 60% | **$60,000** |
| System A | Pass 2 (upstream) | 60 − 60 = 0 | **$0** |
| System B | Pass 2 (upstream) | 40 − 60 = **−20** ❌ | **(snapshot — negative)** |

**Correct attribution (when algorithm is fixed)**

| System | WWT % | WWT $ |
|---|---|---|
| System C | 60% | **$60,000** |
| System A | 24% (60 − 60/100×60 = 24) | **$24,000** |
| System B | 16% (40 − 40/100×60 = 16) | **$16,000** |
| **Total** | 100% | **$100,000** ✓ |

> **Bug:** The Pass 2 deduction subtracts the *full* 60-unit downstream charged portion from each upstream system's flow independently, rather than prorating the deduction by each system's upstream share. System B's flow (40) minus the full 60-unit deduction produces a negative responsibility (−20). The snapshot locks this in so that the fix is visible as a deliberate test update.

---

## Part 5 — Multi-Source and Reuse Configurations

### 5.1 `summing-node`

**What it tests:** Two intakes of different volumes combine through a summing node before reaching a single system. The summing node is transparent — it is not a cost component and does not interrupt attribution. Each intake independently contributes its full block cost to the downstream system.

```
INTAKE A ($1/kgal, 60 Mgal/yr) ──►
                                         SUMMING ──► SYSTEM
INTAKE B ($1/kgal, 40 Mgal/yr) ──►
```

**Node costs**

| Node | Unit cost | Flow basis | Block cost |
|---|---|---|---|
| Intake A | $1/kgal | 60 Mgal/yr | **$60,000** |
| Intake B | $1/kgal | 40 Mgal/yr | **$40,000** |

**Expected attribution — System**

| Intake A | Intake B | Total intake |
|---|---|---|
| $60 (100%) | $40 (100%) | **$100,000** |

> Both intakes are separate cost components. The system accumulates one attribution per intake, not a blended single attribution for the combined flow.

---

### 5.2 `reuse-chained-systems`

**What it tests:** Water flows from an intake through System A, which passes (reuses) some of its water to System B, which then discharges. The algorithm stops the intake walk at the *first* system it reaches (System A) and stops the discharge walk at the *first* system upstream of the discharge (System B). Neither system sees both cost types.

```
INTAKE ($1/kgal)
  │ 100 Mgal/yr
  ▼
SYSTEM A   ← absorbs intake cost; 20 Mgal/yr consumed internally
  │ 80 Mgal/yr  ← reused water passed to System B
  ▼
SYSTEM B   ← absorbs discharge cost; does NOT see intake cost
  │ 80 Mgal/yr
  ▼
DISCHARGE ($2/kgal)
```

**Node costs**

| Node | Unit cost | Flow basis | Block cost |
|---|---|---|---|
| Intake | $1/kgal | 100 Mgal/yr | **$100,000** |
| Discharge | $2/kgal | 80 Mgal/yr | **$160,000** |

**Expected attribution**

| System | Intake | Discharge |
|---|---|---|
| System A | **$100,000** (100%) | $0 — excluded (not the final discharger) |
| System B | $0 — excluded (not the intake recipient) | **$160,000** (100%) |

> This is the "reused water" pattern. System A is responsible for fresh water acquisition; System B is responsible for the discharge it directly causes.

---

## Part 6 — User Attribution Overrides

All three override fixtures use the same approach: a `systemAttributionMap` is pre-populated with an `adjusted` fraction for a specific system–component pair before the algorithm runs. The algorithm still computes and records the default fraction (for the audit trail) but uses the override for the cost calculation.

### 6.1 `adjusted-attribution` (intake override)

**What it tests:** A user has manually set the intake attribution fraction to 0.75 for the single system, even though the computed default is 1.0. The discharge has no override and is computed normally.

```
INTAKE ($1/kgal, 100 Mgal/yr)
  │
  ▼
SYSTEM   ← intake override: 0.75
  │ 80 Mgal/yr
  ▼
DISCHARGE ($2/kgal)   ← no override
```

**Expected attribution — System**

| Cost type | Fraction used | $ |
|---|---|---|
| Intake | 0.75 (override) | **$75,000** (vs. computed $100,000 at 1.0) |
| Discharge | 1.0 (computed) | **$160,000** |

---

### 6.2 `adjusted-attribution-discharge` (discharge override)

**What it tests:** A user has manually set the discharge attribution fraction to 0.60 for System A.

```
SYSTEM A
  │ 80 Mgal/yr
  ▼
DISCHARGE ($2/kgal)   ← discharge override on System A: 0.60
```

**Expected attribution — System A**

| Cost type | Fraction used | $ |
|---|---|---|
| Discharge | 0.60 (override) | **$96,000** (vs. computed $160,000 at 1.0) |

---

### 6.3 `adjusted-attribution-treatment` (treatment override)

**What it tests:** A user has manually set the treatment attribution fraction to 0.80 for System A. The intake has no override and is computed normally at 1.0.

```
INTAKE ($1/kgal, 100 Mgal/yr)
  │
  ▼
TREATMENT ($5/kgal, 100 in / 100 out)   ← treatment override on System A: 0.80
  │
  ▼
SYSTEM A   ← intake computed normally; treatment overridden
```

**Expected attribution — System A**

| Cost type | Fraction used | $ |
|---|---|---|
| Intake | 1.0 (computed normally) | **$100,000** |
| Treatment | 0.80 (override) | **$400,000** (vs. computed $500,000 at 1.0) |

---

## Part 7 — Mass-Balance Invariants

The mass-balance suite does not introduce new configurations. It re-runs the `simple-linear` and `shared-intake` configurations with additional cross-cutting assertions that must hold for *any* valid diagram.

| Invariant | What it checks |
|---|---|
| **Sum equals block cost** | The sum of all per-system attributed intake costs equals the intake's total block cost. No cost is created or destroyed. |
| **No negative costs** | Every system's intake, discharge, and treatment amounts are ≥ 0. |
| **Fractions bounded** | Every attribution fraction in `systemAttributionMap` is between 0.0 and 1.0 (within float tolerance). |

---

## Part 8 — Pending / Not Yet Implemented

### `wwt-recycled-back-to-same-system` *(pending)*

**Intended configuration:** A system sends effluent to a WWT unit, which returns some treated water back to *the same system* that generated it, while the rest goes to discharge.

```
SYSTEM A ──► WWT ──► SYSTEM A  (50% recycled back)
                └──► DISCHARGE (50%)
```

**Why it is not yet implemented:** The graph path-traversal functions (`getAllDownstreamEdgePaths` and `getAllUpstreamEdgePaths`) perform a depth-first search with no cycle detection. This configuration creates a directed cycle, causing infinite recursion. The test is blocked until cycle protection is added to `graph.ts`.

**Expected behavior once implemented:**
- Pass 1 charges System A for the recycled fraction (it is both the WWT input and the reuse recipient).
- Pass 2 skips System A because it is already in `visitedSystemIds`; the discharged fraction goes unattributed — a secondary issue to address at the same time.
