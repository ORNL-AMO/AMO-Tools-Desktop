import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { WaterReductionTreasureHuntService } from './water-reduction-treasure-hunt.service';
import { WaterReductionService } from '../../calculator/waste-water/water-reduction/water-reduction.service';
import { StandaloneService } from '../../calculator/standalone.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { OpportunitySheetService } from '../calculators/standalone-opportunity-sheet/opportunity-sheet.service';
import { OpportunitySummaryService } from '../treasure-hunt-report/opportunity-summary.service';
import { Settings } from '../../shared/models/settings';
import { WaterReductionCalculatorType, WaterReductionData, WaterReductionInput, WaterReductionResult } from '../../shared/models/standalone';
import { OpportunitySheet, OpportunitySummary, Treasure, WaterReductionTreasureHunt } from '../../shared/models/treasure-hunt';

// Stand-in for the suite: all inputs in gallons, $/gal, gpm (see measur-tools-suite water_reduction.d.ts)
function fakeSuiteWaterReduction(input: WaterReductionInput): WaterReductionResult {
  let waterUse = 0;
  let waterCost = 0;
  for (const data of input.waterReductionInputVec) {
    let use = 0;
    switch (data.measurementMethod) {
      case 0: use = data.meteredFlowMethodData.meterReading * 60 * data.hoursPerYear; break;
      case 1: use = (data.volumeMeterMethodData.finalMeterReading - data.volumeMeterMethodData.initialMeterReading) / data.volumeMeterMethodData.elapsedTime * 60 * data.hoursPerYear; break;
      case 2: use = data.bucketMethodData.bucketVolume / data.bucketMethodData.bucketFillTime * 3600 * data.hoursPerYear; break;
      case 3: use = data.otherMethodData.consumption; break;
    }
    waterUse += use;
    waterCost += use * data.waterCost;
  }
  return { waterUse, waterCost, annualWaterSavings: 0, costSavings: 0 };
}

function equipment(meterReading: number, calculatorType: WaterReductionCalculatorType, measurementMethod: number = 0): WaterReductionData {
  return {
    name: 'Equipment #1',
    hoursPerYear: 8760,
    waterCost: 0.005,
    measurementMethod: measurementMethod,
    meteredFlowMethodData: { meterReading: meterReading },
    volumeMeterMethodData: { finalMeterReading: 5842, initialMeterReading: 4235, elapsedTime: 15 },
    bucketMethodData: { bucketVolume: 10, bucketFillTime: 20 },
    otherMethodData: { consumption: 15000 },
    calculatorType: calculatorType
  };
}

function opportunity(calculatorType: WaterReductionCalculatorType): WaterReductionTreasureHunt {
  return {
    baseline: [equipment(100, calculatorType)],
    modification: [equipment(50, calculatorType)],
    opportunityType: Treasure.waterReduction,
    opportunitySheet: {
      name: 'Combined reduction',
      opportunityCost: { engineeringServices: 0, material: 600, labor: 400, otherCosts: [] }
    } as OpportunitySheet
  };
}

describe('WaterReductionTreasureHuntService', () => {
  let service: WaterReductionTreasureHuntService;
  let summaryService: OpportunitySummaryService;
  let convertUnitsService: ConvertUnitsService;
  const imperial = { unitsOfMeasure: 'Imperial', waterCost: 0.005, waterWasteCost: 0.01 } as Settings;

  // baseline 100 gpm, modification 50 gpm, 8760 h: 26,280 kgal/yr saved
  const waterSavingsKgal = 50 * 60 * 8760 / 1000;
  const waterCostSavings = waterSavingsKgal * 1000 * 0.005;
  const wastewaterCostSavings = waterSavingsKgal * 1000 * 0.01;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        WaterReductionTreasureHuntService,
        WaterReductionService,
        ConvertUnitsService,
        OpportunitySheetService,
        { provide: StandaloneService, useValue: { waterReduction: fakeSuiteWaterReduction } },
      ]
    });
    service = TestBed.inject(WaterReductionTreasureHuntService);
    convertUnitsService = TestBed.inject(ConvertUnitsService);
    // OpportunitySummaryService injects every treasure hunt calculator; only the two used for water reduction are needed here
    summaryService = Object.assign(Object.create(OpportunitySummaryService.prototype), {
      opportunitySheetService: TestBed.inject(OpportunitySheetService),
      waterReductionTreasureHuntService: service
    }) as OpportunitySummaryService;
  });

  describe('"Both" water/wastewater split', () => {
    it('splits savings into water and wastewater results that sum to the Mixed total', () => {
      const both = opportunity('both');
      const mixed = service.getTreasureHuntOpportunityResults(both, imperial);
      const water = service.getWaterOpportunityResults(both, imperial);
      const wastewater = service.getWastewaterOpportunityResults(both, imperial);

      expect(mixed.utilityType).toBe('Mixed');
      expect(water.utilityType).toBe('Water');
      expect(wastewater.utilityType).toBe('Waste Water');
      expect(water.energySavings).toBeCloseTo(waterSavingsKgal, 6);
      expect(wastewater.energySavings).toBeCloseTo(waterSavingsKgal, 6);
      expect(water.costSavings).toBeCloseTo(waterCostSavings, 6);
      expect(wastewater.costSavings).toBeCloseTo(wastewaterCostSavings, 6);
      expect(mixed.costSavings).toBeCloseTo(water.costSavings + wastewater.costSavings, 6);
      expect(mixed.baselineCost).toBeCloseTo(water.baselineCost + wastewater.baselineCost, 6);
      expect(mixed.modificationCost).toBeCloseTo(water.modificationCost + wastewater.modificationCost, 6);
    });

    it('wastewater falls back to 0.005 $/gal when settings have no wastewater rate', () => {
      const settings = { unitsOfMeasure: 'Imperial', waterCost: 0.005 } as Settings;
      const wastewater = service.getWastewaterOpportunityResults(opportunity('both'), settings);

      expect(wastewater.costSavings).toBeCloseTo(waterSavingsKgal * 1000 * 0.005, 6);
    });

    it('builds a Mixed summary whose utility summaries sum to the total, with a combined payback', () => {
      const summary: OpportunitySummary = summaryService.getIndividualOpportunitySummary(opportunity('both'), imperial);

      expect(summary.utilityType).toBe('Mixed');
      expect(summary.mixedIndividualResults.map(result => result.utilityType)).toEqual(['Water', 'Waste Water']);
      const [water, wastewater] = summary.mixedIndividualResults;
      expect(water.costSavings).toBeCloseTo(waterCostSavings, 6);
      expect(wastewater.costSavings).toBeCloseTo(wastewaterCostSavings, 6);
      expect(summary.costSavings).toBeCloseTo(water.costSavings + wastewater.costSavings, 6);
      expect(summary.totalCost).toBe(1000);
      expect(summary.payback).toBeCloseTo(1000 / (waterCostSavings + wastewaterCostSavings), 9);
    });

    it('does not split single-utility opportunities', () => {
      const summary: OpportunitySummary = summaryService.getIndividualOpportunitySummary(opportunity('water'), imperial);

      expect(summary.utilityType).toBe('Water');
      expect(summary.mixedIndividualResults).toBeUndefined();
    });
  });

  describe('convertWaterReduction', () => {
    const metric = { unitsOfMeasure: 'Metric' } as Settings;

    [0, 1, 2, 3].forEach(method => {
      it(`Imperial to Metric keeps results equal for measurement method ${method}`, () => {
        const imperialData = equipment(100, 'water', method);
        const imperialResults = TestBed.inject(WaterReductionService).calculate([JSON.parse(JSON.stringify(imperialData))], imperial);
        const metricData = service.convertWaterReduction(JSON.parse(JSON.stringify(imperialData)), imperial, metric);
        const metricResults = TestBed.inject(WaterReductionService).calculate([metricData], metric);

        expect(metricResults.waterCost).toBeCloseTo(imperialResults.waterCost, 4);
        // Imperial waterUse is kgal/yr, Metric is m3/yr
        expect(metricResults.waterUse).toBeCloseTo(convertUnitsService.value(imperialResults.waterUse * 1000).from('gal').to('m3'), 4);
      });
    });
  });
});
