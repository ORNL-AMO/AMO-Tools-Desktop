import { SavingsOpportunity } from '../../shared/models/explore-opps';
import { ExploreOpportunityCategory } from './phast';
import { computeMigratedExploreOpportunityFlags, LegacyModification } from './modification';

describe('computeMigratedExploreOpportunityFlags', () => {
  function buildLegacyModification(overrides: Partial<LegacyModification>): LegacyModification {
    return { id: 'mod-1', ...overrides };
  }

  it('maps every legacy exploreOppsShowX field present to its ExploreOpportunityCategory key', () => {
    const flueGas: SavingsOpportunity = { hasOpportunity: true, display: 'Flue Gas' };
    const material: SavingsOpportunity = { hasOpportunity: false, display: 'Preheat Charge Material' };
    const legacyModification = buildLegacyModification({
      exploreOppsShowFlueGas: flueGas,
      exploreOppsShowMaterial: material,
    });

    const flags = computeMigratedExploreOpportunityFlags(legacyModification);

    expect(flags[ExploreOpportunityCategory.FlueGas]).toBe(flueGas);
    expect(flags[ExploreOpportunityCategory.Material]).toBe(material);
  });

  it('omits categories the legacy modification has no flag for', () => {
    const legacyModification = buildLegacyModification({
      exploreOppsShowFlueGas: { hasOpportunity: true, display: 'Flue Gas' },
    });

    const flags = computeMigratedExploreOpportunityFlags(legacyModification);

    expect(ExploreOpportunityCategory.Wall in flags).toBe(false);
    expect(Object.keys(flags)).toEqual([ExploreOpportunityCategory.FlueGas]);
  });

  it('ignores the legacy top-level boolean exploreOpportunities flag entirely', () => {
    const legacyModification = buildLegacyModification({ exploreOpportunities: true });

    const flags = computeMigratedExploreOpportunityFlags(legacyModification);

    expect(flags).toEqual({});
  });

  it('returns an empty object when the legacy modification has no explore-opportunity flags at all', () => {
    const flags = computeMigratedExploreOpportunityFlags(buildLegacyModification({}));

    expect(flags).toEqual({});
  });

  it('covers all 15 legacy categories', () => {
    const opportunity: SavingsOpportunity = { hasOpportunity: true, display: 'x' };
    const legacyModification = buildLegacyModification({
      exploreOppsShowFlueGas: opportunity,
      exploreOppsShowAirTemp: opportunity,
      exploreOppsShowMaterial: opportunity,
      exploreOppsShowAllTimeOpen: opportunity,
      exploreOppsShowOpening: opportunity,
      exploreOppsShowAllEmissivity: opportunity,
      exploreOppsShowCooling: opportunity,
      exploreOppsShowAtmosphere: opportunity,
      exploreOppsShowOperations: opportunity,
      exploreOppsShowLeakage: opportunity,
      exploreOppsShowSlag: opportunity,
      exploreOppsShowEfficiencyData: opportunity,
      exploreOppsShowWall: opportunity,
      exploreOppsShowAllTemp: opportunity,
      exploreOppsShowFixtures: opportunity,
    });

    const flags = computeMigratedExploreOpportunityFlags(legacyModification);

    // ExtendedSurface has no legacy exploreOppsShowX counterpart (legacy PHAST never had a
    // dedicated extended-surface opportunity toggle), so it's excluded from the "all categories
    // covered" check on purpose.
    const categoriesWithLegacyFields = Object.values(ExploreOpportunityCategory)
      .filter(category => category !== ExploreOpportunityCategory.ExtendedSurface);
    expect(Object.keys(flags).sort()).toEqual(categoriesWithLegacyFields.sort());
  });
});
