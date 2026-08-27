import { PHAST } from '../models/phast';
import { ProcessHeatingModification, ScenarioOverrides } from '../models/modification';
import { computeScenarioOverrides, getEffectivePhast } from './scenario-merge.util';

describe('getEffectivePhast', () => {
  const baseline: PHAST = {
    name: 'Baseline',
    systemEfficiency: 80,
    losses: {
      chargeMaterials: [{ id: 'material-1', name: 'Steel', chargeMaterialType: 'Solid' } as never],
      wallLosses: [{ id: 'wall-1', surfaceArea: 100 } as never],
    },
  };

  function buildModification(scenarioOverrides: ScenarioOverrides | undefined): ProcessHeatingModification {
    return { id: 'mod-1', scenarioOverrides };
  }

  it('returns baseline unchanged when there is no diff', () => {
    const effectivePhast = getEffectivePhast(baseline, buildModification(undefined));

    expect(effectivePhast).toBe(baseline);
  });

  it('overrides a top-level field present in the diff, leaving other top-level fields as baseline', () => {
    const modification = buildModification({ systemEfficiency: 90 });

    const effectivePhast = getEffectivePhast(baseline, modification);

    expect(effectivePhast.systemEfficiency).toBe(90);
    expect(effectivePhast.name).toBe('Baseline');
  });

  it('overrides only the loss type present in the diff, leaving other loss types as baseline', () => {
    const modifiedChargeMaterials = [{ id: 'material-1', name: 'Steel (preheated)', chargeMaterialType: 'Solid' } as never];
    const modification = buildModification({ losses: { chargeMaterials: modifiedChargeMaterials } });

    const effectivePhast = getEffectivePhast(baseline, modification);

    expect(effectivePhast.losses.chargeMaterials).toBe(modifiedChargeMaterials);
    expect(effectivePhast.losses.wallLosses).toBe(baseline.losses.wallLosses);
  });

  it('applies the loss-type diff even when the modification has no Explore Opportunities flags set', () => {
    const modifiedChargeMaterials = [{ id: 'material-1', name: 'Steel (preheated)', chargeMaterialType: 'Solid' } as never];
    const modification = buildModification({ losses: { chargeMaterials: modifiedChargeMaterials } });
    modification.exploreOpportunityFlags = undefined;

    const effectivePhast = getEffectivePhast(baseline, modification);

    expect(effectivePhast.losses.chargeMaterials).toBe(modifiedChargeMaterials);
  });
});

describe('computeScenarioOverrides', () => {
  const baseline: PHAST = {
    name: 'Baseline',
    systemEfficiency: 80,
    losses: {
      chargeMaterials: [{ id: 'material-1', name: 'Steel', chargeMaterialType: 'Solid' } as never],
      wallLosses: [{ id: 'wall-1', surfaceArea: 100 } as never],
    },
  };

  it('captures a changed top-level scalar field, omitting unchanged top-level fields', () => {
    const modificationPhast: PHAST = { ...baseline, systemEfficiency: 90 };

    const overrides = computeScenarioOverrides(modificationPhast, baseline);

    expect(overrides.systemEfficiency).toBe(90);
    expect(overrides.name).toBeUndefined();
    expect('name' in overrides).toBe(false);
  });

  it('captures only the loss type that changed, omitting untouched loss types entirely', () => {
    const modifiedChargeMaterials = [{ id: 'material-1', name: 'Steel (preheated)', chargeMaterialType: 'Solid' } as never];
    const modificationPhast: PHAST = {
      ...baseline,
      losses: { ...baseline.losses, chargeMaterials: modifiedChargeMaterials },
    };

    const overrides = computeScenarioOverrides(modificationPhast, baseline);

    expect(overrides.losses.chargeMaterials).toEqual(modifiedChargeMaterials);
    expect(overrides.losses.wallLosses).toBeUndefined();
    expect('wallLosses' in overrides.losses).toBe(false);
  });

  it('returns an empty object when the modification is identical to baseline in every field', () => {
    const modificationPhast: PHAST = JSON.parse(JSON.stringify(baseline));

    const overrides = computeScenarioOverrides(modificationPhast, baseline);

    expect(overrides).toEqual({});
  });

  it('returns an empty object when the modification has no phast clone at all', () => {
    const overrides = computeScenarioOverrides(undefined, baseline);

    expect(overrides).toEqual({});
  });

  it('round-trips: getEffectivePhast(baseline, { scenarioOverrides: computeScenarioOverrides(modification.phast, baseline) }) reproduces the legacy modification phast', () => {
    const modifiedChargeMaterials = [{ id: 'material-1', name: 'Steel (preheated)', chargeMaterialType: 'Solid' } as never];
    const legacyModificationPhast: PHAST = {
      ...baseline,
      name: 'Scenario 1',
      systemEfficiency: 85,
      losses: { ...baseline.losses, chargeMaterials: modifiedChargeMaterials },
    };

    const scenarioOverrides: ScenarioOverrides = computeScenarioOverrides(legacyModificationPhast, baseline);
    const modification: ProcessHeatingModification = { id: 'mod-1', scenarioOverrides };
    const effectivePhast = getEffectivePhast(baseline, modification);

    expect(effectivePhast).toEqual(legacyModificationPhast);
  });
});
