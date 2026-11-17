import { IntegratedAssessment } from '../shared/assessment-integration/assessment-integration.service';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { Assessment } from '../shared/models/assessment';
import { EAFResults, ExecutiveSummary, PHAST, PhastCo2EmissionsOutput, PhastResults } from '../shared/models/phast/phast';
import { Settings } from '../shared/models/settings';
import { ExecutiveSummaryService } from './phast-report/executive-summary.service';
import { PhastIntegrationService } from './phast-integration.service';
import { PhastResultsService } from './phast-results.service';

describe('PhastIntegrationService', () => {
  const settings = { energySourceType: 'Electricity', furnaceType: 'Electric Arc Furnace (EAF)', energyResultUnit: 'kWh', unitsOfMeasure: 'Imperial' } as Settings;
  const treasureHuntSettings = { energyResultUnit: 'kWh', unitsOfMeasure: 'Imperial' } as Settings;

  let service: PhastIntegrationService;
  let resultsByPhast: Map<PHAST, Partial<PhastResults>>;

  function buildResults(grossHeatInput: number): Partial<PhastResults> {
    return {
      grossHeatInput,
      hourlyEAFResults: { electricEnergyUsed: 0, coalCarbonUsed: 0, electrodeEnergyUsed: 0, otherFuelUsed: 0 } as EAFResults,
      co2EmissionsOutput: {} as PhastCo2EmissionsOutput,
    };
  }

  beforeEach(() => {
    resultsByPhast = new Map();
    const phastResultsService = jasmine.createSpyObj<PhastResultsService>('PhastResultsService', ['getResults', 'getEnergyUseReportData']);
    phastResultsService.getResults.and.callFake(phast => resultsByPhast.get(phast) as PhastResults);
    // Resolves on a later task, so energy options are only complete if every modification's results are awaited
    phastResultsService.getEnergyUseReportData.and.callFake(() => new Promise(resolve => setTimeout(() => resolve({}))) as never);
    const executiveSummaryService = jasmine.createSpyObj<ExecutiveSummaryService>('ExecutiveSummaryService', ['getSummary']);
    executiveSummaryService.getSummary.and.returnValue({ annualCost: 0, co2EmissionsOutput: {} } as ExecutiveSummary);
    service = new PhastIntegrationService(executiveSummaryService, jasmine.createSpyObj<ConvertUnitsService>('ConvertUnitsService', ['convertValue']), phastResultsService);
  });

  it('annualizes EAF gross heat input by each scenario\'s own operating hours', async () => {
    const modificationPhast = { name: 'Fewer hours', operatingHours: { hoursPerYear: 4000 } } as PHAST;
    const phast = {
      name: 'Baseline',
      operatingHours: { hoursPerYear: 8000 },
      modifications: [{ id: 'mod-1', phast: modificationPhast }],
    } as PHAST;
    resultsByPhast.set(phast, buildResults(10));
    resultsByPhast.set(modificationPhast, buildResults(8));
    const integratedAssessment = { assessment: { phast } as Assessment } as IntegratedAssessment;

    await service.setIntegratedAssessmentData(integratedAssessment, settings, treasureHuntSettings);

    expect(integratedAssessment.energyOptions.baseline.annualEnergy).toBe(10 * 8000);
    expect(integratedAssessment.energyOptions.modifications[0].annualEnergy).toBe(8 * 4000);
  });
});
