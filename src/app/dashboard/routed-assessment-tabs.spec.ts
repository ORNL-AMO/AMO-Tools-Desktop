import { Assessment, AssessmentType } from '../shared/models/assessment';
import { getRoutedAssessmentUrl } from './routed-assessment-tabs';

function makeAssessment(type: AssessmentType, setupDone: boolean, isExample = false): Assessment {
  return {
    id: 9,
    type,
    isExample,
    psat: { setupDone },
    fsat: { setupDone },
    ssmt: { setupDone },
    wasteWater: { setupDone },
    treasureHunt: { setupDone },
  } as Assessment;
}

describe('getRoutedAssessmentUrl', () => {
  const cases: Array<[AssessmentType, string, string]> = [
    ['PSAT', '/psat/9/', 'assessment'],
    ['FSAT', '/fsat/9/', 'assessment'],
    ['SSMT', '/ssmt/9/', 'assessment'],
    ['WasteWater', '/waste-water/9/', 'assessment'],
    ['TreasureHunt', '/treasure-hunt/9/', 'treasure-chest'],
  ];

  cases.forEach(([type, base, setupDoneTab]) => {
    describe(type, () => {
      it('opens baseline when setup is not done', () => {
        expect(getRoutedAssessmentUrl(makeAssessment(type, false))).toBe(base + 'baseline');
      });

      it(`opens ${setupDoneTab} when setup is done and no tab is requested`, () => {
        expect(getRoutedAssessmentUrl(makeAssessment(type, true))).toBe(base + setupDoneTab);
      });

      it('opens baseline for a completed example assessment', () => {
        expect(getRoutedAssessmentUrl(makeAssessment(type, true, true))).toBe(base + 'baseline');
      });

      it('opens the requested tab even when setup is not done', () => {
        expect(getRoutedAssessmentUrl(makeAssessment(type, false), 'report')).toBe(base + 'report');
      });

      it(`maps the generic assessment tab to ${setupDoneTab}`, () => {
        expect(getRoutedAssessmentUrl(makeAssessment(type, false), 'assessment')).toBe(base + setupDoneTab);
      });
    });
  });

  it('returns undefined for types that do not route main tabs', () => {
    ['PHAST', 'Water', 'CompressedAir', 'ProcessCooling'].forEach(type => {
      expect(getRoutedAssessmentUrl(makeAssessment(type as AssessmentType, true))).toBeUndefined();
    });
  });
});
