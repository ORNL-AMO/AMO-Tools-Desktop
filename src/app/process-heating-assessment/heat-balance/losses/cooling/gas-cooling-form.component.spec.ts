import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { CoolingFormService, GasCoolingForm } from './cooling-form.service';
import { GasCoolingFormComponent } from './gas-cooling-form.component';

const SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

describe('GasCoolingFormComponent', () => {
  let fixture: ComponentFixture<GasCoolingFormComponent>;
  let form: GasCoolingForm;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [GasCoolingFormComponent],
      providers: [CoolingFormService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    form = TestBed.inject(CoolingFormService).getCoolingForm({ coolingLossType: 'Gas' }, SETTINGS) as GasCoolingForm;
    fixture = TestBed.createComponent(GasCoolingFormComponent);
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('settings', SETTINGS);
    fixture.componentRef.setInput('instanceId', 'instance-1');
    fixture.detectChanges();
  });

  it('shows no warnings for valid defaults', () => {
    expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
  });

  it('shows the legacy temperature warning when inlet exceeds outlet', () => {
    form.patchValue({ inletTemp: 500, outletTemp: 100 });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Inlet temperature is greater than outlet temperature');
  });

  it('shows the legacy density warning and marks the value invalid when negative', () => {
    form.controls.gasDensity.setValue(-1);
    fixture.detectChanges();

    expect(form.controls.gasDensity.invalid).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Gas Density must be equal or greater than 0');
  });

  it('requires a flow rate', () => {
    expect(form.controls.flowRate.hasError('required')).toBeTrue();
  });

  describe('compare indicators', () => {
    const group = (id: string): HTMLElement => fixture.nativeElement.querySelector(`[id="${id}"]`).closest('.input-group');

    it('highlights fields listed as differing from baseline', () => {
      fixture.componentRef.setInput('differingFields', new Set(['gasCoolingLoss.specificHeat']));
      fixture.detectChanges();

      expect(group('specificHeat_instance-1').classList).toContain('indicate-different');
    });

    it('leaves fields that match baseline unhighlighted', () => {
      fixture.componentRef.setInput('differingFields', new Set(['gasCoolingLoss.specificHeat']));
      fixture.detectChanges();

      expect(group('gasDensity_instance-1').classList).not.toContain('indicate-different');
    });

    it('keys the outlet temperature indicator to finalTemperature, the value the form loads', () => {
      fixture.componentRef.setInput('differingFields', new Set(['gasCoolingLoss.finalTemperature']));
      fixture.detectChanges();

      expect(group('outletTemp_instance-1').classList).toContain('indicate-different');
    });

    it('does not highlight the outlet temperature for outletTemperature alone', () => {
      fixture.componentRef.setInput('differingFields', new Set(['gasCoolingLoss.outletTemperature']));
      fixture.detectChanges();

      expect(group('outletTemp_instance-1').classList).not.toContain('indicate-different');
    });

    it('highlights nothing without differing fields', () => {

      expect(fixture.nativeElement.querySelector('.indicate-different')).toBeNull();
    });

    it('ignores differences that belong to another material type', () => {
      fixture.componentRef.setInput('differingFields', new Set(['liquidCoolingLoss.specificHeat']));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.indicate-different')).toBeNull();
    });
  });
});
