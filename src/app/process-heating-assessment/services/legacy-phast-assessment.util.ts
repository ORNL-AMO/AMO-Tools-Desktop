import { Assessment } from '../../shared/models/assessment';
import { PHAST as SharedPHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { PHAST } from '../models/phast';
import { ProcessHeatingModification } from '../models/modification';
import { toLegacyJustifiAssessment } from './legacy-justifi-assessment.util';
import { migrateLegacyPhast } from './legacy-phast-migration.util';
import { scenarioSettingsFor } from './scenario-settings.util';

/**
 * The legacy module reads each modification's full `phast` copy, which a modification created in this module lacks.
 * @param phast Process Heating assessment as saved by either module, never a converted copy
 * @returns whether the legacy module can open the assessment
 */
export function canOpenInLegacyPhast(phast: SharedPHAST): boolean {
  return (phast?.modifications ?? []).every(modification => modification.phast);
}

export type PhastModuleChoice = 'phast' | 'process-heating';

/**
 * Once this module saves an assessment, code outside it calculates from the saved `scenarioOverrides`, while the
 * legacy module would show each modification's stale `phast` clone. A user's explicit choice still opens legacy.
 * @param phast Process Heating assessment as saved by either module, never a converted copy
 * @param override module the user picked, if any
 * @returns the module to open the assessment in
 */
export function phastModuleFor(phast: SharedPHAST, override?: PhastModuleChoice): PhastModuleChoice {
  if (!canOpenInLegacyPhast(phast)) {
    return 'process-heating';
  }
  if (override) {
    return override;
  }
  const modifications = (phast?.modifications ?? []) as unknown as ProcessHeatingModification[];
  const savedByProcessHeating = modifications.some(modification => modification.scenarioOverrides);
  return savedByProcessHeating ? 'process-heating' : 'phast';
}

/**
 * Code outside this module (dashboard, rollup, JUSTIFI export, Treasure Hunt) calculates from each modification's
 * full `phast` clone. A modification saved here has none, and one migrated from legacy keeps a stale clone, so
 * every modification is rebuilt from its `scenarioOverrides`. Never-opened legacy modifications are migrated first,
 * so Auxiliary Power and hidden-tab losses are dropped from them the same way as from the baseline.
 *
 * A modification on a different energy source than the baseline is left out: these consumers calculate every
 * scenario with the baseline's settings, which cannot read its energy entry, and the legacy report expects each
 * modification to hold the baseline's loss types.
 * @param assessment Process Heating assessment as saved by either module
 * @param settings the assessment's settings
 * @returns a copy in the legacy shape; the input is not mutated
 */
export function toLegacyPhastAssessment(assessment: Assessment, settings: Settings): Assessment {
  const phast = migrateLegacyPhast(assessment.phast as unknown as PHAST);
  const converted = toLegacyJustifiAssessment(
    { ...assessment, phast: phast as unknown as SharedPHAST },
    !!phast.setupDone,
    scenario => scenarioSettingsFor(settings, phast, scenario)
  );
  const modifications = converted.phast.modifications.filter(modification => !modification.exportWithoutResults);
  return { ...converted, phast: { ...converted.phast, modifications } };
}
