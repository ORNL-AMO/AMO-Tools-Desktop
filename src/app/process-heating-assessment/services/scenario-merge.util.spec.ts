import { LOSS_KEYS, PHAST } from '../models/phast';
import { ProcessHeatingModification, ScenarioOverrides } from '../models/modification';
import { deriveScenarioOverridesFromLegacyModification, ensureLossIdsForPhast, getBaselineSnapshot, getEffectivePhast } from './scenario-merge.util';

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

  it('stays frozen for a loss type that did not exist on baseline at snapshot time, even after baseline adds it', () => {
    let mutableBaseline: PHAST = { name: 'Baseline', losses: {} };
    const modification = buildModification({ losses: getBaselineSnapshot(mutableBaseline).losses });

    mutableBaseline = { ...mutableBaseline, losses: { ...mutableBaseline.losses, wallLosses: [{ id: 'wall-1', surfaceArea: 100 } as never] } };
    const effectivePhast = getEffectivePhast(mutableBaseline, modification);

    expect(effectivePhast.losses.wallLosses).toBeUndefined();
  });
});

describe('deriveScenarioOverridesFromLegacyModification', () => {
  const baseline: PHAST = {
    name: 'Baseline',
    systemEfficiency: 80,
    losses: {
      chargeMaterials: [{ id: 'material-1', name: 'Steel', chargeMaterialType: 'Solid' } as never],
      wallLosses: [{ id: 'wall-1', surfaceArea: 100 } as never],
    },
  };

  it('captures a changed top-level scalar field, omitting unchanged non-calc top-level fields', () => {
    const modificationPhast: PHAST = { ...baseline, equipmentNotes: 'Preheated' };

    const overrides = deriveScenarioOverridesFromLegacyModification(modificationPhast, baseline);

    expect(overrides.equipmentNotes).toBe('Preheated');
    expect(overrides.name).toBeUndefined();
    expect('name' in overrides).toBe(false);
  });

  it('captures every loss type unconditionally, not just the one that changed', () => {
    const modifiedChargeMaterials = [{ id: 'material-1', name: 'Steel (preheated)', chargeMaterialType: 'Solid' } as never];
    const modificationPhast: PHAST = {
      ...baseline,
      losses: { ...baseline.losses, chargeMaterials: modifiedChargeMaterials },
    };

    const overrides = deriveScenarioOverridesFromLegacyModification(modificationPhast, baseline);

    expect(overrides.losses.chargeMaterials).toEqual(modifiedChargeMaterials);
    expect(overrides.losses.wallLosses).toEqual(baseline.losses.wallLosses);
  });

  it('always captures calc-relevant fields even when identical to baseline', () => {
    const modificationPhast: PHAST = JSON.parse(JSON.stringify(baseline));

    const overrides = deriveScenarioOverridesFromLegacyModification(modificationPhast, baseline);

    expect(overrides.losses.chargeMaterials).toEqual(baseline.losses.chargeMaterials);
    expect(overrides.losses.wallLosses).toEqual(baseline.losses.wallLosses);
    expect(Object.keys(overrides.losses).length).toBe(LOSS_KEYS.length);
    expect(overrides.systemEfficiency).toBe(baseline.systemEfficiency);
    expect('name' in overrides).toBe(false);
  });

  it('returns an empty object when the modification has no phast clone at all', () => {
    const overrides = deriveScenarioOverridesFromLegacyModification(undefined, baseline);

    expect(overrides).toEqual({});
  });

  it('round-trips: getEffectivePhast(baseline, { scenarioOverrides: deriveScenarioOverridesFromLegacyModification(modification.phast, baseline) }) reproduces the legacy modification phast', () => {
    const modifiedChargeMaterials = [{ id: 'material-1', name: 'Steel (preheated)', chargeMaterialType: 'Solid' } as never];
    const legacyModificationPhast: PHAST = {
      ...baseline,
      name: 'Scenario 1',
      systemEfficiency: 85,
      losses: { ...baseline.losses, chargeMaterials: modifiedChargeMaterials },
    };

    const scenarioOverrides: ScenarioOverrides = deriveScenarioOverridesFromLegacyModification(legacyModificationPhast, baseline);
    const modification: ProcessHeatingModification = { id: 'mod-1', scenarioOverrides };
    const effectivePhast = getEffectivePhast(baseline, modification);

    expect(effectivePhast.name).toBe(legacyModificationPhast.name);
    expect(effectivePhast.systemEfficiency).toBe(legacyModificationPhast.systemEfficiency);
    expect(effectivePhast.losses.chargeMaterials).toEqual(legacyModificationPhast.losses.chargeMaterials);
  });
});

describe('ensureLossIdsForPhast', () => {
  it('backfills a missing id on a baseline wall loss', () => {
    const phast: PHAST = { losses: { wallLosses: [{ surfaceArea: 100 } as never] } };

    const migrated = ensureLossIdsForPhast(phast);

    expect(migrated.losses.wallLosses[0].id).toBeTruthy();
  });

  it('backfills a missing id on a baseline extended surface', () => {
    const phast: PHAST = { losses: { extendedSurfaces: [{ surfaceArea: 50 } as never] } };

    const migrated = ensureLossIdsForPhast(phast);

    expect(migrated.losses.extendedSurfaces[0].id).toBeTruthy();
  });

  it('backfills a missing id on a baseline atmosphere loss', () => {
    const phast: PHAST = { losses: { atmosphereLosses: [{ flowRate: 1000 }] } };

    const migrated = ensureLossIdsForPhast(phast);

    expect(migrated.losses.atmosphereLosses[0].id).toBeTruthy();
  });

  it('aligns a legacy modification atmosphere override to baseline ids by position', () => {
    const modification: ProcessHeatingModification = {
      id: 'mod-1',
      scenarioOverrides: { losses: { atmosphereLosses: [{ flowRate: 1000 }, { flowRate: 500 }] } },
    };
    const phast: PHAST = {
      losses: { atmosphereLosses: [{ flowRate: 1000 }, { flowRate: 2000 }] },
      modifications: [modification],
    };

    const migrated = ensureLossIdsForPhast(phast);
    const migratedModification = migrated.modifications[0] as unknown as ProcessHeatingModification;
    const [baselineFirst, baselineSecond] = migrated.losses.atmosphereLosses;
    const [overrideFirst, overrideSecond] = migratedModification.scenarioOverrides.losses.atmosphereLosses;

    expect(overrideFirst.id).toBe(baselineFirst.id);
    expect(overrideSecond.id).toBe(baselineSecond.id);
  });

  it('assigns distinct ids to multiple id-less wall losses instead of leaving them all undefined', () => {
    const phast: PHAST = {
      losses: { wallLosses: [{ surfaceArea: 100 } as never, { surfaceArea: 200 } as never] },
    };

    const migrated = ensureLossIdsForPhast(phast);
    const [first, second] = migrated.losses.wallLosses;

    expect(first.id).toBeTruthy();
    expect(second.id).toBeTruthy();
    expect(first.id).not.toBe(second.id);
  });

  it('aligns a legacy modification override to baseline ids by position instead of leaving it id-less', () => {
    const modification: ProcessHeatingModification = {
      id: 'mod-1',
      scenarioOverrides: { losses: { wallLosses: [{ surfaceArea: 100 }, { surfaceArea: 999 }] as never } },
    };
    const phast: PHAST = {
      losses: { wallLosses: [{ surfaceArea: 100 } as never, { surfaceArea: 200 } as never] },
      modifications: [modification],
    };

    const migrated = ensureLossIdsForPhast(phast);
    const migratedModification = migrated.modifications[0] as unknown as ProcessHeatingModification;
    const [baselineFirst, baselineSecond] = migrated.losses.wallLosses;
    const [overrideFirst, overrideSecond] = migratedModification.scenarioOverrides.losses.wallLosses;

    expect(overrideFirst.id).toBe(baselineFirst.id);
    expect(overrideSecond.id).toBe(baselineSecond.id);
  });

  it('leaves ids already present untouched', () => {
    const phast: PHAST = { losses: { wallLosses: [{ id: 'wall-1', surfaceArea: 100 } as never] } };

    const migrated = ensureLossIdsForPhast(phast);

    expect(migrated.losses.wallLosses[0].id).toBe('wall-1');
  });

  it('returns the same phast reference when nothing needs backfilling', () => {
    const modification: ProcessHeatingModification = { id: 'mod-1', scenarioOverrides: { systemEfficiency: 90 } };
    const phast: PHAST = {
      losses: { wallLosses: [{ id: 'wall-1', surfaceArea: 100 } as never] },
      modifications: [modification],
    };

    const migrated = ensureLossIdsForPhast(phast);

    expect(migrated).toBe(phast);
  });
});
