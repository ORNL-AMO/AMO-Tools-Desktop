# True Cost Attribution — Supported Cases

Cases verified for each attribution function in `src/process-flow-lib/water/logic/results.ts`.

---

## `applySystemIntakeCosts` — `water-intake`

Walks downstream from each intake node, stopping attribution at the first water-using system on each path. Splits intake cost among those systems by the volume each receives from the intake.

**Denominator selection:**

Attribution fractions are computed against one of two denominators:

- **Delivered-flow-volume basis** (`deliveredFlowVolume` — the immediate treatment node's total outflow): used when the treatment chain is the sole gateway through which all intake flow reaches downstream systems. Ensures 100% of intake cost is distributed even when water is lost in treatment.
- **Intake-flow-volume basis** (`intakeData.blockCosts.totalFlow` — the intake's total outflow): used when the intake splits to multiple paths, or when no treatment losses exist. Each system receives its proportional share of the full intake volume; other paths cover the remainder.

**Conditions for delivered-flow-volume basis** (both must hold):

1. `intakeHasSingleOutflow` — the intake node has exactly one outgoing child, meaning all intake flow enters a single treatment chain.
2. A treatment loss exists somewhere in the chain — either the immediate upstream treatment node (`deliveredFlowVolume < treatmentNodeInflow`) or any treatment node traversed earlier in the path (`hasUpstreamTreatmentLoss`).

**Verified cases:**

| Case | Configuration | `intakeHasSingleOutflow` | Chain has losses | Denominator basis | Expected result | Confidence |
|------|----------|--------------------------|------------------|-------------------|-----------------|------------|
| Direct intake to single system | Intake→SystemA | true | false — no treatment | intake-flow-volume | SystemA 100% | 100% |
| Intake splits directly to multiple systems | Intake→{SystemA(6), SystemB(4)} | false | false — no treatment | intake-flow-volume | SystemA 60%, SystemB 40% | 100% |
| Linear chain, no losses | Intake(10)→Treatment(10in/10out)→SystemA | true | false | intake-flow-volume | SystemA 100% | 100% |
| Linear chain, treatment has losses | Intake(10)→Treatment(10in/8out)→SystemA | true | true | delivered-flow-volume | SystemA 100% (8/8) | 100% |
| Intake → single treatment → multiple systems, no losses | Intake(10)→Treatment(10in/10out)→{SystemA(6), SystemB(4)} | true | false | intake-flow-volume | SystemA 60%, SystemB 40% | 100% |
| Treatment split, no losses (A) | Well(10)→Chlorine(10)→{Filtration(5), UserB(5)}; Filtration→{UserB(2.5), UserC(2.5)} | true | false — Chlorine 10/10, Filtration 5/5 | intake-flow-volume | UserB 75%, UserC 25% | 100% |
| Treatment split, no losses (B) | Well(10)→Chlorine(10)→{Filtration(5), UserB(5)}; Filtration→UserC(5) | true | false | intake-flow-volume | UserB 50%, UserC 50% | 100% |
| Chained treatment, upstream loss (Stage 2) | Intake(10)→TreatA(10in/8out)→TreatB(8in/8out)→{SystemC(5), SystemD(3)} | true | true — TreatA in path, 10→8 | delivered-flow-volume | SystemC 62.5%, SystemD 37.5% | 100% |
| Chained treatment, both nodes have losses | Intake(10)→TreatA(10in/8out)→TreatB(8in/6out)→{SystemC(4), SystemD(2)} | true | true — TreatA and TreatB | delivered-flow-volume | SystemC 66.7%, SystemD 33.3% (denominator: TreatB outflow 6) | 95% |
| Intake splits, one branch has treatment with losses | Intake(97.06)→TreatA(10.14in/10.00out)→{SystemA(6.98), SystemB(3.02)} + other paths | **false** | true — TreatA 10.14→10.00 | **intake-flow-volume** | SystemA 7.19%, SystemB 3.11% | 100% |
| Multiple intakes sharing downstream systems | Intake1→SystemA; Intake2→SystemA | per intake | per intake | per intake | costs accumulate additively per intake | 100% |
| RO direct-discharge special case | Intake→RO→{SystemA, Discharge} (single system, RO outflows directly to discharge) | true | — | override | SystemA 100% (fraction forced to 1) | 100% |
| User-adjusted attribution override | any configuration with user override set on component | — | — | override | user-specified fraction replaces default | 100% |
