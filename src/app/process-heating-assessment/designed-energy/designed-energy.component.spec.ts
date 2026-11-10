import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { DesignedEnergy } from '../../shared/models/phast/designedEnergy';
import { Settings } from '../../shared/models/settings';
import { PHAST } from '../models/phast';
import { HeatingEquipmentConfiguration } from '../models/views';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
import { DesignedEnergyFormService } from './designed-energy-form.service';
import { DesignedEnergyComponent } from './designed-energy.component';

function savedSteam(): DesignedEnergy {
  return {
    fuel: false, steam: true, electricity: false,
    zones: [{
      name: 'Main',
      designedEnergyFuel: { fuelType: 0, totalBurnerCapacity: 0, percentCapacityUsed: 0, operatingHours: 0 },
      designedEnergySteam: { totalHeat: 1000, steamFlow: 20, percentCapacityUsed: 50, operatingHours: 8000 },
      designedEnergyElectricity: { kwRating: 0, percentCapacityUsed: 0, operatingHours: 0 },
    }],
  };
}

describe('DesignedEnergyComponent', () => {
  let fixture: ComponentFixture<DesignedEnergyComponent>;
  let component: DesignedEnergyComponent;
  let assessmentService: jasmine.SpyObj<ProcessHeatingAssessmentService>;
  let phast: PHAST;

  const zoneNames = (): string[] =>
    Array.from<HTMLInputElement>(fixture.nativeElement.querySelectorAll('input[formcontrolname="name"]')).map(input => input.value);
  const field = (name: string): HTMLElement | null => fixture.nativeElement.querySelector(`input[formcontrolname="${name}"]`);

  function create(configuration: HeatingEquipmentConfiguration = HeatingEquipmentConfiguration.FUEL_FIRED): void {
    assessmentService = jasmine.createSpyObj('ProcessHeatingAssessmentService', ['updateProcessHeatingProperty'], {
      processHeatingSignal: signal(phast),
      settingsSignal: signal({ unitsOfMeasure: 'Imperial' } as Settings),
    });
    TestBed.configureTestingModule({
      declarations: [DesignedEnergyComponent],
      imports: [ReactiveFormsModule],
      providers: [
        DesignedEnergyFormService,
        { provide: ProcessHeatingAssessmentService, useValue: assessmentService },
        { provide: ProcessHeatingUiService, useValue: { heatingSystemConfigurationSignal: signal(configuration), focusedFieldSignal: signal('default') } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(DesignedEnergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    phast = { losses: {} };
  });

  describe('initialization', () => {
    it('preselects the configuration\'s source with one zone, without saving', () => {
      create(HeatingEquipmentConfiguration.STEAM);

      expect(component.designedEnergy()).toEqual(jasmine.objectContaining({ fuel: false, steam: true, electricity: false }));
      expect(zoneNames()).toEqual(['Zone #1']);
      expect(assessmentService.updateProcessHeatingProperty).not.toHaveBeenCalled();
    });

    it('loads saved designed energy instead of the defaults', () => {
      phast.designedEnergy = savedSteam();
      create();

      expect(zoneNames()).toEqual(['Main']);
      expect(component.designedEnergy().fuel).toBeFalse();
    });
  });

  describe('saving', () => {
    it('saves the serialized form on every change', () => {
      create();
      component.form.controls.zones.at(0).controls.designedEnergyFuel.controls.totalBurnerCapacity.setValue(12);

      const [key, value] = assessmentService.updateProcessHeatingProperty.calls.mostRecent().args;
      expect(key).toBe('designedEnergy');
      expect((value as DesignedEnergy).zones[0].designedEnergyFuel.totalBurnerCapacity).toBe(12);
    });

    it('stops saving after destroy', () => {
      create();
      assessmentService.updateProcessHeatingProperty.calls.reset();
      fixture.destroy();

      component.addZone();
      expect(assessmentService.updateProcessHeatingProperty).not.toHaveBeenCalled();
    });
  });

  describe('zones', () => {
    it('adds and removes zones and saves each change', () => {
      create();
      component.addZone();
      fixture.detectChanges();
      expect(zoneNames()).toEqual(['Zone #1', 'Zone #2']);

      component.removeZone(0);
      fixture.detectChanges();
      expect(zoneNames()).toEqual(['Zone #2']);
      expect((assessmentService.updateProcessHeatingProperty.calls.mostRecent().args[1] as DesignedEnergy).zones.map(zone => zone.name)).toEqual(['Zone #2']);
    });

    it('shows the empty state once every zone is removed', () => {
      create();
      component.removeZone(0);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.no-data')).not.toBeNull();
      expect(zoneNames()).toEqual([]);
    });

    it('collapses and expands one zone\'s inputs, keeping its name visible', () => {
      create();
      component.addZone();
      fixture.detectChanges();
      const [first] = component.form.controls.zones.controls;

      component.toggleCollapse(first);
      fixture.detectChanges();
      expect(zoneNames()).toEqual(['Zone #1', 'Zone #2']);
      expect(fixture.nativeElement.querySelectorAll('input[formcontrolname="totalBurnerCapacity"]').length).toBe(1);

      component.toggleCollapse(first);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('input[formcontrolname="totalBurnerCapacity"]').length).toBe(2);
    });
  });

  describe('source toggles', () => {
    it('shows only the turned-on sources\' fields and saves the change', () => {
      create();
      expect(field('totalBurnerCapacity')).not.toBeNull();
      expect(field('kwRating')).toBeNull();

      component.toggleSource('electricity');
      component.toggleSource('fuel');
      fixture.detectChanges();

      expect(field('totalBurnerCapacity')).toBeNull();
      expect(field('kwRating')).not.toBeNull();
      expect(assessmentService.updateProcessHeatingProperty).toHaveBeenCalledWith('designedEnergy', jasmine.objectContaining({ fuel: false, electricity: true }));
    });
  });
});
