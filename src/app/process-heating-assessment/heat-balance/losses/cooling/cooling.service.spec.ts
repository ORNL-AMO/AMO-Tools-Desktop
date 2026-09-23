import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CoolingLoss } from '../../../../shared/models/phast/losses/coolingLoss';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { CoolingCalculationService } from './cooling-calculation.service';
import { CoolingFormService, isGasCoolingForm } from './cooling-form.service';
import { CoolingService } from './cooling.service';

describe('CoolingService', () => {
  let service: CoolingService;
  let calculationSpy: jasmine.SpyObj<CoolingCalculationService>;
  let savedLosses: CoolingLoss[];

  const baseline: CoolingLoss[] = [
    { id: 'cool-1', name: 'Air loss', coolingLossType: 'Gas', coolingMedium: 'Shop air',
      gasCoolingLoss: { flowRate: 100, gasDensity: 0.07, initialTemperature: 70, finalTemperature: 300, specificHeat: 0.24, correctionFactor: 1 } },
  ];

  beforeEach(() => {
    calculationSpy = jasmine.createSpyObj('CoolingCalculationService', ['calculateGas', 'calculateLiquid']);
    calculationSpy.calculateGas.and.returnValue(10);
    calculationSpy.calculateLiquid.and.returnValue(20);
    savedLosses = [];

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        CoolingService,
        CoolingFormService,
        { provide: CoolingCalculationService, useValue: calculationSpy },
        {
          provide: ProcessHeatingAssessmentService,
          useValue: {
            settingsSignal: signal({ unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings),
            lossSignal: () => baseline,
            updateLossesProperty: (_scenario: string, _key: string, losses: CoolingLoss[]) => savedLosses = losses,
          },
        },
      ],
    });
    service = TestBed.inject(CoolingService);
    service.initialize('baseline');
  });

  it('calculates a gas loss with the gas calculation', () => {
    expect(service.losses()[0].heatLoss).toBe(10);
    expect(calculationSpy.calculateGas).toHaveBeenCalled();
  });

  it('keeps the form when switching Air to Other Gas, only changing the saved type', () => {
    const formBefore = service.losses()[0].form;

    service.switchMedium('cool-1', 'Other Gas');

    expect(service.losses()[0].form).toBe(formBefore);
    expect(savedLosses[0].coolingLossType).toBe('Other Gas');
    expect(savedLosses[0].gasCoolingLoss.flowRate).toBe(100);
  });

  it('replaces the form and discards gas values when switching to Water', () => {
    service.switchMedium('cool-1', 'Liquid');

    const item = service.losses()[0];
    expect(isGasCoolingForm(item.form)).toBeFalse();
    expect(item.form.controls.flowRate.value).toBeNull();
    expect(item.form.controls.specificHeat.value).toBe(1);
    expect(item.form.controls.coolingMedium.value).toBe('Shop air');
    expect(savedLosses[0]).toEqual(jasmine.objectContaining({ id: 'cool-1', name: 'Air loss', coolingLossType: 'Liquid' }));
    expect(savedLosses[0].gasCoolingLoss).toBeUndefined();
  });

  it('recalculates and saves edits made on the replaced form', () => {
    service.switchMedium('cool-1', 'Other Liquid');
    const form = service.losses()[0].form;

    form.patchValue({ specificHeat: 1, density: 8, flowRate: 5, inletTemp: 60, outletTemp: 90, correctionFactor: 1 });

    expect(service.losses()[0].heatLoss).toBe(20);
    expect(savedLosses[0].liquidCoolingLoss.flowRate).toBe(5);
  });
});
