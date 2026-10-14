import { Assessment, AssessmentType } from '../shared/models/assessment';

interface RoutedAssessmentConfig {
  /** URL prefix; the assessment id and tab segments follow */
  base: string;
  isSetupDone: (assessment: Assessment) => boolean;
  /** Tab opened when setup is done. The generic dashboard `assessment` link also maps here. */
  setupDoneTab: string;
}

const ROUTED_ASSESSMENTS: Partial<Record<AssessmentType, RoutedAssessmentConfig>> = {
  PSAT: { base: '/psat/', isSetupDone: assessment => assessment.psat.setupDone, setupDoneTab: 'assessment' },
  FSAT: { base: '/fsat/', isSetupDone: assessment => assessment.fsat.setupDone, setupDoneTab: 'assessment' },
  SSMT: { base: '/ssmt/', isSetupDone: assessment => assessment.ssmt.setupDone, setupDoneTab: 'assessment' },
  WasteWater: { base: '/waste-water/', isSetupDone: assessment => assessment.wasteWater.setupDone, setupDoneTab: 'assessment' },
  // Treasure Hunt has no 'assessment' tab; its treasure chest takes that role
  TreasureHunt: { base: '/treasure-hunt/', isSetupDone: assessment => assessment.treasureHunt.setupDone, setupDoneTab: 'treasure-chest' },
};

/**
 * @param assessment Assessment being opened
 * @param requestedTab Tab asked for by the link, if any
 * @returns The URL of the assessment's starting tab, or undefined when its type does not route main tabs
 */
export function getRoutedAssessmentUrl(assessment: Assessment, requestedTab?: string): string | undefined {
  const config: RoutedAssessmentConfig = ROUTED_ASSESSMENTS[assessment.type];
  if (!config) {
    return undefined;
  }
  let tab: string = 'baseline';
  if (requestedTab) {
    tab = requestedTab === 'assessment' ? config.setupDoneTab : requestedTab;
  } else if (config.isSetupDone(assessment) && !assessment.isExample) {
    tab = config.setupDoneTab;
  }
  return config.base + assessment.id + '/' + tab;
}
