import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LeakageLoss } from '../../../../shared/models/phast/losses/leakageLoss';
import { Settings } from '../../../../shared/models/settings';
import { GasLeakageFormComponent } from './gas-leakage-form.component';
import { GasLeakageFormService } from './gas-leakage-form.service';
import { GasLeakageItem } from './gas-leakage.service';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;

function makeItem(formService: GasLeakageFormService, overrides: Partial<LeakageLoss> = {}): GasLeakageItem {
  return {
    id: 'item-1',
    name: 'Loss #1',
    collapse: false,
    heatLoss: null,
    form: formService.getGasLeakageForm({
      draftPressure: 0.1,
      openingArea: 2,
      leakageGasTemperature: 1500,
      ambientTemperature: 70,
      specificGravity: 1,
      ...overrides,
    }),
  };
}

describe('GasLeakageFormComponent', () => {
  let component: GasLeakageFormComponent;
  let fixture: ComponentFixture<GasLeakageFormComponent>;
  let formService: GasLeakageFormService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [GasLeakageFormComponent],
      providers: [GasLeakageFormService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    formService = TestBed.inject(GasLeakageFormService);
    fixture = TestBed.createComponent(GasLeakageFormComponent);
    component = fixture.componentInstance;
  });

  function render(item: GasLeakageItem = makeItem(formService)): void {
    fixture.componentRef.setInput('item', item);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  }

  describe('initialization', () => {
    it('exposes the item form', () => {
      const item = makeItem(formService);
      render(item);

      expect(component.form()).toBe(item.form as ReturnType<typeof component.form>);
    });

    it('generates a control id for every form control', () => {
      render();

      expect(Object.keys(component.controlIds())).toEqual(Object.keys(component.form().controls));
    });

    it('starts with no warnings for valid values', () => {
      render();

      expect(component.warnings().openingAreaWarning).toBeNull();
      expect(component.warnings().specificGravityWarning).toBeNull();
      expect(component.warnings().temperatureWarning).toBeNull();
    });

    it('computes warnings immediately for values that are already out of range', () => {
      render(makeItem(formService, { ambientTemperature: 2000 }));

      expect(component.warnings().temperatureWarning).toContain("Ambient Temperature shouldn't be greater");
    });
  });

  describe('warning observer', () => {
    it('sets the temperature warning when ambient temperature exceeds the leaking gas temperature', () => {
      render();

      component.form().controls.ambientTemperature.setValue(2000);

      expect(component.warnings().temperatureWarning).not.toBeNull();
    });

    it('clears the temperature warning once the values are corrected', () => {
      render(makeItem(formService, { ambientTemperature: 2000 }));

      component.form().controls.ambientTemperature.setValue(70);

      expect(component.warnings().temperatureWarning).toBeNull();
    });

    it('sets the specific gravity warning for a negative value', () => {
      render();

      component.form().controls.specificGravity.setValue(-1);

      expect(component.warnings().specificGravityWarning).toContain('Specific Gravity of Flue Gas');
    });
  });

  describe('template visibility', () => {
    it('hides the warnings for valid values', () => {
      render();

      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
    });

    it('shows the temperature warning under ambient temperature', () => {
      render(makeItem(formService, { ambientTemperature: 2000 }));

      expect(fixture.nativeElement.querySelector('.alert-warning').textContent).toContain("Ambient Temperature shouldn't be greater");
    });

    it('shows the specific gravity warning', () => {
      render();
      component.form().controls.specificGravity.setValue(-1);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Specific Gravity of Flue Gas must be equal or greater than 0');
    });

    it('marks the draft pressure group invalid when it is empty', () => {
      render(makeItem(formService, { draftPressure: undefined }));

      expect(fixture.nativeElement.querySelector(`[id="${component.controlIds().draftPressure}"]`).closest('.input-group').classList).toContain('invalid');
    });

    it('does not mark the draft pressure group invalid when it has a value', () => {
      render();

      expect(fixture.nativeElement.querySelector(`[id="${component.controlIds().draftPressure}"]`).closest('.input-group').classList).not.toContain('invalid');
    });
  });

  describe('destroy', () => {
    it('stops updating warnings after the component is destroyed', () => {
      render();
      fixture.destroy();

      component.form().controls.specificGravity.setValue(-1);

      expect(component.warnings().specificGravityWarning).toBeNull();
    });
  });
});
