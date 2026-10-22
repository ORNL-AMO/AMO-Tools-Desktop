import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ChargeMaterial, ChargeMaterialType } from '../../../../shared/models/phast/losses/chargeMaterial';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { ChargeMaterialResultsService } from './charge-material-results.service';
import { ChargeMaterialService } from './charge-material.service';
import { GasMaterialFormService } from './gas-form/gas-material-form.service';
import { LiquidMaterialFormService } from './liquid-form/liquid-material-form.service';
import { SolidMaterialFormService } from './solid-form/solid-material-form.service';

describe('ChargeMaterialService differingFields', () => {
  let service: ChargeMaterialService;
  let solidFormService: SolidMaterialFormService;
  let baseline: ChargeMaterial[];
  let modification: ChargeMaterial[];

  beforeEach(() => {
    baseline = [{ id: 'mat-1', name: 'Steel', chargeMaterialType: ChargeMaterialType.Solid, solidChargeMaterial: { materialId: 1, chargeFeedRate: 100 } }];
    modification = baseline;

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        ChargeMaterialService,
        SolidMaterialFormService,
        LiquidMaterialFormService,
        GasMaterialFormService,
        { provide: ChargeMaterialResultsService, useValue: jasmine.createSpyObj('ChargeMaterialResultsService', ['getResults']) },
        {
          provide: ProcessHeatingAssessmentService,
          useValue: {
            settingsSignal: signal({ unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings),
            processHeatingSignal: signal(undefined),
            lossSignal: (scenario: string) => (scenario === 'baseline' ? baseline : modification),
            updateLossesProperty: () => {},
          },
        },
      ],
    });
    service = TestBed.inject(ChargeMaterialService);
    solidFormService = TestBed.inject(SolidMaterialFormService);
  });

  it('flags only the edited field when the modification saved form defaults baseline omits', () => {
    const form = solidFormService.getSolidChargeMaterialForm(baseline[0]);
    form.patchValue({ feedRate: 200 });
    modification = [{ ...solidFormService.buildSolidChargeMaterial(form), id: 'mat-1', name: 'Steel' }];

    service.initialize('mod-1');

    expect([...service.differingFields('mat-1')!] as string[]).toEqual(['solidChargeMaterial.chargeFeedRate']);
  });

  it('is undefined for the baseline scenario', () => {
    service.initialize('baseline');

    expect(service.differingFields('mat-1')).toBeUndefined();
  });
});
