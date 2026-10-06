import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { EnergyInputEAF } from '../../../../shared/models/phast/losses/energyInputEAF';
import { Settings } from '../../../../shared/models/settings';
import { EnergyInputFormComponent } from './energy-input-form.component';
import { EnergyInputFormService } from './energy-input-form.service';
import { EnergyInputItem } from './energy-input.service';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;

function makeItem(formService: EnergyInputFormService, overrides: Partial<EnergyInputEAF> = {}): EnergyInputItem {
  return {
    id: 'item-1',
    name: 'Loss #1',
    collapse: false,
    heatLoss: null,
    form: formService.getEnergyInputForm({
      naturalGasHeatInput: 10, coalCarbonInjection: 100, coalHeatingValue: 12000, electrodeUse: 50,
      electrodeHeatingValue: 14000, otherFuels: 1, electricityInput: 5000, ...overrides,
    }),
  };
}

describe('EnergyInputFormComponent', () => {
  let component: EnergyInputFormComponent;
  let fixture: ComponentFixture<EnergyInputFormComponent>;
  let formService: EnergyInputFormService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [EnergyInputFormComponent],
      providers: [EnergyInputFormService, ConvertUnitsService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    formService = TestBed.inject(EnergyInputFormService);
    fixture = TestBed.createComponent(EnergyInputFormComponent);
    component = fixture.componentInstance;
  });

  function render(item: EnergyInputItem = makeItem(formService), settings: Settings = MOCK_SETTINGS): void {
    fixture.componentRef.setInput('item', item);
    fixture.componentRef.setInput('settings', settings);
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

    it('starts with the flow rate input hidden', () => {
      render();

      expect(component.showFlowRate()).toBeFalse();
    });
  });

  describe('toggleFlowRate', () => {
    it('shows the flow rate input after toggling', () => {
      render();

      component.toggleFlowRate();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector(`[id="${component.controlIds().flowRateInput}"]`)).not.toBeNull();
    });

    it('hides the flow rate input after toggling twice', () => {
      render();

      component.toggleFlowRate();
      component.toggleFlowRate();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector(`[id="${component.controlIds().flowRateInput}"]`)).toBeNull();
    });
  });

  describe('setHeatInputFromFlowRate', () => {
    it('sets natural gas heat input from the flow rate', () => {
      render();
      component.form().controls.flowRateInput.setValue(1000);

      component.setHeatInputFromFlowRate();

      // 1000 scf/hr * 1020 Btu/scf = 1.02 MMBtu/hr
      expect(component.form().controls.naturalGasHeatInput.value).toBeCloseTo(1.02, 3);
    });

    it('leaves natural gas heat input unchanged when the flow rate is empty', () => {
      render();

      component.setHeatInputFromFlowRate();

      expect(component.form().controls.naturalGasHeatInput.value).toBe(10);
    });
  });

  describe('template visibility', () => {
    it('marks natural gas heat input invalid when negative', () => {
      render(makeItem(formService, { naturalGasHeatInput: -1 }));

      expect(fixture.nativeElement.querySelector(`[id="${component.controlIds().naturalGasHeatInput}"]`).closest('.input-group').classList).toContain('invalid');
    });

    it('shows Imperial units by default', () => {
      render();

      expect(fixture.nativeElement.textContent).toContain('MMBtu/hr');
    });

    it('shows Metric units when settings are Metric', () => {
      render(makeItem(formService), { ...MOCK_SETTINGS, unitsOfMeasure: 'Metric' });

      expect(fixture.nativeElement.textContent).toContain('GJ/hr');
    });
  });
});
