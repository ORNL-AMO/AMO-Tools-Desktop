import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Directive, NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { CondensingEconomizerFormComponent } from './condensing-economizer-form.component';
import { CondensingEconomizerService } from '../condensing-economizer.service';
import { CondensingEconomizerFormService } from '../condensing-economizer-form.service';
import { FlueGasMaterialDbService } from '../../../../indexedDb/flue-gas-material-db.service';
import { PhastService } from '../../../../phast/phast.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasMaterial } from '../../../../shared/models/materials';
import { OperatingHours } from '../../../../shared/models/operations';
import { CondensingEconomizerInput } from '../../../../shared/models/steam/condensingEconomizer';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

// Stands in for ngx-bootstrap's ModalDirective so `#materialModal="bs-modal"` resolves.
@Directive({
  selector: '[bsModal]',
  exportAs: 'bs-modal',
  standalone: false,
})
class BsModalStubDirective {
  isShown = false;
  show = jasmine.createSpy('show').and.callFake(() => this.isShown = true);
  hide = jasmine.createSpy('hide').and.callFake(() => this.isShown = false);
}

function makeSettings(unitsOfMeasure: string = 'Imperial'): Settings {
  return {
    unitsOfMeasure,
    steamTemperatureMeasurement: unitsOfMeasure == 'Metric' ? 'C' : 'F',
  } as Settings;
}

function makeMaterial(id: number, substance: string): FlueGasMaterial {
  return {
    id, substance,
    C2H6: 3.1, C3H8: 0.4, C4H10_CnH2n: 0.1, CH4: 94.1, CO: 0.1, CO2: 0.5, H2: 0.1, H2O: 0, N2: 1.4, O2: 0.2, SO2: 0,
    heatingValue: 22030, heatingValueVolume: 1032, specificGravity: 0.57,
  };
}

const MATERIALS: Array<FlueGasMaterial> = [makeMaterial(1, 'Natural Gas'), makeMaterial(2, 'Coke Oven Gas')];

function makeInput(overrides: Partial<CondensingEconomizerInput> = {}): CondensingEconomizerInput {
  return {
    operatingHours: 8000,
    fuelCost: 5,
    materialTypeId: 1,
    oxygenCalculationMethod: 'Oxygen in Flue Gas',
    flueGasTemperature: 300,
    modifiedFlueGasTemperature: 100,
    combustionAirTemperature: 80,
    fuelTemp: 65,
    flueGasO2: 3,
    ambientAirTemperature: 80,
    moistureInCombustionAir: 1,
    heatInput: 50,
    excessAir: 15,
    substance: undefined,
    CH4: undefined, C2H6: undefined, N2: undefined, H2: undefined, C3H8: undefined, C4H10_CnH2n: undefined,
    H2O: undefined, CO: undefined, CO2: undefined, SO2: undefined, O2: undefined,
    ...overrides,
  };
}

const UNIT_CASES: Array<{ field: string, imperial: Array<string>, metric: Array<string> }> = [
  { field: 'fuelCost', imperial: ['$/MMBtu'], metric: ['$/GJ'] },
  { field: 'heatInput', imperial: ['MMBtu/hr'], metric: ['kJ/hr'] },
  { field: 'flueGasTemperature', imperial: ['F'], metric: ['C'] },
  { field: 'modifiedFlueGasTemperature', imperial: ['F'], metric: ['C'] },
];

const EXCESS_AIR = { oxygenCalculationMethod: 'Excess Air' };

const ERROR_CASES: Array<{ field: string, value: number, message: string, input?: Partial<CondensingEconomizerInput> }> = [
  { field: 'operatingHours', value: null, message: 'Value required.' },
  { field: 'operatingHours', value: 9000, message: "Value can't be greater than 8760." },
  { field: 'operatingHours', value: -1, message: "Value can't be less than 0." },
  { field: 'fuelCost', value: null, message: 'Value Required' },
  { field: 'fuelCost', value: -1, message: "Value can't be less than 0." },
  { field: 'heatInput', value: null, message: 'Value Required' },
  { field: 'heatInput', value: -1, message: "Value can't be less than 0 MMBtu/hr ." },
  { field: 'flueGasTemperature', value: null, message: 'Value Required' },
  { field: 'modifiedFlueGasTemperature', value: null, message: 'Value Required' },
  { field: 'modifiedFlueGasTemperature', value: 200, message: 'For all practical systems this temperature cannot be higher than 130 F .' },
  { field: 'flueGasO2', value: null, message: 'Value Required' },
  { field: 'excessAir', value: null, message: 'Value Required', input: EXCESS_AIR },
  { field: 'excessAir', value: 0, message: 'Value must be greater than than 0.', input: EXCESS_AIR },
  { field: 'combustionAirTemperature', value: null, message: 'Value Required' },
  { field: 'moistureInCombustionAir', value: null, message: 'Value Required' },
  { field: 'moistureInCombustionAir', value: 101, message: "Value can't be greater than 100 %." },
  { field: 'moistureInCombustionAir', value: -1, message: "Value can't be less than 0 %." },
  { field: 'fuelTemp', value: null, message: 'Value Required' },
  { field: 'ambientAirTemperature', value: null, message: 'Value Required' },
];

const WARNING_CASES: Array<{ field: string, value: number, message: string }> = [
  { field: 'moistureInCombustionAir', value: 5, message: 'Moisture In Combustion Air is usually 1 or lower' },
  { field: 'flueGasO2', value: 25, message: 'Oxygen levels in Flue Gas must be greater than or equal to 0 and less than 21 percent' },
];

describe('CondensingEconomizerFormComponent', () => {
  let component: CondensingEconomizerFormComponent;
  let fixture: ComponentFixture<CondensingEconomizerFormComponent>;
  let serviceStub: Partial<CondensingEconomizerService>;
  let phastSpy: jasmine.SpyObj<PhastService>;
  let materialDbStub: Partial<FlueGasMaterialDbService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getInput(field: string): HTMLInputElement | null {
    return fixture.nativeElement.querySelector(`#${field}`);
  }

  function getFormGroup(field: string): HTMLElement {
    return getInput(field).closest('.form-group') as HTMLElement;
  }

  function normalize(el: Element): string {
    return el.textContent.replace(/\s+/g, ' ').trim();
  }

  function getUnitTexts(field: string): Array<string> {
    return Array.from(getFormGroup(field).querySelectorAll('.input-group-addon.units:not(.op-hour-addon)')).map(normalize);
  }

  function getErrorTexts(field: string): Array<string> {
    const alert = getFormGroup(field).querySelector('.alert-danger');
    if (!alert) {
      return [];
    }
    return Array.from(alert.querySelectorAll(':scope > span')).map(normalize);
  }

  function getWarning(field: string): HTMLElement | null {
    return getFormGroup(field).querySelector('.alert-warning');
  }

  function optionTexts(field: string): Array<string> {
    return Array.from(getInput(field).querySelectorAll('option')).map(normalize);
  }

  function createComponent(input: CondensingEconomizerInput = makeInput(), settings: Settings = makeSettings()): void {
    serviceStub.condensingEconomizerInput.next(input);
    fixture = TestBed.createComponent(CondensingEconomizerFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', settings);
    fixture.detectChanges();
  }

  function setDirtyValue(field: string, value: number): void {
    component.form.controls[field].setValue(value);
    component.form.controls[field].markAsDirty();
    component.calculate();
    fixture.detectChanges();
  }

  function materialModal(): BsModalStubDirective {
    return component.materialModal as unknown as BsModalStubDirective;
  }

  beforeEach(async () => {
    serviceStub = {
      condensingEconomizerInput: new BehaviorSubject<CondensingEconomizerInput>(undefined),
      resetData: new BehaviorSubject<boolean>(undefined),
      generateExample: new BehaviorSubject<boolean>(undefined),
      modalOpen: new BehaviorSubject<boolean>(false),
      currentField: new BehaviorSubject<string>(undefined),
    };
    phastSpy = jasmine.createSpyObj('PhastService', ['flueGasCalculateExcessAir', 'flueGasCalculateO2']);
    phastSpy.flueGasCalculateExcessAir.and.returnValue(30.5);
    phastSpy.flueGasCalculateO2.and.returnValue(4.2);
    materialDbStub = { dbFlueGasMaterials: new BehaviorSubject<Array<FlueGasMaterial>>(MATERIALS) };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CondensingEconomizerFormComponent, SettingsLabelStubPipe, BsModalStubDirective],
      providers: [
        CondensingEconomizerFormService,
        UntypedFormBuilder,
        ConvertUnitsService,
        { provide: CondensingEconomizerService, useValue: serviceStub },
        { provide: PhastService, useValue: phastSpy },
        { provide: FlueGasMaterialDbService, useValue: materialDbStub },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  describe('initialization', () => {
    it('builds the form from the service input', () => {
      createComponent();
      expect(component.form.controls.operatingHours.value).toBe(8000);
      expect(getInput('operatingHours').value).toBe('8000');
    });

    it('disables the oxygen calculation method', () => {
      createComponent();
      expect(component.form.controls.oxygenCalculationMethod.disabled).toBeTrue();
    });

    it('patches the material composition from the selected fuel', () => {
      createComponent();
      expect(component.form.controls.CH4.value).toBe(94.1);
      expect(component.form.controls.substance.value).toBe('Natural Gas');
    });

    it('does not patch material properties when the fuel is not found', () => {
      createComponent(makeInput({ materialTypeId: 99 }));
      expect(component.form.controls.CH4.value).toBeNull();
    });

    it('publishes the calculated input to the service', () => {
      createComponent();
      expect(serviceStub.condensingEconomizerInput.getValue()).toEqual(jasmine.objectContaining({ operatingHours: 8000, excessAir: 30.5, CH4: 94.1 }));
    });

    it('rebuilds the form when data is reset', () => {
      createComponent();
      serviceStub.condensingEconomizerInput.next(makeInput({ operatingHours: 250 }));
      serviceStub.resetData.next(true);
      fixture.detectChanges();
      expect(getInput('operatingHours').value).toBe('250');
    });

    it('rebuilds the form when an example is generated', () => {
      createComponent();
      serviceStub.condensingEconomizerInput.next(makeInput({ heatInput: 70 }));
      serviceStub.generateExample.next(true);
      fixture.detectChanges();
      expect(getInput('heatInput').value).toBe('70');
    });
  });

  describe('dropdown options', () => {
    it('renders one fuel option per material', () => {
      createComponent();
      expect(optionTexts('materialTypeId')).toEqual(['Natural Gas', 'Coke Oven Gas']);
    });

    it('updates the fuel options when the materials change', () => {
      createComponent();
      materialDbStub.dbFlueGasMaterials.next([makeMaterial(3, 'Propane')]);
      fixture.detectChanges();
      expect(optionTexts('materialTypeId')).toEqual(['Propane']);
    });

    it('renders no fuel options when there are no materials', () => {
      materialDbStub.dbFlueGasMaterials.next([]);
      createComponent();
      expect(optionTexts('materialTypeId')).toEqual([]);
    });

    it('renders the calculation method options', () => {
      createComponent();
      expect(optionTexts('oxygenCalculationMethod')).toEqual(['Excess Air', 'Oxygen in Flue Gas']);
    });
  });

  describe('units', () => {
    UNIT_CASES.forEach(({ field, imperial, metric }) => {
      it(`shows the imperial unit for ${field}`, () => {
        createComponent(makeInput(), makeSettings('Imperial'));
        expect(getUnitTexts(field)).toEqual(imperial);
      });

      it(`shows the metric unit for ${field}`, () => {
        createComponent(makeInput(), makeSettings('Metric'));
        expect(getUnitTexts(field)).toEqual(metric);
      });
    });

    it('shows no unit text for unit-system dependent fields with an unknown unit system', () => {
      createComponent(makeInput(), { ...makeSettings(), unitsOfMeasure: 'Other' } as Settings);
      expect(getUnitTexts('fuelCost')).toEqual(['']);
      expect(getUnitTexts('heatInput')).toEqual(['']);
    });
  });

  describe('oxygen calculation method', () => {
    it('shows the O2 input and hides excess air for the oxygen method', () => {
      createComponent();
      expect(component.calcMethodExcessAir).toBeFalse();
      expect(getInput('flueGasO2')).not.toBeNull();
      expect(getInput('excessAir')).toBeNull();
    });

    it('shows the excess air input and calculated O2 for the excess air method', () => {
      createComponent(makeInput(EXCESS_AIR));
      expect(component.calcMethodExcessAir).toBeTrue();
      expect(getInput('excessAir')).not.toBeNull();
      expect(getInput('flueGasO2')).toBeNull();
      expect(normalize(getFormGroup('excessAir').querySelector('.text-center'))).toBe('04.20 %');
    });

    it('switches to the excess air inputs when the method changes', () => {
      createComponent();
      component.form.controls.oxygenCalculationMethod.setValue('Excess Air');
      component.changeMethod();
      fixture.detectChanges();
      expect(getInput('excessAir')).not.toBeNull();
      expect(getInput('flueGasO2')).toBeNull();
    });

    it('calculates excess air from a valid O2 value', () => {
      createComponent();
      expect(phastSpy.flueGasCalculateExcessAir).toHaveBeenCalledWith(jasmine.objectContaining({ o2InFlueGas: 3, CH4: 94.1 }));
      expect(component.calculationExcessAir).toBe(30.5);
      expect(component.form.controls.excessAir.value).toBe(30.5);
    });

    it('zeroes excess air when the O2 value is invalid', () => {
      createComponent(makeInput({ flueGasO2: null }));
      expect(component.calculationExcessAir).toBe(0);
      expect(component.form.controls.excessAir.value).toBe(0);
    });

    it('calculates O2 from a valid excess air value', () => {
      createComponent(makeInput(EXCESS_AIR));
      expect(phastSpy.flueGasCalculateO2).toHaveBeenCalledWith(jasmine.objectContaining({ excessAir: 15 }));
      expect(component.form.controls.flueGasO2.value).toBe(4.2);
    });

    it('zeroes O2 when the excess air value is invalid', () => {
      createComponent(makeInput({ ...EXCESS_AIR, excessAir: 0 }));
      expect(component.calculationFlueGasO2).toBe(0);
      expect(component.form.controls.flueGasO2.value).toBe(0);
    });
  });

  describe('validation errors', () => {
    ERROR_CASES.forEach(({ field, value, message, input }) => {
      it(`shows only "${message}" for ${field} = ${value}`, () => {
        createComponent(makeInput(input));
        setDirtyValue(field, value);
        expect(getErrorTexts(field)).toEqual([message]);
      });
    });

    it('shows the metric new flue gas temperature maximum', () => {
      createComponent(makeInput({ modifiedFlueGasTemperature: 40 }), makeSettings('Metric'));
      setDirtyValue('modifiedFlueGasTemperature', 100);
      expect(getErrorTexts('modifiedFlueGasTemperature')).toEqual(['For all practical systems this temperature cannot be higher than 54 C .']);
    });

    it('hides errors for an invalid but pristine field', () => {
      createComponent(makeInput({ fuelCost: null }));
      expect(component.form.controls.fuelCost.invalid).toBeTrue();
      expect(getErrorTexts('fuelCost')).toEqual([]);
    });

    it('hides errors for a valid dirty field', () => {
      createComponent();
      setDirtyValue('fuelCost', 3);
      expect(getErrorTexts('fuelCost')).toEqual([]);
    });
  });

  describe('warnings', () => {
    WARNING_CASES.forEach(({ field, value, message }) => {
      it(`shows the ${field} warning for ${value}`, () => {
        createComponent();
        setDirtyValue(field, value);
        expect(normalize(getWarning(field))).toBe(message);
      });

      it(`hides the ${field} warning for a typical value`, () => {
        createComponent();
        expect(getWarning(field)).toBeNull();
      });
    });

    it('hides the O2 warning with the excess air method even when the O2 value is out of range', () => {
      createComponent(makeInput(EXCESS_AIR));
      phastSpy.flueGasCalculateO2.and.returnValue(25);
      component.calcExcessAir();
      fixture.detectChanges();
      expect(component.warnings.o2Warning).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
    });
  });

  describe('user actions', () => {
    it('focusField publishes the current field', () => {
      createComponent();
      component.focusField('heatInput');
      expect(serviceStub.currentField.getValue()).toBe('heatInput');
    });

    it('calculate publishes the updated input', () => {
      createComponent();
      component.form.controls.operatingHours.setValue(4000);
      component.calculate();
      expect(serviceStub.condensingEconomizerInput.getValue().operatingHours).toBe(4000);
    });
  });

  describe('operating hours modal', () => {
    it('is hidden by default', () => {
      createComponent();
      expect(query('app-operating-hours-modal')).toBeNull();
    });

    it('opens and closes', () => {
      createComponent();
      component.openOperatingHoursModal();
      fixture.detectChanges();
      expect(query('app-operating-hours-modal')).not.toBeNull();
      component.closeOperatingHoursModal();
      fixture.detectChanges();
      expect(query('app-operating-hours-modal')).toBeNull();
    });

    it('applies the selected operating hours and closes', () => {
      createComponent();
      component.openOperatingHoursModal();
      component.updateOperatingHours({ hoursPerYear: 4000 } as OperatingHours);
      fixture.detectChanges();
      expect(component.form.controls.operatingHours.value).toBe(4000);
      expect(serviceStub.condensingEconomizerInput.getValue().operatingHours).toBe(4000);
      expect(query('app-operating-hours-modal')).toBeNull();
    });
  });

  describe('material modal', () => {
    it('hides the material form until the modal is shown', () => {
      createComponent();
      expect(query('app-flue-gas-material')).toBeNull();
    });

    it('shows the material form and flags the modal open', () => {
      createComponent();
      component.showMaterialModal();
      fixture.detectChanges();
      expect(materialModal().show).toHaveBeenCalled();
      expect(serviceStub.modalOpen.getValue()).toBeTrue();
      expect(query('app-flue-gas-material')).not.toBeNull();
    });

    it('closes the modal and keeps the current fuel selection when a new material is returned', () => {
      createComponent();
      component.showMaterialModal();
      component.hideMaterialModal({ substance: 'Coke Oven Gas' });
      fixture.detectChanges();
      expect(component.form.controls.materialTypeId.value).toBe(1);
      expect(materialModal().hide).toHaveBeenCalled();
      expect(serviceStub.modalOpen.getValue()).toBeFalse();
      expect(query('app-flue-gas-material')).toBeNull();
    });

    it('closes the modal when closed without a selection', () => {
      createComponent();
      component.showMaterialModal();
      component.hideMaterialModal();
      expect(materialModal().hide).toHaveBeenCalled();
      expect(serviceStub.modalOpen.getValue()).toBeFalse();
    });
  });

  describe('destroy', () => {
    it('stops rebuilding the form after destroy', () => {
      createComponent();
      const form = component.form;
      fixture.destroy();
      serviceStub.resetData.next(true);
      serviceStub.generateExample.next(true);
      expect(component.form).toBe(form);
    });

    it('stops tracking fuel options after destroy', () => {
      createComponent();
      fixture.destroy();
      materialDbStub.dbFlueGasMaterials.next([]);
      expect(component.fuelOptions).toEqual(MATERIALS);
    });
  });
});
