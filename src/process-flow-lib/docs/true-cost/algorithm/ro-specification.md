# True Cost Algorithm — RO Configuration

This document specifies cost attribution for diagrams that contain a **Reverse Osmosis (RO) configuration**. It is an extension of [algorithm-v3.md](algorithm-v3.md) and defines **Section 5** of the Cost Attribution framework — read that document first. The rule here, **ro-reject-redirect**, overrides the standard proportional rules (no-losses-path, with-losses-path, mid-chain-fork, reuse-and-discharge-split, proportional-discharge) wherever an RO configuration is detected.

An RO unit produces a **product-water path** (permeate) and a **reject-water path** (concentrate). The reject path has no water-using system of its own, so under the standard proportional rules alone its share of intake and treatment cost would be permanently unattributed. **ro-reject-redirect** solves this by redirecting the reject's share to the water-using system(s) that received the RO's product water — split among them exactly as any other component splits attribution among multiple systems, by flow share.

---

## Attribution Formula

The reject's share is folded into the product recipients' shares rather than forced to a flat 1.0 for a single system. Each product-receiving system's attribution fraction is its share of the RO's **product-only outflow** (the reject branch is excluded from this denominator, the same way a lossy branch is excluded from the denominator in the with-losses-path rule):

```
productOutflow = RO node's total outflow to product-branch children only (excludes the reject edge)
system's productShare = system's flow received via the product branch / productOutflow
attribution fraction (intake, RO treatment, and any redirected reject-path WWT/discharge) = system's productShare
```

When exactly one system receives product water, `productShare = 1.0` and the result is identical to a single-system configuration. When multiple systems receive product water, their `productShare` values sum to 1.0 and each receives its own proportional slice — together they absorb 100% of the cost that the reject branch would otherwise leave unattributed.

```
cost charged to system = productShare × total component cost
```

---

## Supported Configurations

A Reverse Osmosis unit produces two output branches: a **product-water path** (permeate) and a **reject-water path** (concentrate). The product-water path may fork to **one or more** water-using systems — including **two or more**, not just a single system as in earlier versions of this specification. This is not limited to Configuration 2 below; every configuration in this list supports an arbitrary number of product-recipient systems, denoted `System(s)`. The reject-water path and the product system(s)' downstream flow may connect to waste treatment in several ways, including sharing a waste-water-treatment (WWT) node with systems outside the RO chain:

**1 — Direct discharge on both paths, single product system**
```
Intake → RO → (product) → System → Discharge
              └ (reject) → Discharge
```

**2 — Product path forks to two or more systems**
```
Intake → RO ──┬─ (product) → System A → Discharge
              ├─ (product) → System B → Discharge
              ├─ (product) → System C → Discharge  (and so on, for N ≥ 2 systems)
              └─ (reject)  → Discharge
```
Each product-recipient system is identified independently during preprocessing and assigned its own `productShare` of the RO's product-only outflow (see [Attribution Formula](#attribution-formula)). There is no cap on the number of systems the product branch may fork to.

**3 — Both paths to the same discharge**
```
Intake → RO → (product) → System(s) ──► Discharge (same)
              └ (reject) ─────────────► Discharge (same)
```

**4 — Reject path through waste treatment**
```
Intake → RO → (product) → System(s) → Discharge
              └ (reject) → WWT → Discharge
```

**5 — Product path through waste treatment**
```
Intake → RO → (product) → System(s) → WWT → Discharge
              └ (reject) ────────────────────► Discharge
```
The WWT here treats the product recipient(s)' own post-use wastewater, not the incoming product water itself — it sits after System(s), not between RO and System(s).

**6 — Both paths through the same waste treatment**
```
Intake → RO → (product) → System(s) ──► WWT → Discharge
              └ (reject) ──────────────► WWT (same)
```
As in Configuration 5, the WWT treats System(s)' own post-use wastewater - it sits after System(s) on the product path. The reject branch feeds the same WWT node directly from the RO (not via System(s)). The WWT is therefore not exclusive to the RO's reject stream (see [How to attribute](#how-to-attribute)): it has two independent upstream contributors - System(s)' own discharge and the RO's reject - that happen to total 100% here because there is no contributor outside the RO chain.

**7 — Reject-path WWT shared with an independent water-using system**
```
Intake → RO → (product) → System A → Discharge
              └ (reject) ──────┐
                                ▼
                               WWT ◄── System B (System B's own wastewater)
                                │
                                ▼
                            Discharge
```
The WWT node here is not exclusive to the RO's reject stream — it also receives System B's own wastewater directly, where System B is not a product recipient of this RO unit. Both contributors are attributed independently: System B receives its own share by the standard reuse-and-discharge-split rule, and the RO's reject share is redirected to System A by **ro-reject-redirect**.

---

## Cost Attribution

### 5. RO Cost Components

#### What to identify

A water-treatment node qualifies for **ro-reject-redirect** when **all** of the following hold:

1. **Treatment type is Reverse Osmosis.** The node's `treatmentType` is `6`.
2. **Exactly one reject branch.** Among the RO node's direct outflow edges, exactly one is the reject-water branch (identified by criterion 4 below). The remaining direct outflow edges — one or more — make up the product-water side; they may lead straight to separate water-using systems (Supported Configuration 2) or converge/fork through further treatment before reaching one.
3. **Product path.** Each product-water branch leads to a `water-using-system` node, whether directly or after further treatment (see mid-chain-fork in algorithm-v3). Every product-recipient system found this way is identified along with its share of the RO node's product-only outflow. This share is what **ro-reject-redirect** uses in place of a flat 1.0.
4. **Reject path.** The reject branch's subtree contains no `water-using-system` nodes, exactly one `water-discharge` node, and at most one `waste-water-treatment` node (immediately before the discharge).
5. **Single upstream intake.** Traversing upstream from the RO node reaches exactly one `water-intake` node.
6. **WWT need not be exclusive.** A `waste-water-treatment` node on the reject path may have other parents besides the RO node — it may also receive wastewater directly from one or more water-using systems that are not product recipients of this RO unit, or the reject stream of another RO unit. Each contributor is still attributed independently (see [How to attribute](#how-to-attribute)); the presence of other contributors does not disqualify the RO's own reject contribution from being redirected.

If criteria 1, 2, 4, or 5 are not met, no override applies and all four cost attribution sub-routines proceed under the standard rules.

#### Preprocessing — Step 1.5

Before any cost attribution sub-routine executes, every `water-treatment` node in the diagram is evaluated against the qualification criteria above. For each qualifying node, the following are recorded in an index keyed by the RO treatment node ID:

- The upstream `water-intake` node
- The `water-treatment` (RO) node
- The `water-discharge` node on the reject path (the **reject discharge node**)
- The `waste-water-treatment` node on the reject path, if present. A WWT node on the product path (Supported Configuration 5) is not stored — it is attributed normally by standard reuse-and-discharge-split because the upstream walk from that node reaches a water-using system directly.
- The **product distribution**: a map of each product-recipient system's node ID to its `productShare` (its flow received via the product branch, divided by the RO node's product-only outflow), computed by the standard branch-ratio walk over the product subtree.

This index is consulted during all four Step 2 sub-routines. **Preprocessing must complete before any Step 2 cost attribution begins.** The index is keyed by the RO treatment node, not by a single system, because more than one system may need to be split across.

#### How to attribute

- **ro-reject-redirect (Intake):** When the intake being attributed is the registered intake for a qualifying RO configuration, each system in that RO's product distribution receives `productShare × intake block cost`, regardless of the product-water recovery fraction. The reject stream is an unavoidable operational loss, not water consumed by a second beneficiary; its share is folded into the product recipients rather than left unattributed.

- **ro-reject-redirect (Water Treatment):** When the treatment node being attributed is the registered RO node, each system in the product distribution receives `productShare × RO block cost`. Block cost is calculated on the total inflow to the RO node, exactly as under the standard rule; only the attribution fraction changes.

- **ro-reject-redirect (Wastewater Treatment):** When a WWT node is registered in the preprocessing index as the reject-path WWT for a qualifying RO configuration, the RO's own contribution to that WWT is identified the same way any discharger's contribution is identified under reuse-and-discharge-split — as a share of the WWT's total inflow. That share of the WWT block cost is then split across the RO's product recipients by `productShare`, instead of being attributed to the RO node itself (which is not a water-using system and would otherwise leave that share unattributed). If the WWT node has no other inflow (Supported Configuration 4), the RO's reject share is 100% of the WWT's inflow and the product recipients absorb the full WWT cost between them. If the WWT node is shared — whether with the RO's own product recipient(s) feeding it their own post-use wastewater (Supported Configuration 6) or with an independent system outside the RO chain (Supported Configuration 7) — the other contributor's share is attributed directly by the standard reuse-and-discharge-split rule (the upstream walk reaches it as an ordinary water-using system immediately above the WWT), and only the RO's direct reject share is redirected by ro-reject-redirect. In Configuration 6 the two shares happen to land on the same system(s) and together total 100% of the WWT cost, but they are computed by two independent rules, not by a single 100% ro-reject-redirect attribution.

- **ro-reject-redirect (Discharge, reject path):** When the discharge node being attributed is the registered reject discharge node for a qualifying RO configuration, each system in the product distribution receives `productShare × discharge block cost`. The standard upstream walk from the reject-path discharge reaches the RO node — not a water-using system — and would attribute nothing; the preprocessing index identifies the product distribution directly and the upstream walk is skipped.

- **Product-path discharge:** The product-path discharge is not subject to **ro-reject-redirect** and is attributed normally under proportional-discharge. The standard upstream walk correctly finds the water-using system(s) on the product path and attributes cost by flow fraction, splitting across multiple systems exactly as any other shared discharge would. When both paths share a single discharge node (Supported Configurations 3 and 6), that node is the registered reject discharge node and **ro-reject-redirect** applies to the RO's share of it — no separate product-path discharge exists in that shape.

#### Non-qualifying configurations

| Configuration | Reason the override does not apply |
|---|---|
| Reject path contains a water-using system | The reject stream is consumed by another system, not wasted |
| Multiple intake nodes upstream of the RO unit | Each intake would require independent attribution; standard proportional rules apply |
| RO unit has internal loss (inflow ≠ product + reject) | The model assumes all inflow exits as either product or reject; configurations with unaccounted internal loss are not supported |
| Treatment type is not Reverse Osmosis | Override is specific to `treatmentType === 6` |

#### Examples

- **ro-reject-redirect, intake, single product system:** City Water (10 MGY, $1/kGal) → RO (70% recovery) → Process (7 MGY product) + Discharge-Reject (3 MGY reject). Intake block cost = $10,000/yr. Without the override, 30% ($3,000) is permanently unattributed — no system receives the reject volume. Process is the only product recipient (`productShare` = 1.0): Process = $10,000/yr.

- **ro-reject-redirect, intake, product forks to two systems:** City Water (10 MGY, $1/kGal) → RO (70% recovery, 7 MGY product) + Discharge-Reject (3 MGY reject). Product forks to Process A (5 MGY) and Process B (2 MGY). `productOutflow` = 7 MGY. Process A's `productShare` = 5/7 = 71.4%; Process B's `productShare` = 2/7 = 28.6%. Intake block cost $10,000/yr → Process A = $7,143/yr, Process B = $2,857/yr. Together they absorb the full $10,000, including the 30% that the reject stream would otherwise leave unattributed.

- **ro-reject-redirect, treatment:** RO block cost = 10 MGY × $5/kGal = $50,000/yr, same two-system split as above: Process A = $35,714/yr, Process B = $14,286/yr.

- **ro-reject-redirect, WWT, exclusive:** Reject stream passes through a brine WWT ($3/kGal) before discharge, with no other contributors. WWT block cost = 3 MGY × $3/kGal = $9,000/yr. The RO's contribution is 100% of WWT inflow, split by `productShare`: Process A = $6,429/yr, Process B = $2,571/yr.

- **ro-reject-redirect, WWT, shared with an independent system:** The same brine WWT also receives 4 MGY of System C's own wastewater (System C is not a product recipient of this RO). WWT total inflow = 3 + 4 = 7 MGY, block cost = 7 MGY × $3/kGal = $21,000/yr. System C's contribution (4/7 = 57.1%) is attributed to System C directly by reuse-and-discharge-split: $12,000/yr. The RO's contribution (3/7 = 42.9%, $9,000/yr) is redirected and split by `productShare`: Process A = $6,429/yr, Process B = $2,571/yr — the same dollar amounts as the exclusive case, because the RO's own reject flow and unit cost did not change.

- **ro-reject-redirect, discharge, reject path:** Discharge-Reject block cost = 3 MGY × $0.50/kGal = $1,500/yr. The upstream walk reaches the RO node, not a water-using system, and attributes $0 without the override. Split by `productShare`: Process A = $1,071/yr, Process B = $429/yr. Discharge-Product is attributed normally under proportional-discharge and is unaffected.

---

## Full Worked Example — Multiple Product Systems, Shared Reject WWT

**Diagram:**

```
City Water (10 MGY, $1/kGal) → RO ($5/kGal, 70% recovery)
                                  ├─ (product, 5 MGY) → Process A → Discharge-A (5 MGY, $1/kGal)
                                  ├─ (product, 2 MGY) → Process B → Discharge-B (2 MGY, $1/kGal)
                                  └─ (reject,  3 MGY) ──┐
                                                          ▼
                             System C's wastewater (4 MGY) ──► WWT ($3/kGal) ──► Discharge-Shared (7 MGY, $0.50/kGal)
```

**Block costs:**

| Component | Flow basis | Unit cost | Block cost |
|---|---|---|---|
| City Water intake | 10 MGY outflow | $1/kGal | $10,000/yr |
| RO treatment | 10 MGY inflow | $5/kGal | $50,000/yr |
| WWT | 7 MGY inflow (3 reject + 4 System C) | $3/kGal | $21,000/yr |
| Discharge-A | 5 MGY inflow | $1/kGal | $5,000/yr |
| Discharge-B | 2 MGY inflow | $1/kGal | $2,000/yr |
| Discharge-Shared | 7 MGY inflow | $0.50/kGal | $3,500/yr |

**Preprocessing (Step 1.5):** RO is registered with `productOutflow` = 7 MGY and product distribution {Process A: 5/7 = 71.4%, Process B: 2/7 = 28.6%}. Index stores: intake = City Water, treatmentNode = RO, wasteTreatmentNode = WWT (shared, not exclusive).

**Attribution:**

| Cost component | Rule | Process A (71.4%) | Process B (28.6%) | System C |
|---|---|---|---|---|
| City Water intake | ro-reject-redirect | $7,143/yr | $2,857/yr | — |
| RO treatment | ro-reject-redirect | $35,714/yr | $14,286/yr | — |
| WWT | ro-reject-redirect (RO's 3/7 share) + reuse-and-discharge-split (System C's 4/7 share) | $6,429/yr | $2,571/yr | $12,000/yr |
| Discharge-A / B | proportional-discharge | $5,000/yr | $2,000/yr | — |
| Discharge-Shared | ro-reject-redirect (RO's 3/7 share) + proportional-discharge (System C's 4/7 share) | $1,071/yr | $429/yr | $2,000/yr |

**Total true cost:** Process A = $55,357/yr, Process B = $22,143/yr, System C = $14,000/yr.

Process A and Process B split every RO-related cost component by the same `productShare` (71.4% / 28.6%) they were assigned at preprocessing, exactly as they would split a standard shared component. System C is attributed only for its own wastewater contribution and is unaffected by how the RO's reject share is redirected upstream of it.

---
