import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { PHAST } from '../models/phast';
import { ProcessHeatingModification } from '../models/modification';
import { ProcessHeatingAssessmentService } from './process-heating-assessment.service';

describe('ProcessHeatingAssessmentService', () => {
  let service: ProcessHeatingAssessmentService;
  let settingsDb: jasmine.SpyObj<SettingsDbService>;
  let assessmentDb: jasmine.SpyObj<AssessmentDbService>;

  beforeEach(() => {
    settingsDb = jasmine.createSpyObj<SettingsDbService>('SettingsDbService', [
      'updateWithObservable', 'getAllSettings', 'setAll', 'getByAssessmentId', 'addWithObservable',
    ]);
    settingsDb.updateWithObservable.and.returnValue(of(undefined));
    settingsDb.getAllSettings.and.returnValue(of([]));
    assessmentDb = jasmine.createSpyObj<AssessmentDbService>('AssessmentDbService', ['updateWithObservable', 'getAllAssessments', 'setAll']);
    assessmentDb.updateWithObservable.and.returnValue(of(undefined));
    assessmentDb.getAllAssessments.and.returnValue(of([]));
    TestBed.configureTestingModule({
      providers: [
        ProcessHeatingAssessmentService,
        { provide: AssessmentDbService, useValue: assessmentDb },
        { provide: SettingsDbService, useValue: settingsDb },
      ],
    });
    service = TestBed.inject(ProcessHeatingAssessmentService);
  });

  describe('lossSignal / updateLossesProperty', () => {
    const baseline: PHAST = {
      name: 'Baseline',
      losses: {
        wallLosses: [{ id: 'wall-1', surfaceArea: 100 } as never],
        chargeMaterials: [{ id: 'material-1', name: 'Steel' } as never],
      },
    };

    it('keeps the same array reference for an untouched loss type when a different loss type is edited', () => {
      service.setProcessHeating(baseline);
      const chargeMaterialsBefore = service.lossSignal('baseline', 'chargeMaterials');

      service.updateLossesProperty('baseline', 'wallLosses', [{ id: 'wall-1', surfaceArea: 999 } as never]);

      expect(service.lossSignal('baseline', 'chargeMaterials')).toBe(chargeMaterialsBefore);
    });

    it('returns the updated array reference for the loss type that was actually edited', () => {
      service.setProcessHeating(baseline);
      const updatedWallLosses = [{ id: 'wall-1', surfaceArea: 999 } as never];

      service.updateLossesProperty('baseline', 'wallLosses', updatedWallLosses);

      expect(service.lossSignal('baseline', 'wallLosses')).toBe(updatedWallLosses);
    });

    it('layers a modification-scenario write onto its existing scenarioOverrides.losses instead of replacing it', () => {
      service.setProcessHeating({
        ...baseline,
        modifications: [{ id: 'mod-1', scenarioOverrides: { losses: { chargeMaterials: [{ id: 'material-1', name: 'Preheated' } as never] } } } as never],
      });
      const updatedWallLosses = [{ id: 'wall-1', surfaceArea: 50 } as never];

      service.updateLossesProperty('mod-1', 'wallLosses', updatedWallLosses);

      expect(service.lossSignal('mod-1', 'wallLosses')).toBe(updatedWallLosses);
      expect(service.lossSignal('mod-1', 'chargeMaterials')?.[0].name).toBe('Preheated');
    });
  });

  describe('saveSettings', () => {
    const imperial = { id: 1, unitsOfMeasure: 'Imperial', energyResultUnit: 'MMBtu' } as Settings;
    const metric = { id: 1, unitsOfMeasure: 'Metric', energyResultUnit: 'GJ' } as Settings;

    function buildPhast(): PHAST {
      const modification: ProcessHeatingModification = {
        id: 'mod-1',
        scenarioOverrides: { losses: { wallLosses: [{ id: 'wall-1', ambientTemperature: 212 }] } },
      };
      return {
        losses: { wallLosses: [{ id: 'wall-1', ambientTemperature: 212 }], otherLosses: [{ id: 'other-1', heatLoss: 10 }] },
        operatingCosts: { fuelCost: 5 },
        modifications: [modification],
      };
    }

    beforeEach(() => {
      service.setSettings(imperial);
      service.setProcessHeating(buildPhast());
    });

    it('converts baseline and modification overrides when the unit system changes', async () => {
      await service.saveSettings(metric);

      const phast = service.processHeatingSignal();
      const [modification] = service.getModifications(phast);
      expect(phast.losses.wallLosses[0].ambientTemperature).toBe(100);
      expect(modification.scenarioOverrides.losses.wallLosses[0].ambientTemperature).toBe(100);
      expect(phast.losses.otherLosses[0].heatLoss).toBe(10.5506);
      expect(phast.operatingCosts.fuelCost).toBeCloseTo(5 / 1.055056, 3);
    });

    it('converts only energyResultUnit-based values when only the energy unit changes', async () => {
      await service.saveSettings({ ...imperial, energyResultUnit: 'GJ' });

      const phast = service.processHeatingSignal();
      expect(phast.losses.wallLosses[0].ambientTemperature).toBe(212);
      expect(phast.losses.otherLosses[0].heatLoss).toBe(10.5506);
    });

    it('leaves stored data untouched when neither unit changed', async () => {
      const before = service.processHeatingSignal();

      await service.saveSettings({ ...imperial, currency: '€' });

      expect(service.processHeatingSignal()).toBe(before);
    });

    it('converts once when saves overlap', async () => {
      await Promise.all([service.saveSettings(metric), service.saveSettings({ ...metric })]);

      expect(service.processHeatingSignal().losses.wallLosses[0].ambientTemperature).toBe(100);
    });

    it('applies the new settings and persists them', async () => {
      await service.saveSettings(metric);

      expect(service.settingsSignal()).toBe(metric);
      expect(settingsDb.updateWithObservable).toHaveBeenCalledWith(metric);
      expect(settingsDb.setAll).toHaveBeenCalledWith([]);
    });

    it('writes the converted assessment before the settings', async () => {
      await service.saveSettings(metric);

      const savedPhast = assessmentDb.updateWithObservable.calls.mostRecent().args[0].phast as unknown as PHAST;
      expect(savedPhast.losses.wallLosses[0].ambientTemperature).toBe(100);
      expect(assessmentDb.updateWithObservable).toHaveBeenCalledBefore(settingsDb.updateWithObservable);
    });

    it('does not write the assessment immediately when nothing was converted', async () => {
      await service.saveSettings({ ...imperial, currency: '€' });

      expect(assessmentDb.updateWithObservable).not.toHaveBeenCalled();
    });
  });

  describe('initAssessmentSettings', () => {
    const assessment = { id: 7 } as Assessment;

    function stubNewAssessmentSettings(directorySettings: Settings): void {
      settingsDb.addWithObservable.and.returnValue(of(undefined));
      settingsDb.getByAssessmentId.and.callFake((_assessment, assessmentSettings) => {
        if (!assessmentSettings) {
          return { ...directorySettings, id: 3 };
        }
        const created = settingsDb.addWithObservable.calls.count() > 0;
        return created ? { ...directorySettings, assessmentId: 7 } : undefined;
      });
    }

    it('pushes the converted data into the assessment when new Metric settings are created', async () => {
      stubNewAssessmentSettings({ unitsOfMeasure: 'Metric', energyResultUnit: 'GJ' } as Settings);
      service.setProcessHeating({ losses: { wallLosses: [{ id: 'wall-1', ambientTemperature: 212 }] } });

      await service.initAssessmentSettings(assessment);

      expect(service.processHeatingSignal().losses.wallLosses[0].ambientTemperature).toBe(100);
      const savedPhast = assessmentDb.updateWithObservable.calls.mostRecent().args[0].phast as unknown as PHAST;
      expect(savedPhast.losses.wallLosses[0].ambientTemperature).toBe(100);
    });

    it('does not convert when new settings are Imperial', async () => {
      stubNewAssessmentSettings({ unitsOfMeasure: 'Imperial', energyResultUnit: 'MMBtu' } as Settings);
      service.setProcessHeating({ losses: { wallLosses: [{ id: 'wall-1', ambientTemperature: 212 }] } });

      await service.initAssessmentSettings(assessment);

      expect(service.processHeatingSignal().losses.wallLosses[0].ambientTemperature).toBe(212);
      expect(assessmentDb.updateWithObservable).not.toHaveBeenCalled();
    });
  });
});
