import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasConditionsFieldsComponent } from './flue-gas-conditions-fields.component';
import { FlueGasFormService, FlueGasVolumeForm, OxygenCalculationMethod } from './flue-gas-form.service';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

describe('FlueGasConditionsFieldsComponent', () => {
  let fixture: ComponentFixture<FlueGasConditionsFieldsComponent>;
  let component: FlueGasConditionsFieldsComponent;
  let formService: FlueGasFormService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FlueGasConditionsFieldsComponent],
      providers: [FlueGasFormService, ConvertUnitsService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    formService = TestBed.inject(FlueGasFormService);
  });

  function render(method: OxygenCalculationMethod): FlueGasVolumeForm {
    const form = formService.getFlueGasVolumeForm({}, MOCK_SETTINGS);
    form.controls.oxygenCalculationMethod.setValue(method);
    fixture = TestBed.createComponent(FlueGasConditionsFieldsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('instanceId', 'instance-1');
    fixture.detectChanges();
    return form;
  }

  describe('changeOxygenCalculationMethod', () => {
    it('zeroes both O2 and excess air so only the new method is entered', () => {
      const form = render(OxygenCalculationMethod.ExcessAir);
      form.patchValue({ o2InFlueGas: 4, excessAirPercentage: 25 });

      component.changeOxygenCalculationMethod();

      expect(form.controls.o2InFlueGas.value).toBe(0);
      expect(form.controls.excessAirPercentage.value).toBe(0);
    });
  });

  describe('template visibility', () => {
    it('shows excess air and hides O2 for the Excess Air method', () => {
      render(OxygenCalculationMethod.ExcessAir);

      expect(fixture.nativeElement.querySelector('[formControlName="excessAirPercentage"]')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('[formControlName="o2InFlueGas"]')).toBeNull();
    });

    it('shows O2 and hides excess air for the Oxygen in Flue Gas method', () => {
      render(OxygenCalculationMethod.OxygenInFlueGas);

      expect(fixture.nativeElement.querySelector('[formControlName="o2InFlueGas"]')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('[formControlName="excessAirPercentage"]')).toBeNull();
    });

    it('suffixes control ids with the instance id', () => {
      render(OxygenCalculationMethod.ExcessAir);

      expect(fixture.nativeElement.querySelector('#flueGasTemperature_instance-1')).not.toBeNull();
    });
  });
});
