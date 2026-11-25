import { computeMigratedExploreOpportunityFlags, LegacyModification } from '../models/modification';
import { PHAST } from '../models/phast';
import { migrateLegacyAuxEquipment } from './auxiliary-equipment-migration.util';
import { deriveScenarioOverridesFromLegacyModification } from './scenario-merge.util';

/**
 * Gives each modification last written by legacy (a full `phast` clone and flat `exploreOppsShowX` fields) the
 * `scenarioOverrides` and `exploreOpportunityFlags` this module reads, and migrates legacy auxiliary equipment.
 * A modification that already has `scenarioOverrides` is left untouched, and `modification.phast` and the legacy
 * flags are kept so the legacy module can still read the record.
 * @param phast baseline as saved, in either module's shape
 * @returns the baseline with every modification in this module's shape
 */
export function migrateLegacyPhast(phast: PHAST): PHAST {
  const processHeating = migrateLegacyAuxEquipment(phast);
  const modifications = processHeating.modifications?.map(modification => {
    const legacyModification = modification as LegacyModification;
    return legacyModification.scenarioOverrides
      ? modification
      : {
        ...modification,
        scenarioOverrides: deriveScenarioOverridesFromLegacyModification(
          migrateLegacyAuxEquipment(legacyModification.phast, processHeating.auxiliaryEquipment), processHeating),
        exploreOpportunityFlags: computeMigratedExploreOpportunityFlags(legacyModification),
      };
  });
  return modifications ? { ...processHeating, modifications } : processHeating;
}
