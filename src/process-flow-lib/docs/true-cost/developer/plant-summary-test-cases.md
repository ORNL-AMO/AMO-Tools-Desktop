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

> **Why the system gets 100% despite receiving only 80 units:** The treatment node has a single child, so its branch ratio is 80/80 = 1.0 regardless of its own loss — the 20-unit loss is absorbed through the 100-unit path inflow, not through this ratio. Attribution fraction = (100 × 1.0) / 100 = 1.0. The intake block cost is based on the original 100 units drawn from the source.

---

### 2.3 `treatment-chain`

**What it tests:** Two treatment units in series where the first is lossy (100 in → 80 out). Each treatment unit independently accumulates 100% attribution to the single downstream system. For the intake attribution, both Treatment A and Treatment B contribute a branch ratio of 1.0 to the product (each has a single child), so Treatment A's loss is absorbed through path inflow rather than reducing the system's fraction.

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

> Treatment B is lossless on its own, but Treatment A's loss doesn't need separate detection — the branch-ratio walk multiplies in every treatment-source edge's ratio along the path regardless of depth, so Treatment A's 1.0 ratio (single child) and Treatment B's 1.0 ratio (single child) both contribute, and the 100-unit path inflow (not the reduced 80-unit outflow) remains the basis.

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

### 2.5 `split-path-treatment-loss`

**What it tests:** An intake that splits to two paths, where one path routes through a treatment unit that loses half its volume before reaching System A. The other path reaches System B directly with no treatment. System A's intake share is based on what entered the treatment (60/100 = 60%), not what it actually received after the loss (30/100 = 30%) — losses must not shrink the attributed percentage (Core Rule 3).

```
              ┌─── 60 Mgal/yr ──► TREATMENT ($5/kgal, 60 in / 30 out) ──► SYSTEM A
INTAKE        │
($1/kgal) │
  100 Mgal/yr └─── 40 Mgal/yr ──────────────────────────────────────────► SYSTEM B
```

**Node costs**

| Node | Unit cost | Flow basis | Block cost |
|---|---|---|---|
| Intake | $1/kgal | 100 Mgal/yr | **$100,000** |
| Treatment | $5/kgal | 60 Mgal/yr in | **$300,000** |

**Expected attribution**

| System | Intake share | Intake $ | Treatment $ |
|---|---|---|---|
| System A | 60 / 100 = 60% (pre-loss path inflow) | **$60,000** | **$300,000** (100% — sole downstream system) |
| System B | 40 / 100 = 40% | **$40,000** | — |
| **Total** | 100% | **$100,000** ✓ | |

> System A's intake attribution uses the treatment's branch ratio (30/30 = 1.0, since it has a single child) multiplied by the 60 Mgal/yr path inflow — not the 30 Mgal/yr it actually received. The 30 Mgal/yr lost in treatment is still paid for by System A, the sole beneficiary of that branch. This is the fixture added to close the gap noted in `intake-attribution-delivered-flow-volume-refactor.md`: an intake that splits to multiple paths where one branch contains a lossy treatment chain.

---

### 2.6 `mid-chain-branching`

**What it tests:** An intake that splits to two paths; one of those paths routes through a treatment node (Chemical Treatment 2) that itself forks into branches of *different depth* — Cooling Tower is one hop away, Boiler is two hops away through a second treatment node (UV Filtration). Both treatment nodes lose volume. This is the regression fixture for the mid-chain-branching gap: a formula that only looks at the treatment node immediately upstream of each system cannot see that UV Filtration itself was only one branch of Chemical Treatment 2's output, and double-counts Cooling Tower's and Boiler's shares.

```
CITY WATER ($1/kgal)
  │ 177.2 Mgal/yr total
  ├─── 49.2 Mgal/yr ──► CHEMICAL TREATMENT 2 ($2/kgal, 49.2 in / 37 out — loses 12.2)
  │                          ├─── 25 Mgal/yr ──► COOLING TOWER
  │                          └─── 12 Mgal/yr ──► UV FILTRATION ($4/kgal, 12 in / 6 out — loses 6)
  │                                                    └─── 6 Mgal/yr ──► BOILER
  └─── 128 Mgal/yr ─────────────────────────────────────────────────────► SYSTEM B
```

**Node costs**

| Node | Unit cost | Flow basis | Block cost |
|---|---|---|---|
| City Water | $1/kgal | 177.2 Mgal/yr | **$177,200** |
| Chemical Treatment 2 | $2/kgal | 49.2 Mgal/yr in | **$98,400** |
| UV Filtration | $4/kgal | 12 Mgal/yr in | **$48,000** |

**Expected attribution — intake**

| System | Branch ratio(s) | Intake share | Intake $ |
|---|---|---|---|
| Cooling Tower | 25/37 = 0.6757 | 49.2 × 0.6757 / 177.2 = 18.76% | **$33,243** |
| Boiler | (12/37) × (6/6) = 0.3243 | 49.2 × 0.3243 / 177.2 = 9.00% | **$15,957** |
| System B | — (direct path) | 128 / 177.2 = 72.23% | **$128,000** |
| **Total** | | 100% | **$177,200** ✓ |

> Cooling Tower + Boiler sum to 27.76% — exactly the path's true share of the intake (49.2/177.2). A formula limited to the treatment node immediately upstream of each system (the pre-existing behavior this replaced) summed these two systems to 46.53% instead — a double-count, since Boiler's old fraction alone (27.77%) already equaled the full path's true share, before Cooling Tower's fair share was added on top. UV Filtration's own loss (12 in / 6 out) does not reduce Boiler's branch ratio, because UV Filtration has a single child — the loss is absorbed through path inflow, the same rule verified in `split-path-treatment-loss` §2.5.

**Expected attribution — treatment (Chemical Treatment 2)**

| System | Branch ratio(s) | Treatment share | Treatment $ |
|---|---|---|---|
| Cooling Tower | 25/37 = 0.6757 | 67.57% | **$66,486** |
| Boiler | (12/37) × (6/6) = 0.3243 | 32.43% | **$31,914** |
| **Total** | | 100% | **$98,400** ✓ |

> Reading only the edge closest to the system (UV Filtration → Boiler, 6 Mgal/yr) instead of the edge Chemical Treatment 2 actually sent down that branch (12 Mgal/yr) would have produced a Boiler fraction of 6/37 = 16.22% (\$15,957) — undercounting Chemical Treatment 2's own cost by \$15,957 and leaving Cooling Tower + Boiler summing to only 83.79% instead of 100%. UV Filtration's own treatment cost (\$48,000) is a separate row, attributed 100% to Boiler independently (single downstream system, single edge).

---

### 2.7 `treatment-chain-downstream-loss`

**What it tests:** Two treatment units in series where the *first* has no loss of its own, but the *second* does. There is no branching anywhere in this diagram. This is the regression fixture for the treatment-cost mid-chain gap in its simplest, unbranched form: Treatment A's own attribution must not be undercounted by a later, unrelated loss in Treatment B.

```
INTAKE ($1/kgal)
  │ 100 Mgal/yr
  ▼
TREATMENT A ($5/kgal)   ← 100 in, 100 out (lossless)
  │ 100 Mgal/yr
  ▼
TREATMENT B ($4/kgal)   ← 100 in, 70 out (30 Mgal/yr lost)
  │ 70 Mgal/yr
  ▼
SYSTEM
```

**Node costs**

| Node | Unit cost | Flow basis | Block cost |
|---|---|---|---|
| Intake | $1/kgal | 100 Mgal/yr | **$100,000** |
| Treatment A | $5/kgal | 100 Mgal/yr in | **$500,000** |
| Treatment B | $4/kgal | 100 Mgal/yr in | **$400,000** |

**Expected attribution — System**

| Treatment A | Treatment B | Total |
|---|---|---|
| $500,000 (100%) | $400,000 (100%) | **$900,000** |

> Treatment A's own attribution reads the first edge of its path (Treatment A → Treatment B, 100 Mgal/yr) rather than the edge closest to the system (Treatment B → System, 70 Mgal/yr). Treatment B's branch ratio to its sole child is 70/70 = 1.0 regardless of its own loss, so branchFraction = 1.0 and Treatment A's fraction = 100/100 = 100%. Reading the last edge instead would have produced 70/100 = 70%, silently undercounting Treatment A's cost by $150,000 — even though nothing in this diagram branches. See `mid-chain-branching` §2.6 for the version of this gap that also involves a fork.

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

**What it tests:** Two systems both feed into one WWT unit, which returns some treated water for reuse (System C) and sends the rest to discharge. This is the worked example from `cost-component-attribution/apply-system-waste-water-treatment-costs.md §6`. The test documents a known algorithm bug in the Pass 2 deduction logic.

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

### 5.2 `treatment-based-merge-node`

**What it tests:** The same two-intakes-into-one-node merge pattern as `summing-node` §5.1, but the merge point is a `water-treatment` node instead of a transparent `summing-node` type. This exercises the branch-ratio `localRatio` calculation for each intake's path independently, rather than skipping it (a `summing-node` is not a `water-treatment` type, so it never triggers the branch-ratio walk at all).

```
INTAKE A ($1/kgal, 60 Mgal/yr) ──┐
                                   ├─► TREATMENT ($3/kgal, 100 in / 100 out) ──► SYSTEM
INTAKE B ($1/kgal, 40 Mgal/yr) ──┘
```

**Node costs**

| Node | Unit cost | Flow basis | Block cost |
|---|---|---|---|
| Intake A | $1/kgal | 60 Mgal/yr | **$60,000** |
| Intake B | $1/kgal | 40 Mgal/yr | **$40,000** |
| Treatment | $3/kgal | 100 Mgal/yr in | **$300,000** |

**Expected attribution — System**

| Intake A | Intake B | Treatment | Total |
|---|---|---|---|
| $60,000 (100%) | $40,000 (100%) | $300,000 (100%) | **$400,000** |

> Each intake's path independently reaches Treatment, whose single outgoing edge (to System, carrying its full 100 Mgal/yr outflow) gives a branch ratio of 1.0 regardless of which intake's path is being evaluated — so each intake attributes 100% of its own block cost to the sole downstream system, the same outcome `summing-node` produces through a non-treatment merge point.

---

### 5.3 `reuse-chained-systems`

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
