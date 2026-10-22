import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { WallLossesSurfaceDbService } from '../../../../indexedDb/wall-losses-surface-db.service';
import { Settings } from '../../../../shared/models/settings';
import { WallLoss } from '../../../models/wall-loss';
import { ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { WallLossCalculationService } from './wall-loss-calculation.service';
import { WallLossesFormService } from './wall-losses-form.service';
import { WallLossesService } from './wall-losses.service';

describe('WallLossesService differingFields', () => {
  let service: WallLossesService;
  let formService: WallLossesFormService;
  let baseline: WallLoss[];
  let modification: WallLoss[];

  beforeEach(() => {
    baseline = [{ id: 'wall-1', surfaceArea: 100, surfaceTemperature: 300, ambientTemperature: 70, surfaceShape: 1 }];
    modification = baseline;

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        WallLossesService,
        WallLossesFormService,
        { provide: WallLossCalculationService, useValue: jasmine.createSpyObj('WallLossCalculationService', { calculate: 10 }) },
        { provide: WallLossesSurfaceDbService, useValue: { getAllWithObservable: () => of([]) } },
        {
          provide: ProcessHeatingAssessmentService,
          useValue: {
            settingsSignal: signal({ unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings),
            lossSignal: (scenario: string) => (scenario === 'baseline' ? baseline : modification),
            updateLossesProperty: () => {},
          },
        },
      ],
    });
    service = TestBed.inject(WallLossesService);
    formService = TestBed.inject(WallLossesFormService);
  });

  it('flags only the edited field when the modification saved form defaults baseline omits', () => {
    const form = formService.getWallLossForm(baseline[0]);
    form.patchValue({ surfaceArea: 250 });
    modification = [{ ...formService.buildWallLoss(form), id: 'wall-1' }];

    service.initialize('mod-1');

    expect([...service.differingFields('wall-1')!]).toEqual(['surfaceArea']);
  });

  it('has no differences for an unedited modification', () => {
    service.initialize('mod-1');

    expect(service.differingFields('wall-1')?.size).toBe(0);
  });

  it('has no differences for the baseline scenario', () => {
    service.initialize('baseline');

    expect(service.differingFields('wall-1')).toBeUndefined();
  });
});
