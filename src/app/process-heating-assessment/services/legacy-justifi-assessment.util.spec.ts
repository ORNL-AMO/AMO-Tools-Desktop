import { Assessment } from '../../shared/models/assessment';
import { ExploreOpportunityCategory, PHAST } from '../models/phast';
import { ProcessHeatingModification } from '../models/modification';
import { toLegacyJustifiAssessment } from './legacy-justifi-assessment.util';

function buildAssessment(modifications: ProcessHeatingModification[]): Assessment {
  const phast = { name: 'Baseline', implementationCost: 0, setupDone: true, modifications } as unknown as PHAST;
  return { id: 1, name: 'Furnace', type: 'PHAST', phast } as unknown as Assessment;
}

describe('toLegacyJustifiAssessment', () => {
  it('gives each modification a full phast built from baseline plus its overrides', () => {
    const result = toLegacyJustifiAssessment(buildAssessment([{ id: 'm1', scenarioOverrides: { name: 'Mod 1', implementationCost: 500 } }]));
    const modification = result.phast.modifications[0];
    expect(modification.id).toBe('m1');
    expect(modification.phast.name).toBe('Mod 1');
    expect(modification.phast.implementationCost).toBe(500);
    expect(modification.phast.setupDone).toBeTrue();
  });

  it('maps explore opportunity flags to the legacy exploreOppsShow fields', () => {
    const flag = { hasOpportunity: true, display: 'Reduce flue gas' };
    const result = toLegacyJustifiAssessment(buildAssessment([{ id: 'm1', exploreOpportunityFlags: { [ExploreOpportunityCategory.FlueGas]: flag } }]));
    const modification = result.phast.modifications[0];
    expect(modification.exploreOpportunities).toBeTrue();
    expect(modification.exploreOppsShowFlueGas).toEqual(flag);
  });

  it('leaves exploreOpportunities false when a modification has no flags', () => {
    const result = toLegacyJustifiAssessment(buildAssessment([{ id: 'm1' }]));
    expect(result.phast.modifications[0].exploreOpportunities).toBeFalse();
  });

  it('does not mutate the saved assessment', () => {
    const assessment = buildAssessment([{ id: 'm1', scenarioOverrides: { name: 'Mod 1' } }]);
    toLegacyJustifiAssessment(assessment);
    expect((assessment.phast.modifications[0] as ProcessHeatingModification).scenarioOverrides.name).toBe('Mod 1');
  });
});
