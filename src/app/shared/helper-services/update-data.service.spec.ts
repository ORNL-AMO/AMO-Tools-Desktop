import { TestBed } from '@angular/core/testing';
import { UpdateDataService } from './update-data.service';
import { ConvertUnitsService } from '../convert-units/convert-units.service';
import { Assessment } from '../models/assessment';
import { ProcessCoolingAssessment, TowerType } from '../models/process-cooling-assessment';
import { environment } from '../../../environments/environment';
import { DryerOperatingCostInput, DryerType, PurgeInputMode } from '../models/standalone';
import { Calculator } from '../models/calculators';
import { Treasure, TreasureHunt } from '../models/treasure-hunt';

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

describe('UpdateDataService dryer operating cost migration', () => {
  let service: UpdateDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UpdateDataService, ConvertUnitsService]
    });
    service = TestBed.inject(UpdateDataService);
  });

  function buildLegacyInput(overrides: Record<string, unknown> = {}): DryerOperatingCostInput {
    return {
      dryerType: DryerType.BlowerPurgeWithSweep,
      flowRate: 1000,
      pressure: 100,
      temperature: 75,
      operatingHoursPerDay: 16,
      operatingDaysPerWeek: 5,
      operatingWeeksPerYear: 50,
      costOfElectricity: 0.08,
      costOfCompressedAir: 0.25,
      costOfCoolingWater: 0.5,
      heaterPower: 40,
      heatingHoursPerDay: 12,
      purgeRate: 9,
      designDDCPercentage: 0,
      ...overrides,
    } as unknown as DryerOperatingCostInput;
  }

  it('derives annualOperatingHours from the legacy schedule and drops the legacy fields', () => {
    const migrated = service.updateDryerOperatingCostInput(buildLegacyInput());
    expect(migrated.annualOperatingHours).toBe(4000);
    expect('operatingHoursPerDay' in migrated).toBeFalse();
    expect('operatingDaysPerWeek' in migrated).toBeFalse();
    expect('operatingWeeksPerYear' in migrated).toBeFalse();
  });

  it('keeps shared operating and utility values', () => {
    const migrated = service.updateDryerOperatingCostInput(buildLegacyInput());
    expect(migrated.dryerType).toBe(DryerType.BlowerPurgeWithSweep);
    expect(migrated.flowRate).toBe(1000);
    expect(migrated.pressure).toBe(100);
    expect(migrated.temperature).toBe(75);
    expect(migrated.costOfElectricity).toBe(0.08);
    expect(migrated.costOfCompressedAir).toBe(0.25);
    expect(migrated.costOfCoolingWater).toBe(0.5);
  });

  it('applies V2 type defaults with percentage purge mode and automatic sizing', () => {
    const migrated = service.updateDryerOperatingCostInput(buildLegacyInput());
    expect(migrated).toEqual(jasmine.objectContaining({
      purgeInputMode: PurgeInputMode.PercentOfDryerCapacity,
      purgeRate: 7,
      purgeFlowRate: 0,
      heaterPower: 0,
      heatingHoursPerDay: 18,
      motorPower: 0,
      designDDCPercentage: 16.33,
      regenerationCycleLength: 4,
    }));
  });

  it('sends 0 for assumptions hidden for the dryer type', () => {
    const migrated = service.updateDryerOperatingCostInput(buildLegacyInput({ dryerType: DryerType.Refrigerated }));
    expect(migrated.purgeRate).toBe(0);
    expect(migrated.heatingHoursPerDay).toBe(0);
    expect(migrated.designDDCPercentage).toBe(0);
    expect(migrated.regenerationCycleLength).toBe(0);
  });

  it('leaves V2 inputs unchanged', () => {
    const v2Input = service.updateDryerOperatingCostInput(buildLegacyInput());
    v2Input.heaterPower = 25;
    expect(service.updateDryerOperatingCostInput(v2Input)).toBe(v2Input);
    expect(v2Input.heaterPower).toBe(25);
  });

  it('migrates assessment calculator baseline and modification', () => {
    const calculator: Calculator = {
      dryerOperatingCost: { baseline: buildLegacyInput(), modification: buildLegacyInput({ operatingHoursPerDay: 24, operatingDaysPerWeek: 7, operatingWeeksPerYear: 52 }) },
    };
    service.updateAssessmentCalculatorVersion(calculator);
    expect(calculator.dryerOperatingCost.baseline.annualOperatingHours).toBe(4000);
    expect(calculator.dryerOperatingCost.modification.annualOperatingHours).toBe(8736);
  });

  it('migrates Treasure Hunt dryer opportunities', () => {
    const assessment: Assessment = {
      name: 'test treasure hunt',
      type: 'TreasureHunt',
      appVersion: '1.7.5',
      treasureHunt: { compressedAirDryerOpportunities: [{ baseline: buildLegacyInput(), modification: buildLegacyInput() }] } as TreasureHunt,
    };
    service.updateAssessmentVersion(assessment);
    const opportunity = assessment.treasureHunt.compressedAirDryerOpportunities[0];
    expect(opportunity.baseline.annualOperatingHours).toBe(4000);
    expect(opportunity.modification.purgeInputMode).toBe(PurgeInputMode.PercentOfDryerCapacity);
    expect(opportunity.opportunityType).toBe(Treasure.compressedAirDryer);
  });
});
