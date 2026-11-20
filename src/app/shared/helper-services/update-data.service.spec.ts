import { TestBed } from '@angular/core/testing';
import { UpdateDataService } from './update-data.service';
import { ConvertUnitsService } from '../convert-units/convert-units.service';
import { Assessment } from '../models/assessment';
import { ProcessCoolingAssessment, TowerType } from '../models/process-cooling-assessment';
import { environment } from '../../../environments/environment';
import { LegacyWaterReductionData, WaterReductionData } from '../models/standalone';
import { Treasure, WaterReductionTreasureHunt } from '../models/treasure-hunt';
import { Settings } from '../models/settings';
import { ReactiveFormsModule } from '@angular/forms';
import { WaterReductionService } from '../../calculator/waste-water/water-reduction/water-reduction.service';
import { StandaloneService } from '../../calculator/standalone.service';

describe('UpdateDataService.updateProcessCooling', () => {
  let service: UpdateDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UpdateDataService, ConvertUnitsService]
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
});

describe('UpdateDataService.updateWaterReductionTreasureHunt', () => {
  let service: UpdateDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UpdateDataService, ConvertUnitsService]
    });
    service = TestBed.inject(UpdateDataService);
  });

  function buildOpportunity(baseline: Array<Partial<LegacyWaterReductionData>>, modification: Array<Partial<LegacyWaterReductionData>> = []): WaterReductionTreasureHunt {
    return {
      baseline: baseline as Array<WaterReductionData>,
      modification: modification as Array<WaterReductionData>,
      opportunityType: Treasure.waterReduction
    };
  }

  it('maps legacy isWastewater true to wastewater and false to water', () => {
    const opportunity = buildOpportunity([{ isWastewater: true }], [{ isWastewater: false }]);
    service.updateWaterReductionTreasureHunt(opportunity);
    expect(opportunity.baseline[0].calculatorType).toBe('wastewater');
    expect(opportunity.modification[0].calculatorType).toBe('water');
  });

  it('defaults to water when neither field is set', () => {
    const opportunity = buildOpportunity([{}]);
    service.updateWaterReductionTreasureHunt(opportunity);
    expect(opportunity.baseline[0].calculatorType).toBe('water');
  });

  it('keeps an existing calculatorType and removes the legacy field', () => {
    const opportunity = buildOpportunity([{ calculatorType: 'both', isWastewater: false }]);
    service.updateWaterReductionTreasureHunt(opportunity);
    expect(opportunity.baseline[0].calculatorType).toBe('both');
    expect('isWastewater' in opportunity.baseline[0]).toBeFalse();
  });

  it('migrates water reductions when updating a treasure hunt assessment', () => {
    const assessment = {
      name: 'test treasure hunt',
      type: 'TreasureHunt',
      appVersion: '1.7.5',
      treasureHunt: { waterReductions: [buildOpportunity([{ isWastewater: true }])] }
    } as Assessment;
    service.updateAssessmentVersion(assessment);
    expect(assessment.treasureHunt.waterReductions[0].baseline[0].calculatorType).toBe('wastewater');
  });
});

describe('UpdateDataService legacy Metric water reduction defaults', () => {
  let service: UpdateDataService;
  let waterReductionService: WaterReductionService;
  const metricSettings = { unitsOfMeasure: 'Metric', waterCost: 0.002, waterWasteCost: 0.004 } as Settings;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [UpdateDataService, ConvertUnitsService, WaterReductionService, { provide: StandaloneService, useValue: {} }]
    });
    service = TestBed.inject(UpdateDataService);
    waterReductionService = TestBed.inject(WaterReductionService);
  });

  // values saved by a 1.8.3 Metric treasure hunt (settings water 0.002 $/L, wastewater 0.004 $/L)
  function buildLegacyReduction(overrides: Partial<LegacyWaterReductionData> = {}): LegacyWaterReductionData {
    return {
      name: 'Equipment #1',
      hoursPerYear: 8760,
      waterCost: 0.528,
      measurementMethod: 2,
      meteredFlowMethodData: { meterReading: 0.379 },
      volumeMeterMethodData: { finalMeterReading: 22.114, initialMeterReading: 16.031, elapsedTime: 15 },
      bucketMethodData: { bucketVolume: 0.038, bucketFillTime: 20 },
      otherMethodData: { consumption: 56.781 },
      isWastewater: false,
      ...overrides
    } as LegacyWaterReductionData;
  }

  function buildAssessment(baseline: Array<LegacyWaterReductionData>, modification: Array<LegacyWaterReductionData> = []): Assessment {
    return {
      name: 'Has Water Bug',
      type: 'TreasureHunt',
      appVersion: '1.7.5',
      treasureHunt: {
        existingDataUnits: 'Metric',
        waterReductions: [{
          baseline: baseline as Array<WaterReductionData>,
          modification: modification as Array<WaterReductionData>,
          opportunityType: Treasure.waterReduction
        }]
      }
    } as Assessment;
  }

  it('converts untouched legacy defaults to the current Metric defaults', () => {
    const assessment = buildAssessment([buildLegacyReduction()]);
    service.updateAssessmentVersion(assessment, metricSettings);
    const migrated = assessment.treasureHunt.waterReductions[0].baseline[0];
    const currentDefault = waterReductionService.initObject(0, metricSettings, 'water', undefined);
    expect(migrated.waterCost).toBe(currentDefault.waterCost);
    expect(migrated.meteredFlowMethodData.meterReading).toBe(currentDefault.meteredFlowMethodData.meterReading);
    expect(migrated.volumeMeterMethodData.finalMeterReading).toBe(currentDefault.volumeMeterMethodData.finalMeterReading);
    expect(migrated.volumeMeterMethodData.initialMeterReading).toBe(currentDefault.volumeMeterMethodData.initialMeterReading);
    expect(migrated.bucketMethodData.bucketVolume).toBe(currentDefault.bucketMethodData.bucketVolume);
    expect(migrated.otherMethodData.consumption).toBe(currentDefault.otherMethodData.consumption);
  });

  it('leaves values the user entered unchanged', () => {
    const typed = buildLegacyReduction({ meteredFlowMethodData: { meterReading: 0.5 }, otherMethodData: { consumption: 56922.48 } });
    const assessment = buildAssessment([buildLegacyReduction()], [typed]);
    service.updateAssessmentVersion(assessment, metricSettings);
    const modification = assessment.treasureHunt.waterReductions[0].modification[0];
    expect(modification.meteredFlowMethodData.meterReading).toBe(0.5);
    expect(modification.otherMethodData.consumption).toBe(56922.48);
  });

  it('matches wastewater costs against the wastewater rate', () => {
    const assessment = buildAssessment([buildLegacyReduction({ isWastewater: true, waterCost: 1.057 })]);
    service.updateAssessmentVersion(assessment, metricSettings);
    expect(assessment.treasureHunt.waterReductions[0].baseline[0].waterCost).toBe(0.004);
  });

  it('converts the 0.005 $/gal fallback cost when settings have no rate', () => {
    const noRateSettings = { unitsOfMeasure: 'Metric' } as Settings;
    const assessment = buildAssessment([buildLegacyReduction({ waterCost: 1.321 })]);
    service.updateAssessmentVersion(assessment, noRateSettings);
    expect(assessment.treasureHunt.waterReductions[0].baseline[0].waterCost).toBe(waterReductionService.initObject(0, noRateSettings, 'water', undefined).waterCost);
  });

  it('leaves the cost unchanged when the settings rate changed since it was saved', () => {
    const assessment = buildAssessment([buildLegacyReduction()]);
    service.updateAssessmentVersion(assessment, { ...metricSettings, waterCost: 0.003 } as Settings);
    const migrated = assessment.treasureHunt.waterReductions[0].baseline[0];
    expect(migrated.waterCost).toBe(0.528);
    expect(migrated.bucketMethodData.bucketVolume).toBe(37.854);
  });

  it('does not change Imperial treasure hunts', () => {
    const assessment = buildAssessment([buildLegacyReduction()]);
    service.updateAssessmentVersion(assessment, { ...metricSettings, unitsOfMeasure: 'Imperial' } as Settings);
    expect(assessment.treasureHunt.waterReductions[0].baseline[0].meteredFlowMethodData.meterReading).toBe(0.379);
  });

  it('does not change records saved with a calculatorType', () => {
    const assessment = buildAssessment([buildLegacyReduction({ calculatorType: 'water', isWastewater: undefined })]);
    service.updateAssessmentVersion(assessment, metricSettings);
    const reduction = assessment.treasureHunt.waterReductions[0].baseline[0];
    expect(reduction.meteredFlowMethodData.meterReading).toBe(0.379);
    expect(reduction.waterCost).toBe(0.528);
  });

  it('converts the defaults only once', () => {
    const assessment = buildAssessment([buildLegacyReduction()]);
    service.updateAssessmentVersion(assessment, metricSettings);
    service.updateAssessmentVersion(assessment, metricSettings);
    expect(assessment.treasureHunt.waterReductions[0].baseline[0].meteredFlowMethodData.meterReading).toBe(378.541);
  });

  it('converts legacy defaults on imported opportunities', () => {
    const opportunity = buildAssessment([buildLegacyReduction()]).treasureHunt.waterReductions[0];
    service.updateWaterReductionTreasureHunt(opportunity, 'Metric', metricSettings);
    expect(opportunity.baseline[0].bucketMethodData.bucketVolume).toBe(37.854);
    expect(opportunity.baseline[0].waterCost).toBe(0.002);
  });

  it('uses existingDataUnits and skips the cost when settings are not available', () => {
    const assessment = buildAssessment([buildLegacyReduction()]);
    service.updateAssessmentVersion(assessment);
    const migrated = assessment.treasureHunt.waterReductions[0].baseline[0];
    expect(migrated.meteredFlowMethodData.meterReading).toBe(378.541);
    expect(migrated.waterCost).toBe(0.528);
  });
});

describe('UpdateDataService.updateSSMT', () => {
  let service: UpdateDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UpdateDataService, ConvertUnitsService]
    });
    service = TestBed.inject(UpdateDataService);
  });

  function buildSsmtAssessment(baselineValue?: boolean, modificationValue?: boolean): Assessment {
    return {
      name: 'legacy steam assessment',
      type: 'SSMT',
      appVersion: '1.8.1',
      ssmt: {
        headerInput: {},
        boilerInput: { sendBlowdownToDeaerator: baselineValue },
        modifications: [{
          modificationId: 'modification-id',
          ssmt: {
            headerInput: {},
            boilerInput: { sendBlowdownToDeaerator: modificationValue }
          }
        }]
      }
    } as Assessment;
  }

  it('defaults missing baseline and modification routing values to false', () => {
    const updated = service.updateAssessmentVersion(buildSsmtAssessment());

    expect(updated.ssmt.boilerInput.sendBlowdownToDeaerator).toBeFalse();
    expect(updated.ssmt.modifications[0].ssmt.boilerInput.sendBlowdownToDeaerator).toBeFalse();
  });

  it('preserves explicit baseline and modification routing values', () => {
    const updated = service.updateAssessmentVersion(buildSsmtAssessment(true, true));

    expect(updated.ssmt.boilerInput.sendBlowdownToDeaerator).toBeTrue();
    expect(updated.ssmt.modifications[0].ssmt.boilerInput.sendBlowdownToDeaerator).toBeTrue();
  });
});
