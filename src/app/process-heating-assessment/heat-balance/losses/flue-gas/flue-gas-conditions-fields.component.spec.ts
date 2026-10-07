import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { ModalDialogService } from '../../../../shared/modal-dialog.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasConditionsFieldsComponent } from './flue-gas-conditions-fields.component';
import { FlueGasFormService, FlueGasVolumeForm, OxygenCalculationMethod } from './flue-gas-form.service';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

describe('FlueGasConditionsFieldsComponent', () => {
  let fixture: ComponentFixture<FlueGasConditionsFieldsComponent>;
  let component: FlueGasConditionsFieldsComponent;
  let formService: FlueGasFormService;
  let modalDialogServiceSpy: jasmine.SpyObj<ModalDialogService>;
  let closed$: Subject<number | undefined>;

  beforeEach(async () => {
    closed$ = new Subject<number | undefined>();
    modalDialogServiceSpy = jasmine.createSpyObj('ModalDialogService', ['openModal']);
    modalDialogServiceSpy.openModal.and.returnValue({ closed: closed$.asObservable() } as never);
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FlueGasConditionsFieldsComponent],
      providers: [FlueGasFormService, ConvertUnitsService, { provide: ModalDialogService, useValue: modalDialogServiceSpy }],
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

  describe('openMoistureModal', () => {
    it('opens the dialog with the current settings', () => {
      render(OxygenCalculationMethod.ExcessAir);

      component.openMoistureModal();

      expect(modalDialogServiceSpy.openModal.calls.mostRecent().args[1]?.data).toEqual({ settings: MOCK_SETTINGS });
    });

    it('applies the calculated moisture rounded to 2 decimals', () => {
      const form = render(OxygenCalculationMethod.ExcessAir);
      component.openMoistureModal();

      closed$.next(1.23456);

      expect(form.controls.moistureInAirCombustion.value).toBe(1.23);
    });

    it('applies a calculated moisture of 0', () => {
      const form = render(OxygenCalculationMethod.ExcessAir);
      form.patchValue({ moistureInAirCombustion: 5 });
      component.openMoistureModal();

      closed$.next(0);

      expect(form.controls.moistureInAirCombustion.value).toBe(0);
    });

    it('leaves the field unchanged when the dialog is cancelled', () => {
      const form = render(OxygenCalculationMethod.ExcessAir);
      form.patchValue({ moistureInAirCombustion: 5 });
      component.openMoistureModal();

      closed$.next(undefined);

      expect(form.controls.moistureInAirCombustion.value).toBe(5);
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
