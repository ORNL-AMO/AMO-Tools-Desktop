/**
 * Round-trip test: legacy fixture -> scenarioOverrides migration -> getEffectivePhast -> results.
 *
 * Mirrors the resolver's migration (derive overrides for each legacy modification, then backfill
 * loss ids) and asserts the rebuilt scenarios produce the same PhastResults as the legacy
 * `modification.phast` snapshots. Reuses the existing snapshots; none are generated here.
 */

import { PHAST as SharedPHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { PhastResultsService } from '../../phast/phast-results.service';
import { PHAST } from '../models/phast';
import { LegacyModification, ProcessHeatingModification } from '../models/modification';
import { deriveScenarioOverridesFromLegacyModification, ensureLossIdsForPhast, getEffectivePhast } from '../services/scenario-merge.util';
import { buildPhastServices } from './snapshot.helper';
import { FIXTURES } from './snapshot-fixtures';

function migrate(baseline: PHAST): PHAST {
  const modifications = baseline.modifications?.map(modification => {
    const legacyModification = modification as LegacyModification;
    return {
      ...modification,
      scenarioOverrides: deriveScenarioOverridesFromLegacyModification(legacyModification.phast, baseline),
    };
  });
  return ensureLossIdsForPhast({ ...baseline, modifications });
}

function toResults(service: PhastResultsService, phast: PHAST, settings: Settings): unknown {
  return JSON.parse(JSON.stringify(service.getResults(phast as unknown as SharedPHAST, settings)));
}

describe('Scenario round-trip: legacy fixtures through scenarioOverrides', () => {
  let phastResultsService: PhastResultsService;

  beforeAll(async () => {
    phastResultsService = (await buildPhastServices()).phastResultsService;
  });

  for (const { name, fixture, snapshots } of FIXTURES) {
    describe(name, () => {
      const raw = fixture.assessments[0];
      const settings: Settings = raw.settings;
      const modificationCount: number = raw.assessment.phast.modifications.length;

      it('baseline (after id backfill) matches snapshot', () => {
        const migrated = migrate(raw.assessment.phast);
        expect(toResults(phastResultsService, migrated, settings)).toEqual(snapshots.baseline);
      });

      for (let i = 0; i < modificationCount; i++) {
        it(`modification[${i}] rebuilt from scenarioOverrides matches snapshot`, () => {
          const migrated = migrate(raw.assessment.phast);
          const modification = migrated.modifications[i] as ProcessHeatingModification;
          const effective = getEffectivePhast(migrated, modification);
          expect(toResults(phastResultsService, effective, settings)).toEqual(snapshots[`modification_${i}`]);
        });
      }
    });
  }
});
