import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Settings } from '../../shared/models/settings';
import { AuxiliaryEquipmentMeasurementMethod } from '../models/auxiliary-equipment';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
import { AuxiliaryEquipmentFormComponent } from './auxiliary-equipment-form.component';
import { AuxiliaryEquipmentFormService, newAuxiliaryEquipmentItem } from './auxiliary-equipment-form.service';
import { AuxiliaryEquipmentFormItem } from './auxiliary-equipment.service';

describe('AuxiliaryEquipmentFormComponent', () => {
  let fixture: ComponentFixture<AuxiliaryEquipmentFormComponent>;
  let component: AuxiliaryEquipmentFormComponent;
  let item: AuxiliaryEquipmentFormItem;

  const element = (): HTMLElement => fixture.nativeElement;
  const field = (name: string): Element | null => element().querySelector(`[formControlName="${name}"]`);
  const setMethod = (method: AuxiliaryEquipmentMeasurementMethod): void => {
    item.form.controls.measurementMethod.setValue(method);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuxiliaryEquipmentFormComponent],
      imports: [ReactiveFormsModule],
      providers: [AuxiliaryEquipmentFormService, { provide: ProcessHeatingUiService, useValue: { focusedFieldSignal: { set: () => undefined } } }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    const form = TestBed.inject(AuxiliaryEquipmentFormService).getForm(newAuxiliaryEquipmentItem(8760, true));
    item = { id: 'aux-1', name: 'Fan', collapse: false, heatLoss: null, form };
    fixture = TestBed.createComponent(AuxiliaryEquipmentFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('item', item);
    fixture.componentRef.setInput('settings', { unitsOfMeasure: 'Imperial' } as Settings);
    fixture.detectChanges();
  });

  describe('measurement method fields', () => {
    it('shows only the selected method inputs, and # of units for every method but other', () => {
      expect(field('supplyVoltage')).not.toBeNull();
      expect(field('ratedMotorPower')).toBeNull();
      expect(field('units')).not.toBeNull();

      setMethod(AuxiliaryEquipmentMeasurementMethod.NAMEPLATE);
      expect(field('ratedMotorPower')).not.toBeNull();
      expect(field('supplyVoltage')).toBeNull();

      setMethod(AuxiliaryEquipmentMeasurementMethod.POWER_METER);
      expect(field('power')).not.toBeNull();

      setMethod(AuxiliaryEquipmentMeasurementMethod.OTHER);
      expect(field('energy')).not.toBeNull();
      expect(field('units')).toBeNull();
    });

    it('shows operational frequency only for a variable speed motor', () => {
      setMethod(AuxiliaryEquipmentMeasurementMethod.NAMEPLATE);
      expect(field('operationalFrequency')).not.toBeNull();

      item.form.controls.nameplateData.controls.variableSpeedMotor.setValue(false);
      fixture.detectChanges();

      expect(field('operationalFrequency')).toBeNull();
    });
  });

  describe('user actions', () => {
    it('sets the number of phases', () => {
      component.setNumberOfPhases(1);
      expect(item.form.controls.multimeterData.controls.numberOfPhases.value).toBe(1);
    });

    it('toggles nameplate power between hp and kW', () => {
      component.toggleUserSelectedHP();
      expect(item.form.controls.userSelectedHP.value).toBeFalse();
      component.toggleUserSelectedHP();
      expect(item.form.controls.userSelectedHP.value).toBeTrue();
    });
  });

  describe('validation messages', () => {
    it('states the power factor lower limit', () => {
      item.form.controls.multimeterData.controls.powerFactor.setValue(0);
      fixture.detectChanges();

      expect(field('powerFactor').parentElement.textContent).toContain('Value must be greater than 0');
    });

    it('states only the lower limit for a negative power factor', () => {
      const input = field('powerFactor') as HTMLInputElement;
      input.value = '-1';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(input.parentElement.textContent).toContain('Value must be greater than 0');
      expect(input.parentElement.textContent).not.toContain("can't be less than");
      expect(input.parentElement.querySelectorAll('.alert-danger').length).toBe(1);
    });

    it('states the upper limit and a missing value', () => {
      const input = field('powerFactor') as HTMLInputElement;
      const type = (value: string): void => {
        input.value = value;
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
      };

      type('1.5');
      expect(input.parentElement.textContent).toContain("Value can't be greater than 1");

      type('');
      expect(input.parentElement.textContent).toContain('Value Required');
    });

    it('drops the power factor lower limit message for a value in range or above it', () => {
      item.form.controls.multimeterData.controls.powerFactor.setValue(1);
      fixture.detectChanges();
      expect(field('powerFactor').parentElement.textContent).not.toContain('greater than 0');

      item.form.controls.multimeterData.controls.powerFactor.setValue(1.5);
      fixture.detectChanges();
      expect(field('powerFactor').parentElement.textContent).not.toContain('greater than 0');
    });
  });

  describe('differing fields', () => {
    it('highlights nested fields that differ from baseline', () => {
      fixture.componentRef.setInput('differingFields', new Set(['multimeterData.supplyVoltage']));
      fixture.detectChanges();

      expect(field('supplyVoltage').closest('.input-group').classList).toContain('indicate-different');
      expect(field('averageCurrent').closest('.input-group').classList).not.toContain('indicate-different');
    });
  });
});
