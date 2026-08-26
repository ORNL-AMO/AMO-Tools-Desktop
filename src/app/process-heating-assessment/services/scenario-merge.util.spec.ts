import { PHAST } from '../models/phast';
import { ProcessHeatingModification, ScenarioOverrides } from '../models/modification';
import { getEffectivePhast } from './scenario-merge.util';

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
    modification.exploreOpportunities = undefined;

    const effectivePhast = getEffectivePhast(baseline, modification);

    expect(effectivePhast.losses.chargeMaterials).toBe(modifiedChargeMaterials);
  });
});
