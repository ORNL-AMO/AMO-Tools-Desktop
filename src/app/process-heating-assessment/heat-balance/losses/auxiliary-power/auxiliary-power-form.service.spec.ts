import { TestBed } from '@angular/core/testing';
import { AuxiliaryPowerLoss } from '../../../../shared/models/phast/losses/auxiliaryPowerLoss';
import { AuxiliaryPowerFormService } from './auxiliary-power-form.service';

const LOSS: AuxiliaryPowerLoss = { motorPhase: 3, supplyVoltage: 460, avgCurrent: 20, powerFactor: 0.85, operatingTime: 80 };

describe('AuxiliaryPowerFormService', () => {
  let service: AuxiliaryPowerFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AuxiliaryPowerFormService] });
    service = TestBed.inject(AuxiliaryPowerFormService);
  });

  it('is invalid on an empty loss', () => {
    expect(service.getAuxiliaryPowerForm().valid).toBeFalse();
  });

  it('is valid for a complete loss', () => {
    expect(service.getAuxiliaryPowerForm(LOSS).valid).toBeTrue();
  });

  it('rejects a power factor above 1', () => {
    expect(service.getAuxiliaryPowerForm({ ...LOSS, powerFactor: 1.1 }).controls.powerFactor.errors?.['max']).toBeTruthy();
  });

  it('rejects an operating time above 100', () => {
    expect(service.getAuxiliaryPowerForm({ ...LOSS, operatingTime: 101 }).controls.operatingTime.errors?.['max']).toBeTruthy();
  });

  it('rejects negative voltage and current', () => {
    const form = service.getAuxiliaryPowerForm({ ...LOSS, supplyVoltage: -1, avgCurrent: -1 });

    expect(form.controls.supplyVoltage.errors?.['min']).toBeTruthy();
    expect(form.controls.avgCurrent.errors?.['min']).toBeTruthy();
  });

  it('round-trips a loss through the form', () => {
    expect(service.buildAuxiliaryPowerLoss(service.getAuxiliaryPowerForm(LOSS))).toEqual(LOSS);
  });
});
