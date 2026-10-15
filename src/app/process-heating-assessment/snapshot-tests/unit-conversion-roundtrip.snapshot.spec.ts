/**
 * Unit-conversion round trip over every fixture: Imperial -> Metric -> Imperial returns the stored
 * values, and the Metric copy (with `energyResultUnit` held fixed) produces the same results as the
 * Imperial snapshots, which catches any unit-bearing field the converter missed.
 */

import { cloneDeep } from 'lodash';
import { PHAST as SharedPHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { PhastResultsService } from '../../phast/phast-results.service';
import { PHAST } from '../models/phast';
import { LegacyModification, ProcessHeatingModification } from '../models/modification';
import { convertProcessHeatingUnits } from '../services/convert-process-heating.util';
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

// Legacy computes these in the unit system's own units (EAF fuel energy in MMBtu or GJ, emissions in
// ton or tonne), so they differ between Imperial and Metric by design. Their input conversions are
// covered by convert-process-heating.util.spec.ts.
const UNIT_SYSTEM_DEPENDENT_RESULTS = ['co2EmissionsOutput', 'hourlyEAFResults', 'annualEAFResults'];

function toComparableResults(service: PhastResultsService, phast: PHAST, settings: Settings): unknown {
  const results = JSON.parse(JSON.stringify(service.getResults(phast as unknown as SharedPHAST, settings)));
  UNIT_SYSTEM_DEPENDENT_RESULTS.forEach(key => delete results[key]);
  return results;
}

function withoutUnitSystemDependentResults(snapshot: object): object {
  const comparable = { ...snapshot };
  UNIT_SYSTEM_DEPENDENT_RESULTS.forEach(key => delete comparable[key]);
  return comparable;
}

/** Paths of numeric leaves in `actual` that differ from `expected` by more than `absolute + relative * |expected|`. */
function findMismatches(actual: unknown, expected: unknown, absolute: number, relative: number, path = ''): string[] {
  if (typeof expected === 'number' && typeof actual === 'number') {
    return Math.abs(actual - expected) > absolute + relative * Math.abs(expected) ? [`${path}: ${actual} vs ${expected}`] : [];
  }
  if (expected && typeof expected === 'object' && actual && typeof actual === 'object') {
    return Object.keys(expected).flatMap(key => findMismatches(actual[key], expected[key], absolute, relative, `${path}.${key}`));
  }
  return actual === expected ? [] : [`${path}: ${JSON.stringify(actual)} vs ${JSON.stringify(expected)}`];
}

describe('Unit conversion round trip over fixtures', () => {
  let phastResultsService: PhastResultsService;

  beforeAll(async () => {
    phastResultsService = (await buildPhastServices()).phastResultsService;
  });

  for (const { name, fixture, snapshots } of FIXTURES) {
    describe(name, () => {
      const raw = fixture.assessments[0];
      const imperial: Settings = raw.settings;
      // Held on the Imperial energyResultUnit so results are directly comparable to the Imperial snapshots.
      const metric: Settings = { ...imperial, unitsOfMeasure: 'Metric' };
      const modificationCount: number = raw.assessment.phast.modifications.length;

      it('Imperial to Metric and back returns the stored values', () => {
        const original = migrate(cloneDeep(raw.assessment.phast));

        const metricPhast = convertProcessHeatingUnits(original, imperial, metric);
        const roundTrip = convertProcessHeatingUnits(metricPhast, metric, imperial);
        delete roundTrip.lossDataUnits;

        expect(findMismatches(roundTrip, original, 1e-3, 1e-4).join('\n')).toBe('');
      });

      it('Metric baseline results match the Imperial snapshot', () => {
        const metricPhast = convertProcessHeatingUnits(migrate(cloneDeep(raw.assessment.phast)), imperial, metric);

        expect(findMismatches(toComparableResults(phastResultsService, metricPhast, metric), withoutUnitSystemDependentResults(snapshots.baseline), 1e-6, 1e-3).join('\n')).toBe('');
      });

      for (let i = 0; i < modificationCount; i++) {
        it(`Metric modification[${i}] results match the Imperial snapshot`, () => {
          const metricPhast = convertProcessHeatingUnits(migrate(cloneDeep(raw.assessment.phast)), imperial, metric);
          const modification = metricPhast.modifications[i] as ProcessHeatingModification;
          const effective = getEffectivePhast(metricPhast, modification);

          expect(findMismatches(toComparableResults(phastResultsService, effective, metric), withoutUnitSystemDependentResults(snapshots[`modification_${i}`]), 1e-6, 1e-3).join('\n')).toBe('');
        });
      }
    });
  }
});
