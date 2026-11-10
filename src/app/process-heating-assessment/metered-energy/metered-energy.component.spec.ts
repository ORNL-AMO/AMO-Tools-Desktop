import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { FlueGasMaterialDbService } from '../../indexedDb/flue-gas-material-db.service';
import { SolidLiquidMaterialDbService } from '../../indexedDb/solid-liquid-material-db.service';
import { FlueGasMaterial, SolidLiquidFlueGasMaterial } from '../../shared/models/materials';
import { MeteredEnergy } from '../../shared/models/phast/meteredEnergy';
import { Settings } from '../../shared/models/settings';
import { ProcessHeatingApiService } from '../../tools-suite-api/process-heating-api.service';
import { PHAST } from '../models/phast';
import { HeatingEquipmentConfiguration } from '../models/views';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
import { MeteredEnergyFormService } from './metered-energy-form.service';
import { MeteredEnergyComponent } from './metered-energy.component';

const NATURAL_GAS = { id: 1, substance: 'Natural Gas', heatingValueVolume: 1020 } as FlueGasMaterial;
const COAL = { id: 7, substance: 'Coal' } as SolidLiquidFlueGasMaterial;

function savedSteam(): MeteredEnergy {
  return {
    fuel: false, steam: true, electricity: false,
    meteredEnergySteam: { totalHeatSteam: 1000, flowRate: 50, collectionTime: 2, electricityUsed: 0, electricityCollectionTime: 0, operatingHours: 8000 },
  };
}

describe('MeteredEnergyComponent', () => {
  let fixture: ComponentFixture<MeteredEnergyComponent>;
  let component: MeteredEnergyComponent;
  let assessmentService: jasmine.SpyObj<ProcessHeatingAssessmentService>;
  let apiService: jasmine.SpyObj<ProcessHeatingApiService>;
  let settings: WritableSignal<Partial<Settings>>;
  let phast: PHAST;

  const section = (label: string): HTMLElement | undefined =>
    Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.group-label')).find(el => el.textContent.includes(label));

  function create(configuration: HeatingEquipmentConfiguration = HeatingEquipmentConfiguration.FUEL_FIRED): void {
    assessmentService = jasmine.createSpyObj('ProcessHeatingAssessmentService', ['updateProcessHeatingProperty'], {
      processHeatingSignal: signal(phast),
      settingsSignal: settings,
    });
    apiService = jasmine.createSpyObj('ProcessHeatingApiService', ['flueGasByMassCalculateHeatingValue']);
    TestBed.configureTestingModule({
      declarations: [MeteredEnergyComponent],
      imports: [ReactiveFormsModule],
      providers: [
        MeteredEnergyFormService,
        { provide: ProcessHeatingAssessmentService, useValue: assessmentService },
        { provide: ProcessHeatingUiService, useValue: { heatingSystemConfigurationSignal: signal(configuration), focusedFieldSignal: signal('default') } },
        { provide: FlueGasMaterialDbService, useValue: { dbFlueGasMaterials: new BehaviorSubject([NATURAL_GAS]) } },
        { provide: SolidLiquidMaterialDbService, useValue: { dbSolidLiquidFlueGasMaterials: new BehaviorSubject([COAL]) } },
        { provide: ProcessHeatingApiService, useValue: apiService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(MeteredEnergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    settings = signal<Partial<Settings>>({ unitsOfMeasure: 'Imperial' });
    phast = { losses: {} };
  });

  describe('initialization', () => {
    it('preselects the configuration\'s source without saving it', () => {
      create(HeatingEquipmentConfiguration.ELECTROTECHNOLOGY_EAF);

      expect(component.meteredEnergy()).toEqual(jasmine.objectContaining({ fuel: false, steam: false, electricity: true }));
      expect(assessmentService.updateProcessHeatingProperty).not.toHaveBeenCalled();
    });

    it('loads saved metered energy instead of the defaults', () => {
      phast.meteredEnergy = savedSteam();
      create();

      expect(component.steamForm.controls.totalHeatSteam.value).toBe(1000);
      expect(component.meteredEnergy().fuel).toBeFalse();
    });
  });

  describe('saving', () => {
    it('saves the serialized form on every change', () => {
      create();
      component.fuelForm.controls.collectionTime.setValue(3);

      const saved = assessmentService.updateProcessHeatingProperty.calls.mostRecent().args;
      expect(saved[0]).toBe('meteredEnergy');
      expect((saved[1] as MeteredEnergy).meteredEnergyFuel.collectionTime).toBe(3);
      expect(component.meteredEnergy().meteredEnergyFuel.collectionTime).toBe(3);
    });

    it('stops saving after destroy', () => {
      create();
      assessmentService.updateProcessHeatingProperty.calls.reset();
      fixture.destroy();

      component.fuelForm.controls.collectionTime.setValue(3);
      expect(assessmentService.updateProcessHeatingProperty).not.toHaveBeenCalled();
    });
  });

  describe('source toggles', () => {
    it('adds a source alongside the preselected one and saves it', () => {
      create();
      component.toggleSource('steam');

      expect(assessmentService.updateProcessHeatingProperty).toHaveBeenCalledWith('meteredEnergy', jasmine.objectContaining({ fuel: true, steam: true }));
    });

    it('shows only the turned-on sources\' sections', () => {
      create();
      expect(section('Fuel')).toBeDefined();
      expect(section('Steam')).toBeUndefined();

      component.toggleSource('steam');
      component.toggleSource('fuel');
      fixture.detectChanges();

      expect(section('Fuel')).toBeUndefined();
      expect(section('Steam')).toBeDefined();
    });

    it('keeps the only turned-on source shown as selected but locked until another source is on', () => {
      create();
      const button = (label: string): HTMLButtonElement =>
        Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('.toggle-btn')).find(el => el.textContent.trim() === label);
      expect(button('Fuel').disabled).toBeFalse();
      expect(button('Fuel').classList).toContain('active');
      expect(button('Fuel').getAttribute('aria-disabled')).toBe('true');
      expect(button('Steam-based').hasAttribute('aria-disabled')).toBeFalse();

      component.toggleSource('fuel');
      expect(component.meteredEnergy().fuel).toBeTrue();

      component.toggleSource('steam');
      fixture.detectChanges();
      expect(button('Fuel').hasAttribute('aria-disabled')).toBeFalse();
    });
  });

  describe('fuel', () => {
    it('fills the heating value from the selected gas fuel', () => {
      create();
      component.fuelForm.controls.fuelType.setValue(NATURAL_GAS.id);
      component.selectFuel();

      expect(component.fuelForm.controls.heatingValue.value).toBe(1020);
    });

    it('converts the gas heating value for metric units', () => {
      settings.set({ unitsOfMeasure: 'Metric' });
      create();
      component.fuelForm.controls.fuelType.setValue(NATURAL_GAS.id);
      component.selectFuel();

      expect(component.fuelForm.controls.heatingValue.value).toBeCloseTo(38004, 0);
    });

    it('calculates the solid/liquid heating value through the suite', () => {
      create();
      apiService.flueGasByMassCalculateHeatingValue.and.returnValue(12000);
      component.fuelForm.patchValue({ fuelDescription: 'solidLiquid', fuelType: COAL.id });
      component.selectFuel();

      expect(apiService.flueGasByMassCalculateHeatingValue).toHaveBeenCalledWith(COAL);
      expect(component.fuelForm.controls.heatingValue.value).toBe(12000);
    });

    it('lists the fuels for the selected type of fuel', () => {
      create();
      expect(component.fuelTypes()).toEqual([NATURAL_GAS]);

      component.fuelForm.controls.fuelDescription.setValue('solidLiquid');
      expect(component.fuelTypes()).toEqual([COAL]);
    });

    it('clears the fuel and heating value when the type of fuel changes', () => {
      create();
      component.fuelForm.patchValue({ fuelType: NATURAL_GAS.id, heatingValue: 1020 });
      component.changeFuelDescription();

      expect(component.fuelForm.controls.fuelType.value).toBeNull();
      expect(component.fuelForm.controls.heatingValue.value).toBeNull();
    });

    it('shows the calculated fuel energy, updating as inputs change, until the user defines it', () => {
      create();
      const derived = (): string => fixture.nativeElement.querySelector('[data-testid="derived-fuel-energy"]')?.textContent.trim();

      component.fuelForm.patchValue({ fuelFlowRateInput: 1000, heatingValue: 1020, collectionTime: 2 });
      fixture.detectChanges();
      expect(derived()).toBe('2.04 MMBtu');

      component.fuelForm.controls.collectionTime.setValue(4);
      fixture.detectChanges();
      expect(derived()).toBe('4.08 MMBtu');

      component.toggleUserDefinedFuelEnergy();
      fixture.detectChanges();
      expect(derived()).toBeUndefined();
      expect(fixture.nativeElement.querySelector('#meteredFuelEnergy')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('#meteredFuelFlowRate')).toBeNull();
    });
  });
});
