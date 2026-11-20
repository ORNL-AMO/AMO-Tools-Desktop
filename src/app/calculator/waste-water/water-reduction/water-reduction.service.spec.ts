import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { WaterReductionService } from './water-reduction.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { StandaloneService } from '../../standalone.service';
import { Settings } from '../../../shared/models/settings';
import { WaterReductionData, WaterReductionInput, WaterReductionResult } from '../../../shared/models/standalone';

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

describe('WaterReductionService Metric unit handling', () => {
  let service: WaterReductionService;
  let convertUnitsService: ConvertUnitsService;
  const imperial = { unitsOfMeasure: 'Imperial' } as Settings;
  const metric = { unitsOfMeasure: 'Metric' } as Settings;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        WaterReductionService,
        ConvertUnitsService,
        { provide: StandaloneService, useValue: { waterReduction: fakeSuiteWaterReduction } },
      ]
    });
    service = TestBed.inject(WaterReductionService);
    convertUnitsService = TestBed.inject(ConvertUnitsService);
  });

  const galToL = (v: number) => convertUnitsService.value(v).from('gal').to('L');
  const galToM3 = (v: number) => convertUnitsService.value(v).from('gal').to('m3');

  function imperialData(measurementMethod: number): WaterReductionData {
    return {
      name: 'Equipment #1',
      hoursPerYear: 8760,
      waterCost: 0.005,
      measurementMethod: measurementMethod,
      meteredFlowMethodData: { meterReading: 100 },
      volumeMeterMethodData: { finalMeterReading: 5842, initialMeterReading: 4235, elapsedTime: 15 },
      bucketMethodData: { bucketVolume: 10, bucketFillTime: 20 },
      otherMethodData: { consumption: 15000 },
      calculatorType: 'water'
    };
  }

  // same scenario entered in the units the Metric form shows: $/L, L/min, L, m3/yr
  function metricData(measurementMethod: number): WaterReductionData {
    const data = imperialData(measurementMethod);
    data.waterCost = 0.005 / galToL(1);
    data.meteredFlowMethodData.meterReading = galToL(100);
    data.volumeMeterMethodData.finalMeterReading = galToL(5842);
    data.volumeMeterMethodData.initialMeterReading = galToL(4235);
    data.bucketMethodData.bucketVolume = galToL(10);
    data.otherMethodData.consumption = galToM3(15000);
    return data;
  }

  [0, 1, 2, 3].forEach(method => {
    it(`Metric matches Imperial for measurement method ${method}`, () => {
      const imperialResults = service.calculate([imperialData(method)], imperial);
      const metricResults = service.calculate([metricData(method)], metric);

      expect(metricResults.waterCost).toBeCloseTo(imperialResults.waterCost, 6);
      // Imperial waterUse is kgal/yr, Metric is m3/yr
      expect(metricResults.waterUse).toBeCloseTo(galToM3(imperialResults.waterUse * 1000), 6);
    });
  });

  it('"Both" water and wastewater costs agree in Metric when unit costs are equal', () => {
    const settings = { unitsOfMeasure: 'Metric', waterCost: 0.002, waterWasteCost: 0.002 } as Settings;
    const data = metricData(3);
    data.waterCost = 0.002;
    data.calculatorType = 'both';
    const results = service.getResults(settings, [data]);

    expect(results.baselineResults.wastewaterCost).toBeCloseTo(results.baselineResults.waterCost, 6);
  });

  it('Metric default cost uses the $/L value from settings as-is', () => {
    const settings = { unitsOfMeasure: 'Metric', waterCost: 0.0015, waterWasteCost: 0.004 } as Settings;

    expect(service.initObject(0, settings, 'water', undefined).waterCost).toBe(0.0015);
    expect(service.initObject(0, settings, 'wastewater', undefined).waterCost).toBe(0.004);
    expect(service.getDefaultWaterCostForForm(settings, 'wastewater')).toBe(0.004);
  });

  it('Metric default cost without settings converts 0.005 $/gal to $/L', () => {
    const settings = { unitsOfMeasure: 'Metric' } as Settings;

    expect(service.initObject(0, settings, 'water', undefined).waterCost).toBeCloseTo(0.005 / galToL(1), 6);
  });

  it('Metric default volume inputs are in liters', () => {
    const data = service.initObject(0, metric, 'water', undefined);

    expect(data.bucketMethodData.bucketVolume).toBeCloseTo(galToL(10), 3);
    expect(data.meteredFlowMethodData.meterReading).toBeCloseTo(galToL(100), 3);
    expect(data.otherMethodData.consumption).toBeCloseTo(galToM3(15000), 3);
  });
});
