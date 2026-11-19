/**
 * The per-fixture specs call the legacy PhastResultsService directly, which skips the losses this module
 * leaves out for the scenario's energy source. These run the Gas Leakage fixtures through
 * ProcessHeatingResultsService so a non-fuel scenario that drops its leakage fails against the legacy snapshot.
 */
import { TestBed } from '@angular/core/testing';
import { PhastResultsService } from '../../phast/phast-results.service';
import { MeteredEnergyService } from '../../phast/metered-energy/metered-energy.service';
import { DesignedEnergyService } from '../../phast/designed-energy/designed-energy.service';
import { Settings } from '../../shared/models/settings';
import { LegacyModification } from '../models/modification';
import { PHAST } from '../models/phast';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { ProcessHeatingResultsService } from '../services/process-heating-results.service';
import { buildPhastServices } from './snapshot.helper';
import { GAS_LEAKAGE_FIXTURES } from './snapshot-fixtures';

describe('Gas Leakage fixtures through ProcessHeatingResultsService', () => {
  let phastResultsService: PhastResultsService;
  let service: ProcessHeatingResultsService;

  beforeAll(async () => {
    phastResultsService = (await buildPhastServices()).phastResultsService;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProcessHeatingResultsService,
        { provide: PhastResultsService, useValue: phastResultsService },
        { provide: ProcessHeatingAssessmentService, useValue: {} },
        { provide: MeteredEnergyService, useValue: {} },
        { provide: DesignedEnergyService, useValue: {} },
      ],
    });
    service = TestBed.inject(ProcessHeatingResultsService);
  });

  const toResults = (phast: PHAST, settings: Settings): unknown => JSON.parse(JSON.stringify(service.getResults(phast, settings)));

  for (const { name, fixture, snapshots } of GAS_LEAKAGE_FIXTURES) {
    describe(name, () => {
      const raw = fixture.assessments[0];
      const settings: Settings = raw.settings;
      const baseline: PHAST = raw.assessment.phast;
      const modifications: LegacyModification[] = raw.assessment.phast.modifications;

      it('baseline counts its Gas Leakage and matches the legacy snapshot', () => {
        expect(snapshots.baseline.totalLeakageLoss).toBeGreaterThan(0);
        expect(toResults(baseline, settings)).toEqual(snapshots.baseline);
      });

      modifications.forEach((modification, index) => {
        it(`modification[${index}] counts its Gas Leakage and matches the legacy snapshot`, () => {
          const snapshot = snapshots[`modification_${index}`];
          expect(snapshot.totalLeakageLoss).toBeGreaterThan(0);
          expect(toResults(modification.phast, settings)).toEqual(snapshot);
        });
      });
    });
  }
});
