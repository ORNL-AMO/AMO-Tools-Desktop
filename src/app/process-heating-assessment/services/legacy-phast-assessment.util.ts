import { Assessment } from '../../shared/models/assessment';
import { PHAST as SharedPHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { PHAST } from '../models/phast';
import { toLegacyJustifiAssessment } from './legacy-justifi-assessment.util';
import { migrateLegacyPhast } from './legacy-phast-migration.util';
import { scenarioSettingsFor } from './process-heating-assessment.service';

/**
 * Code outside this module (dashboard, rollup, JUSTIFI export, Treasure Hunt) calculates from each modification's
 * full `phast` clone. A modification saved here has none, and one migrated from legacy keeps a stale clone, so
 * every modification is rebuilt from its `scenarioOverrides`. Never-opened legacy modifications are migrated first,
 * so Auxiliary Power and hidden-tab losses are dropped from them the same way as from the baseline.
 * @param assessment Process Heating assessment as saved by either module
 * @param settings the assessment's settings
 * @returns a copy in the legacy shape; the input is not mutated
 */
export function toLegacyPhastAssessment(assessment: Assessment, settings: Settings): Assessment {
  const phast = migrateLegacyPhast(assessment.phast as unknown as PHAST);
  return toLegacyJustifiAssessment(
    { ...assessment, phast: phast as unknown as SharedPHAST },
    !!phast.setupDone,
    scenario => scenarioSettingsFor(settings, phast, scenario)
  );
}
