import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { CoolingFormService, isGasCoolingForm } from './cooling-form.service';

const IMPERIAL = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC = { unitsOfMeasure: 'Metric' } as Settings;

describe('CoolingFormService', () => {
  let service: CoolingFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ReactiveFormsModule], providers: [CoolingFormService] });
    service = TestBed.inject(CoolingFormService);
  });

  it('builds a new loss as Air with the legacy air defaults', () => {
    const form = service.getCoolingForm({}, IMPERIAL);

    expect(isGasCoolingForm(form)).toBeTrue();
    expect(form.getRawValue()).toEqual(jasmine.objectContaining({ coolingLossType: 'Gas', specificHeat: 0.2371, gasDensity: 0.074887 }));
  });

  it('uses the Metric water defaults for a new Water loss', () => {
    const form = service.getCoolingForm({ coolingLossType: 'Liquid' }, METRIC);

    expect(isGasCoolingForm(form)).toBeFalse();
    expect(form.getRawValue()).toEqual(jasmine.objectContaining({ coolingLossType: 'Liquid', specificHeat: 4.187, density: 0.999 }));
  });

  it('leaves Other media blank', () => {
    expect(service.getCoolingForm({ coolingLossType: 'Other Gas' }, IMPERIAL).controls.specificHeat.value).toBeNull();
    expect(service.getCoolingForm({ coolingLossType: 'Other Liquid' }, IMPERIAL).controls.specificHeat.value).toBeNull();
  });

  it('does not apply defaults over a saved loss', () => {
    const form = service.getCoolingForm({ coolingLossType: 'Gas', gasCoolingLoss: { flowRate: 100 } }, IMPERIAL);

    expect(form.controls.specificHeat.value).toBeNull();
  });

  it('saves the gas outlet temperature under both finalTemperature and outletTemperature', () => {
    const form = service.getCoolingForm({ coolingLossType: 'Other Gas', coolingMedium: 'Nitrogen', gasCoolingLoss: { finalTemperature: 300 } }, IMPERIAL);

    const loss = service.buildCoolingLoss(form);

    expect(loss.coolingLossType).toBe('Other Gas');
    expect(loss.coolingMedium).toBe('Nitrogen');
    expect(loss.gasCoolingLoss).toEqual(jasmine.objectContaining({ finalTemperature: 300, outletTemperature: 300 }));
    expect(loss.liquidCoolingLoss).toBeUndefined();
  });

  it('round-trips a liquid loss', () => {
    const saved = { coolingLossType: 'Other Liquid', liquidCoolingLoss: { flowRate: 10, density: 1, initialTemperature: 60, outletTemperature: 90, specificHeat: 1, correctionFactor: 1 } };

    const loss = service.buildCoolingLoss(service.getCoolingForm(saved, IMPERIAL));

    expect(loss.liquidCoolingLoss).toEqual(saved.liquidCoolingLoss);
    expect(loss.gasCoolingLoss).toBeUndefined();
  });
});
