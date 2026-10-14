import { Assessment, AssessmentType } from '../shared/models/assessment';
import { WATER_MAIN_VIEWS } from '../water/routing/water-main-views';

interface RoutedAssessmentConfig {
  /** URL prefix; the assessment id and tab segments follow */
  base: string;
  isSetupDone: (assessment: Assessment) => boolean;
  /** Tab opened when setup is done. The generic dashboard `assessment` link also maps here. */
  setupDoneTab: string;
  /** When set, a requested tab outside this list opens baseline */
  views?: Array<string>;
  /** Extra URL segment for a tab, e.g. the diagram id */
  getTabSuffix?: (assessment: Assessment, tab: string) => string | undefined;
}

const ROUTED_ASSESSMENTS: Partial<Record<AssessmentType, RoutedAssessmentConfig>> = {
  PSAT: { base: '/psat/', isSetupDone: assessment => assessment.psat.setupDone, setupDoneTab: 'assessment' },
  FSAT: { base: '/fsat/', isSetupDone: assessment => assessment.fsat.setupDone, setupDoneTab: 'assessment' },
  SSMT: { base: '/ssmt/', isSetupDone: assessment => assessment.ssmt.setupDone, setupDoneTab: 'assessment' },
  WasteWater: { base: '/waste-water/', isSetupDone: assessment => assessment.wasteWater.setupDone, setupDoneTab: 'assessment' },
  Water: {
    base: '/water/',
    isSetupDone: () => false,
    setupDoneTab: 'baseline',
    views: WATER_MAIN_VIEWS,
    getTabSuffix: (assessment, tab) => tab === 'diagram' && assessment.diagramId ? String(assessment.diagramId) : undefined,
  },
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
    if (config.views && !config.views.includes(tab)) {
      tab = 'baseline';
    }
  } else if (config.isSetupDone(assessment) && !assessment.isExample) {
    tab = config.setupDoneTab;
  }
  const suffix: string | undefined = config.getTabSuffix?.(assessment, tab);
  return config.base + assessment.id + '/' + tab + (suffix ? '/' + suffix : '');
}
