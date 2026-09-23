import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { CoolingFormService, LiquidCoolingForm } from './cooling-form.service';
import { LiquidCoolingFormComponent } from './liquid-cooling-form.component';

const SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

describe('LiquidCoolingFormComponent', () => {
  let fixture: ComponentFixture<LiquidCoolingFormComponent>;
  let form: LiquidCoolingForm;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [LiquidCoolingFormComponent],
      providers: [CoolingFormService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    form = TestBed.inject(CoolingFormService).getCoolingForm({ coolingLossType: 'Liquid' }, SETTINGS) as LiquidCoolingForm;
    fixture = TestBed.createComponent(LiquidCoolingFormComponent);
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
    form.controls.density.setValue(-1);
    fixture.detectChanges();

    expect(form.controls.density.invalid).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Density must be equal or greater than 0');
  });

  it('requires a flow rate', () => {
    expect(form.controls.flowRate.hasError('required')).toBeTrue();
  });
});
