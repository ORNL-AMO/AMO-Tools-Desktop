import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AuxiliaryPowerLoss } from '../../../../shared/models/phast/losses/auxiliaryPowerLoss';
import { Settings } from '../../../../shared/models/settings';
import { AuxiliaryPowerFormComponent } from './auxiliary-power-form.component';
import { AuxiliaryPowerFormService } from './auxiliary-power-form.service';
import { AuxiliaryPowerItem } from './auxiliary-power.service';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;

function makeItem(formService: AuxiliaryPowerFormService, overrides: Partial<AuxiliaryPowerLoss> = {}): AuxiliaryPowerItem {
  return {
    id: 'item-1',
    name: 'Loss #1',
    collapse: false,
    heatLoss: null,
    form: formService.getAuxiliaryPowerForm({
      motorPhase: 3, supplyVoltage: 460, avgCurrent: 20, powerFactor: 0.85, operatingTime: 80, ...overrides,
    }),
  };
}

describe('AuxiliaryPowerFormComponent', () => {
  let component: AuxiliaryPowerFormComponent;
  let fixture: ComponentFixture<AuxiliaryPowerFormComponent>;
  let formService: AuxiliaryPowerFormService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AuxiliaryPowerFormComponent],
      providers: [AuxiliaryPowerFormService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    formService = TestBed.inject(AuxiliaryPowerFormService);
    fixture = TestBed.createComponent(AuxiliaryPowerFormComponent);
    component = fixture.componentInstance;
  });

  function render(item: AuxiliaryPowerItem = makeItem(formService)): void {
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

    it('starts with no voltage warning for a valid value', () => {
      render();

      expect(component.warnings().voltageWarning).toBeNull();
    });

    it('computes the warning immediately for an out-of-range value', () => {
      render(makeItem(formService, { supplyVoltage: 500 }));

      expect(component.warnings().voltageWarning).toContain('less than 480 V');
    });
  });

  describe('warning observer', () => {
    it('sets the voltage warning when supply voltage exceeds 480 V', () => {
      render();

      component.form().controls.supplyVoltage.setValue(500);

      expect(component.warnings().voltageWarning).not.toBeNull();
    });

    it('clears the voltage warning once the value is corrected', () => {
      render(makeItem(formService, { supplyVoltage: 500 }));

      component.form().controls.supplyVoltage.setValue(460);

      expect(component.warnings().voltageWarning).toBeNull();
    });
  });

  describe('template visibility', () => {
    it('hides the warning for a valid value', () => {
      render();

      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
    });

    it('shows the voltage warning for an out-of-range value', () => {
      render(makeItem(formService, { supplyVoltage: 500 }));

      expect(fixture.nativeElement.querySelector('.alert-warning').textContent).toContain('less than 480 V');
    });

    it('marks the supply voltage group invalid when it is empty', () => {
      render(makeItem(formService, { supplyVoltage: undefined }));

      expect(fixture.nativeElement.querySelector(`[id="${component.controlIds().supplyVoltage}"]`).closest('.input-group').classList).toContain('invalid');
    });

    it('renders single and three phase options', () => {
      render();

      expect(fixture.nativeElement.querySelectorAll('select option').length).toBe(2);
    });
  });

  describe('destroy', () => {
    it('stops updating warnings after the component is destroyed', () => {
      render();
      fixture.destroy();

      component.form().controls.supplyVoltage.setValue(500);

      expect(component.warnings().voltageWarning).toBeNull();
    });
  });
});
