import { TestBed } from '@angular/core/testing';
import { ConvertProcessCoolingService } from './convert-process-cooling.service';
import { ProcessCoolingSuiteApiService } from '../../tools-suite-api/process-cooling-suite-api.service';
import { Settings } from '../../shared/models/settings';
import { getDefaultProcessCoolingAssessment } from '../constants/process-cooling-constants';
import { CondenserCoolingMethod, Modification, ProcessCoolingAssessment, ProcessCoolingResults, TowerSizeMetric } from '../../shared/models/process-cooling-assessment';
import { copyObject } from '../../shared/helperFunctions';
import { convertChillerEfficiency, convertFlowRatePerTon } from '../constants/process-cooling-units';

const IMPERIAL = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC = { unitsOfMeasure: 'Metric' } as Settings;

function getImperialAssessment(): ProcessCoolingAssessment {
  const processCooling = getDefaultProcessCoolingAssessment({ ...IMPERIAL, fuelCost: 10 } as Settings);
  processCooling.systemInformation.operations.chilledWaterSupplyTemp = 44;
  processCooling.systemInformation.waterCooledSystemInput.condenserWaterTemp = 72;
  processCooling.systemInformation.waterCooledSystemInput.followingTempDifferential = 10;
  processCooling.systemInformation.towerInput.HEXApproachTemp = 5;
  processCooling.systemInformation.towerInput.towerSizeMetric = TowerSizeMetric.Tons;
  processCooling.systemInformation.towerInput.towerSize = 500;
  processCooling.systemInformation.chilledWaterPumpInput.flowRate = 3;
  processCooling.systemInformation.chilledWaterPumpInput.motorSize = 50;
  processCooling.inventory[0].capacity = 100;
  processCooling.inventory[0].fullLoadEfficiency = 0.78;
  processCooling.inventory[0].kWPerTonAtLoad = [0.5, 0.6, 0.7, 0.78];
  processCooling.weatherData = {
    addressString: '',
    selectedStation: null,
    weatherDataPoints: [{ dry_bulb_temp: 212, wet_bulb_temp: 32 } as any],
  };
  processCooling.modifications = [{
    increaseChilledWaterTemp: { chilledWaterSupplyTemp: 50 },
    decreaseCondenserWaterTemp: { condenserWaterTemp: 70 },
    useSlidingCondenserWaterTemp: { followingTempDifferential: 9 },
    useFreeCooling: { HEXApproachTemp: 18 },
    replaceChillers: { newChiller: { capacity: 200, fullLoadEfficiency: 0.5, kWPerTonAtLoad: [] } },
  } as Modification];
  return processCooling;
}

describe('ConvertProcessCoolingService', () => {
  let service: ConvertProcessCoolingService;
  let suiteCalls: Array<{ method: string, input: ProcessCoolingAssessment, weatherData: any }>;

  beforeEach(() => {
    suiteCalls = [];
    const getSuiteResult = (method: string) => (input: ProcessCoolingAssessment, weatherData: any): ProcessCoolingResults => {
      suiteCalls.push({ method, input, weatherData });
      return { fuelCost: 99, chiller: [{ efficiency: [0.78] } as any] } as ProcessCoolingResults;
    };
    TestBed.configureTestingModule({
      providers: [
        ConvertProcessCoolingService,
        {
          provide: ProcessCoolingSuiteApiService, useValue: {
            getWaterCooledResults: getSuiteResult('water'),
            getAirCooledResults: getSuiteResult('air'),
          }
        },
      ]
    });
    service = TestBed.inject(ConvertProcessCoolingService);
  });

  describe('unit helpers', () => {
    it('converts kW/ton to kW/kW', () => {
      expect(convertChillerEfficiency(0.78, true)).toBeCloseTo(0.2218, 4);
      expect(convertChillerEfficiency(convertChillerEfficiency(0.78, true), false)).toBeCloseTo(0.78, 10);
    });

    it('converts gpm/ton to L/s/kW', () => {
      expect(convertFlowRatePerTon(3, true)).toBeCloseTo(0.05382, 5);
      expect(convertFlowRatePerTon(convertFlowRatePerTon(3, true), false)).toBeCloseTo(3, 10);
    });
  });

  describe('convertProcessCooling', () => {
    it('converts Imperial to Metric', () => {
      const metric = service.convertProcessCooling(getImperialAssessment(), IMPERIAL, METRIC);
      const systemInformation = metric.systemInformation;

      expect(systemInformation.operations.chilledWaterSupplyTemp).toBe(6.67);
      expect(systemInformation.waterCooledSystemInput.condenserWaterTemp).toBe(22.22);
      // * temperature differences are scaled without the 32F offset
      expect(systemInformation.waterCooledSystemInput.followingTempDifferential).toBe(5.56);
      expect(systemInformation.towerInput.HEXApproachTemp).toBe(2.78);
      expect(systemInformation.towerInput.towerSize).toBe(1758.43);
      expect(systemInformation.chilledWaterPumpInput.flowRate).toBe(0.0538);
      expect(systemInformation.chilledWaterPumpInput.motorSize).toBe(37.28);
      expect(metric.inventory[0].capacity).toBe(351.69);
      expect(metric.inventory[0].fullLoadEfficiency).toBe(0.2218);
      expect(metric.inventory[0].kWPerTonAtLoad[3]).toBe(0.2218);
      // * weather data is converted on settings change by convertWeatherData, not with the assessment data
      expect(metric.weatherData.weatherDataPoints[0].dry_bulb_temp).toBe(212);

      const modification = metric.modifications[0];
      expect(modification.increaseChilledWaterTemp.chilledWaterSupplyTemp).toBe(10);
      expect(modification.decreaseCondenserWaterTemp.condenserWaterTemp).toBe(21.11);
      expect(modification.useSlidingCondenserWaterTemp.followingTempDifferential).toBe(5);
      expect(modification.useFreeCooling.HEXApproachTemp).toBe(10);
      expect(modification.replaceChillers.newChiller.capacity).toBe(703.37);
    });

    it('converts tower size in hp to kW', () => {
      const processCooling = getImperialAssessment();
      processCooling.systemInformation.towerInput.towerSizeMetric = TowerSizeMetric.HP;
      processCooling.systemInformation.towerInput.towerSize = 50;
      const metric = service.convertProcessCooling(processCooling, IMPERIAL, METRIC);
      expect(metric.systemInformation.towerInput.towerSize).toBe(37.28);
    });

    it('returns to the original Imperial values after a Metric round trip', () => {
      const original = getImperialAssessment();
      const metric = service.convertProcessCooling(copyObject(original), IMPERIAL, METRIC);
      const imperial = service.convertProcessCooling(metric, METRIC, IMPERIAL);

      expect(imperial.systemInformation.operations.chilledWaterSupplyTemp).toBeCloseTo(44, 1);
      expect(imperial.systemInformation.waterCooledSystemInput.followingTempDifferential).toBeCloseTo(10, 1);
      expect(imperial.systemInformation.towerInput.HEXApproachTemp).toBeCloseTo(5, 1);
      expect(imperial.systemInformation.towerInput.towerSize).toBeCloseTo(500, 1);
      expect(imperial.systemInformation.chilledWaterPumpInput.flowRate).toBeCloseTo(3, 2);
      expect(imperial.systemInformation.chilledWaterPumpInput.motorSize).toBeCloseTo(50, 1);
      expect(imperial.systemInformation.operations.fuelCost).toBeCloseTo(10, 2);
      expect(imperial.inventory[0].capacity).toBeCloseTo(100, 1);
      expect(imperial.inventory[0].fullLoadEfficiency).toBeCloseTo(0.78, 3);
    });

    it('does not change values when units are unchanged', () => {
      const original = getImperialAssessment();
      const converted = service.convertProcessCooling(copyObject(original), IMPERIAL, IMPERIAL);
      expect(converted.systemInformation).toEqual(original.systemInformation);
      expect(converted.inventory).toEqual(original.inventory);
    });
  });

  describe('Suite boundary', () => {
    it('getSuiteResults sends Imperial inputs and weather to the Suite and returns Metric results', () => {
      const metric = service.convertProcessCooling(getImperialAssessment(), IMPERIAL, METRIC, false);
      const metricWeather = service.convertWeatherData(metric.weatherData, IMPERIAL, METRIC);

      const results = service.getSuiteResults(metric, metricWeather, METRIC);

      expect(suiteCalls.length).toBe(1);
      expect(suiteCalls[0].method).toBe('water');
      expect(suiteCalls[0].input.inventory[0].capacity).toBeCloseTo(100, 8);
      expect(suiteCalls[0].weatherData.weatherDataPoints[0].dry_bulb_temp).toBeCloseTo(212, 8);
      expect(results.chiller[0].efficiency[0]).toBeCloseTo(0.2218, 4);
      expect(results.fuelCost).toBe(metric.systemInformation.operations.fuelCost);
    });

    it('getSuiteResults uses the air-cooled calculation for air-cooled systems', () => {
      const processCooling = getImperialAssessment();
      processCooling.systemInformation.operations.condenserCoolingMethod = CondenserCoolingMethod.Air;

      service.getSuiteResults(processCooling, processCooling.weatherData, IMPERIAL);

      expect(suiteCalls[0].method).toBe('air');
      expect(suiteCalls[0].input).toBe(processCooling);
    });

    it('convertInputsForSuite returns Imperial values without modifying the Metric input', () => {
      const original = getImperialAssessment();
      const metric = service.convertProcessCooling(copyObject(original), IMPERIAL, METRIC, false);
      const metricSnapshot = copyObject(metric);

      const suiteInput = service.convertInputsForSuite(metric, METRIC);

      expect(metric).toEqual(metricSnapshot);
      expect(suiteInput.systemInformation.operations.chilledWaterSupplyTemp).toBeCloseTo(44, 8);
      expect(suiteInput.systemInformation.waterCooledSystemInput.followingTempDifferential).toBeCloseTo(10, 8);
      expect(suiteInput.systemInformation.towerInput.towerSize).toBeCloseTo(500, 8);
      expect(suiteInput.systemInformation.chilledWaterPumpInput.flowRate).toBeCloseTo(3, 8);
      expect(suiteInput.inventory[0].capacity).toBeCloseTo(100, 8);
      expect(suiteInput.inventory[0].fullLoadEfficiency).toBeCloseTo(0.78, 8);
      expect(suiteInput.inventory[0].kWPerTonAtLoad[0]).toBeCloseTo(0.5, 8);
    });

    it('convertInputsForSuite returns Imperial input as is', () => {
      const original = getImperialAssessment();
      const suiteInput = service.convertInputsForSuite(original, IMPERIAL);
      expect(suiteInput).toBe(original);
    });

    it('convertInputsForSuite shares weather data instead of copying it', () => {
      const original = service.convertProcessCooling(getImperialAssessment(), IMPERIAL, METRIC);
      const suiteInput = service.convertInputsForSuite(original, METRIC);
      expect(suiteInput.weatherData).toBe(original.weatherData);
    });

    it('convertWeatherData converts F to C and back', () => {
      const weatherData = {
        addressString: '',
        selectedStation: null,
        weatherDataPoints: [{ dry_bulb_temp: 212, wet_bulb_temp: 32 } as any],
      };
      const metric = service.convertWeatherData(weatherData, IMPERIAL, METRIC);
      expect(metric.weatherDataPoints[0].dry_bulb_temp).toBeCloseTo(100, 10);
      expect(metric.weatherDataPoints[0].wet_bulb_temp).toBeCloseTo(0, 10);
      const imperial = service.convertWeatherData(metric, METRIC, IMPERIAL);
      expect(imperial.weatherDataPoints[0].dry_bulb_temp).toBeCloseTo(212, 10);
      expect(weatherData.weatherDataPoints[0].dry_bulb_temp).toBe(212);
    });

    it('convertWeatherDataForSuiteApi converts Metric weather to F', () => {
      const weatherData = {
        addressString: '',
        selectedStation: null,
        weatherDataPoints: [{ dry_bulb_temp: 100, wet_bulb_temp: 0 } as any],
      };
      const converted = service.convertWeatherDataForSuiteApi(weatherData, METRIC);
      expect(converted.weatherDataPoints[0].dry_bulb_temp).toBeCloseTo(212, 8);
      expect(converted.weatherDataPoints[0].wet_bulb_temp).toBeCloseTo(32, 8);
      expect(weatherData.weatherDataPoints[0].dry_bulb_temp).toBe(100);
    });

    it('convertProcessCoolingResults converts chiller efficiency for Metric only', () => {
      const getResults = (): ProcessCoolingResults => ({
        id: '1',
        name: 'Baseline',
        fuelCost: 10,
        electricityCost: 0.1,
        chiller: [{
          efficiency: [0.78], ariEfficiencyProfile: [0.78], ariEfficiencyProfileFactored: [0.78],
          power: [100], energy: [1000],
        } as any],
        pump: { chillerPumpingEnergy: [] },
      });

      const metricResults = service.convertProcessCoolingResults(getResults(), METRIC, 9.48);
      expect(metricResults.fuelCost).toBe(9.48);
      expect(metricResults.chiller[0].efficiency[0]).toBeCloseTo(0.2218, 4);
      expect(metricResults.chiller[0].ariEfficiencyProfile[0]).toBeCloseTo(0.2218, 4);
      expect(metricResults.chiller[0].ariEfficiencyProfileFactored[0]).toBeCloseTo(0.2218, 4);
      expect(metricResults.chiller[0].power[0]).toBe(100);
      expect(metricResults.chiller[0].energy[0]).toBe(1000);

      const imperialResults = service.convertProcessCoolingResults(getResults(), IMPERIAL, 10);
      expect(imperialResults.fuelCost).toBe(10);
      expect(imperialResults.chiller[0].efficiency[0]).toBe(0.78);
    });
  });
});
