import { TestBed } from '@angular/core/testing';
import { AuxiliaryEquipmentItem } from '../../shared/models/phast/auxEquipment';
import { AuxiliaryEquipmentMeasurementMethod } from '../models/auxiliary-equipment';
import { AuxiliaryEquipmentFormService, newAuxiliaryEquipmentItem } from './auxiliary-equipment-form.service';

describe('AuxiliaryEquipmentFormService', () => {
  let service: AuxiliaryEquipmentFormService;

  const withMethod = (measurementMethod: AuxiliaryEquipmentMeasurementMethod): AuxiliaryEquipmentItem =>
    ({ ...newAuxiliaryEquipmentItem(8760, true), measurementMethod, id: 'aux-1', name: 'Fan' });

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AuxiliaryEquipmentFormService] });
    service = TestBed.inject(AuxiliaryEquipmentFormService);
  });

  it('starts a new item valid, in hp for imperial and kW for metric', () => {
    expect(service.getForm(newAuxiliaryEquipmentItem(8760, true)).valid).toBeTrue();
    expect(newAuxiliaryEquipmentItem(8760, true).userSelectedHP).toBeTrue();
    expect(newAuxiliaryEquipmentItem(8760, false).userSelectedHP).toBeFalse();
  });

  it('round trips a saved item', () => {
    const { id, name, ...item } = withMethod(AuxiliaryEquipmentMeasurementMethod.NAMEPLATE);
    expect(service.buildItem(service.getForm(item))).toEqual(item);
  });

  it('validates only the inputs of the selected measurement method', () => {
    const item = withMethod(AuxiliaryEquipmentMeasurementMethod.POWER_METER);
    item.multimeterData = { ...item.multimeterData, supplyVoltage: undefined };

    expect(service.isValid(item)).toBeTrue();
    expect(service.isValid({ ...item, measurementMethod: AuxiliaryEquipmentMeasurementMethod.MULTIMETER })).toBeFalse();
  });

  it('revalidates when the measurement method changes, before the form reports the change', () => {
    const item = withMethod(AuxiliaryEquipmentMeasurementMethod.POWER_METER);
    item.otherMethodData = { energy: undefined };
    const form = service.getForm(item);
    const validityOnChange: boolean[] = [];
    form.valueChanges.subscribe(() => validityOnChange.push(form.valid));

    form.controls.measurementMethod.setValue(AuxiliaryEquipmentMeasurementMethod.OTHER);

    expect(validityOnChange).toEqual([false]);
  });

  it('does not need units for the other method', () => {
    const item = { ...withMethod(AuxiliaryEquipmentMeasurementMethod.OTHER), units: undefined };
    expect(service.isValid(item)).toBeTrue();
  });

  it('rejects out-of-range inputs', () => {
    const item = withMethod(AuxiliaryEquipmentMeasurementMethod.MULTIMETER);
    expect(service.isValid({ ...item, operatingHours: 9000 })).toBeFalse();
    expect(service.isValid({ ...item, units: 0 })).toBeFalse();
    expect(service.isValid({ ...item, multimeterData: { ...item.multimeterData, powerFactor: 0 } })).toBeFalse();
    expect(service.isValid({ ...item, multimeterData: { ...item.multimeterData, powerFactor: 1.1 } })).toBeFalse();
  });

  it('requires operational frequency only for a variable speed motor, saving line frequency otherwise', () => {
    const item = withMethod(AuxiliaryEquipmentMeasurementMethod.NAMEPLATE);
    const fixedSpeed = { ...item, nameplateData: { ...item.nameplateData, variableSpeedMotor: false, operationalFrequency: undefined } };

    expect(service.isValid(fixedSpeed)).toBeTrue();
    expect(service.isValid({ ...fixedSpeed, nameplateData: { ...fixedSpeed.nameplateData, variableSpeedMotor: true } })).toBeFalse();
    expect(service.buildItem(service.getForm(fixedSpeed)).nameplateData.operationalFrequency).toBe(60);
  });
});
