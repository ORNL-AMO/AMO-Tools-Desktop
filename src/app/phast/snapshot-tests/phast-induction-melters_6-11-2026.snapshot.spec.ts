/**
 * Snapshot test: Induction melters
 *
 * Electrotechnology, Imperial, 1 charge material, 1 cooling loss, 1 modification.
 *
 * To regenerate snapshots:
 *   1. Set GENERATE = true
 *   2. Run: ng test --include="**\/phast-induction-melters_6-11-2026.snapshot.spec.ts" --watch=false --browsers=ChromeHeadlessNoSandbox
 *   3. Pipe output through generate-snapshot.py into snapshots/induction-melters_6-11-2026.snap.json
 *   4. Set GENERATE = false and re-run to confirm green
 */

import { PHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { PhastResultsService } from '../phast-results.service';
import { buildPhastServices } from './snapshot.helper';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fixture = require('./fixtures/Induction melters_6-11-2026.json');

const GENERATE = false;

const MODIFICATION_COUNT = 1;

function extractAssessment(): { phast: PHAST; settings: Settings } {
  const raw = fixture.assessments[0];
  return { phast: raw.assessment.phast, settings: raw.settings };
}

describe('Snapshot Test: Induction melters', () => {
  let phastResultsService: PhastResultsService;

  beforeAll(async () => {
    const services = await buildPhastServices();
    phastResultsService = services.phastResultsService;
  });

  it('GENERATE flag must be false before committing', () => {
    expect(GENERATE).toBe(false);
  });

  it('fixture has expected modification count', () => {
    expect(extractAssessment().phast.modifications.length).toBe(MODIFICATION_COUNT);
  });

  if (GENERATE) {

    it('generates baseline snapshot', () => {
      const { phast, settings } = extractAssessment();
      const result = phastResultsService.getResults(phast, settings);
      console.log('SNAPSHOT:baseline:' + JSON.stringify(result));
      expect(true).toBe(true);
    });

    for (let i = 0; i < MODIFICATION_COUNT; i++) {
      it(`generates modification[${i}] snapshot`, () => {
        const { phast, settings } = extractAssessment();
        const modPhast: PHAST = phast.modifications[i].phast;
        const result = phastResultsService.getResults(modPhast, settings);
        console.log(`SNAPSHOT:modification_${i}:` + JSON.stringify(result));
        expect(true).toBe(true);
      });
    }

  } else {

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const snapshots = require('./snapshots/induction-melters_6-11-2026.snap.json');

    it('baseline results match snapshot', () => {
      const { phast, settings } = extractAssessment();
      const result = JSON.parse(JSON.stringify(phastResultsService.getResults(phast, settings)));
      expect(result).toEqual(snapshots.baseline);
    });

    for (let i = 0; i < MODIFICATION_COUNT; i++) {
      it(`modification[${i}] results match snapshot`, () => {
        const { phast, settings } = extractAssessment();
        const modPhast: PHAST = phast.modifications[i].phast;
        const result = JSON.parse(JSON.stringify(phastResultsService.getResults(modPhast, settings)));
        expect(result).toEqual(snapshots[`modification_${i}`]);
      });
    }

  }
});
