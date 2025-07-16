import { TestBed } from '@angular/core/testing';
import { ProcessCoolingSuiteApiService } from './process-cooling-suite-api.service';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ProcessCoolingAssessment } from '../shared/models/process-cooling-assessment';
import {
  EXAMPLE_AIR_COOLED_SYSTEM_INPUT,
  EXAMPLE_WATER_COOLED_SYSTEM_INPUT,
  EXAMPLE_PUMP_INPUT,
  EXAMPLE_TOWER_INPUT,
  EXAMPLE_CHILLER_INVENTORY_ITEM,
  EXAMPLE_SYSTEM_BASICS,
  EXAMPLE_SYSTEM_INFORMATION_OPERATIONS,
  EXAMPLE_INVENTORY
} from '../examples/exampleProcessCoolingConstants';

// Mock WASM Module
declare var window: any;
window.Module = {
  ChillerInput: function() {
    return {
      delete: () => {}
    };
  },
  ChillerInputV: function() {
    return {
      push: () => {},
      push_back: () => {},
      delete: () => {}
    };
  },
  AirCooledSystemInput: function() { return { delete: () => {} }; },
  WaterCooledSystemInput: function() { return { delete: () => {} }; },
  PumpInput: function() { return { delete: () => {} }; },
  TowerInput: function() { return { delete: () => {} }; },
  ProcessCooling: function() {
    return {
      calculateChillerEnergy: () => ({
        efficiency: { size: () => 1, get: () => ({ size: () => 2, get: (i: number) => [0.5, 0.6][i], delete: () => {} }) },
        hours: { size: () => 1, get: () => ({ size: () => 2, get: (i: number) => [100, 200][i], delete: () => {} }) },
        power: { size: () => 1, get: () => ({ size: () => 2, get: (i: number) => [50, 60][i], delete: () => {} }) },
        energy: { size: () => 1, get: () => ({ size: () => 2, get: (i: number) => [5000, 6000][i], delete: () => {} }) },
        delete: () => {}
      }),
      calculatePumpEnergy: () => ({
        chillerPumpingEnergy: { size: () => 2, get: (i: number) => [1000, 2000][i], delete: () => {} },
        delete: () => {}
      }),
      calculateTowerEnergy: () => ({
        hours: { size: () => 2, get: (i: number) => [300, 400][i], delete: () => {} },
        energy: { size: () => 2, get: (i: number) => [7000, 8000][i], delete: () => {} },
        delete: () => {}
      }),
      delete: () => {}
    };
  }
};

// Mock SuiteApiHelperService
class MockSuiteApiHelperService {
  getProcessCoolingFanMotorSpeedTypeEnum(val: any) { return val; }
  getProcessCoolingTowerSizedByEnum(val: any) { return val; }
  getProcessCoolingFanTypeEnum(val: any) { return val; }
  getProcessCoolingChillerCompressorTypeEnum(val: any) { return val; }
}

describe('ProcessCoolingSuiteApiService', () => {
  let service: ProcessCoolingSuiteApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProcessCoolingSuiteApiService,
        { provide: SuiteApiHelperService, useClass: MockSuiteApiHelperService }
      ]
    });
    service = TestBed.inject(ProcessCoolingSuiteApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate air-cooled chiller energy', () => {
    const assessment: ProcessCoolingAssessment = {
      ...(<any>{}),
      name: 'Test',
      setupDone: true,
      selectedModificationId: '',
      existingDataUnits: 'IP',
      selected: true,
      systemBasics: { ...EXAMPLE_SYSTEM_BASICS },
      systemInformation: {
        operations: { ...EXAMPLE_SYSTEM_INFORMATION_OPERATIONS },
        airCooledSystemInput: { ...EXAMPLE_AIR_COOLED_SYSTEM_INPUT },
        waterCooledSystemInput: null,
        pumpInput: null,
        towerInput: null
      },
      inventory: [ ...EXAMPLE_INVENTORY ],
      modifications: [],
    };
    const result = service.runAirCooledChillerEnergy(assessment);
    expect(result.length).toBe(1);
    expect(result[0].efficiency).toEqual([0.5, 0.6]);
    expect(result[0].hours).toEqual([100, 200]);
    expect(result[0].power).toEqual([50, 60]);
    expect(result[0].energy).toEqual([5000, 6000]);
  });

  it('should calculate water-cooled chiller energy', () => {
    const assessment: ProcessCoolingAssessment = {
      ...(<any>{}),
      name: 'Test',
      setupDone: true,
      selectedModificationId: '',
      existingDataUnits: 'IP',
      selected: true,
      systemBasics: { ...EXAMPLE_SYSTEM_BASICS, condenserCoolingMethod: 'water' },
      systemInformation: {
        operations: { ...EXAMPLE_SYSTEM_INFORMATION_OPERATIONS, condenserCoolingMethod: 1 },
        airCooledSystemInput: null,
        waterCooledSystemInput: { ...EXAMPLE_WATER_COOLED_SYSTEM_INPUT },
        pumpInput: null,
        towerInput: { ...EXAMPLE_TOWER_INPUT }
      },
      inventory: [ ...EXAMPLE_INVENTORY ],
      modifications: [],
    };
    const result = service.runWaterCooledChillerEnergy(assessment);
    expect(result.length).toBe(1);
    expect(result[0].efficiency).toEqual([0.5, 0.6]);
    expect(result[0].hours).toEqual([100, 200]);
    expect(result[0].power).toEqual([50, 60]);
    expect(result[0].energy).toEqual([5000, 6000]);
  });

  it('should calculate pump energy', () => {
    const assessment: ProcessCoolingAssessment = {
      ...(<any>{}),
      name: 'Test',
      setupDone: true,
      selectedModificationId: '',
      existingDataUnits: 'IP',
      selected: true,
      systemBasics: { ...EXAMPLE_SYSTEM_BASICS },
      systemInformation: {
        operations: { ...EXAMPLE_SYSTEM_INFORMATION_OPERATIONS },
        airCooledSystemInput: { ...EXAMPLE_AIR_COOLED_SYSTEM_INPUT },
        waterCooledSystemInput: null,
        pumpInput: { ...EXAMPLE_PUMP_INPUT },
        towerInput: null
      },
      inventory: [ ...EXAMPLE_INVENTORY ],
      modifications: [],
    };
    const result = service.runPumpEnergy(assessment);
    expect(result.chillerPumpingEnergy).toEqual([1000, 2000]);
  });

  it('should calculate tower energy', () => {
    const assessment: ProcessCoolingAssessment = {
      ...(<any>{}),
      name: 'Test',
      setupDone: true,
      selectedModificationId: '',
      existingDataUnits: 'IP',
      selected: true,
      systemBasics: { ...EXAMPLE_SYSTEM_BASICS, condenserCoolingMethod: 'water' },
      systemInformation: {
        operations: { ...EXAMPLE_SYSTEM_INFORMATION_OPERATIONS, condenserCoolingMethod: 1 },
        airCooledSystemInput: null,
        waterCooledSystemInput: { ...EXAMPLE_WATER_COOLED_SYSTEM_INPUT },
        pumpInput: null,
        towerInput: { ...EXAMPLE_TOWER_INPUT }
      },
      inventory: [ ...EXAMPLE_INVENTORY ],
      modifications: [],
    };
    const result = service.runTowerEnergy(assessment);
    expect(result.hours).toEqual([300, 400]);
    expect(result.energy).toEqual([7000, 8000]);
  });
});
