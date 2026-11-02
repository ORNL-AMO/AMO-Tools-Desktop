import { TestBed } from '@angular/core/testing';
import { ProcessCoolingSuiteApiService } from '../../tools-suite-api/process-cooling-suite-api.service';
import { UpdateDataService } from './update-data.service';
import { ConvertUnitsService } from '../convert-units/convert-units.service';
import { Assessment } from '../models/assessment';
import { Modification, ProcessCoolingAssessment, TowerSizeMetric, TowerType } from '../models/process-cooling-assessment';
import { environment } from '../../../environments/environment';
import { Settings } from '../models/settings';
import { getDefaultProcessCoolingAssessment } from '../../process-cooling-assessment/constants/process-cooling-constants';
import { ConvertProcessCoolingService } from '../../process-cooling-assessment/services/convert-process-cooling.service';
import { convertChillerEfficiency } from '../../process-cooling-assessment/constants/process-cooling-units';

describe('UpdateDataService.updateProcessCooling', () => {
  let service: UpdateDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UpdateDataService, ConvertUnitsService, ConvertProcessCoolingService, { provide: ProcessCoolingSuiteApiService, useValue: {} }]
    });
    service = TestBed.inject(UpdateDataService);
  });

  function buildAssessment(processCooling: Partial<ProcessCoolingAssessment>): Assessment {
    return {
      name: 'test process cooling assessment',
      type: 'ProcessCooling',
      appVersion: '1.7.5',
      processCooling: processCooling as ProcessCoolingAssessment,
    };
  }

  // legacy (pre commit 313d4fa3) fanSpeedType -> corrected fanSpeedType, keyed by towerType
  const LEGACY_TOWER_TYPE_CASES: Array<{ towerType: TowerType, legacyFanSpeedType: number, correctedFanSpeedType: number }> = [
    { towerType: TowerType.OneCellOneSpeed, legacyFanSpeedType: 1, correctedFanSpeedType: 0 },
    { towerType: TowerType.OneCellTwoSpeed, legacyFanSpeedType: 2, correctedFanSpeedType: 1 },
    { towerType: TowerType.TwoCellOneSpeed, legacyFanSpeedType: 1, correctedFanSpeedType: 0 },
    { towerType: TowerType.TwoCellTwoSpeed, legacyFanSpeedType: 2, correctedFanSpeedType: 1 },
    { towerType: TowerType.ThreeCellOneSpeed, legacyFanSpeedType: 1, correctedFanSpeedType: 0 },
    { towerType: TowerType.ThreeCellTwoSpeed, legacyFanSpeedType: 2, correctedFanSpeedType: 1 },
    { towerType: TowerType.VariableSpeed, legacyFanSpeedType: 0, correctedFanSpeedType: 2 },
  ];

  describe('systemInformation.towerInput.fanSpeedType', () => {
    LEGACY_TOWER_TYPE_CASES.forEach(({ towerType, legacyFanSpeedType, correctedFanSpeedType }) => {
      it(`corrects legacy fanSpeedType ${legacyFanSpeedType} to ${correctedFanSpeedType} for towerType ${TowerType[towerType]}`, () => {
        const assessment = buildAssessment({
          systemInformation: {
            towerInput: { towerType, fanSpeedType: legacyFanSpeedType } as any
          } as any
        });

        const updated = service.updateAssessmentVersion(assessment);

        expect(updated.processCooling.systemInformation.towerInput.fanSpeedType).toBe(correctedFanSpeedType);
      });
    });

    it('sets appVersion to the current environment version after migrating', () => {
      const assessment = buildAssessment({
        systemInformation: {
          towerInput: { towerType: TowerType.TwoCellOneSpeed, fanSpeedType: 1 } as any
        } as any
      });

      const updated = service.updateAssessmentVersion(assessment);

      expect(updated.appVersion).toBe(environment.version);
    });

    it('leaves an already-corrected fanSpeedType unchanged', () => {
      const assessment = buildAssessment({
        systemInformation: {
          towerInput: { towerType: TowerType.TwoCellTwoSpeed, fanSpeedType: 1 } as any
        } as any
      });

      const updated = service.updateAssessmentVersion(assessment);

      expect(updated.processCooling.systemInformation.towerInput.fanSpeedType).toBe(1);
    });

    it('does not touch fanSpeedType when towerType is undefined', () => {
      const assessment = buildAssessment({
        systemInformation: {
          towerInput: { towerType: undefined, fanSpeedType: 1 } as any
        } as any
      });

      const updated = service.updateAssessmentVersion(assessment);

      expect(updated.processCooling.systemInformation.towerInput.fanSpeedType).toBe(1);
    });

    it('does not touch fanSpeedType when towerType is null', () => {
      const assessment = buildAssessment({
        systemInformation: {
          towerInput: { towerType: null, fanSpeedType: 1 } as any
        } as any
      });

      const updated = service.updateAssessmentVersion(assessment);

      expect(updated.processCooling.systemInformation.towerInput.fanSpeedType).toBe(1);
    });
  });

  describe('modifications[].upgradeCoolingTowerFans.fanSpeedType', () => {
    it('corrects legacy fanSpeedType on each modification using its own towerType', () => {
      const assessment = buildAssessment({
        systemInformation: {
          towerInput: { towerType: TowerType.OneCellOneSpeed, fanSpeedType: 1 } as any
        } as any,
        modifications: [
          { upgradeCoolingTowerFans: { towerType: TowerType.OneCellTwoSpeed, fanSpeedType: 2, numberOfFans: 1 } } as any,
          { upgradeCoolingTowerFans: { towerType: TowerType.VariableSpeed, fanSpeedType: 0, numberOfFans: 1 } } as any,
        ]
      });

      const updated = service.updateAssessmentVersion(assessment);

      expect(updated.processCooling.modifications[0].upgradeCoolingTowerFans.fanSpeedType).toBe(1);
      expect(updated.processCooling.modifications[1].upgradeCoolingTowerFans.fanSpeedType).toBe(2);
    });

    it('does not throw and leaves fanSpeedType untouched when a modification has no towerType set', () => {
      const assessment = buildAssessment({
        systemInformation: {
          towerInput: { towerType: TowerType.OneCellOneSpeed, fanSpeedType: 1 } as any
        } as any,
        modifications: [
          { upgradeCoolingTowerFans: {} } as any,
        ]
      });

      expect(() => service.updateAssessmentVersion(assessment)).not.toThrow();
      expect(assessment.processCooling.modifications[0].upgradeCoolingTowerFans.fanSpeedType).toBeUndefined();
    });

    it('leaves fanSpeedType untouched when a modification towerType is null', () => {
      const assessment = buildAssessment({
        systemInformation: {
          towerInput: { towerType: TowerType.OneCellOneSpeed, fanSpeedType: 1 } as any
        } as any,
        modifications: [
          { upgradeCoolingTowerFans: { towerType: null, fanSpeedType: 1 } } as any,
        ]
      });

      const updated = service.updateAssessmentVersion(assessment);

      expect(updated.processCooling.modifications[0].upgradeCoolingTowerFans.fanSpeedType).toBe(1);
    });
  });

  it('does not throw when processCooling is missing', () => {
    const assessment: Assessment = { name: 'no data', type: 'ProcessCooling', appVersion: '1.7.5' };
    expect(() => service.updateAssessmentVersion(assessment)).not.toThrow();
  });

  describe('legacy Metric data', () => {
    const METRIC = { unitsOfMeasure: 'Metric' } as Settings;
    const IMPERIAL = { unitsOfMeasure: 'Imperial' } as Settings;

    /**
     * v1.10 Metric data: efficiency and towerSize were never converted, other values are as stored by v1.10
     */
    function getV110MetricProcessCooling(): ProcessCoolingAssessment {
      const processCooling: ProcessCoolingAssessment = getDefaultProcessCoolingAssessment({ fuelCost: 10 } as Settings);
      const systemInformation = processCooling.systemInformation;
      systemInformation.operations.chilledWaterSupplyTemp = 6.67;
      systemInformation.waterCooledSystemInput.followingTempDifferential = -12.22;
      systemInformation.towerInput.towerSizeMetric = TowerSizeMetric.Tons;
      systemInformation.towerInput.towerSize = 500;
      systemInformation.chilledWaterPumpInput.flowRate = 0.01;
      processCooling.inventory[0].capacity = 351.69;
      processCooling.inventory[0].fullLoadEfficiency = 0.6;
      processCooling.inventory[0].kWPerTonAtLoad = [0.5, 0.6];
      processCooling.modifications = [{
        useFreeCooling: { HEXApproachTemp: 10 },
        replaceChillers: { newChiller: { fullLoadEfficiency: 0.5 } },
      } as Modification];
      processCooling.existingDataUnits = 'Imperial';
      return processCooling;
    }

    function buildV110Assessment(processCooling: ProcessCoolingAssessment, appVersion: string = '1.10.0'): Assessment {
      const assessment = buildAssessment(processCooling);
      assessment.appVersion = appVersion;
      return assessment;
    }

    it('converts chiller efficiency and tower size so the Suite receives the original Imperial values', () => {
      const updated = service.updateAssessmentVersion(buildV110Assessment(getV110MetricProcessCooling()), METRIC);
      const suiteInput = TestBed.inject(ConvertProcessCoolingService).convertInputsForSuite(updated.processCooling, METRIC);

      expect(suiteInput.systemInformation.towerInput.towerSize).toBeCloseTo(500, 0);
      expect(suiteInput.inventory[0].fullLoadEfficiency).toBeCloseTo(0.6, 3);
      expect(suiteInput.inventory[0].kWPerTonAtLoad[0]).toBeCloseTo(0.5, 3);
      expect(suiteInput.inventory[0].kWPerTonAtLoad[1]).toBeCloseTo(0.6, 3);
      expect(updated.processCooling.modifications[0].replaceChillers.newChiller.fullLoadEfficiency).toBeCloseTo(convertChillerEfficiency(0.5, true), 4);
    });

    it('converts tower size in hp to kW', () => {
      const processCooling = getV110MetricProcessCooling();
      processCooling.systemInformation.towerInput.towerSizeMetric = TowerSizeMetric.HP;
      processCooling.systemInformation.towerInput.towerSize = 10;

      const updated = service.updateAssessmentVersion(buildV110Assessment(processCooling), METRIC);

      expect(updated.processCooling.systemInformation.towerInput.towerSize).toBeCloseTo(7.46, 2);
    });

    it('sets existingDataUnits to Metric so the Update Data reminder is not shown', () => {
      const updated = service.updateAssessmentVersion(buildV110Assessment(getV110MetricProcessCooling()), METRIC);

      expect(updated.processCooling.existingDataUnits).toBe('Metric');
    });

    it('leaves values v1.10 converted as stored', () => {
      const updated = service.updateAssessmentVersion(buildV110Assessment(getV110MetricProcessCooling()), METRIC);

      const systemInformation = updated.processCooling.systemInformation;
      expect(systemInformation.operations.chilledWaterSupplyTemp).toBe(6.67);
      expect(systemInformation.waterCooledSystemInput.followingTempDifferential).toBe(-12.22);
      expect(systemInformation.chilledWaterPumpInput.flowRate).toBe(0.01);
      expect(updated.processCooling.inventory[0].capacity).toBe(351.69);
      expect(updated.processCooling.modifications[0].useFreeCooling.HEXApproachTemp).toBe(10);
    });

    it('does not update assessments with Imperial settings', () => {
      const processCooling = getV110MetricProcessCooling();
      const expected = structuredClone(processCooling);

      const updated = service.updateAssessmentVersion(buildV110Assessment(processCooling), IMPERIAL);

      expect(updated.processCooling).toEqual(expected);
    });

    it('does not update assessments without settings', () => {
      const processCooling = getV110MetricProcessCooling();
      const expected = structuredClone(processCooling);

      const updated = service.updateAssessmentVersion(buildV110Assessment(processCooling));

      expect(updated.processCooling).toEqual(expected);
    });

    it('does not update Metric data saved after v1.10', () => {
      const processCooling = getV110MetricProcessCooling();
      const expected = structuredClone(processCooling);

      const updated = service.updateAssessmentVersion(buildV110Assessment(processCooling, '1.11.0'), METRIC);

      expect(updated.processCooling).toEqual(expected);
    });

    it('updates assessments saved before v1.10', () => {
      const updated = service.updateAssessmentVersion(buildV110Assessment(getV110MetricProcessCooling(), '1.8.5'), METRIC);

      expect(updated.processCooling.existingDataUnits).toBe('Metric');
    });
  });
});
