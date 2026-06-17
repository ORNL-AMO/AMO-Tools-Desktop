import { SteamLeakTreasureHuntService } from './steam-leak-treasure-hunt.service';
import { Settings } from '../../shared/models/settings';

describe('SteamLeakTreasureHuntService', () => {
  const mockResults = {
    individualLeaks: [],
    baselineTotal: { leakRate: 0, steamLoss: 0, energyLoss: 0, leakCost: 0 },
    modificationTotal: { leakRate: 0, steamLoss: 0, energyLoss: 0, leakCost: 0 },
    savings: { leakRate: 10, steamLoss: 500, energyLoss: 1000, leakCost: 200 },
  };

  function makeService() {
    const steamLeakSurveyService = jasmine.createSpyObj('SteamLeakSurveyService', ['getResults']);
    steamLeakSurveyService.getResults.and.returnValue(mockResults);
    return new SteamLeakTreasureHuntService(steamLeakSurveyService, {} as any);
  }

  function makeInput(utilityType: number) {
    return {
      steamLeakSurveyInput: {
        steamLeakSurveyInputVec: [],
        facilitySteamLeakData: {
          annualOperatingHours: 8760,
          utilityType,
          steamCost: 0,
          steamTemperature: 500,
          steamPressure: 300,
          feedwaterTemperature: 70,
          fuelCost: 15.5,
          fuelEnergyFactor: 1.038,
          electricityCost: 0.1,
          boilerEfficiency: 80,
          systemEfficiency: 75,
        }
      }
    } as any;
  }

  const imperialSettings = { unitsOfMeasure: 'Imperial' } as Settings;

  it('Steam utility (0): maps costSavings and baselineCost from leakCost, energySavings from steamLoss', () => {
    const results = makeService().getTreasureHuntOpportunityResults(makeInput(0), imperialSettings);

    expect(results.utilityType).toBe('Steam');
    expect(results.costSavings).toBe(200);
    expect(results.energySavings).toBe(500);
    expect(results.baselineCost).toBe(200);
    expect(results.modificationCost).toBe(0);
  });

  it('Electricity utility (1): maps energySavings from energyLoss and sets utilityType to Electricity', () => {
    const results = makeService().getTreasureHuntOpportunityResults(makeInput(1), imperialSettings);

    expect(results.utilityType).toBe('Electricity');
    expect(results.costSavings).toBe(200);
    expect(results.energySavings).toBe(1000);
    expect(results.baselineCost).toBe(200);
    expect(results.modificationCost).toBe(0);
  });

  it('Natural Gas utility (2): maps energySavings from energyLoss and sets utilityType to Natural Gas', () => {
    const results = makeService().getTreasureHuntOpportunityResults(makeInput(2), imperialSettings);

    expect(results.utilityType).toBe('Natural Gas');
    expect(results.costSavings).toBe(200);
    expect(results.energySavings).toBe(1000);
    expect(results.baselineCost).toBe(200);
    expect(results.modificationCost).toBe(0);
  });

  it('Other Fuel utility (3): falls through to Steam branch — energySavings from steamLoss', () => {
    const results = makeService().getTreasureHuntOpportunityResults(makeInput(3), imperialSettings);

    expect(results.utilityType).toBe('Steam');
    expect(results.energySavings).toBe(500);
    expect(results.costSavings).toBe(200);
    expect(results.modificationCost).toBe(0);
  });
});
