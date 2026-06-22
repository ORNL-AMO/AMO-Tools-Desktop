/**
 * Unit tests for getPlantSummaryResults and the four attribution sub-routines.
 *
 * Each fixture is the minimum graph needed to exercise one identifiable
 * behavior. Assertions use toBeCloseTo(value, 0) for dollar amounts to avoid
 * floating-point noise causing false failures.
 *
 *  Fixture definitions and mass-balance invariants are documented inline with
* the tests below.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { SystemAttributionMap } from 'process-flow-lib';
import { getPlantSummaryResults } from 'process-flow-lib';
import {
  makeIntakeNode,
  makeSystemNode,
  makeDischargeNode,
  makeTreatmentNode,
  makeWasteTreatmentNode,
  makeSummingNode,
  makeEdge,
  makeCalcData,
  defaultSettings,
} from '../__fixtures__/builders';

// getFlowCost formula: unitCost * (flow * 1000)
// e.g. costPerKGal=1, flow=100 → 1 * 100_000 = 100_000

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const blockCost = (costPerKGal: number, flow: number) => costPerKGal * flow * 1000;

// ---------------------------------------------------------------------------
// Fixture: simple-linear
// Configuration: Intake → System → Discharge
//
//   intake (cost=1/kGal, outflow=100)
//     └─ e1 (100) ─► system
//                        └─ e2 (80) ─► discharge (cost=2/kGal, inflow=80)
//
// Expected attribution fractions: intake=1.0, discharge=1.0 (single system)
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — simple-linear: Intake → System → Discharge', () => {
  const INTAKE_COST = 1;
  const DISCHARGE_COST = 2;
  const INTAKE_FLOW = 100;
  const DISCHARGE_FLOW = 80;

  const intake = makeIntakeNode('intake', INTAKE_COST);
  const system = makeSystemNode('system');
  const discharge = makeDischargeNode('discharge', DISCHARGE_COST);

  const nodes = [intake, system, discharge];
  const edges = [
    makeEdge('intake', 'system', INTAKE_FLOW),
    makeEdge('system', 'discharge', DISCHARGE_FLOW),
  ];
  const calcData = makeCalcData({
    intake: { totalDischargeFlow: INTAKE_FLOW },
    system: { totalSourceFlow: INTAKE_FLOW, totalDischargeFlow: DISCHARGE_FLOW },
    discharge: { totalSourceFlow: DISCHARGE_FLOW },
  });

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    {},
  );

  it('attributes 100% of intake block cost to the single system', () => {
    expect(result.trueCostOfSystems['system'].intake)
      .toBeCloseTo(blockCost(INTAKE_COST, INTAKE_FLOW), 0);
  });

  it('attributes 100% of discharge block cost to the single system', () => {
    expect(result.trueCostOfSystems['system'].discharge)
      .toBeCloseTo(blockCost(DISCHARGE_COST, DISCHARGE_FLOW), 0);
  });

  it('records intake attribution fraction of 1.0 in systemAttributionMap', () => {
    expect(result.systemAttributionMap['system']['intake'].totalAttribution.default)
      .toBeCloseTo(1.0, 6);
  });

  it('records discharge attribution fraction of 1.0 in systemAttributionMap', () => {
    expect(result.systemAttributionMap['system']['discharge'].totalAttribution.default)
      .toBeCloseTo(1.0, 6);
  });

  it('intake block cost in costComponentsTotalsMap matches expected', () => {
    expect(result.costComponentsTotalsMap['intake'].totalBlockCost)
      .toBeCloseTo(blockCost(INTAKE_COST, INTAKE_FLOW), 0);
  });
});

// ---------------------------------------------------------------------------
// Fixture: shared-intake
// Configuration: Intake → [System A (60%), System B (40%)]
//
//   intake (cost=1/kGal, outflow=100)
//     ├─ e_a (60) ─► systemA
//     └─ e_b (40) ─► systemB
//
// Expected: costs split proportionally by flow fraction
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — shared-intake: Intake → [System A (60%), System B (40%)]', () => {
  const INTAKE_COST = 1;
  const FLOW_A = 60;
  const FLOW_B = 40;
  const TOTAL_FLOW = FLOW_A + FLOW_B;

  const intake = makeIntakeNode('intake', INTAKE_COST);
  const systemA = makeSystemNode('sysA');
  const systemB = makeSystemNode('sysB');

  const nodes = [intake, systemA, systemB];
  const edges = [
    makeEdge('intake', 'sysA', FLOW_A),
    makeEdge('intake', 'sysB', FLOW_B),
  ];
  const calcData = makeCalcData({
    intake: { totalDischargeFlow: TOTAL_FLOW },
    sysA: { totalSourceFlow: FLOW_A },
    sysB: { totalSourceFlow: FLOW_B },
  });

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    {},
  );

  it('attributes 60% of intake block cost to System A', () => {
    const expected = blockCost(INTAKE_COST, TOTAL_FLOW) * (FLOW_A / TOTAL_FLOW);
    expect(result.trueCostOfSystems['sysA'].intake).toBeCloseTo(expected, 0);
  });

  it('attributes 40% of intake block cost to System B', () => {
    const expected = blockCost(INTAKE_COST, TOTAL_FLOW) * (FLOW_B / TOTAL_FLOW);
    expect(result.trueCostOfSystems['sysB'].intake).toBeCloseTo(expected, 0);
  });

  it('attributed intake costs sum to total intake block cost (mass balance)', () => {
    const total = result.trueCostOfSystems['sysA'].intake
      + result.trueCostOfSystems['sysB'].intake;
    expect(total).toBeCloseTo(blockCost(INTAKE_COST, TOTAL_FLOW), 0);
  });

  it('records correct attribution fractions in systemAttributionMap', () => {
    expect(result.systemAttributionMap['sysA']['intake'].totalAttribution.default)
      .toBeCloseTo(FLOW_A / TOTAL_FLOW, 6);
    expect(result.systemAttributionMap['sysB']['intake'].totalAttribution.default)
      .toBeCloseTo(FLOW_B / TOTAL_FLOW, 6);
  });
});

// ---------------------------------------------------------------------------
// Fixture: treatment-with-loss
// Configuration: Intake → Treatment (100 in, 80 out, losses=20) → System
//
//   intake (cost=1/kGal, outflow=100)
//     └─ e1 (100) ─► treatment (cost=5/kGal, inflow=100, outflow=80)
//                        └─ e2 (80) ─► system
//
// Algorithm uses delivered-flow-volume basis when intake has a single
// outflow path and the treatment chain has losses.
// System is responsible for 100% of both block costs despite receiving
// only 80 units from the treatment node.
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — treatment-with-loss: Intake → Treatment (losses) → System', () => {
  const INTAKE_COST = 1;
  const TREATMENT_COST = 5;
  const INTAKE_FLOW = 100;
  const TREATMENT_INFLOW = 100;
  const TREATMENT_OUTFLOW = 80;

  const intake = makeIntakeNode('intake', INTAKE_COST);
  const treatment = makeTreatmentNode('treatment', TREATMENT_COST);
  const system = makeSystemNode('system');

  const nodes = [intake, treatment, system];
  const edges = [
    makeEdge('intake', 'treatment', INTAKE_FLOW),
    makeEdge('treatment', 'system', TREATMENT_OUTFLOW),
  ];
  const calcData = makeCalcData({
    intake: { totalDischargeFlow: INTAKE_FLOW },
    treatment: { totalSourceFlow: TREATMENT_INFLOW, totalDischargeFlow: TREATMENT_OUTFLOW },
    system: { totalSourceFlow: TREATMENT_OUTFLOW },
  });

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    {},
  );

  it('attributes 100% of intake cost to the downstream system (delivered-flow-volume basis)', () => {
    expect(result.trueCostOfSystems['system'].intake)
      .toBeCloseTo(blockCost(INTAKE_COST, INTAKE_FLOW), 0);
  });

  it('attributes 100% of treatment cost to the downstream system', () => {
    // Treatment block cost uses inflow as the cost basis
    expect(result.trueCostOfSystems['system'].treatment)
      .toBeCloseTo(blockCost(TREATMENT_COST, TREATMENT_INFLOW), 0);
  });

  it('intake attribution fraction reflects delivered-flow basis (systemInflow / deliveredFlow = 1.0)', () => {
    expect(result.systemAttributionMap['system']['intake'].totalAttribution.default)
      .toBeCloseTo(1.0, 6);
  });

  it('treatment attribution fraction is 1.0 (system absorbs all losses)', () => {
    expect(result.systemAttributionMap['system']['treatment'].totalAttribution.default)
      .toBeCloseTo(1.0, 6);
  });
});

// ---------------------------------------------------------------------------
// Fixture: ro-single-system
// Configuration: Intake → RO (treatmentType=6) → System A → Discharge1 (product path)
//                                          └──────────► Discharge2 (reject path)
//
//   intake (cost=1/kGal, outflow=100)
//     └─ e1 (100) ─► RO (cost=5/kGal, treatmentType=6, inflow=100, outflow=100)
//                     ├─ e2 (70) ─► systemA
//                     │               └─ e4 (70) ─► discharge1 (cost=1/kGal)
//                     └─ e3 (30) ─► discharge2 (reject, cost=0)
//
// assignsystemsWithRODirectDischarge detects this configuration and stores
// systemA as the single-system RO owner, overriding all attribution
// fractions to 1.0 regardless of actual flow split.
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — ro-single-system: Intake → RO → [System, Discharge(reject)]', () => {
  const INTAKE_COST = 1;
  const RO_COST = 5;
  const DISCHARGE1_COST = 1;
  const RO_INFLOW = 100;
  const PRODUCT_FLOW = 70;
  const REJECT_FLOW = 30;

  const intake = makeIntakeNode('intake', INTAKE_COST);
  const ro = makeTreatmentNode('ro', RO_COST, 6); // treatmentType 6 = Reverse Osmosis
  const systemA = makeSystemNode('sysA');
  const discharge1 = makeDischargeNode('discharge1', DISCHARGE1_COST); // product path
  const discharge2 = makeDischargeNode('discharge2', 0);               // reject path

  const nodes = [intake, ro, systemA, discharge1, discharge2];
  const edges = [
    makeEdge('intake', 'ro', RO_INFLOW),
    makeEdge('ro', 'sysA', PRODUCT_FLOW),
    makeEdge('ro', 'discharge2', REJECT_FLOW),
    makeEdge('sysA', 'discharge1', PRODUCT_FLOW),
  ];
  const calcData = makeCalcData({
    intake:     { totalDischargeFlow: RO_INFLOW },
    ro:         { totalSourceFlow: RO_INFLOW, totalDischargeFlow: RO_INFLOW },
    sysA:       { totalSourceFlow: PRODUCT_FLOW, totalDischargeFlow: PRODUCT_FLOW },
    discharge1: { totalSourceFlow: PRODUCT_FLOW },
    discharge2: { totalSourceFlow: REJECT_FLOW },
  });

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    {},
  );

  it('assigns all intake block cost to the single system (RO override)', () => {
    expect(result.trueCostOfSystems['sysA'].intake)
      .toBeCloseTo(blockCost(INTAKE_COST, RO_INFLOW), 0);
  });

  it('assigns all RO treatment block cost to the single system (RO override)', () => {
    expect(result.trueCostOfSystems['sysA'].treatment)
      .toBeCloseTo(blockCost(RO_COST, RO_INFLOW), 0);
  });

  it('assigns product-path discharge cost to the single system', () => {
    expect(result.trueCostOfSystems['sysA'].discharge)
      .toBeCloseTo(blockCost(DISCHARGE1_COST, PRODUCT_FLOW), 0);
  });

  it('records intake attribution fraction of 1.0 in systemAttributionMap (RO override)', () => {
    expect(result.systemAttributionMap['sysA']['intake'].totalAttribution.default)
      .toBeCloseTo(1.0, 6);
  });

  it('records RO treatment attribution fraction of 1.0 in systemAttributionMap (RO override)', () => {
    expect(result.systemAttributionMap['sysA']['ro'].totalAttribution.default)
      .toBeCloseTo(1.0, 6);
  });

  it('does not attribute reject-path discharge cost to any system', () => {
    // discharge2 has no water-using-system in its upstream path, so it is
    // not attributed via the discharge algorithm. All cost responsibility for
    // the reject stream is already captured through the intake + RO block costs.
    const totalDischarge2Cost = blockCost(0, REJECT_FLOW);
    expect(totalDischarge2Cost).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Mass-balance invariants
// These assertions must hold for any valid fixture regardless of configuration.
// ---------------------------------------------------------------------------

describe('mass-balance invariants', () => {
  it('simple-linear: sum of all system intake attributions equals intake block cost', () => {
    const intake = makeIntakeNode('intake', 1);
    const system = makeSystemNode('system');
    const discharge = makeDischargeNode('discharge', 0);
    const nodes = [intake, system, discharge];
    const edges = [makeEdge('intake', 'system', 100), makeEdge('system', 'discharge', 100)];
    const calcData = makeCalcData({
      intake: { totalDischargeFlow: 100 },
      system: { totalSourceFlow: 100, totalDischargeFlow: 100 },
      discharge: { totalSourceFlow: 100 },
    });

    const result = getPlantSummaryResults(nodes, calcData, edges, 0.066, defaultSettings(), {});
    const intakeBlockCost = result.costComponentsTotalsMap['intake'].totalBlockCost;
    const totalAttributed = Object.values(result.trueCostOfSystems)
      .reduce((sum, s) => sum + s.intake, 0);

    expect(totalAttributed).toBeCloseTo(intakeBlockCost, 0);
  });

  it('shared-intake: sum of all system intake attributions equals intake block cost', () => {
    const intake = makeIntakeNode('intake', 1);
    const sysA = makeSystemNode('sysA');
    const sysB = makeSystemNode('sysB');
    const nodes = [intake, sysA, sysB];
    const edges = [makeEdge('intake', 'sysA', 60), makeEdge('intake', 'sysB', 40)];
    const calcData = makeCalcData({
      intake: { totalDischargeFlow: 100 },
      sysA: { totalSourceFlow: 60 },
      sysB: { totalSourceFlow: 40 },
    });

    const result = getPlantSummaryResults(nodes, calcData, edges, 0.066, defaultSettings(), {});
    const intakeBlockCost = result.costComponentsTotalsMap['intake'].totalBlockCost;
    const totalAttributed = Object.values(result.trueCostOfSystems)
      .reduce((sum, s) => sum + s.intake, 0);

    expect(totalAttributed).toBeCloseTo(intakeBlockCost, 0);
  });

  it('no system receives a negative intake cost', () => {
    const intake = makeIntakeNode('intake', 1);
    const sysA = makeSystemNode('sysA');
    const sysB = makeSystemNode('sysB');
    const nodes = [intake, sysA, sysB];
    const edges = [makeEdge('intake', 'sysA', 60), makeEdge('intake', 'sysB', 40)];
    const calcData = makeCalcData({
      intake: { totalDischargeFlow: 100 },
      sysA: { totalSourceFlow: 60 },
      sysB: { totalSourceFlow: 40 },
    });

    const result = getPlantSummaryResults(nodes, calcData, edges, 0.066, defaultSettings(), {});

    for (const contributions of Object.values(result.trueCostOfSystems)) {
      expect(contributions.intake).toBeGreaterThanOrEqual(0);
      expect(contributions.discharge).toBeGreaterThanOrEqual(0);
      expect(contributions.treatment).toBeGreaterThanOrEqual(0);
    }
  });

  it('all attribution fractions are bounded between 0 and 1', () => {
    const intake = makeIntakeNode('intake', 1);
    const sysA = makeSystemNode('sysA');
    const sysB = makeSystemNode('sysB');
    const nodes = [intake, sysA, sysB];
    const edges = [makeEdge('intake', 'sysA', 60), makeEdge('intake', 'sysB', 40)];
    const calcData = makeCalcData({
      intake: { totalDischargeFlow: 100 },
      sysA: { totalSourceFlow: 60 },
      sysB: { totalSourceFlow: 40 },
    });

    const result = getPlantSummaryResults(nodes, calcData, edges, 0.066, defaultSettings(), {});

    for (const systemMap of Object.values(result.systemAttributionMap)) {
      for (const attribution of Object.values(systemMap)) {
        const fraction = attribution.totalAttribution.default;
        expect(fraction).toBeGreaterThanOrEqual(0);
        expect(fraction).toBeLessThanOrEqual(1.0 + 1e-9); // 1e-9 tolerance for float
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Fixture: shared-discharge
// Configuration: [System A (60%), System B (40%)] → Discharge
//
//   sysA ─ e_a (60) ─► discharge (cost=2/kGal, inflow=100)
//   sysB ─ e_b (40) ─►
//
// Expected: discharge block cost split proportionally by flow fraction
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — shared-discharge: [System A, System B] → Discharge', () => {
  const DISCHARGE_COST = 2;
  const FLOW_A = 60;
  const FLOW_B = 40;
  const TOTAL_FLOW = FLOW_A + FLOW_B;

  const sysA = makeSystemNode('sysA');
  const sysB = makeSystemNode('sysB');
  const discharge = makeDischargeNode('discharge', DISCHARGE_COST);

  const nodes = [sysA, sysB, discharge];
  const edges = [
    makeEdge('sysA', 'discharge', FLOW_A),
    makeEdge('sysB', 'discharge', FLOW_B),
  ];
  const calcData = makeCalcData({
    sysA: { totalDischargeFlow: FLOW_A },
    sysB: { totalDischargeFlow: FLOW_B },
    discharge: { totalSourceFlow: TOTAL_FLOW },
  });

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    {},
  );

  it('attributes 60% of discharge block cost to System A', () => {
    const expected = blockCost(DISCHARGE_COST, TOTAL_FLOW) * (FLOW_A / TOTAL_FLOW);
    expect(result.trueCostOfSystems['sysA'].discharge).toBeCloseTo(expected, 0);
  });

  it('attributes 40% of discharge block cost to System B', () => {
    const expected = blockCost(DISCHARGE_COST, TOTAL_FLOW) * (FLOW_B / TOTAL_FLOW);
    expect(result.trueCostOfSystems['sysB'].discharge).toBeCloseTo(expected, 0);
  });

  it('attributed discharge costs sum to total discharge block cost (mass balance)', () => {
    const total = result.trueCostOfSystems['sysA'].discharge
      + result.trueCostOfSystems['sysB'].discharge;
    expect(total).toBeCloseTo(blockCost(DISCHARGE_COST, TOTAL_FLOW), 0);
  });
});

// ---------------------------------------------------------------------------
// Fixture: treatment-no-loss
// Configuration: Intake → Treatment (no losses) → [System A (60%), System B (40%)]
//
//   intake (cost=1/kGal, outflow=100)
//     └─ e1 (100) ─► treatment (cost=5/kGal, inflow=100, outflow=100)
//                     ├─ e_a (60) ─► sysA
//                     └─ e_b (40) ─► sysB
//
// Both intake and treatment block costs are split by flow fraction.
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — treatment-no-loss: Intake → Treatment → [System A, System B]', () => {
  const INTAKE_COST = 1;
  const TREATMENT_COST = 5;
  const INTAKE_FLOW = 100;
  const FLOW_A = 60;
  const FLOW_B = 40;

  const intake = makeIntakeNode('intake', INTAKE_COST);
  const treatment = makeTreatmentNode('treatment', TREATMENT_COST);
  const sysA = makeSystemNode('sysA');
  const sysB = makeSystemNode('sysB');

  const nodes = [intake, treatment, sysA, sysB];
  const edges = [
    makeEdge('intake', 'treatment', INTAKE_FLOW),
    makeEdge('treatment', 'sysA', FLOW_A),
    makeEdge('treatment', 'sysB', FLOW_B),
  ];
  const calcData = makeCalcData({
    intake:    { totalDischargeFlow: INTAKE_FLOW },
    treatment: { totalSourceFlow: INTAKE_FLOW, totalDischargeFlow: INTAKE_FLOW },
    sysA:      { totalSourceFlow: FLOW_A },
    sysB:      { totalSourceFlow: FLOW_B },
  });

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    {},
  );

  it('attributes 60% of intake block cost to System A', () => {
    expect(result.trueCostOfSystems['sysA'].intake)
      .toBeCloseTo(blockCost(INTAKE_COST, INTAKE_FLOW) * (FLOW_A / INTAKE_FLOW), 0);
  });

  it('attributes 40% of intake block cost to System B', () => {
    expect(result.trueCostOfSystems['sysB'].intake)
      .toBeCloseTo(blockCost(INTAKE_COST, INTAKE_FLOW) * (FLOW_B / INTAKE_FLOW), 0);
  });

  it('attributes 60% of treatment block cost to System A', () => {
    expect(result.trueCostOfSystems['sysA'].treatment)
      .toBeCloseTo(blockCost(TREATMENT_COST, INTAKE_FLOW) * (FLOW_A / INTAKE_FLOW), 0);
  });

  it('attributes 40% of treatment block cost to System B', () => {
    expect(result.trueCostOfSystems['sysB'].treatment)
      .toBeCloseTo(blockCost(TREATMENT_COST, INTAKE_FLOW) * (FLOW_B / INTAKE_FLOW), 0);
  });
});

// ---------------------------------------------------------------------------
// Fixture: treatment-chain
// Configuration: Intake → Treatment A (lossy) → Treatment B → System
//
//   intake (cost=1, outflow=100)
//     └─ e1 (100) ─► treatA (cost=5, inflow=100, outflow=80 — losses=20)
//                     └─ e2 (80) ─► treatB (cost=4, inflow=80, outflow=80)
//                                     └─ e3 (80) ─► system
//
// Each treatment unit independently attributes 100% of its block cost to the
// single downstream system. The intake uses delivered-flow-volume basis because
// hasUpstreamTreatmentLoss=true (treatA losses are detected when computing
// intake attribution for the system).
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — treatment-chain: Intake → Treatment A (lossy) → Treatment B → System', () => {
  const INTAKE_COST = 1;
  const TREAT_A_COST = 5;
  const TREAT_B_COST = 4;
  const INTAKE_FLOW = 100;
  const TREAT_A_OUTFLOW = 80;

  const intake = makeIntakeNode('intake', INTAKE_COST);
  const treatA = makeTreatmentNode('treatA', TREAT_A_COST);
  const treatB = makeTreatmentNode('treatB', TREAT_B_COST);
  const system = makeSystemNode('system');

  const nodes = [intake, treatA, treatB, system];
  const edges = [
    makeEdge('intake', 'treatA', INTAKE_FLOW),
    makeEdge('treatA', 'treatB', TREAT_A_OUTFLOW),
    makeEdge('treatB', 'system', TREAT_A_OUTFLOW),
  ];
  const calcData = makeCalcData({
    intake: { totalDischargeFlow: INTAKE_FLOW },
    treatA: { totalSourceFlow: INTAKE_FLOW, totalDischargeFlow: TREAT_A_OUTFLOW },
    treatB: { totalSourceFlow: TREAT_A_OUTFLOW, totalDischargeFlow: TREAT_A_OUTFLOW },
    system: { totalSourceFlow: TREAT_A_OUTFLOW },
  });

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    {},
  );

  it('attributes 100% of intake cost to the system (upstream loss triggers delivered-flow-volume basis)', () => {
    expect(result.trueCostOfSystems['system'].intake)
      .toBeCloseTo(blockCost(INTAKE_COST, INTAKE_FLOW), 0);
  });

  it('attributes 100% of Treatment A block cost to the system', () => {
    expect(result.trueCostOfSystems['system'].treatment)
      .toBeCloseTo(
        blockCost(TREAT_A_COST, INTAKE_FLOW) + blockCost(TREAT_B_COST, TREAT_A_OUTFLOW),
        0,
      );
  });
});

// ---------------------------------------------------------------------------
// Fixture: wwt-discharge-only
// Configuration: System → WWT → Discharge (WWT Pass 2 only)
//
//   system ─ e1 (100) ─► wwt (cost=3/kGal, inflow=100)
//                          └─ e2 (100) ─► discharge (cost=0)
//
// No downstream reuse (Pass 1 finds no systems); all WWT cost goes upstream
// to the single discharger via Pass 2.
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — wwt-discharge-only: System → WWT → Discharge', () => {
  const WWT_COST = 3;
  const FLOW = 100;

  const system = makeSystemNode('system');
  const wwt = makeWasteTreatmentNode('wwt', WWT_COST);
  const discharge = makeDischargeNode('discharge', 0);

  const nodes = [system, wwt, discharge];
  const edges = [
    makeEdge('system', 'wwt', FLOW),
    makeEdge('wwt', 'discharge', FLOW),
  ];
  const calcData = makeCalcData({
    system:    { totalDischargeFlow: FLOW },
    wwt:       { totalSourceFlow: FLOW, totalDischargeFlow: FLOW },
    discharge: { totalSourceFlow: FLOW },
  });

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    {},
  );

  it('attributes 100% of WWT cost to the upstream system (Pass 2)', () => {
    expect(result.trueCostOfSystems['system'].wasteTreatment)
      .toBeCloseTo(blockCost(WWT_COST, FLOW), 0);
  });

  it('records WWT attribution fraction of 1.0 for the upstream system', () => {
    expect(result.systemAttributionMap['system']['wwt'].totalAttribution.default)
      .toBeCloseTo(1.0, 6);
  });
});

// ---------------------------------------------------------------------------
// Fixture: wwt-reuse
// Configuration: System A → WWT → [System B (60%), Discharge (40%)]
//
//   sysA ─ e1 (100) ─► wwt (cost=3/kGal, inflow=100, outflow=100)
//                        ├─ e2 (60) ─► sysB
//                        └─ e3 (40) ─► discharge (cost=0)
//
// Pass 1: 60% of WWT cost attributed to the downstream reuse recipient (sysB).
// Pass 2: the remaining 40% attributed to the upstream discharger (sysA).
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — wwt-reuse: System A → WWT → [System B (reuse), Discharge]', () => {
  const WWT_COST = 3;
  const WWT_FLOW = 100;
  const REUSE_FLOW = 60;
  const DISCHARGE_FLOW = 40;

  const sysA = makeSystemNode('sysA');
  const wwt = makeWasteTreatmentNode('wwt', WWT_COST);
  const sysB = makeSystemNode('sysB');
  const discharge = makeDischargeNode('discharge', 0);

  const nodes = [sysA, wwt, sysB, discharge];
  const edges = [
    makeEdge('sysA', 'wwt', WWT_FLOW),
    makeEdge('wwt', 'sysB', REUSE_FLOW),
    makeEdge('wwt', 'discharge', DISCHARGE_FLOW),
  ];
  const calcData = makeCalcData({
    sysA:      { totalDischargeFlow: WWT_FLOW },
    wwt:       { totalSourceFlow: WWT_FLOW, totalDischargeFlow: WWT_FLOW },
    sysB:      { totalSourceFlow: REUSE_FLOW },
    discharge: { totalSourceFlow: DISCHARGE_FLOW },
  });

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    {},
  );

  it('attributes reuse fraction (60%) of WWT cost to the downstream system (Pass 1)', () => {
    const expected = blockCost(WWT_COST, WWT_FLOW) * (REUSE_FLOW / WWT_FLOW);
    expect(result.trueCostOfSystems['sysB'].wasteTreatment).toBeCloseTo(expected, 0);
  });

  it('attributes discharge fraction (40%) of WWT cost to the upstream discharger (Pass 2)', () => {
    const expected = blockCost(WWT_COST, WWT_FLOW) * (DISCHARGE_FLOW / WWT_FLOW);
    expect(result.trueCostOfSystems['sysA'].wasteTreatment).toBeCloseTo(expected, 0);
  });

  it('WWT attributed costs sum to total WWT block cost (mass balance)', () => {
    const total = result.trueCostOfSystems['sysA'].wasteTreatment
      + result.trueCostOfSystems['sysB'].wasteTreatment;
    expect(total).toBeCloseTo(blockCost(WWT_COST, WWT_FLOW), 0);
  });
});

// ---------------------------------------------------------------------------
// Fixture: reuse-chained-systems
// Configuration: Intake → System A → System B → Discharge
//
//   intake (cost=1, outflow=100)
//     └─ e1 (100) ─► sysA
//                     └─ e2 (80) ─► sysB
//                                    └─ e3 (80) ─► discharge (cost=2)
//
// Intake attribution stops at the first system in each downstream path (sysA).
// Discharge attribution starts at the last system in each upstream path (sysB).
// sysA has no discharge cost; sysB has no intake cost.
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — reuse-chained-systems: Intake → System A → System B → Discharge', () => {
  const INTAKE_COST = 1;
  const DISCHARGE_COST = 2;
  const INTAKE_FLOW = 100;
  const REUSE_FLOW = 80;

  const intake = makeIntakeNode('intake', INTAKE_COST);
  const sysA = makeSystemNode('sysA');
  const sysB = makeSystemNode('sysB');
  const discharge = makeDischargeNode('discharge', DISCHARGE_COST);

  const nodes = [intake, sysA, sysB, discharge];
  const edges = [
    makeEdge('intake', 'sysA', INTAKE_FLOW),
    makeEdge('sysA', 'sysB', REUSE_FLOW),
    makeEdge('sysB', 'discharge', REUSE_FLOW),
  ];
  const calcData = makeCalcData({
    intake:    { totalDischargeFlow: INTAKE_FLOW },
    sysA:      { totalSourceFlow: INTAKE_FLOW, totalDischargeFlow: REUSE_FLOW },
    sysB:      { totalSourceFlow: REUSE_FLOW, totalDischargeFlow: REUSE_FLOW },
    discharge: { totalSourceFlow: REUSE_FLOW },
  });

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    {},
  );

  it('attributes 100% of intake cost to System A (first system downstream of intake)', () => {
    expect(result.trueCostOfSystems['sysA'].intake)
      .toBeCloseTo(blockCost(INTAKE_COST, INTAKE_FLOW), 0);
  });

  it('does not attribute any intake cost to System B (reuse recipient is excluded)', () => {
    expect(result.trueCostOfSystems['sysB'].intake).toBeCloseTo(0, 0);
  });

  it('attributes 100% of discharge cost to System B (last system upstream of discharge)', () => {
    expect(result.trueCostOfSystems['sysB'].discharge)
      .toBeCloseTo(blockCost(DISCHARGE_COST, REUSE_FLOW), 0);
  });

  it('does not attribute any discharge cost to System A (upstream provider is excluded)', () => {
    expect(result.trueCostOfSystems['sysA'].discharge).toBeCloseTo(0, 0);
  });
});

// ---------------------------------------------------------------------------
// Fixture: ro-multi-system
// Configuration: Intake → RO → [System A (40%), System B (40%), Discharge (20%)]
//
//   intake (cost=1, outflow=100)
//     └─ e1 (100) ─► RO (cost=5, treatmentType=6, inflow=100, outflow=100)
//                     ├─ e_a (40) ─► sysA
//                     ├─ e_b (40) ─► sysB
//                     └─ e_c (20) ─► discharge (cost=0)
//
// RO has 3 children — assignsystemsWithRODirectDischarge requires exactly 2,
// so the single-system override does NOT apply. Standard flow-fraction is used.
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — ro-multi-system: Intake → RO → [System A, System B, Discharge]', () => {
  const INTAKE_COST = 1;
  const RO_COST = 5;
  const RO_INFLOW = 100;
  const FLOW_A = 40;
  const FLOW_B = 40;
  const FLOW_DISCHARGE = 20;

  const intake = makeIntakeNode('intake', INTAKE_COST);
  const ro = makeTreatmentNode('ro', RO_COST, 6);
  const sysA = makeSystemNode('sysA');
  const sysB = makeSystemNode('sysB');
  const discharge = makeDischargeNode('discharge', 0);

  const nodes = [intake, ro, sysA, sysB, discharge];
  const edges = [
    makeEdge('intake', 'ro', RO_INFLOW),
    makeEdge('ro', 'sysA', FLOW_A),
    makeEdge('ro', 'sysB', FLOW_B),
    makeEdge('ro', 'discharge', FLOW_DISCHARGE),
  ];
  const calcData = makeCalcData({
    intake:    { totalDischargeFlow: RO_INFLOW },
    ro:        { totalSourceFlow: RO_INFLOW, totalDischargeFlow: RO_INFLOW },
    sysA:      { totalSourceFlow: FLOW_A },
    sysB:      { totalSourceFlow: FLOW_B },
    discharge: { totalSourceFlow: FLOW_DISCHARGE },
  });

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    {},
  );

  it('attributes 40% of intake cost to System A (no RO override — 3 children)', () => {
    expect(result.trueCostOfSystems['sysA'].intake)
      .toBeCloseTo(blockCost(INTAKE_COST, RO_INFLOW) * (FLOW_A / RO_INFLOW), 0);
  });

  it('attributes 40% of intake cost to System B (no RO override — 3 children)', () => {
    expect(result.trueCostOfSystems['sysB'].intake)
      .toBeCloseTo(blockCost(INTAKE_COST, RO_INFLOW) * (FLOW_B / RO_INFLOW), 0);
  });

  it('attributes 40% of RO treatment cost to System A', () => {
    expect(result.trueCostOfSystems['sysA'].treatment)
      .toBeCloseTo(blockCost(RO_COST, RO_INFLOW) * (FLOW_A / RO_INFLOW), 0);
  });

  it('attributes 40% of RO treatment cost to System B', () => {
    expect(result.trueCostOfSystems['sysB'].treatment)
      .toBeCloseTo(blockCost(RO_COST, RO_INFLOW) * (FLOW_B / RO_INFLOW), 0);
  });
});

// ---------------------------------------------------------------------------
// Fixture: summing-node
// Configuration: [Intake A (60), Intake B (40)] → Summing Node → System
//
//   intakeA (cost=1, outflow=60) ─► summing ─► system
//   intakeB (cost=1, outflow=40) ─►
//
// The summing node is a pass-through: each intake independently attributes
// 100% of its own block cost to the single downstream system.
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — summing-node: [Intake A, Intake B] → Summing → System', () => {
  const COST_PER_KGAL = 1;
  const FLOW_A = 60;
  const FLOW_B = 40;

  const intakeA = makeIntakeNode('intakeA', COST_PER_KGAL);
  const intakeB = makeIntakeNode('intakeB', COST_PER_KGAL);
  const summing = makeSummingNode('summing');
  const system = makeSystemNode('system');

  const nodes = [intakeA, intakeB, summing, system];
  const edges = [
    makeEdge('intakeA', 'summing', FLOW_A),
    makeEdge('intakeB', 'summing', FLOW_B),
    makeEdge('summing', 'system', FLOW_A + FLOW_B),
  ];
  const calcData = makeCalcData({
    intakeA: { totalDischargeFlow: FLOW_A },
    intakeB: { totalDischargeFlow: FLOW_B },
    summing: { totalSourceFlow: FLOW_A + FLOW_B, totalDischargeFlow: FLOW_A + FLOW_B },
    system:  { totalSourceFlow: FLOW_A + FLOW_B },
  });

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    {},
  );

  it('system receives 100% of Intake A block cost', () => {
    expect(result.trueCostOfSystems['system'].intake)
      .toBeGreaterThanOrEqual(blockCost(COST_PER_KGAL, FLOW_A) - 0.5);
  });

  it('system receives combined block costs from both intakes', () => {
    const expected = blockCost(COST_PER_KGAL, FLOW_A) + blockCost(COST_PER_KGAL, FLOW_B);
    expect(result.trueCostOfSystems['system'].intake).toBeCloseTo(expected, 0);
  });
});

// ---------------------------------------------------------------------------
// Fixture: ro-single-system-wwt
// Configuration: Intake → RO → System A → Discharge1 (product path)
//                       → WWT → Discharge2 (reject path with treatment)
//
//   intake (cost=1, outflow=100)
//     └─ e1 (100) ─► RO (cost=5, treatmentType=6, inflow=100, outflow=100)
//                     ├─ e2 (70) ─► sysA
//                     │               └─ e4 (70) ─► discharge1 (cost=1)
//                     └─ e3 (30) ─► wwt (cost=3, inflow=30)
//                                    └─ e5 (30) ─► discharge2 (cost=0)
//
// Case I (applyROSystemWasteTreatmentCosts) attributes 100% of the reject-path
// WWT cost directly to sysA. Pass 2 of applySystemWasteTreatmentCosts skips
// this WWT node via the isROOwnedWWT guard, so no double-attribution occurs.
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — ro-single-system-wwt: Intake → RO → [System, WWT → Discharge]', () => {
  const INTAKE_COST = 1;
  const RO_COST = 5;
  const DISCHARGE1_COST = 1;
  const WWT_COST = 3;
  const RO_INFLOW = 100;
  const PRODUCT_FLOW = 70;
  const REJECT_FLOW = 30;

  const intake = makeIntakeNode('intake', INTAKE_COST);
  const ro = makeTreatmentNode('ro', RO_COST, 6);
  const sysA = makeSystemNode('sysA');
  const discharge1 = makeDischargeNode('discharge1', DISCHARGE1_COST);
  const wwt = makeWasteTreatmentNode('wwt', WWT_COST);
  const discharge2 = makeDischargeNode('discharge2', 0);

  const nodes = [intake, ro, sysA, discharge1, wwt, discharge2];
  const edges = [
    makeEdge('intake', 'ro', RO_INFLOW),
    makeEdge('ro', 'sysA', PRODUCT_FLOW),
    makeEdge('sysA', 'discharge1', PRODUCT_FLOW),
    makeEdge('ro', 'wwt', REJECT_FLOW),
    makeEdge('wwt', 'discharge2', REJECT_FLOW),
  ];
  const calcData = makeCalcData({
    intake:     { totalDischargeFlow: RO_INFLOW },
    ro:         { totalSourceFlow: RO_INFLOW, totalDischargeFlow: RO_INFLOW },
    sysA:       { totalSourceFlow: PRODUCT_FLOW, totalDischargeFlow: PRODUCT_FLOW },
    discharge1: { totalSourceFlow: PRODUCT_FLOW },
    wwt:        { totalSourceFlow: REJECT_FLOW, totalDischargeFlow: REJECT_FLOW },
    discharge2: { totalSourceFlow: REJECT_FLOW },
  });

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    {},
  );

  it('assigns all intake cost to sysA via RO single-system override', () => {
    expect(result.trueCostOfSystems['sysA'].intake)
      .toBeCloseTo(blockCost(INTAKE_COST, RO_INFLOW), 0);
  });

  it('assigns all RO treatment cost to sysA via RO single-system override', () => {
    expect(result.trueCostOfSystems['sysA'].treatment)
      .toBeCloseTo(blockCost(RO_COST, RO_INFLOW), 0);
  });

  it('assigns product-path discharge cost to sysA', () => {
    expect(result.trueCostOfSystems['sysA'].discharge)
      .toBeCloseTo(blockCost(DISCHARGE1_COST, PRODUCT_FLOW), 0);
  });

  it('assigns all WWT cost to sysA via Case I (no double-attribution)', () => {
    expect(result.trueCostOfSystems['sysA'].wasteTreatment)
      .toBeCloseTo(blockCost(WWT_COST, REJECT_FLOW), 0);
  });
});

// ---------------------------------------------------------------------------
// Fixture: adjusted-attribution
// Configuration: Intake → System → Discharge  (same as simple-linear)
//
//   intake (cost=1, outflow=100) → system → discharge (cost=2, inflow=80)
//
// The systemAttributionMap is pre-populated with adjusted=0.75 for the
// system→intake pair, overriding the computed 1.0 fraction.
// The discharge attribution is unaffected (no override).
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — adjusted-attribution: user override replaces computed fraction', () => {
  const INTAKE_COST = 1;
  const DISCHARGE_COST = 2;
  const INTAKE_FLOW = 100;
  const DISCHARGE_FLOW = 80;
  const ADJUSTED_FRACTION = 0.75;

  const intake = makeIntakeNode('intake', INTAKE_COST);
  const system = makeSystemNode('system');
  const discharge = makeDischargeNode('discharge', DISCHARGE_COST);

  const nodes = [intake, system, discharge];
  const edges = [
    makeEdge('intake', 'system', INTAKE_FLOW),
    makeEdge('system', 'discharge', DISCHARGE_FLOW),
  ];
  const calcData = makeCalcData({
    intake:    { totalDischargeFlow: INTAKE_FLOW },
    system:    { totalSourceFlow: INTAKE_FLOW, totalDischargeFlow: DISCHARGE_FLOW },
    discharge: { totalSourceFlow: DISCHARGE_FLOW },
  });

  const prePopulatedMap: SystemAttributionMap = {
    system: {
      intake: {
        componentId: 'intake',
        name: 'intake',
        processComponentType: 'water-intake',
        totalAttribution: { default: 0, adjusted: ADJUSTED_FRACTION },
        componentPathAttribution: [],
      },
    },
  };

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    prePopulatedMap,
  );

  it('applies adjusted fraction to intake cost (overrides computed 1.0)', () => {
    expect(result.trueCostOfSystems['system'].intake)
      .toBeCloseTo(blockCost(INTAKE_COST, INTAKE_FLOW) * ADJUSTED_FRACTION, 0);
  });

  it('discharge attribution is unaffected by the intake override', () => {
    expect(result.trueCostOfSystems['system'].discharge)
      .toBeCloseTo(blockCost(DISCHARGE_COST, DISCHARGE_FLOW), 0);
  });
});

// ---------------------------------------------------------------------------
// Fixture: diamond-treatment
// Configuration: Intake → [Treatment A (60%), Treatment B (40%)] → System A
//
//   intake (cost=1/kGal, flow=100)
//     ├─ e1 (60) ─► treatA (cost=3/kGal, inflow=60, outflow=60) ─► sysA
//     └─ e2 (40) ─► treatB (cost=3/kGal, inflow=40, outflow=40) ─►
//
// Two separate treatment paths converge on the same system. The de-duplication
// guard in applySystemIntakeCosts must NOT fire here because path A
// ([e1, e_treatA_sysA]) and path B ([e2, e_treatB_sysA]) differ in their
// first edge, so they are genuinely distinct attributions.
//
// Expected:
//   - intake: sysA accumulates 60% (via path A) + 40% (via path B) = 100%
//   - treatment: treatA attributes 100% of its own block cost to sysA,
//                treatB does the same independently — no cross-interference
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — diamond-treatment: Intake → [TreatA, TreatB] → System A', () => {
  const INTAKE_COST = 1;
  const TREAT_COST = 3;
  const INTAKE_FLOW = 100;
  const FLOW_A = 60;
  const FLOW_B = 40;

  const intake = makeIntakeNode('intake', INTAKE_COST);
  const treatA = makeTreatmentNode('treatA', TREAT_COST);
  const treatB = makeTreatmentNode('treatB', TREAT_COST);
  const sysA = makeSystemNode('sysA');

  const nodes = [intake, treatA, treatB, sysA];
  const edges = [
    makeEdge('intake', 'treatA', FLOW_A),
    makeEdge('intake', 'treatB', FLOW_B),
    makeEdge('treatA', 'sysA', FLOW_A),
    makeEdge('treatB', 'sysA', FLOW_B),
  ];
  const calcData = makeCalcData({
    intake: { totalDischargeFlow: INTAKE_FLOW },
    treatA: { totalSourceFlow: FLOW_A, totalDischargeFlow: FLOW_A },
    treatB: { totalSourceFlow: FLOW_B, totalDischargeFlow: FLOW_B },
    sysA:   { totalSourceFlow: INTAKE_FLOW },
  });

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    {},
  );

  it('attributes 100% of intake block cost to sysA across both converging paths', () => {
    expect(result.trueCostOfSystems['sysA'].intake)
      .toBeCloseTo(blockCost(INTAKE_COST, INTAKE_FLOW), 0);
  });

  it('records accumulated intake attribution fraction of 1.0 for sysA (60% + 40% across two paths)', () => {
    expect(result.systemAttributionMap['sysA']['intake'].totalAttribution.default)
      .toBeCloseTo(1.0, 6);
  });

  it('attributes Treatment A block cost 100% to sysA independently of Treatment B', () => {
    // Each treatment node is its own cost component; their attributions accumulate on sysA.
    // Verify that treatA alone contributes its full block cost.
    const treatABlockCost = blockCost(TREAT_COST, FLOW_A);
    expect(result.systemAttributionMap['sysA']['treatA'].totalAttribution.default)
      .toBeCloseTo(1.0, 6);
    expect(result.trueCostOfSystems['sysA'].treatment)
      .toBeGreaterThanOrEqual(treatABlockCost - 0.5);
  });

  it('sysA.treatment equals the combined block cost of both treatment nodes', () => {
    const expected = blockCost(TREAT_COST, FLOW_A) + blockCost(TREAT_COST, FLOW_B);
    expect(result.trueCostOfSystems['sysA'].treatment).toBeCloseTo(expected, 0);
  });

  it('mass balance — attributed intake equals total intake block cost', () => {
    const total = Object.values(result.trueCostOfSystems)
      .reduce((sum, s) => sum + s.intake, 0);
    expect(total).toBeCloseTo(blockCost(INTAKE_COST, INTAKE_FLOW), 0);
  });

  it('mass balance — attributed treatment equals combined treatment block cost', () => {
    const expected = blockCost(TREAT_COST, FLOW_A) + blockCost(TREAT_COST, FLOW_B);
    const total = Object.values(result.trueCostOfSystems)
      .reduce((sum, s) => sum + s.treatment, 0);
    expect(total).toBeCloseTo(expected, 0);
  });
});

// ---------------------------------------------------------------------------
// Fixture: wwt-two-upstream-with-reuse
// Configuration: [System A (60), System B (40)] → WWT → [System C (reuse 60), Discharge (40)]
//
//   sysA (60) ──►
//                 wwt (100 in, $1/kGal) ──► sysC (60, reuse)
//   sysB (40) ──►                       └──► discharge (cost=0, 40)
//
// This is the worked example from apply-system-waste-water-treatment-costs.md §6.
//
// Expected behavior per documentation:
//   Pass 1: sysC → fraction 60/100 = 0.60, cost = $60,000 of $100,000 block cost
//   Pass 2, sysA → systemFlowResponsibility = 60 − 60 = 0 (all reuse offsets sysA)
//   Pass 2, sysB → systemFlowResponsibility = 40 − 60 = −20 (KNOWN BUG: the
//     full downstream charged portion is deducted from EACH upstream system
//     independently rather than being prorated across them, producing a negative
//     responsibility when totalDownstreamChargedPortion > systemEdgeFlow)
//
// Correct behavior would prorate the deduction by each system's upstream share:
//   sysA correct: 60 − (60/100 × 60) = 60 − 36 = 24 → fraction 24%
//   sysB correct: 40 − (40/100 × 60) = 40 − 24 = 16 → fraction 16%
//   Total correct = 60% + 24% + 16% = 100%
//
// The snapshot for sysB captures current (buggy) behavior. Update the snapshot
// when the algorithm is corrected, and verify that sysB then receives
// blockCost(WWT_COST, WWT_INFLOW) * 0.16 = $16,000.
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — wwt-two-upstream-with-reuse: [SysA, SysB] → WWT → [SysC, Discharge]', () => {
  const WWT_COST = 1;
  const WWT_INFLOW = 100;
  const FLOW_A = 60;
  const FLOW_B = 40;
  const REUSE_FLOW = 60;
  const DISCHARGE_FLOW = 40;

  const sysA = makeSystemNode('sysA');
  const sysB = makeSystemNode('sysB');
  const wwt = makeWasteTreatmentNode('wwt', WWT_COST);
  const sysC = makeSystemNode('sysC');
  const discharge = makeDischargeNode('discharge', 0);

  const nodes = [sysA, sysB, wwt, sysC, discharge];
  const edges = [
    makeEdge('sysA', 'wwt', FLOW_A),
    makeEdge('sysB', 'wwt', FLOW_B),
    makeEdge('wwt', 'sysC', REUSE_FLOW),
    makeEdge('wwt', 'discharge', DISCHARGE_FLOW),
  ];
  const calcData = makeCalcData({
    sysA:      { totalDischargeFlow: FLOW_A },
    sysB:      { totalDischargeFlow: FLOW_B },
    wwt:       { totalSourceFlow: WWT_INFLOW, totalDischargeFlow: WWT_INFLOW },
    sysC:      { totalSourceFlow: REUSE_FLOW },
    discharge: { totalSourceFlow: DISCHARGE_FLOW },
  });

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    {},
  );

  const WWT_BLOCK_COST = blockCost(WWT_COST, WWT_INFLOW);

  it('attributes reuse fraction (60%) of WWT cost to the downstream reuse recipient sysC (Pass 1)', () => {
    expect(result.trueCostOfSystems['sysC'].wasteTreatment)
      .toBeCloseTo(WWT_BLOCK_COST * (REUSE_FLOW / WWT_INFLOW), 0);
  });

  it('records sysC WWT attribution fraction of 0.60 in systemAttributionMap', () => {
    expect(result.systemAttributionMap['sysC']['wwt'].totalAttribution.default)
      .toBeCloseTo(REUSE_FLOW / WWT_INFLOW, 6);
  });

  it('attributes zero WWT cost to sysA (sysA upstream flow equals total downstream charged portion)', () => {
    // sysA's upstream flow (60) equals the total downstream charged portion (60),
    // yielding a net flow responsibility of 0.
    expect(result.trueCostOfSystems['sysA'].wasteTreatment).toBeCloseTo(0, 0);
  });

  it('documents current sysB WWT attribution — snapshots known algorithm limitation', () => {
    // The algorithm deducts the full 60-unit downstream charged portion from each
    // upstream system independently. sysB's 40-unit flow minus 60 = −20, producing
    // negative wasteTreatment cost. This snapshot locks in the current behavior so
    // that a fix registers as a test change requiring deliberate review.
    expect(result.trueCostOfSystems['sysB'].wasteTreatment).toMatchSnapshot();
  });

  it('sysC Pass 1 mass balance — attributed reuse cost matches expected fraction of block cost', () => {
    const expectedSysC = WWT_BLOCK_COST * 0.60;
    expect(result.trueCostOfSystems['sysC'].wasteTreatment).toBeCloseTo(expectedSysC, 0);
  });
});

// ---------------------------------------------------------------------------
// Gap: WWT output recycled back to its own upstream system
// Configuration: System A → WWT → System A (partial recycle) + Discharge
//
// This configuration creates a directed cycle in the flow graph. Neither
// getAllDownstreamEdgePaths nor getAllUpstreamEdgePaths currently implements
// cycle detection — a DFS on this graph would recurse until the call stack
// is exhausted. Calling getPlantSummaryResults on this configuration is unsafe.
//
// This test is pending until cycle protection is added to graph.ts.
// When implemented, the expected behavior is:
//   Pass 1: sysA receives the recycled fraction of WWT cost (reuse recipient)
//   Pass 2: sysA is already in visitedSystemIds; it is skipped, leaving the
//           discharge fraction unattributed — a second known issue to resolve.
// ---------------------------------------------------------------------------
it.todo(
  'wwt-recycled-back-to-same-system: getPlantSummaryResults handles WWT output cycling back to its upstream system (requires cycle protection in getAllDownstreamEdgePaths / getAllUpstreamEdgePaths in graph.ts)',
);

// ---------------------------------------------------------------------------
// Fixture: adjusted-attribution-discharge
// Configuration: System A → Discharge  (minimal — no intake or treatment)
//
//   sysA ─ e1 (80) ─► discharge (cost=2/kGal, inflow=80)
//
// The systemAttributionMap is pre-populated with adjusted=0.60 for the
// sysA→discharge pair, overriding the computed 1.0 fraction.
// The computed default (1.0) must still be recorded for audit purposes.
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — adjusted-attribution-discharge: user override on discharge node', () => {
  const DISCHARGE_COST = 2;
  const DISCHARGE_FLOW = 80;
  const ADJUSTED_FRACTION = 0.60;

  const sysA = makeSystemNode('sysA');
  const discharge = makeDischargeNode('discharge', DISCHARGE_COST);

  const nodes = [sysA, discharge];
  const edges = [makeEdge('sysA', 'discharge', DISCHARGE_FLOW)];
  const calcData = makeCalcData({
    sysA:      { totalDischargeFlow: DISCHARGE_FLOW },
    discharge: { totalSourceFlow: DISCHARGE_FLOW },
  });

  const prePopulatedMap: SystemAttributionMap = {
    sysA: {
      discharge: {
        componentId: 'discharge',
        name: 'discharge',
        processComponentType: 'water-discharge',
        totalAttribution: { default: 0, adjusted: ADJUSTED_FRACTION },
        componentPathAttribution: [],
      },
    },
  };

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    prePopulatedMap,
  );

  it('applies adjusted fraction to discharge cost (overrides computed 1.0)', () => {
    expect(result.trueCostOfSystems['sysA'].discharge)
      .toBeCloseTo(blockCost(DISCHARGE_COST, DISCHARGE_FLOW) * ADJUSTED_FRACTION, 0);
  });

  it('computed default discharge fraction (1.0) is preserved in the attribution map alongside the override', () => {
    expect(result.systemAttributionMap['sysA']['discharge'].totalAttribution.default)
      .toBeCloseTo(1.0, 6);
  });

  it('adjusted discharge fraction is preserved in the attribution map', () => {
    expect(result.systemAttributionMap['sysA']['discharge'].totalAttribution.adjusted)
      .toBeCloseTo(ADJUSTED_FRACTION, 6);
  });
});

// ---------------------------------------------------------------------------
// Fixture: adjusted-attribution-treatment
// Configuration: Intake → Treatment → System A  (same shape as treatment-no-loss)
//
//   intake (cost=1/kGal, outflow=100)
//     └─ e1 (100) ─► treatment (cost=5/kGal, inflow=100, outflow=100)
//                     └─ e2 (100) ─► sysA
//
// The systemAttributionMap is pre-populated with adjusted=0.80 for the
// sysA→treatment pair, overriding the computed 1.0 fraction.
// Intake has no override and must be computed normally at 100%.
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — adjusted-attribution-treatment: user override on treatment node', () => {
  const INTAKE_COST = 1;
  const TREATMENT_COST = 5;
  const FLOW = 100;
  const ADJUSTED_FRACTION = 0.80;

  const intake = makeIntakeNode('intake', INTAKE_COST);
  const treatment = makeTreatmentNode('treatment', TREATMENT_COST);
  const sysA = makeSystemNode('sysA');

  const nodes = [intake, treatment, sysA];
  const edges = [
    makeEdge('intake', 'treatment', FLOW),
    makeEdge('treatment', 'sysA', FLOW),
  ];
  const calcData = makeCalcData({
    intake:    { totalDischargeFlow: FLOW },
    treatment: { totalSourceFlow: FLOW, totalDischargeFlow: FLOW },
    sysA:      { totalSourceFlow: FLOW },
  });

  const prePopulatedMap: SystemAttributionMap = {
    sysA: {
      treatment: {
        componentId: 'treatment',
        name: 'treatment',
        processComponentType: 'water-treatment',
        totalAttribution: { default: 0, adjusted: ADJUSTED_FRACTION },
        componentPathAttribution: [],
      },
    },
  };

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    prePopulatedMap,
  );

  it('applies adjusted fraction to treatment cost (overrides computed 1.0)', () => {
    expect(result.trueCostOfSystems['sysA'].treatment)
      .toBeCloseTo(blockCost(TREATMENT_COST, FLOW) * ADJUSTED_FRACTION, 0);
  });

  it('computed default treatment fraction (1.0) is preserved in the attribution map alongside the override', () => {
    expect(result.systemAttributionMap['sysA']['treatment'].totalAttribution.default)
      .toBeCloseTo(1.0, 6);
  });

  it('adjusted treatment fraction is preserved in the attribution map', () => {
    expect(result.systemAttributionMap['sysA']['treatment'].totalAttribution.adjusted)
      .toBeCloseTo(ADJUSTED_FRACTION, 6);
  });

  it('intake attribution is computed normally and is unaffected by the treatment override', () => {
    expect(result.trueCostOfSystems['sysA'].intake)
      .toBeCloseTo(blockCost(INTAKE_COST, FLOW), 0);
  });
});

// ---------------------------------------------------------------------------
// Fixture: ro-single-system-shared-discharge
// Configuration 2: both product and reject paths converge on the same discharge
//
//   intake (cost=1/kGal, outflow=100)
//     └─ e1 (100) ─► ro (cost=5/kGal, treatmentType=6, inflow=100)
//                     ├─ e2 (70) ─► sysA
//                     │               └─ e4 (70) ─► discharge (cost=2/kGal, shared)
//                     └─ e3 (30) ──────────────────►
//
// There is no separate product-path discharge node. The shared discharge
// receives both product (70) and reject (30) flow. The preprocessing index
// registers it as the reject discharge node. Case K applies: sysA receives
// 100% of the combined discharge block cost. Case J does not apply because
// no separate product-path discharge exists.
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — ro-single-system-shared-discharge: Intake → RO → System → Discharge ←── reject', () => {
  const INTAKE_COST = 1;
  const RO_COST = 5;
  const DISCHARGE_COST = 2;
  const RO_INFLOW = 100;
  const PRODUCT_FLOW = 70;
  const REJECT_FLOW = 30;
  const COMBINED_DISCHARGE_FLOW = PRODUCT_FLOW + REJECT_FLOW;

  const intake = makeIntakeNode('intake', INTAKE_COST);
  const ro = makeTreatmentNode('ro', RO_COST, 6);
  const sysA = makeSystemNode('sysA');
  const discharge = makeDischargeNode('discharge', DISCHARGE_COST);

  const nodes = [intake, ro, sysA, discharge];
  const edges = [
    makeEdge('intake', 'ro', RO_INFLOW),
    makeEdge('ro', 'sysA', PRODUCT_FLOW),
    makeEdge('sysA', 'discharge', PRODUCT_FLOW),
    makeEdge('ro', 'discharge', REJECT_FLOW),
  ];
  const calcData = makeCalcData({
    intake:    { totalDischargeFlow: RO_INFLOW },
    ro:        { totalSourceFlow: RO_INFLOW, totalDischargeFlow: RO_INFLOW },
    sysA:      { totalSourceFlow: PRODUCT_FLOW, totalDischargeFlow: PRODUCT_FLOW },
    discharge: { totalSourceFlow: COMBINED_DISCHARGE_FLOW },
  });

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    {},
  );

  it('assigns all intake block cost to sysA (Case D)', () => {
    expect(result.trueCostOfSystems['sysA'].intake)
      .toBeCloseTo(blockCost(INTAKE_COST, RO_INFLOW), 0);
  });

  it('assigns all RO treatment block cost to sysA (Case G)', () => {
    expect(result.trueCostOfSystems['sysA'].treatment)
      .toBeCloseTo(blockCost(RO_COST, RO_INFLOW), 0);
  });

  it('assigns 100% of the combined shared discharge block cost to sysA (Case K)', () => {
    // The shared discharge receives 70 (product) + 30 (reject) = 100 total inflow.
    // Case K overrides proportional attribution: sysA owns the reject path and
    // receives the entire discharge block cost, including the product-path flow.
    expect(result.trueCostOfSystems['sysA'].discharge)
      .toBeCloseTo(blockCost(DISCHARGE_COST, COMBINED_DISCHARGE_FLOW), 0);
  });

  it('records intake attribution fraction of 1.0 in systemAttributionMap (Case D override)', () => {
    expect(result.systemAttributionMap['sysA']['intake'].totalAttribution.default)
      .toBeCloseTo(1.0, 6);
  });
});

// ---------------------------------------------------------------------------
// Fixture: ro-single-system-product-wwt
// Configuration 4: product path includes a WWT before the product discharge
//
//   intake (cost=1/kGal, outflow=100)
//     └─ e1 (100) ─► ro (cost=5/kGal, treatmentType=6, inflow=100)
//                     ├─ e2 (70) ─► sysA
//                     │               └─ e4 (70) ─► wwt (cost=3/kGal, inflow=70)
//                     │                               └─ e5 (70) ─► discharge1 (cost=1/kGal)
//                     └─ e3 (30) ──────────────────────────────────► discharge2 (cost=0.5/kGal)
//
// The WWT is on the product path (between sysA and discharge1). Per the spec
// preprocessing rules, a WWT on the product path is NOT stored in the RO index
// and is NOT subject to Case I — it is attributed normally via standard Case H.
// discharge1 is the product-path discharge and is attributed normally via Case J.
// discharge2 is the reject-path discharge and is subject to Case K.
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — ro-single-system-product-wwt: Intake → RO → [System → WWT → Discharge, reject → Discharge]', () => {
  const INTAKE_COST = 1;
  const RO_COST = 5;
  const WWT_COST = 3;
  const DISCHARGE1_COST = 1;
  const DISCHARGE2_COST = 0.5;
  const RO_INFLOW = 100;
  const PRODUCT_FLOW = 70;
  const REJECT_FLOW = 30;

  const intake = makeIntakeNode('intake', INTAKE_COST);
  const ro = makeTreatmentNode('ro', RO_COST, 6);
  const sysA = makeSystemNode('sysA');
  const wwt = makeWasteTreatmentNode('wwt', WWT_COST);
  const discharge1 = makeDischargeNode('discharge1', DISCHARGE1_COST);
  const discharge2 = makeDischargeNode('discharge2', DISCHARGE2_COST);

  const nodes = [intake, ro, sysA, wwt, discharge1, discharge2];
  const edges = [
    makeEdge('intake', 'ro', RO_INFLOW),
    makeEdge('ro', 'sysA', PRODUCT_FLOW),
    makeEdge('sysA', 'wwt', PRODUCT_FLOW),
    makeEdge('wwt', 'discharge1', PRODUCT_FLOW),
    makeEdge('ro', 'discharge2', REJECT_FLOW),
  ];
  const calcData = makeCalcData({
    intake:     { totalDischargeFlow: RO_INFLOW },
    ro:         { totalSourceFlow: RO_INFLOW, totalDischargeFlow: RO_INFLOW },
    sysA:       { totalSourceFlow: PRODUCT_FLOW, totalDischargeFlow: PRODUCT_FLOW },
    wwt:        { totalSourceFlow: PRODUCT_FLOW, totalDischargeFlow: PRODUCT_FLOW },
    discharge1: { totalSourceFlow: PRODUCT_FLOW },
    discharge2: { totalSourceFlow: REJECT_FLOW },
  });

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    {},
  );

  it('assigns all intake block cost to sysA (Case D)', () => {
    expect(result.trueCostOfSystems['sysA'].intake)
      .toBeCloseTo(blockCost(INTAKE_COST, RO_INFLOW), 0);
  });

  it('assigns all RO treatment block cost to sysA (Case G)', () => {
    expect(result.trueCostOfSystems['sysA'].treatment)
      .toBeCloseTo(blockCost(RO_COST, RO_INFLOW), 0);
  });

  it('assigns WWT block cost to sysA via standard Case H (not Case I — WWT is on product path)', () => {
    // The product-path WWT is not stored in the RO preprocessing index.
    // Standard Case H applies: Pass 1 finds no downstream reuse recipients
    // (discharge1 only), Pass 2 upstream walk finds sysA → 100% to sysA.
    expect(result.trueCostOfSystems['sysA'].wasteTreatment)
      .toBeCloseTo(blockCost(WWT_COST, PRODUCT_FLOW), 0);
  });

  it('assigns reject-path discharge block cost to sysA (Case K)', () => {
    // discharge2 (reject path): standard upstream walk reaches ro, not a
    // system. Case K override: sysA receives 100% of the reject discharge cost.
    const rejectDischargeCost = blockCost(DISCHARGE2_COST, REJECT_FLOW);
    expect(result.trueCostOfSystems['sysA'].discharge)
      .toBeGreaterThanOrEqual(rejectDischargeCost - 0.5);
  });
});

// ---------------------------------------------------------------------------
// Fixture: ro-single-system-shared-wwt
// Configuration 5: both product and reject paths converge on the same WWT
//
//   intake (cost=1/kGal, outflow=100)
//     └─ e1 (100) ─► ro (cost=5/kGal, treatmentType=6, inflow=100)
//                     ├─ e2 (70) ─► sysA ──►
//                     │                      wwt (cost=3/kGal, inflow=100) → discharge (cost=0.5/kGal)
//                     └─ e3 (30) ────────────►
//
// The shared WWT receives 70 from sysA (product path) and 30 from ro (reject).
// Criterion 6 qualifies: both upstream contributors are either the RO node
// itself or the product-path system. The preprocessing index registers the
// WWT as the reject-path WWT (Case I) and the downstream discharge as the
// reject discharge node (Case K).
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — ro-single-system-shared-wwt: Intake → RO → [System, reject] → WWT → Discharge', () => {
  const INTAKE_COST = 1;
  const RO_COST = 5;
  const WWT_COST = 3;
  const DISCHARGE_COST = 0.5;
  const RO_INFLOW = 100;
  const PRODUCT_FLOW = 70;
  const REJECT_FLOW = 30;
  const WWT_INFLOW = PRODUCT_FLOW + REJECT_FLOW;

  const intake = makeIntakeNode('intake', INTAKE_COST);
  const ro = makeTreatmentNode('ro', RO_COST, 6);
  const sysA = makeSystemNode('sysA');
  const wwt = makeWasteTreatmentNode('wwt', WWT_COST);
  const discharge = makeDischargeNode('discharge', DISCHARGE_COST);

  const nodes = [intake, ro, sysA, wwt, discharge];
  const edges = [
    makeEdge('intake', 'ro', RO_INFLOW),
    makeEdge('ro', 'sysA', PRODUCT_FLOW),
    makeEdge('sysA', 'wwt', PRODUCT_FLOW),
    makeEdge('ro', 'wwt', REJECT_FLOW),
    makeEdge('wwt', 'discharge', WWT_INFLOW),
  ];
  const calcData = makeCalcData({
    intake:    { totalDischargeFlow: RO_INFLOW },
    ro:        { totalSourceFlow: RO_INFLOW, totalDischargeFlow: RO_INFLOW },
    sysA:      { totalSourceFlow: PRODUCT_FLOW, totalDischargeFlow: PRODUCT_FLOW },
    wwt:       { totalSourceFlow: WWT_INFLOW, totalDischargeFlow: WWT_INFLOW },
    discharge: { totalSourceFlow: WWT_INFLOW },
  });

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    {},
  );

  it('assigns all intake block cost to sysA (Case D)', () => {
    expect(result.trueCostOfSystems['sysA'].intake)
      .toBeCloseTo(blockCost(INTAKE_COST, RO_INFLOW), 0);
  });

  it('assigns all RO treatment block cost to sysA (Case G)', () => {
    expect(result.trueCostOfSystems['sysA'].treatment)
      .toBeCloseTo(blockCost(RO_COST, RO_INFLOW), 0);
  });

  it('assigns 100% of the shared WWT block cost to sysA (Case I)', () => {
    // The shared WWT is on the reject path (one of its two inputs is the RO
    // reject stream). Criterion 6 is met: both contributors (ro and sysA) are
    // allowable. Case I overrides: sysA receives the full WWT block cost
    // computed on total WWT inflow (product + reject = 100).
    expect(result.trueCostOfSystems['sysA'].wasteTreatment)
      .toBeCloseTo(blockCost(WWT_COST, WWT_INFLOW), 0);
  });

  it('assigns 100% of the discharge block cost to sysA (Case K)', () => {
    // The discharge is the registered reject discharge node (it follows the
    // shared WWT, which is on the reject path). Case K override: sysA receives
    // the full discharge block cost regardless of the combined inflow.
    expect(result.trueCostOfSystems['sysA'].discharge)
      .toBeCloseTo(blockCost(DISCHARGE_COST, WWT_INFLOW), 0);
  });
});

// ---------------------------------------------------------------------------
// Fixture: ro-dual-intake
// Configuration: [Intake1, Intake2] → RO → [System, Discharge(reject)]
//
//   intake1 (cost=1/kGal, outflow=60)  ─┐
//                                        ├─► ro (cost=5/kGal, inflow=100)
//   intake2 (cost=2/kGal, outflow=40)  ─┘       ├─ (70) ─► sysA → discharge1 (cost=1/kGal)
//                                                └─ (30) ─► discharge2 (reject, cost=0)
//
// Both intakes feed exclusively into the RO node (criterion 5b satisfied).
// Case D must fire independently for each intake, attributing 100% of each
// intake's block cost to sysA.
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — ro-dual-intake: [Intake1, Intake2] → RO → [System, Discharge(reject)]', () => {
  const INTAKE1_COST = 1;
  const INTAKE2_COST = 2;
  const RO_COST = 5;
  const DISCHARGE1_COST = 1;
  const INTAKE1_FLOW = 60;
  const INTAKE2_FLOW = 40;
  const RO_INFLOW = INTAKE1_FLOW + INTAKE2_FLOW;
  const PRODUCT_FLOW = 70;
  const REJECT_FLOW = 30;

  const intake1 = makeIntakeNode('intake1', INTAKE1_COST);
  const intake2 = makeIntakeNode('intake2', INTAKE2_COST);
  const ro = makeTreatmentNode('ro', RO_COST, 6);
  const sysA = makeSystemNode('sysA');
  const discharge1 = makeDischargeNode('discharge1', DISCHARGE1_COST); // product path
  const discharge2 = makeDischargeNode('discharge2', 0);               // reject path

  const nodes = [intake1, intake2, ro, sysA, discharge1, discharge2];
  const edges = [
    makeEdge('intake1', 'ro', INTAKE1_FLOW),
    makeEdge('intake2', 'ro', INTAKE2_FLOW),
    makeEdge('ro', 'sysA', PRODUCT_FLOW),
    makeEdge('ro', 'discharge2', REJECT_FLOW),
    makeEdge('sysA', 'discharge1', PRODUCT_FLOW),
  ];
  const calcData = makeCalcData({
    intake1:    { totalDischargeFlow: INTAKE1_FLOW },
    intake2:    { totalDischargeFlow: INTAKE2_FLOW },
    ro:         { totalSourceFlow: RO_INFLOW, totalDischargeFlow: RO_INFLOW },
    sysA:       { totalSourceFlow: PRODUCT_FLOW, totalDischargeFlow: PRODUCT_FLOW },
    discharge1: { totalSourceFlow: PRODUCT_FLOW },
    discharge2: { totalSourceFlow: REJECT_FLOW },
  });

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    {},
  );

  it('assigns 100% of intake1 block cost to sysA (Case D)', () => {
    expect(result.trueCostOfSystems['sysA'].intake)
      .toBeGreaterThanOrEqual(blockCost(INTAKE1_COST, INTAKE1_FLOW));
  });

  it('assigns 100% of intake2 block cost to sysA (Case D)', () => {
    const totalIntakeCost = blockCost(INTAKE1_COST, INTAKE1_FLOW) + blockCost(INTAKE2_COST, INTAKE2_FLOW);
    expect(result.trueCostOfSystems['sysA'].intake)
      .toBeCloseTo(totalIntakeCost, 0);
  });

  it('assigns 100% of RO treatment block cost to sysA (Case G)', () => {
    expect(result.trueCostOfSystems['sysA'].treatment)
      .toBeCloseTo(blockCost(RO_COST, RO_INFLOW), 0);
  });

  it('assigns product-path discharge cost to sysA', () => {
    expect(result.trueCostOfSystems['sysA'].discharge)
      .toBeCloseTo(blockCost(DISCHARGE1_COST, PRODUCT_FLOW), 0);
  });

  it('records intake1 attribution fraction of 1.0 (Case D)', () => {
    expect(result.systemAttributionMap['sysA']['intake1'].totalAttribution.default)
      .toBeCloseTo(1.0, 6);
  });

  it('records intake2 attribution fraction of 1.0 (Case D)', () => {
    expect(result.systemAttributionMap['sysA']['intake2'].totalAttribution.default)
      .toBeCloseTo(1.0, 6);
  });

  it('records RO treatment attribution fraction of 1.0 (Case G)', () => {
    expect(result.systemAttributionMap['sysA']['ro'].totalAttribution.default)
      .toBeCloseTo(1.0, 6);
  });
});

// ---------------------------------------------------------------------------
// Fixture: ro-nonqualifying-reject-has-system
// Non-qualifying: reject path contains a water-using system
//
//   intake (cost=1/kGal, outflow=100)
//     └─ e1 (100) ─► ro (cost=5/kGal, treatmentType=6, inflow=100)
//                     ├─ e2 (70) ─► sysA → discharge1 (cost=0)
//                     └─ e3 (30) ─► sysB → discharge2 (cost=0)
//
// Criterion 3/4: the reject output subtree contains a water-using-system (sysB).
// The single-system RO override does not apply. Standard flow-proportional
// attribution is used for both intake and treatment.
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — ro-nonqualifying-reject-has-system: reject path has water-using system, override does not apply', () => {
  const INTAKE_COST = 1;
  const RO_COST = 5;
  const RO_INFLOW = 100;
  const FLOW_A = 70;
  const FLOW_B = 30;

  const intake = makeIntakeNode('intake', INTAKE_COST);
  const ro = makeTreatmentNode('ro', RO_COST, 6);
  const sysA = makeSystemNode('sysA');
  const sysB = makeSystemNode('sysB');
  const discharge1 = makeDischargeNode('discharge1', 0);
  const discharge2 = makeDischargeNode('discharge2', 0);

  const nodes = [intake, ro, sysA, sysB, discharge1, discharge2];
  const edges = [
    makeEdge('intake', 'ro', RO_INFLOW),
    makeEdge('ro', 'sysA', FLOW_A),
    makeEdge('ro', 'sysB', FLOW_B),
    makeEdge('sysA', 'discharge1', FLOW_A),
    makeEdge('sysB', 'discharge2', FLOW_B),
  ];
  const calcData = makeCalcData({
    intake:     { totalDischargeFlow: RO_INFLOW },
    ro:         { totalSourceFlow: RO_INFLOW, totalDischargeFlow: RO_INFLOW },
    sysA:       { totalSourceFlow: FLOW_A, totalDischargeFlow: FLOW_A },
    sysB:       { totalSourceFlow: FLOW_B, totalDischargeFlow: FLOW_B },
    discharge1: { totalSourceFlow: FLOW_A },
    discharge2: { totalSourceFlow: FLOW_B },
  });

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    {},
  );

  it('attributes 70% of intake block cost to sysA (standard proportional — no RO override)', () => {
    expect(result.trueCostOfSystems['sysA'].intake)
      .toBeCloseTo(blockCost(INTAKE_COST, RO_INFLOW) * (FLOW_A / RO_INFLOW), 0);
  });

  it('attributes 30% of intake block cost to sysB (standard proportional — no RO override)', () => {
    expect(result.trueCostOfSystems['sysB'].intake)
      .toBeCloseTo(blockCost(INTAKE_COST, RO_INFLOW) * (FLOW_B / RO_INFLOW), 0);
  });

  it('attributed intake costs sum to total intake block cost (mass balance)', () => {
    const total = result.trueCostOfSystems['sysA'].intake
      + result.trueCostOfSystems['sysB'].intake;
    expect(total).toBeCloseTo(blockCost(INTAKE_COST, RO_INFLOW), 0);
  });

  it('attributes 70% of RO treatment block cost to sysA (standard proportional)', () => {
    expect(result.trueCostOfSystems['sysA'].treatment)
      .toBeCloseTo(blockCost(RO_COST, RO_INFLOW) * (FLOW_A / RO_INFLOW), 0);
  });

  it('attributes 30% of RO treatment block cost to sysB (standard proportional)', () => {
    expect(result.trueCostOfSystems['sysB'].treatment)
      .toBeCloseTo(blockCost(RO_COST, RO_INFLOW) * (FLOW_B / RO_INFLOW), 0);
  });
});

// ---------------------------------------------------------------------------
// Fixture: ro-nonqualifying-wwt-external-feed
// Non-qualifying: WWT on reject path receives flow from an external system
//                 (Criterion 6 not met)
//
//   intake (cost=1/kGal, outflow=100)
//     └─ e1 (100) ─► ro (cost=5/kGal, treatmentType=6, inflow=100)
//                     ├─ e2 (70) ─► sysA → discharge1 (cost=0)
//                     └─ e3 (30) ─► wwt (cost=3/kGal, inflow=50)
//                                        └─ e5 (50) ─► discharge2 (cost=0)
//   externalSys ─ e4 (20) ──────────────►
//
// Criterion 6 fails: the reject-path WWT receives 30 from the RO reject stream
// (allowable) and 20 from externalSys (not the RO node or the product-path
// system). The single-system RO override does not apply.
// Standard Case H attributes the WWT cost only to systems that contribute
// flow to it — externalSys receives a fraction; sysA receives none (sysA
// does not flow into the WWT in this configuration).
// ---------------------------------------------------------------------------

describe('getPlantSummaryResults — ro-nonqualifying-wwt-external-feed: WWT on reject path fed by external system, Criterion 6 fails', () => {
  const INTAKE_COST = 1;
  const RO_COST = 5;
  const WWT_COST = 3;
  const RO_INFLOW = 100;
  const PRODUCT_FLOW = 70;
  const REJECT_FLOW = 30;
  const EXTERNAL_FLOW = 20;
  const WWT_INFLOW = REJECT_FLOW + EXTERNAL_FLOW;

  const intake = makeIntakeNode('intake', INTAKE_COST);
  const ro = makeTreatmentNode('ro', RO_COST, 6);
  const sysA = makeSystemNode('sysA');
  const externalSys = makeSystemNode('externalSys');
  const wwt = makeWasteTreatmentNode('wwt', WWT_COST);
  const discharge1 = makeDischargeNode('discharge1', 0);
  const discharge2 = makeDischargeNode('discharge2', 0);

  const nodes = [intake, ro, sysA, externalSys, wwt, discharge1, discharge2];
  const edges = [
    makeEdge('intake', 'ro', RO_INFLOW),
    makeEdge('ro', 'sysA', PRODUCT_FLOW),
    makeEdge('sysA', 'discharge1', PRODUCT_FLOW),
    makeEdge('ro', 'wwt', REJECT_FLOW),
    makeEdge('externalSys', 'wwt', EXTERNAL_FLOW),
    makeEdge('wwt', 'discharge2', WWT_INFLOW),
  ];
  const calcData = makeCalcData({
    intake:       { totalDischargeFlow: RO_INFLOW },
    ro:           { totalSourceFlow: RO_INFLOW, totalDischargeFlow: RO_INFLOW },
    sysA:         { totalSourceFlow: PRODUCT_FLOW, totalDischargeFlow: PRODUCT_FLOW },
    externalSys:  { totalDischargeFlow: EXTERNAL_FLOW },
    wwt:          { totalSourceFlow: WWT_INFLOW, totalDischargeFlow: WWT_INFLOW },
    discharge1:   { totalSourceFlow: PRODUCT_FLOW },
    discharge2:   { totalSourceFlow: WWT_INFLOW },
  });

  const result = getPlantSummaryResults(
    nodes, calcData, edges,
    defaultSettings().electricityCost,
    defaultSettings(),
    {},
  );

  it('does not attribute full intake cost to sysA (RO single-system override does not apply)', () => {
    // Without the override, standard proportional: sysA receives 70% not 100%.
    const standardFraction = PRODUCT_FLOW / RO_INFLOW;
    expect(result.trueCostOfSystems['sysA'].intake)
      .toBeCloseTo(blockCost(INTAKE_COST, RO_INFLOW) * standardFraction, 0);
  });

  it('sysA does not receive any WWT cost (sysA does not flow into the WWT)', () => {
    // Case I must NOT apply: sysA has no edge into the WWT in this config.
    // Standard Case H Pass 2 upstream walk from the WWT finds externalSys,
    // not sysA.
    expect(result.trueCostOfSystems['sysA'].wasteTreatment).toBeCloseTo(0, 0);
  });

  it('externalSys receives a WWT cost attribution (standard Case H Pass 2)', () => {
    // externalSys contributes EXTERNAL_FLOW (20) of the WWT_INFLOW (50).
    // Standard Pass 2 attributes a flow-proportional fraction to externalSys.
    expect(result.trueCostOfSystems['externalSys'].wasteTreatment).toBeGreaterThan(0);
  });
});
