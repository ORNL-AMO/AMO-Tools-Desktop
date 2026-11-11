import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AddModificationComponent } from './add-modification.component';
import { PsatTabService } from '../psat-tab.service';
import { PsatService } from '../psat.service';
import { Modification, PSAT, PsatOutputs } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

function makePsat(): PSAT {
  return {
    inputs: { operating_hours: 8760, fluidType: 'water', fluidTemperature: 60 },
  };
}

function makeOutputs(pumpEfficiency: number): PsatOutputs {
  return {
    pump_efficiency: pumpEfficiency, motor_rated_power: 50, motor_shaft_power: 45, mover_shaft_power: 45,
    motor_efficiency: 90, motor_power_factor: 0.9, motor_current: 10, motor_power: 40,
    load_factor: 0.8, drive_efficiency: 100, annual_energy: 1000, annual_cost: 500,
    annual_savings_potential: 0, optimization_rating: 1, percent_annual_savings: 0, co2EmissionsOutput: 0,
  };
}

describe('AddModificationComponent', () => {
  let component: AddModificationComponent;
  let fixture: ComponentFixture<AddModificationComponent>;
  let psatTabServiceSpy: jasmine.SpyObj<PsatTabService>;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let secondaryTab: BehaviorSubject<string>;

  function setupComponent(target: AddModificationComponent) {
    target.psat = makePsat();
    target.settings = MOCK_SETTINGS;
    target.modifications = [];
    target.modificationExists = false;
  }

  beforeEach(async () => {
    secondaryTab = new BehaviorSubject<string>('modify-conditions');
    psatTabServiceSpy = jasmine.createSpyObj('PsatTabService', [], { secondaryTab });
    psatServiceSpy = jasmine.createSpyObj('PsatService', ['resultsExisting']);
    psatServiceSpy.resultsExisting.and.returnValue(makeOutputs(75));

    await TestBed.configureTestingModule({
      declarations: [AddModificationComponent],
      providers: [
        { provide: PsatTabService, useValue: psatTabServiceSpy },
        { provide: PsatService, useValue: psatServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AddModificationComponent);
    component = fixture.componentInstance;
    setupComponent(component);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('names the new scenario "Scenario 1" when modifications is empty', () => {
      expect(component.newModificationName).toBe('Scenario 1');
    });

    it('names the new scenario after modifications.length + 1 when modifications has entries', () => {
      const freshFixture = TestBed.createComponent(AddModificationComponent);
      const freshComponent = freshFixture.componentInstance;
      setupComponent(freshComponent);
      freshComponent.modifications = [{ id: 'mod-1' }, { id: 'mod-2' }] as Modification[];
      freshFixture.detectChanges();

      expect(freshComponent.newModificationName).toBe('Scenario 3');
    });

    it('names the new scenario "Scenario 1" when modifications is undefined', () => {
      const freshFixture = TestBed.createComponent(AddModificationComponent);
      const freshComponent = freshFixture.componentInstance;
      setupComponent(freshComponent);
      freshComponent.modifications = undefined;
      freshFixture.detectChanges();

      expect(freshComponent.newModificationName).toBe('Scenario 1');
    });

    it('sets currentTab from the current value of secondaryTab', () => {
      expect(component.currentTab).toBe('modify-conditions');
    });
  });

  describe('saveScenarioChange', () => {
    it('sets isWhatIfScenario to the given value', () => {
      component.saveScenarioChange(false);
      expect(component.isWhatIfScenario).toBeFalse();

      component.saveScenarioChange(true);
      expect(component.isWhatIfScenario).toBeTrue();
    });
  });

  describe('addModification', () => {
    it('calls resultsExisting with the baseline inputs and current settings', () => {
      component.addModification();
      expect(psatServiceSpy.resultsExisting).toHaveBeenCalledWith(component.psat.inputs, MOCK_SETTINGS);
    });

    it('emits a modification cloned from the baseline psat, with pump_style, whatIfScenario, and pump_specified set', () => {
      component.isWhatIfScenario = false;
      component.newModificationName = 'My Scenario';
      const emitted: Modification[] = [];
      component.save.subscribe(value => emitted.push(value));

      component.addModification();

      expect(emitted.length).toBe(1);
      const modification = emitted[0];
      expect(modification.id).toBeTruthy();
      expect(modification.psat.name).toBe('My Scenario');
      expect(modification.psat.inputs).not.toBe(component.psat.inputs);
      expect(modification.psat.inputs.operating_hours).toBe(component.psat.inputs.operating_hours);
      expect(modification.psat.inputs.pump_style).toBe(11);
      expect(modification.psat.inputs.whatIfScenario).toBeFalse();
      expect(modification.psat.inputs.pump_specified).toBe(75);
    });

    it('sets exploreOpportunities to false when currentTab is not explore-opportunities', () => {
      const emitted: Modification[] = [];
      component.save.subscribe(value => emitted.push(value));

      component.addModification();

      expect(emitted[0].exploreOpportunities).toBeFalse();
    });

    it('sets exploreOpportunities to true when currentTab is explore-opportunities', () => {
      secondaryTab.next('explore-opportunities');
      const emitted: Modification[] = [];
      component.save.subscribe(value => emitted.push(value));

      component.addModification();

      expect(emitted[0].exploreOpportunities).toBeTrue();
    });

    it('mirrors userEnteredBaselineEmissions into userEnteredModificationEmissions when co2SavingsData is present', () => {
      component.psat.inputs.co2SavingsData = { userEnteredBaselineEmissions: true } as any;
      const emitted: Modification[] = [];
      component.save.subscribe(value => emitted.push(value));

      component.addModification();

      expect(emitted[0].psat.inputs.co2SavingsData.userEnteredModificationEmissions).toBeTrue();
    });
  });

  describe('template visibility', () => {
    it('shows the modify-conditions helper text when modificationExists is false and currentTab is modify-conditions', () => {
      const paragraphs = fixture.nativeElement.querySelectorAll('p.small');
      expect(paragraphs.length).toBe(1);
      expect(paragraphs[0].textContent).toContain('Modify All Conditions');
    });

    it('shows the explore-opportunities helper text when modificationExists is false and currentTab is explore-opportunities', () => {
      secondaryTab.next('explore-opportunities');
      fixture.detectChanges();

      const paragraphs = fixture.nativeElement.querySelectorAll('p.small');
      expect(paragraphs.length).toBe(1);
      expect(paragraphs[0].textContent).toContain('Explore Opportunities');
    });

    it('hides both helper texts when modificationExists is true', () => {
      component.modificationExists = true;
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('p.small').length).toBe(0);
    });

    it('shows the two-existing-pumps-vs-what-if radio group when currentTab is not explore-opportunities', () => {
      expect(fixture.nativeElement.querySelector('#twoExisting')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('#whatIf')).not.toBeNull();
    });

    it('hides the two-existing-pumps-vs-what-if radio group when currentTab is explore-opportunities', () => {
      secondaryTab.next('explore-opportunities');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('#twoExisting')).toBeNull();
      expect(fixture.nativeElement.querySelector('#whatIf')).toBeNull();
    });
  });

  describe('destroy', () => {
    it('stops updating currentTab after the component is destroyed', () => {
      fixture.destroy();
      secondaryTab.next('explore-opportunities');
      expect(component.currentTab).toBe('modify-conditions');
    });
  });
});
