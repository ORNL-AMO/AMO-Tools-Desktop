import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Directive, NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { FeedwaterEconomizerFormComponent } from './feedwater-economizer-form.component';
import { FeedwaterEconomizerService } from '../feedwater-economizer.service';
import { FeedwaterEconomizerFormService } from '../feedwater-economizer-form.service';
import { FlueGasMaterialDbService } from '../../../../indexedDb/flue-gas-material-db.service';
import { PhastService } from '../../../../phast/phast.service';
import { SteamService } from '../../steam.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasMaterial } from '../../../../shared/models/materials';
import { OperatingHours } from '../../../../shared/models/operations';
import { FeedwaterEconomizerInput } from '../../../../shared/models/steam/feedwaterEconomizer';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

// Stands in for ngx-bootstrap's ModalDirective so `#gasMaterialModal="bs-modal"` and `#moistureModal="bs-modal"` resolve.
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
    steamPressureMeasurement: unitsOfMeasure == 'Metric' ? 'kPag' : 'psig',
    fuelCost: 5,
    otherFuelCost: 7,
    electricityCost: 0.1,
    steamCost: 9,
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

function makeInput(overrides: Partial<FeedwaterEconomizerInput> = {}): FeedwaterEconomizerInput {
  return {
    operatingHours: 8000,
    fuelCost: 5,
    materialTypeId: 1,
    oxygenCalculationMethod: 'Oxygen in Flue Gas',
    excessAir: 15,
    flueGasTemperature: 725,
    flueGasO2: 5,
    fuelTemp: 65,
    combustionAirTemperature: 80,
    ambientAirTemperature: 80,
    moistureInCombustionAir: 1,
    energyRateInput: 53,
    steamPressure: 500,
    steamCondition: 1,
    steamTemperature: 500,
    feedWaterTemperature: 225,
    percBlowdown: 4,
    hxEfficiency: 62.5,
    higherHeatingVal: 1032.44,
    ...overrides,
  };
}

const UNIT_CASES: Array<{ field: string, imperial: Array<string>, metric: Array<string> }> = [
  { field: 'higherHeatingVal', imperial: ['Btu/scf'], metric: ['kJ/Nm3'] },
  { field: 'fuelCost', imperial: ['$/MMBtu'], metric: ['$/GJ'] },
  { field: 'energyRateInput', imperial: ['MMBtu/hr'], metric: ['kJ/hr'] },
  { field: 'fuelTemp', imperial: ['F'], metric: ['C'] },
  { field: 'steamPressure', imperial: ['psig'], metric: ['kPag'] },
];

const ERROR_CASES: Array<{ field: string, value: number, message: string, input?: Partial<FeedwaterEconomizerInput> }> = [
  { field: 'operatingHours', value: null, message: 'Value required.' },
  { field: 'operatingHours', value: 9000, message: "Value can't be greater than 8760." },
  { field: 'operatingHours', value: -1, message: "Value can't be less than 0." },
  { field: 'higherHeatingVal', value: null, message: 'Value Required' },
  { field: 'fuelCost', value: null, message: 'Value Required' },
  { field: 'fuelCost', value: -1, message: "Value can't be less than 0." },
  { field: 'fuelTemp', value: null, message: 'Value Required' },
  { field: 'flueGasTemperature', value: null, message: 'Value Required' },
  { field: 'flueGasO2', value: null, message: 'Value Required' },
  { field: 'excessAir', value: null, message: 'Value Required', input: { oxygenCalculationMethod: 'Excess Air' } },
  { field: 'excessAir', value: 0, message: 'Value must be greater than than 0.', input: { oxygenCalculationMethod: 'Excess Air' } },
  { field: 'combustionAirTemperature', value: null, message: 'Value Required' },
  { field: 'ambientAirTemperature', value: null, message: 'Value Required' },
  { field: 'moistureInCombustionAir', value: null, message: 'Value Required' },
  { field: 'moistureInCombustionAir', value: 101, message: "Value can't be greater than 100 %." },
  { field: 'moistureInCombustionAir', value: -1, message: "Value can't be less than 0 %." },
  { field: 'energyRateInput', value: null, message: 'Value Required' },
  { field: 'energyRateInput', value: -1, message: "Value can't be less than 0 MMBtu/hr ." },
  { field: 'steamPressure', value: null, message: 'Value Required' },
  { field: 'steamPressure', value: -1, message: "Value can't be less than 0 psig." },
  { field: 'steamTemperature', value: null, message: 'Value Required', input: { steamCondition: 0 } },
  { field: 'steamTemperature', value: 100, message: "Value can't be less than 212 F", input: { steamCondition: 0 } },
  { field: 'steamTemperature', value: 2000, message: "Value can't be greater than 1472 F.", input: { steamCondition: 0 } },
  { field: 'feedWaterTemperature', value: null, message: 'Value Required' },
  { field: 'feedWaterTemperature', value: 10, message: "Value can't be less than 32 ℉" },
  { field: 'percBlowdown', value: null, message: 'Value Required' },
  { field: 'hxEfficiency', value: null, message: 'Value Required' },
  { field: 'hxEfficiency', value: -1, message: "Value can't be less than 0." },
];

const WARNING_CASES: Array<{ field: string, value: number, message: string }> = [
  { field: 'moistureInCombustionAir', value: 5, message: 'Moisture In Combustion Air is usually 1 or lower' },
  { field: 'percBlowdown', value: 25, message: 'Boiler Blowdown Percentage of Feedwater is usually 20 or lower' },
  { field: 'hxEfficiency', value: 70, message: 'Heat Exchanger Effectiveness is usually between 40 and 65' },
  { field: 'flueGasO2', value: 25, message: 'Oxygen levels in Flue Gas must be greater than or equal to 0 and less than 21 percent' },
];

describe('FeedwaterEconomizerFormComponent', () => {
  let component: FeedwaterEconomizerFormComponent;
  let fixture: ComponentFixture<FeedwaterEconomizerFormComponent>;
  let serviceSpy: jasmine.SpyObj<FeedwaterEconomizerService>;
  let phastSpy: jasmine.SpyObj<PhastService>;
  let steamSpy: jasmine.SpyObj<SteamService>;
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
    return Array.from(getFormGroup(field).querySelectorAll('.input-group-addon.units:not(.op-hour-addon)'))
      .map(normalize).filter(text => text !== 'hrs/yr' && text !== '%');
  }

  function getErrorTexts(field: string): Array<string> {
    const alert = getFormGroup(field).querySelector('.alert-danger');
    if (!alert) {
      return [];
    }
    return Array.from(alert.querySelectorAll(':scope > span:not(.alert-warning)')).map(normalize);
  }

  function getWarning(field: string): HTMLElement | null {
    return getFormGroup(field).querySelector('.alert-warning');
  }

  function optionTexts(field: string): Array<string> {
    return Array.from(getInput(field).querySelectorAll('option')).map(normalize);
  }

  function createComponent(input: FeedwaterEconomizerInput = makeInput(), settings: Settings = makeSettings()): void {
    serviceSpy.feedwaterEconomizerInput.next(input);
    fixture = TestBed.createComponent(FeedwaterEconomizerFormComponent);
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

  function modal(name: 'gasMaterialModal' | 'moistureModal'): BsModalStubDirective {
    return component[name] as unknown as BsModalStubDirective;
  }

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj<FeedwaterEconomizerService>('FeedwaterEconomizerService', ['getTreasureHuntFuelCost'], {
      feedwaterEconomizerInput: new BehaviorSubject<FeedwaterEconomizerInput>(undefined),
      resetData: new BehaviorSubject<boolean>(undefined),
      generateExample: new BehaviorSubject<boolean>(undefined),
      modalOpen: new BehaviorSubject<boolean>(false),
      currentField: new BehaviorSubject<string>(undefined),
    });
    phastSpy = jasmine.createSpyObj('PhastService', ['flueGasCalculateExcessAir', 'flueGasCalculateO2', 'flueGasByVolumeCalculateHeatingValue']);
    phastSpy.flueGasCalculateExcessAir.and.returnValue(30.5);
    phastSpy.flueGasCalculateO2.and.returnValue(4.2);
    phastSpy.flueGasByVolumeCalculateHeatingValue.and.returnValue({ heatingValueVolume: 1020.123 } as any);
    steamSpy = jasmine.createSpyObj('SteamService', ['getQuantityRange']);
    steamSpy.getQuantityRange.and.returnValue({ min: 212, max: 1472 });
    materialDbStub = { dbFlueGasMaterials: new BehaviorSubject<Array<FlueGasMaterial>>(MATERIALS) };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FeedwaterEconomizerFormComponent, SettingsLabelStubPipe, BsModalStubDirective],
      providers: [
        FeedwaterEconomizerFormService,
        UntypedFormBuilder,
        ConvertUnitsService,
        { provide: FeedwaterEconomizerService, useValue: serviceSpy },
        { provide: PhastService, useValue: phastSpy },
        { provide: SteamService, useValue: steamSpy },
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

    it('patches the material composition and heating value from the selected fuel', () => {
      createComponent();
      expect(phastSpy.flueGasByVolumeCalculateHeatingValue).toHaveBeenCalledWith(MATERIALS[0]);
      expect(component.form.controls.higherHeatingVal.value).toBe(1020.12);
      expect(component.form.controls.CH4.value).toBe(94.1);
      expect(component.form.controls.substance.value).toBe('Natural Gas');
    });

    it('does not patch material properties when the fuel is not found', () => {
      createComponent(makeInput({ materialTypeId: 99 }));
      expect(phastSpy.flueGasByVolumeCalculateHeatingValue).not.toHaveBeenCalled();
      expect(component.form.controls.higherHeatingVal.value).toBe(1032.44);
    });

    it('publishes the calculated input to the service', () => {
      createComponent();
      expect(serviceSpy.feedwaterEconomizerInput.getValue()).toEqual(jasmine.objectContaining({ operatingHours: 8000, excessAir: 30.5 }));
    });

    it('rebuilds the form when data is reset', () => {
      createComponent();
      serviceSpy.feedwaterEconomizerInput.next(makeInput({ operatingHours: 250 }));
      serviceSpy.resetData.next(true);
      fixture.detectChanges();
      expect(getInput('operatingHours').value).toBe('250');
    });

    it('rebuilds the form when an example is generated', () => {
      createComponent();
      serviceSpy.feedwaterEconomizerInput.next(makeInput({ percBlowdown: 7 }));
      serviceSpy.generateExample.next(true);
      fixture.detectChanges();
      expect(getInput('percBlowdown').value).toBe('7');
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
      expect(getUnitTexts('higherHeatingVal')).toEqual([]);
      expect(getUnitTexts('fuelCost')).toEqual(['']);
      expect(getUnitTexts('energyRateInput')).toEqual(['']);
    });
  });

  describe('oxygen calculation method', () => {
    it('shows the O2 input and calculated excess air for the oxygen method', () => {
      createComponent();
      expect(component.calcMethodExcessAir).toBeFalse();
      expect(getInput('flueGasO2')).not.toBeNull();
      expect(getInput('excessAir')).toBeNull();
      const excessAirGroup = Array.from(fixture.nativeElement.querySelectorAll('.form-group'))
        .find((el: HTMLElement) => el.querySelector('label')?.textContent.trim() === 'Excess Air') as HTMLElement;
      expect(normalize(excessAirGroup.querySelector('.text-center'))).toBe('30.50 %');
    });

    it('shows the excess air input and calculated O2 for the excess air method', () => {
      createComponent(makeInput({ oxygenCalculationMethod: 'Excess Air' }));
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
      expect(phastSpy.flueGasCalculateExcessAir).toHaveBeenCalledWith(jasmine.objectContaining({ o2InFlueGas: 5, CH4: 94.1 }));
      expect(component.calculationExcessAir).toBe(30.5);
      expect(component.form.controls.excessAir.value).toBe(30.5);
    });

    it('zeroes excess air when the O2 value is invalid', () => {
      createComponent(makeInput({ flueGasO2: null }));
      expect(component.calculationExcessAir).toBe(0);
      expect(component.form.controls.excessAir.value).toBe(0);
    });

    it('calculates O2 from a valid excess air value', () => {
      createComponent(makeInput({ oxygenCalculationMethod: 'Excess Air' }));
      expect(phastSpy.flueGasCalculateO2).toHaveBeenCalledWith(jasmine.objectContaining({ excessAir: 15 }));
      expect(component.form.controls.flueGasO2.value).toBe(4.2);
    });

    it('zeroes O2 when the excess air value is invalid', () => {
      createComponent(makeInput({ oxygenCalculationMethod: 'Excess Air', excessAir: 0 }));
      expect(component.calculationFlueGasO2).toBe(0);
      expect(component.form.controls.flueGasO2.value).toBe(0);
    });
  });

  describe('steam quality', () => {
    it('hides steam temperature for saturated steam', () => {
      createComponent();
      expect(getInput('steamTemperature')).toBeNull();
    });

    it('shows steam temperature for superheated steam', () => {
      createComponent(makeInput({ steamCondition: 0 }));
      expect(getInput('steamTemperature')).not.toBeNull();
    });

    it('applies steam temperature validators when switching to superheated', () => {
      createComponent(makeInput({ steamTemperature: null }));
      expect(component.form.controls.steamTemperature.valid).toBeTrue();
      component.form.controls.steamCondition.setValue(0);
      component.setQuality();
      fixture.detectChanges();
      expect(component.form.controls.steamTemperature.hasError('required')).toBeTrue();
      expect(getInput('steamTemperature')).not.toBeNull();
    });

    it('clears steam temperature validators when switching to saturated', () => {
      createComponent(makeInput({ steamCondition: 0, steamTemperature: null }));
      expect(component.form.controls.steamTemperature.invalid).toBeTrue();
      component.form.controls.steamCondition.setValue(1);
      component.setQuality();
      fixture.detectChanges();
      expect(component.form.controls.steamTemperature.valid).toBeTrue();
      expect(getInput('steamTemperature')).toBeNull();
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

    it('shows the metric feedwater temperature minimum', () => {
      createComponent(makeInput(), makeSettings('Metric'));
      setDirtyValue('feedWaterTemperature', -10);
      expect(getErrorTexts('feedWaterTemperature')).toEqual(["Value can't be less than 0 ℃"]);
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
      createComponent(makeInput({ oxygenCalculationMethod: 'Excess Air' }));
      phastSpy.flueGasCalculateO2.and.returnValue(25);
      component.calcExcessAir();
      fixture.detectChanges();
      expect(component.warnings.o2Warning).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
    });

    it('does not show the flue gas temperature warning for a valid low value', () => {
      createComponent();
      setDirtyValue('flueGasTemperature', 150);
      expect(component.warnings.flueGasTemp).not.toBeNull();
      expect(getWarning('flueGasTemperature')).toBeNull();
    });
  });

  describe('user actions', () => {
    it('focusField publishes the current field', () => {
      createComponent();
      component.focusField('fuelCost');
      expect(serviceSpy.currentField.getValue()).toBe('fuelCost');
    });

    it('calculate publishes the updated input', () => {
      createComponent();
      component.form.controls.operatingHours.setValue(4000);
      component.calculate();
      expect(serviceSpy.feedwaterEconomizerInput.getValue().operatingHours).toBe(4000);
    });

    it('sets the treasure hunt fuel cost from the energy source', () => {
      serviceSpy.getTreasureHuntFuelCost.and.returnValue(7);
      createComponent();
      component.setTreasureHuntFuelCost('Other Fuel');
      expect(serviceSpy.getTreasureHuntFuelCost).toHaveBeenCalledWith('Other Fuel', component.settings);
      expect(serviceSpy.feedwaterEconomizerInput.getValue().fuelCost).toBe(7);
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
      expect(serviceSpy.feedwaterEconomizerInput.getValue().operatingHours).toBe(4000);
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
      expect(modal('gasMaterialModal').show).toHaveBeenCalled();
      expect(serviceSpy.modalOpen.getValue()).toBeTrue();
      expect(query('app-flue-gas-material')).not.toBeNull();
    });

    it('selects the new material on close', () => {
      createComponent();
      component.showMaterialModal();
      component.hideMaterialModal({ substance: 'Coke Oven Gas' });
      fixture.detectChanges();
      expect(component.form.controls.materialTypeId.value).toBe(2);
      expect(component.form.controls.substance.value).toBe('Coke Oven Gas');
      expect(modal('gasMaterialModal').hide).toHaveBeenCalled();
      expect(serviceSpy.modalOpen.getValue()).toBeFalse();
      expect(query('app-flue-gas-material')).toBeNull();
    });

    it('keeps the current material when closed without a selection', () => {
      createComponent();
      component.showMaterialModal();
      component.hideMaterialModal();
      expect(component.form.controls.materialTypeId.value).toBe(1);
      expect(serviceSpy.modalOpen.getValue()).toBeFalse();
    });
  });

  describe('moisture modal', () => {
    it('hides the moisture calculator until opened', () => {
      createComponent();
      expect(query('app-flue-gas-moisture-modal')).toBeNull();
    });

    it('shows the moisture calculator and flags the modal open', () => {
      createComponent();
      component.showMoistureModal();
      fixture.detectChanges();
      expect(modal('moistureModal').show).toHaveBeenCalled();
      expect(serviceSpy.modalOpen.getValue()).toBeTrue();
      expect(query('app-flue-gas-moisture-modal')).not.toBeNull();
    });

    it('applies the rounded moisture value on close', () => {
      createComponent();
      component.showMoistureModal();
      component.hideMoistureModal(1.2345);
      fixture.detectChanges();
      expect(component.form.controls.moistureInCombustionAir.value).toBe(1.23);
      expect(modal('moistureModal').hide).toHaveBeenCalled();
      expect(serviceSpy.modalOpen.getValue()).toBeFalse();
      expect(query('app-flue-gas-moisture-modal')).toBeNull();
    });

    it('keeps the moisture value when closed without a value', () => {
      createComponent();
      component.showMoistureModal();
      component.hideMoistureModal();
      expect(component.form.controls.moistureInCombustionAir.value).toBe(1);
    });
  });

  describe('destroy', () => {
    it('stops rebuilding the form after destroy', () => {
      createComponent();
      const form = component.form;
      fixture.destroy();
      serviceSpy.resetData.next(true);
      serviceSpy.generateExample.next(true);
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
