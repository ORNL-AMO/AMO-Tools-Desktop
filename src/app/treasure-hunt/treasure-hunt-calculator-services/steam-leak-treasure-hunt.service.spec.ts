import { SteamLeakTreasureHuntService } from './steam-leak-treasure-hunt.service';
import { SteamLeakSurveyService } from '../../calculator/steam/steam-leak/steam-leak-survey-service';
import { SteamLeakUtilityType } from '../../calculator/steam/steam-leak/steam-leak-constants';
import { Settings } from '../../shared/models/settings';
import { SteamLeakSurveyTreasureHunt } from '../../shared/models/treasure-hunt';
import { SteamLeakSurveyInput } from '../../shared/models/standalone';

describe('SteamLeakTreasureHuntService', () => {
  const settings = { unitsOfMeasure: 'Imperial' } as Settings;

  function buildSurvey(utilityType: SteamLeakUtilityType): SteamLeakSurveyTreasureHunt {
    const input: SteamLeakSurveyInput = {
      steamLeakSurveyInputVec: [],
      facilitySteamLeakData: {
        annualOperatingHours: 8760,
        utilityType,
        steamCost: 5,
        steamTemperature: 500,
        steamPressure: 300,
        feedwaterTemperature: 70,
        fuelCost: 15.5,
        fuelEnergyFactor: 1.038,
        electricityCost: 0.1,
        boilerEfficiency: 80,
        systemEfficiency: 75,
      }
    };
    return { steamLeakSurveyInput: input, selected: true } as any;
  }

  function buildService(leakCost: number, energyLoss: number, steamLoss: number): SteamLeakTreasureHuntService {
    const steamLeakServiceSpy = jasmine.createSpyObj<SteamLeakSurveyService>('SteamLeakSurveyService', ['getResults']);
    steamLeakServiceSpy.getResults.and.returnValue({
      individualLeaks: [],
      baselineTotal: { leakRate: 0, steamLoss: 0, energyLoss: 0, leakCost: 0 },
      modificationTotal: { leakRate: 0, steamLoss: 0, energyLoss: 0, leakCost: 0 },
      savings: { leakRate: 0, steamLoss, energyLoss, leakCost },
    } as any);
    return new SteamLeakTreasureHuntService(steamLeakServiceSpy, {} as any);
  }

  // ─── getTreasureHuntOpportunityResults ────────────────────────────────────────

  it('maps Steam utility type to "Steam" and uses steamLoss for energySavings', () => {
    const service = buildService(500, 100, 80);
    const results = service.getTreasureHuntOpportunityResults(buildSurvey(SteamLeakUtilityType.Steam), settings);

    expect(results.utilityType).toBe('Steam');
    expect(results.costSavings).toBe(500);
    expect(results.energySavings).toBe(80);
    expect(results.baselineCost).toBe(500);
    expect(results.modificationCost).toBe(0);
  });

  it('maps Electric utility type to "Electricity" and uses energyLoss for energySavings', () => {
    const service = buildService(200, 1500, 0);
    const results = service.getTreasureHuntOpportunityResults(buildSurvey(SteamLeakUtilityType.Electric), settings);

    expect(results.utilityType).toBe('Electricity');
    expect(results.costSavings).toBe(200);
    expect(results.energySavings).toBe(1500);
  });

  it('maps NaturalGas utility type to "Natural Gas" and uses energyLoss for energySavings', () => {
    const service = buildService(300, 2000, 0);
    const results = service.getTreasureHuntOpportunityResults(buildSurvey(SteamLeakUtilityType.NaturalGas), settings);

    expect(results.utilityType).toBe('Natural Gas');
    expect(results.costSavings).toBe(300);
    expect(results.energySavings).toBe(2000);
  });

  it('maps OtherFuel utility type to "Other Fuel" and uses energyLoss for energySavings', () => {
    const service = buildService(400, 50, 70);
    const results = service.getTreasureHuntOpportunityResults(buildSurvey(SteamLeakUtilityType.OtherFuel), settings);

    expect(results.utilityType).toBe('Other Fuel');
    expect(results.energySavings).toBe(50);
  });

  // ─── getSteamLeakSurveyCardData ───────────────────────────────────────────────

  it('selects electricityCosts and "kWh" unit string for Electric utility', () => {
    const service = buildService(200, 1500, 0);
    const opportunitySummary = {
      costSavings: 200,
      totalCost: 500,
      payback: 2.5,
      totalEnergySavings: 1500,
      utilityType: 'Electricity',
      baselineCost: 200,
      modificationCost: 0,
      opportunityName: 'Steam Leak Survey',
    } as any;
    const currentEnergyUsage = { electricityCosts: 10000, naturalGasCosts: 5000, steamCosts: 3000 } as any;

    const card = service.getSteamLeakSurveyCardData(
      buildSurvey(SteamLeakUtilityType.Electric),
      opportunitySummary,
      settings,
      0,
      currentEnergyUsage
    );

    expect(card.annualEnergySavings[0].energyUnit).toBe('kWh');
    expect(card.percentSavings[0].percent).toBeCloseTo(200 / 10000 * 100, 4);
    expect(card.opportunityType).toBe('steam-leak-survey');
  });

  it('selects naturalGasCosts and "MMBtu" unit string for NaturalGas utility in Imperial', () => {
    const service = buildService(300, 2000, 0);
    const opportunitySummary = {
      costSavings: 300,
      totalCost: 1000,
      payback: 3.3,
      totalEnergySavings: 2000,
      utilityType: 'Natural Gas',
      baselineCost: 300,
      modificationCost: 0,
      opportunityName: 'Steam Leak Survey',
    } as any;
    const currentEnergyUsage = { electricityCosts: 10000, naturalGasCosts: 5000, steamCosts: 3000 } as any;

    const card = service.getSteamLeakSurveyCardData(
      buildSurvey(SteamLeakUtilityType.NaturalGas),
      opportunitySummary,
      settings,
      0,
      currentEnergyUsage
    );

    expect(card.annualEnergySavings[0].energyUnit).toBe('MMBtu');
    expect(card.percentSavings[0].percent).toBeCloseTo(300 / 5000 * 100, 4);
  });

  it('selects steamCosts and "lb" unit string for Steam utility in Imperial', () => {
    const service = buildService(500, 0, 80);
    const opportunitySummary = {
      costSavings: 500,
      totalCost: 1500,
      payback: 3,
      totalEnergySavings: 80,
      utilityType: 'Steam',
      baselineCost: 500,
      modificationCost: 0,
      opportunityName: 'Steam Leak Survey',
    } as any;
    const currentEnergyUsage = { electricityCosts: 10000, naturalGasCosts: 5000, steamCosts: 3000 } as any;

    const card = service.getSteamLeakSurveyCardData(
      buildSurvey(SteamLeakUtilityType.Steam),
      opportunitySummary,
      settings,
      0,
      currentEnergyUsage
    );

    expect(card.annualEnergySavings[0].energyUnit).toBe('lb');
    expect(card.percentSavings[0].percent).toBeCloseTo(500 / 3000 * 100, 4);
  });

  it('selects naturalGasCosts and "MMBtu" unit string for OtherFuel utility in Imperial', () => {
    const service = buildService(400, 2500, 0);
    const opportunitySummary = {
      costSavings: 400,
      totalCost: 1200,
      payback: 3,
      totalEnergySavings: 2500,
      utilityType: 'Other Fuel',
      baselineCost: 400,
      modificationCost: 0,
      opportunityName: 'Steam Leak Survey',
    } as any;
    const currentEnergyUsage = { electricityCosts: 10000, naturalGasCosts: 5000, steamCosts: 3000 } as any;

    const card = service.getSteamLeakSurveyCardData(
      buildSurvey(SteamLeakUtilityType.OtherFuel),
      opportunitySummary,
      settings,
      0,
      currentEnergyUsage
    );

    expect(card.annualEnergySavings[0].energyUnit).toBe('MMBtu');
    expect(card.percentSavings[0].percent).toBeCloseTo(400 / 5000 * 100, 4);
  });

  it('uses "GJ" and "kg" unit strings for NaturalGas/OtherFuel and Steam utility in Metric', () => {
    const metricSettings = { unitsOfMeasure: 'Metric' } as Settings;
    const opportunitySummary = {
      costSavings: 100,
      totalCost: 200,
      payback: 2,
      totalEnergySavings: 500,
      utilityType: 'Natural Gas',
      baselineCost: 100,
      modificationCost: 0,
      opportunityName: 'Steam Leak Survey',
    } as any;
    const currentEnergyUsage = { electricityCosts: 10000, naturalGasCosts: 5000, steamCosts: 3000 } as any;

    const service = buildService(100, 500, 0);

    const ngCard = service.getSteamLeakSurveyCardData(
      buildSurvey(SteamLeakUtilityType.NaturalGas), opportunitySummary, metricSettings, 0, currentEnergyUsage
    );
    expect(ngCard.annualEnergySavings[0].energyUnit).toBe('GJ');

    const otherFuelOpportunity = { ...opportunitySummary, utilityType: 'Other Fuel' } as any;
    const otherFuelCard = service.getSteamLeakSurveyCardData(
      buildSurvey(SteamLeakUtilityType.OtherFuel), otherFuelOpportunity, metricSettings, 0, currentEnergyUsage
    );
    expect(otherFuelCard.annualEnergySavings[0].energyUnit).toBe('GJ');

    const steamOpportunity = { ...opportunitySummary, utilityType: 'Steam' } as any;
    const steamCard = service.getSteamLeakSurveyCardData(
      buildSurvey(SteamLeakUtilityType.Steam), steamOpportunity, metricSettings, 0, currentEnergyUsage
    );
    expect(steamCard.annualEnergySavings[0].energyUnit).toBe('kg');
  });

  // ─── State management helpers ─────────────────────────────────────────────────

  it('saveTreasureHuntOpportunity appends the survey to the treasure hunt list', () => {
    const steamLeakServiceSpy = jasmine.createSpyObj<SteamLeakSurveyService>('SteamLeakSurveyService', ['getResults']);
    const service = new SteamLeakTreasureHuntService(steamLeakServiceSpy, {} as any);
    const treasureHunt = { steamLeakSurveys: [] } as any;
    const survey = buildSurvey(SteamLeakUtilityType.Electric);

    service.saveTreasureHuntOpportunity(survey, treasureHunt);

    expect(treasureHunt.steamLeakSurveys.length).toBe(1);
    expect(treasureHunt.steamLeakSurveys[0]).toBe(survey);
  });

  it('deleteOpportunity removes the correct survey by index', () => {
    const steamLeakServiceSpy = jasmine.createSpyObj<SteamLeakSurveyService>('SteamLeakSurveyService', ['getResults']);
    const service = new SteamLeakTreasureHuntService(steamLeakServiceSpy, {} as any);
    const surveyA = buildSurvey(SteamLeakUtilityType.Electric);
    const surveyB = buildSurvey(SteamLeakUtilityType.NaturalGas);
    const treasureHunt = { steamLeakSurveys: [surveyA, surveyB] } as any;

    service.deleteOpportunity(0, treasureHunt);

    expect(treasureHunt.steamLeakSurveys.length).toBe(1);
    expect(treasureHunt.steamLeakSurveys[0]).toBe(surveyB);
  });
});
