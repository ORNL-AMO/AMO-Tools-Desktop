import { TestBed } from '@angular/core/testing';
import { EnergyInputExhaustGasFormService } from './energy-input-exhaust-gas-form.service';

describe('EnergyInputExhaustGasFormService', () => {
  let service: EnergyInputExhaustGasFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [EnergyInputExhaustGasFormService] });
    service = TestBed.inject(EnergyInputExhaustGasFormService);
  });

  it('defaults to zero heat input and 100% available heat and efficiency, and is valid', () => {
    const form = service.getEnergyInputExhaustGasForm();

    expect(form.getRawValue()).toEqual({ totalHeatInput: 0, availableHeat: 100, electricalHeaterEfficiency: 100 });
    expect(form.valid).toBeTrue();
  });

  it('rejects available heat of 0 and above 100', () => {
    expect(service.getEnergyInputExhaustGasForm({ availableHeat: 0 }).controls.availableHeat.valid).toBeFalse();
    expect(service.getEnergyInputExhaustGasForm({ availableHeat: 101 }).controls.availableHeat.errors?.['max']).toBeTruthy();
  });

  it('rejects electrical heater efficiency of 0 and above 100', () => {
    expect(service.getEnergyInputExhaustGasForm({ electricalHeaterEfficiency: 0 }).controls.electricalHeaterEfficiency.valid).toBeFalse();
    expect(service.getEnergyInputExhaustGasForm({ electricalHeaterEfficiency: 101 }).controls.electricalHeaterEfficiency.errors?.['max']).toBeTruthy();
  });

  it('requires total heat input', () => {
    const form = service.getEnergyInputExhaustGasForm();
    form.controls.totalHeatInput.setValue(null);

    expect(form.controls.totalHeatInput.errors?.['required']).toBeTruthy();
  });

  it('builds a loss with otherLosses fixed at 0', () => {
    const loss = { totalHeatInput: 5, availableHeat: 80, electricalHeaterEfficiency: 90 };

    expect(service.buildEnergyInputExhaustGasLoss(service.getEnergyInputExhaustGasForm(loss))).toEqual({ ...loss, otherLosses: 0 });
  });
});
