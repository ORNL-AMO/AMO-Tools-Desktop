import { AirLeakTreasureHuntService } from './air-leak-treasure-hunt.service';
import { Settings } from '../../shared/models/settings';

describe('AirLeakTreasureHuntService', () => {
  it('keeps treasure-hunt integration results mapped from air-leak survey output', () => {
    const airLeakService = jasmine.createSpyObj('AirLeakService', ['getResults']);
    airLeakService.getResults.and.returnValue({
      individualLeaks: [],
      baselineTotal: { totalFlowRate: 20, annualTotalFlowRate: 200, annualTotalElectricity: 2000, annualTotalElectricityCost: 200 },
      modificationTotal: { totalFlowRate: 5, annualTotalFlowRate: 50, annualTotalElectricity: 500, annualTotalElectricityCost: 50 },
      savings: { totalFlowRate: 15, annualTotalFlowRate: 150, annualTotalElectricity: 1500, annualTotalElectricityCost: 150 }
    });
    const service = new AirLeakTreasureHuntService(airLeakService, {} as any);

    const results = service.getTreasureHuntOpportunityResults({
      airLeakSurveyInput: {
        compressedAirLeakSurveyInputVec: [],
        facilityCompressorData: {
          hoursPerYear: 8760,
          utilityType: 0,
          utilityCost: 0.2,
          compressorElectricityData: {
            compressorControl: 8,
            compressorControlAdjustment: 25,
            compressorSpecificPowerControl: 0,
            compressorSpecificPower: 16
          }
        }
      }
    } as any, { unitsOfMeasure: 'Imperial' } as Settings);

    expect(results.utilityType).toBe('Compressed Air');
    expect(results.costSavings).toBe(150);
    expect(results.energySavings).toBe(150);
    expect(results.baselineCost).toBe(150);
    expect(results.modificationCost).toBe(0);
  });
});
