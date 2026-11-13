import { Assessment } from '../../shared/models/assessment';
import { ExploreOpportunityCategory, PHAST } from '../models/phast';
import { ProcessHeatingModification } from '../models/modification';
import { toLegacyJustifiAssessment } from './legacy-justifi-assessment.util';

function buildAssessment(modifications: ProcessHeatingModification[]): Assessment {
  const phast = { name: 'Baseline', implementationCost: 0, modifications } as unknown as PHAST;
  return { id: 1, name: 'Furnace', type: 'PHAST', phast } as unknown as Assessment;
}

describe('toLegacyJustifiAssessment', () => {
  it('gives each modification a full phast built from baseline plus its overrides', () => {
    const result = toLegacyJustifiAssessment(buildAssessment([{ id: 'm1', scenarioOverrides: { name: 'Mod 1', implementationCost: 500 } }]), true);
    const modification = result.phast.modifications[0];
    expect(modification.id).toBe('m1');
    expect(modification.phast.name).toBe('Mod 1');
    expect(modification.phast.implementationCost).toBe(500);
  });

  it('maps explore opportunity flags to the legacy exploreOppsShow fields', () => {
    const flag = { hasOpportunity: true, display: 'Reduce flue gas' };
    const result = toLegacyJustifiAssessment(buildAssessment([{ id: 'm1', exploreOpportunityFlags: { [ExploreOpportunityCategory.FlueGas]: flag } }]), true);
    const modification = result.phast.modifications[0];
    expect(modification.exploreOpportunities).toBeTrue();
    expect(modification.exploreOppsShowFlueGas).toEqual(flag);
  });

  it('leaves exploreOpportunities false when a modification has no flags', () => {
    const result = toLegacyJustifiAssessment(buildAssessment([{ id: 'm1' }]), true);
    expect(result.phast.modifications[0].exploreOpportunities).toBeFalse();
  });

  it('sets setupDone on the exported baseline from the given readiness, even when the saved assessment has none', () => {
    expect(toLegacyJustifiAssessment(buildAssessment([]), true).phast.setupDone).toBeTrue();
    expect(toLegacyJustifiAssessment(buildAssessment([]), false).phast.setupDone).toBeFalse();
  });

  it('leaves saved auxiliary power losses out of the exported baseline and modifications', () => {
    const assessment = buildAssessment([{ id: 'm1' }]);
    (assessment.phast as unknown as PHAST).losses = { auxiliaryPowerLosses: [{ supplyVoltage: 480 }], wallLosses: [] };

    const result = toLegacyJustifiAssessment(assessment, true);

    expect(result.phast.losses.auxiliaryPowerLosses).toBeUndefined();
    expect(result.phast.losses.wallLosses).toEqual([]);
    expect(result.phast.modifications[0].phast.losses.auxiliaryPowerLosses).toBeUndefined();
    expect(assessment.phast.losses.auxiliaryPowerLosses.length).toBe(1);
  });

  it('leaves auxiliary equipment out of the exported baseline and modifications', () => {
    const assessment = buildAssessment([{ id: 'm1', scenarioOverrides: { auxiliaryEquipment: [{ id: 'aux-2' } as never] } }]);
    const baseline = assessment.phast as unknown as PHAST;
    baseline.auxEquipment = [{ name: 'Fan' } as never];
    baseline.auxiliaryEquipment = [{ id: 'aux-1' } as never];

    const result = toLegacyJustifiAssessment(assessment, true);

    expect('auxEquipment' in result.phast).toBeFalse();
    expect('auxiliaryEquipment' in result.phast).toBeFalse();
    expect('auxEquipment' in result.phast.modifications[0].phast).toBeFalse();
    expect('auxiliaryEquipment' in result.phast.modifications[0].phast).toBeFalse();
    expect(baseline.auxiliaryEquipment.length).toBe(1);
  });

  it('does not mutate the saved assessment', () => {
    const assessment = buildAssessment([{ id: 'm1', scenarioOverrides: { name: 'Mod 1' } }]);
    toLegacyJustifiAssessment(assessment, true);
    expect((assessment.phast.modifications[0] as ProcessHeatingModification).scenarioOverrides.name).toBe('Mod 1');
  });
});
