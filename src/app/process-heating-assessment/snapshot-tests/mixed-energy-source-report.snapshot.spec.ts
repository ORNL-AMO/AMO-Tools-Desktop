/**
 * A fuel-fired baseline compared with an electric modification, through the real results engine and the
 * Executive Summary and Result Data report services. Legacy can't produce mixed-source results, so instead of
 * a golden master this checks that every scenario's report values don't depend on the assessment's energy
 * result unit, and that each column only reports the rows its own energy source uses.
 */
import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PhastResultsService } from '../../phast/phast-results.service';
import { MeteredEnergyService } from '../../phast/metered-energy/metered-energy.service';
import { DesignedEnergyService } from '../../phast/designed-energy/designed-energy.service';
import { FeatureFlagService } from '../../shared/feature-flag.service';
import { ReportTableRow } from '../../shared/report-builder/models/report-ui-models';
import { Settings } from '../../shared/models/settings';
import { AuxiliaryEquipmentResults } from '../models/auxiliary-equipment';
import { ProcessHeatingModification } from '../models/modification';
import { PHAST } from '../models/phast';
import { ExecutiveSummaryResultsService } from '../report/executive-summary/executive-summary-results.service';
import { ResultsDataResultsService } from '../report/results-data/results-data-results.service';
import { AuxiliaryEquipmentResultsService } from '../services/auxiliary-equipment-results.service';
import { ModificationService } from '../services/modification.service';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { ProcessHeatingResultsService } from '../services/process-heating-results.service';
import { buildPhastServices } from './snapshot.helper';

/* eslint-disable @typescript-eslint/no-require-imports */
const FUEL_FIXTURE = require('./fixtures/Process Heating - Fuel Example.json');
const EAF_FIXTURE = require('./fixtures/EAF Dummy Values.json');
const INDUCTION_FIXTURE = require('./fixtures/Induction melters_6-11-2026.json');
/* eslint-enable @typescript-eslint/no-require-imports */

const NO_EQUIPMENT: AuxiliaryEquipmentResults = { items: [], isComplete: true, totalPower: 0, totalEnergyUse: 0, totalEnergyCost: 0 };

interface MixedSourceCase {
  name: string;
  modificationPhast: () => PHAST;
  modificationSettings: Settings;
}

/** The EAF fixture without its exhaust gas entry, the path where electricity input feeds the totals directly. */
function eafWithoutExhaustGas(): PHAST {
  const phast = structuredClone(EAF_FIXTURE.assessments[0].assessment.phast);
  delete phast.losses.exhaustGasEAF;
  return phast;
}

const CASES: MixedSourceCase[] = [
  { name: 'electric arc furnace', modificationPhast: eafWithoutExhaustGas, modificationSettings: EAF_FIXTURE.assessments[0].settings },
  {
    name: 'standard electrotechnology',
    modificationPhast: () => structuredClone(INDUCTION_FIXTURE.assessments[0].assessment.phast),
    modificationSettings: INDUCTION_FIXTURE.assessments[0].settings,
  },
];

describe('Mixed energy source report', () => {
  let phastResultsService: PhastResultsService;

  beforeAll(async () => {
    phastResultsService = (await buildPhastServices()).phastResultsService;
  });

  for (const { name, modificationPhast, modificationSettings } of CASES) {
    describe(`fuel-fired baseline with a ${name} modification`, () => {
      let settings: WritableSignal<Settings>;
      let executiveSummary: ExecutiveSummaryResultsService;
      let resultsData: ResultsDataResultsService;

      const summaryRow = (label: string): ReportTableRow => executiveSummary.executiveSummaryUI().summaryRows.find(row => row.label === label);
      const resultsRow = (label: string): ReportTableRow => resultsData.resultsDataUI().rows.find(row => row.label === label);
      const values = (row: ReportTableRow): [number, number] => [row.baseline.value as number, row.modifications[0].value as number];

      beforeEach(() => {
        settings = signal<Settings>({ ...FUEL_FIXTURE.assessments[0].settings });
        const baselinePhast: PHAST = structuredClone(FUEL_FIXTURE.assessments[0].assessment.phast);
        const phasts: Record<string, PHAST> = { baseline: baselinePhast, mod1: modificationPhast() };
        const energySource = {
          energySourceType: modificationSettings.energySourceType,
          furnaceType: modificationSettings.furnaceType,
          customFurnaceName: modificationSettings.customFurnaceName,
        };

        TestBed.configureTestingModule({
          providers: [
            ProcessHeatingResultsService,
            ExecutiveSummaryResultsService,
            ResultsDataResultsService,
            { provide: PhastResultsService, useValue: phastResultsService },
            { provide: MeteredEnergyService, useValue: {} },
            { provide: DesignedEnergyService, useValue: {} },
            {
              provide: ProcessHeatingAssessmentService,
              useValue: {
                settingsSignal: settings,
                scenarioSettings: (scenario: string) => scenario === 'baseline' ? settings() : { ...settings(), ...energySource },
                scenarioPhastSignal: (scenario: string) => phasts[scenario],
              },
            },
            {
              provide: ModificationService,
              useValue: { modifications: signal<ProcessHeatingModification[]>([{ id: 'mod1', scenarioOverrides: { name: 'Electric' } }]) },
            },
            { provide: FeatureFlagService, useValue: { showOperationalImpacts: signal(false) } },
            { provide: AuxiliaryEquipmentResultsService, useValue: { scenarioResults: () => NO_EQUIPMENT } },
          ],
        });
        executiveSummary = TestBed.inject(ExecutiveSummaryResultsService);
        resultsData = TestBed.inject(ResultsDataResultsService);
      });

      it('prices both scenarios the same whatever the energy result unit', () => {
        const mmBtuCost = values(summaryRow('Cost'));
        settings.update(current => ({ ...current, energyResultUnit: 'kWh' }));
        const kWhCost = values(summaryRow('Cost'));

        expect(mmBtuCost[0]).toBeGreaterThan(0);
        expect(mmBtuCost[1]).toBeGreaterThan(0);
        expect(kWhCost[0]).toBeCloseTo(mmBtuCost[0], 0);
        expect(kWhCost[1]).toBeCloseTo(mmBtuCost[1], 0);
      });

      it('reports the electrical cost breakdown for the modification only', () => {
        const electrical = executiveSummary.executiveSummaryUI().costRows.find(row => row.label === 'Electrical');
        expect(electrical.baseline.value).toBeNull();
        expect(electrical.modifications[0].value).toBeGreaterThan(0);
      });

      it("reports flue gas for the baseline and electrical heat delivered for the modification", () => {
        const [baselineFlueGas, modificationFlueGas] = values(resultsRow('Flue Gas Losses'));
        const [baselineElectrical, modificationElectrical] = values(resultsRow('Electrical Heat Delivered'));

        expect(baselineFlueGas).toBeGreaterThan(0);
        expect(modificationFlueGas).toBeNull();
        expect(baselineElectrical).toBeNull();
        expect(modificationElectrical).toBeGreaterThan(0);
      });
    });
  }
});
