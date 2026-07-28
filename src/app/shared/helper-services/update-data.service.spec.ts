import { TestBed } from '@angular/core/testing';
import { UpdateDataService } from './update-data.service';
import { ConvertUnitsService } from '../convert-units/convert-units.service';
import { Assessment } from '../models/assessment';
import { ProcessCoolingAssessment, TowerType } from '../models/process-cooling-assessment';
import { environment } from '../../../environments/environment';

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
