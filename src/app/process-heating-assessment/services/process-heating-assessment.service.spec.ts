import { TestBed } from '@angular/core/testing';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { ConvertPhastService } from '../../phast/convert-phast.service';
import { PHAST } from '../models/phast';
import { ProcessHeatingAssessmentService } from './process-heating-assessment.service';

describe('ProcessHeatingAssessmentService', () => {
  let service: ProcessHeatingAssessmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProcessHeatingAssessmentService,
        { provide: AssessmentDbService, useValue: {} },
        { provide: SettingsDbService, useValue: {} },
        { provide: ConvertPhastService, useValue: {} },
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
});
