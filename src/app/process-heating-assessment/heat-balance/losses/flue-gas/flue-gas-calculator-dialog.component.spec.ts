import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasCalculationService } from './flue-gas-calculation.service';
import { FlueGasCalculatorDialogComponent } from './flue-gas-calculator-dialog.component';
import { FlueGasFormService, FlueGasType, FlueGasVolumeForm, isFlueGasMassForm } from './flue-gas-form.service';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

describe('FlueGasCalculatorDialogComponent', () => {
  let fixture: ComponentFixture<FlueGasCalculatorDialogComponent>;
  let component: FlueGasCalculatorDialogComponent;
  let dialogRefSpy: jasmine.SpyObj<DialogRef<number>>;
  let calculationServiceSpy: jasmine.SpyObj<FlueGasCalculationService>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);
    calculationServiceSpy = jasmine.createSpyObj('FlueGasCalculationService', ['calculateByVolume', 'calculateByMass', 'deriveOxygenAndExcessAir']);
    calculationServiceSpy.calculateByVolume.and.returnValue({ availableHeat: 78.5, calculatedFlueGasO2: 3, calculatedExcessAir: 15 });
    calculationServiceSpy.calculateByMass.and.returnValue({ availableHeat: 70, calculatedFlueGasO2: 3, calculatedExcessAir: 15 });
    calculationServiceSpy.deriveOxygenAndExcessAir.and.returnValue({ o2InFlueGas: 3, excessAirPercentage: 15 });

    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [FlueGasCalculatorDialogComponent],
      providers: [
        ConvertUnitsService,
        { provide: DialogRef, useValue: dialogRefSpy },
        { provide: DIALOG_DATA, useValue: { settings: MOCK_SETTINGS } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(FlueGasCalculatorDialogComponent, { set: { providers: [{ provide: FlueGasCalculationService, useValue: calculationServiceSpy }, FlueGasFormService] } })
      .compileComponents();

    fixture = TestBed.createComponent(FlueGasCalculatorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('starts as a by-volume calculation with no result for the empty form', () => {
    expect(component.flueGasType()).toBe(FlueGasType.ByVolume);
    expect(component.result()).toBeNull();
  });

  it('does not mutate the settings passed in', () => {
    expect(component.settings).not.toBe(MOCK_SETTINGS);
  });

  it('switches to a by-mass form and discards by-volume values', () => {
    (component.form() as FlueGasVolumeForm).patchValue({ CH4: 50 });

    component.switchType(FlueGasType.ByMass);

    expect(isFlueGasMassForm(component.form())).toBeTrue();
  });

  it('closes with the available heat when applied', () => {
    component.result.set({ availableHeat: 78.5, calculatedFlueGasO2: 3, calculatedExcessAir: 15 });

    component.apply();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(78.5);
  });

  it('disables Use Result until a result exists', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.modal-footer .btn-primary');
    expect(button.disabled).toBeTrue();
  });

  it('closes without a value when cancelled', () => {
    component.cancel();

    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });
});

