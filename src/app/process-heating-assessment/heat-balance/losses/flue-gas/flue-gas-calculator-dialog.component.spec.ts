import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SigFigsPipe } from '../../../../shared/shared-pipes/sig-figs.pipe';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasCalculationService } from './flue-gas-calculation.service';
import { FlueGasCalculatorDialogComponent } from './flue-gas-calculator-dialog.component';
import { FlueGasFormService, FlueGasMassForm, FlueGasType, FlueGasVolumeForm, isFlueGasMassForm } from './flue-gas-form.service';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const VOLUME_COMPOSITION = { CH4: 100, C2H6: 0, N2: 0, H2: 0, C3H8: 0, C4H10_CnH2n: 0, H2O: 0, CO: 0, CO2: 0, SO2: 0, O2: 0 };
const MASS_ANALYSIS = { carbon: 70, hydrogen: 5, sulphur: 2, inertAsh: 2, o2: 8, moisture: 5, nitrogen: 8 };

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
      declarations: [FlueGasCalculatorDialogComponent, SigFigsPipe],
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

  describe('recalculation', () => {
    const volumeForm = (): FlueGasVolumeForm => component.form() as FlueGasVolumeForm;

    it('calculates by volume from the form values and updates the result', () => {
      volumeForm().patchValue(VOLUME_COMPOSITION);

      expect(calculationServiceSpy.calculateByVolume.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({ CH4: 100 }));
      expect(component.result()?.availableHeat).toBe(78.5);
    });

    it('refreshes the result when an input changes again', () => {
      volumeForm().patchValue(VOLUME_COMPOSITION);
      calculationServiceSpy.calculateByVolume.and.returnValue({ availableHeat: 80, calculatedFlueGasO2: 3, calculatedExcessAir: 15 });

      volumeForm().patchValue({ flueGasTemperature: 500 });

      expect(calculationServiceSpy.calculateByVolume.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({ flueGasTemperature: 500 }));
      expect(component.result()?.availableHeat).toBe(80);
    });

    it('clears the result when the form becomes invalid', () => {
      volumeForm().patchValue(VOLUME_COMPOSITION);

      volumeForm().patchValue({ CH4: 150 });

      expect(component.result()).toBeNull();
    });

    it('derives O2 and excess air before calculating by mass', () => {
      component.switchType(FlueGasType.ByMass);
      const massForm = component.form() as FlueGasMassForm;

      massForm.patchValue(MASS_ANALYSIS);

      expect(calculationServiceSpy.deriveOxygenAndExcessAir).toHaveBeenCalled();
      expect(massForm.controls.o2InFlueGas.value).toBe(3);
      expect(calculationServiceSpy.calculateByMass).toHaveBeenCalled();
      expect(component.result()?.availableHeat).toBe(70);
    });

    it('recalculates after switching back to by volume', () => {
      component.switchType(FlueGasType.ByMass);
      component.switchType(FlueGasType.ByVolume);

      volumeForm().patchValue(VOLUME_COMPOSITION);

      expect(component.result()?.availableHeat).toBe(78.5);
    });

    it('ignores changes to a discarded form', () => {
      const discardedForm = volumeForm();
      component.switchType(FlueGasType.ByMass);
      calculationServiceSpy.calculateByVolume.calls.reset();

      discardedForm.patchValue(VOLUME_COMPOSITION);

      expect(calculationServiceSpy.calculateByVolume).not.toHaveBeenCalled();
    });

    it('renders the available heat once a result exists', () => {
      volumeForm().patchValue(VOLUME_COMPOSITION);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('dl, .loss-results').textContent).toContain('78.5');
    });
  });
});
