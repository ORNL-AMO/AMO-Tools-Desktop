import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Co2SavingsPhastService } from '../../phast/losses/operations/co2-savings-phast/co2-savings-phast.service';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { Settings } from '../../shared/models/settings';
import { PHAST, PhastCo2SavingsData } from '../models/phast';
import { HeatingEquipmentConfiguration } from '../models/views';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { ProcessHeatingOperationsFormService } from '../services/process-heating-operations-form.service';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
import { OperationsComponent } from './operations.component';

function makePhast(hoursPerYear: number, fuelCost: number, extra: Partial<PHAST> = {}): PHAST {
  return {
    operatingHours: { hoursPerYear },
    operatingCosts: { fuelCost, steamCost: 0, electricityCost: 0.1, coalCarbonCost: 0, electrodeCost: 0, otherFuelCost: 0 },
    co2SavingsData: { zipcode: '00000' } as PhastCo2SavingsData,
    ...extra,
  } as PHAST;
}

describe('OperationsComponent', () => {
  let fixture: ComponentFixture<OperationsComponent>;
  let component: OperationsComponent;
  let scenarios: WritableSignal<Record<AssessmentScenario, PHAST>>;
  let assessmentService: jasmine.SpyObj<ProcessHeatingAssessmentService>;

  function render(scenario: AssessmentScenario): void {
    fixture = TestBed.createComponent(OperationsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('scenario', scenario);
    fixture.detectChanges();
  }

  function input(id: string): HTMLInputElement | null {
    return fixture.nativeElement.querySelector(`#${id}`);
  }

  beforeEach(() => {
    scenarios = signal({
      baseline: makePhast(8000, 5),
      'mod-1': makePhast(6000, 5, { implementationCost: 1200 }),
      'mod-2': makePhast(4000, 4),
    });
    assessmentService = jasmine.createSpyObj<ProcessHeatingAssessmentService>(
      'ProcessHeatingAssessmentService',
      ['setProcessHeating', 'updateProcessHeatingProperty', 'updateModificationProperty', 'scenarioPhast', 'scenarioPhastSignal'],
      {
        settingsSignal: signal({ unitsOfMeasure: 'Imperial' } as Settings),
        processHeatingSignal: signal(scenarios().baseline),
      },
    );
    assessmentService.scenarioPhast.and.callFake(scenario => scenarios()[scenario]);
    assessmentService.scenarioPhastSignal.and.callFake(scenario => scenarios()[scenario]);

    TestBed.configureTestingModule({
      declarations: [OperationsComponent],
      imports: [ReactiveFormsModule],
      providers: [
        ProcessHeatingOperationsFormService,
        { provide: ProcessHeatingAssessmentService, useValue: assessmentService },
        {
          provide: ProcessHeatingUiService,
          useValue: { heatingSystemConfigurationSignal: signal(HeatingEquipmentConfiguration.FUEL_FIRED), focusedFieldSignal: signal('default') },
        },
        { provide: Co2SavingsPhastService, useValue: { getCo2SavingsDataFromSettingsObject: () => ({}) } },
        { provide: ModalDialogService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  describe('initialization', () => {
    it('fills the form from the baseline', () => {
      render('baseline');

      expect(component.form.getRawValue()).toEqual(jasmine.objectContaining({ hoursPerYear: 8000, fuelCost: 5 }));
    });

    it('fills the form and implementation cost from the modification', () => {
      render('mod-1');

      expect(component.form.controls.hoursPerYear.value).toBe(6000);
      expect(component.implementationCost.value).toBe(1200);
    });

    it('gives each scenario its own input ids', () => {
      render('mod-1');

      expect(input('hoursPerYear_mod-1')).not.toBeNull();
    });
  });

  describe('template visibility', () => {
    it('hides implementation cost on the baseline', () => {
      render('baseline');

      expect(input('implementationCost_baseline')).toBeNull();
    });

    it('shows implementation cost on a modification', () => {
      render('mod-1');

      expect(input('implementationCost_mod-1')).not.toBeNull();
    });

    it('marks fields that differ from the baseline on a modification only', () => {
      render('mod-1');

      expect(input('hoursPerYear_mod-1')!.closest('.input-group')!.classList).toContain('indicate-different');
      expect(input('fuelCost_mod-1')!.closest('.input-group')!.classList).not.toContain('indicate-different');
    });
  });

  describe('saving', () => {
    it('saves baseline edits to the baseline', () => {
      render('baseline');

      component.form.controls.hoursPerYear.setValue(7000);

      expect(assessmentService.setProcessHeating).toHaveBeenCalledWith(jasmine.objectContaining({
        operatingHours: jasmine.objectContaining({ hoursPerYear: 7000 }),
      }));
      expect(assessmentService.updateModificationProperty).not.toHaveBeenCalled();
    });

    it('saves only the operating hours when a modification changes its hours', () => {
      render('mod-1');

      component.form.controls.hoursPerYear.setValue(5000);

      expect(assessmentService.updateModificationProperty).toHaveBeenCalledOnceWith('mod-1', 'operatingHours', jasmine.objectContaining({ hoursPerYear: 5000 }));
      expect(assessmentService.setProcessHeating).not.toHaveBeenCalled();
    });

    it('saves only the operating costs when a modification changes a cost', () => {
      render('mod-1');

      component.form.controls.fuelCost.setValue(3);

      expect(assessmentService.updateModificationProperty).toHaveBeenCalledOnceWith('mod-1', 'operatingCosts', jasmine.objectContaining({ fuelCost: 3 }));
    });

    it('saves the implementation cost to the modification, clearing it when emptied', () => {
      render('mod-1');

      component.implementationCost.setValue(900);
      component.implementationCost.setValue(null);

      expect(assessmentService.updateModificationProperty.calls.allArgs()).toEqual([
        ['mod-1', 'implementationCost', 900],
        ['mod-1', 'implementationCost', undefined],
      ]);
    });

    it('saves CO2 data to the modification it belongs to', () => {
      render('mod-1');
      const co2SavingsData = { zipcode: '12345' } as PhastCo2SavingsData;

      component.updateCo2SavingsData(co2SavingsData);

      expect(assessmentService.updateModificationProperty).toHaveBeenCalledWith('mod-1', 'co2SavingsData', co2SavingsData);
    });
  });

  describe('scenario change', () => {
    it('refills the form from the new modification without saving', () => {
      render('mod-1');

      fixture.componentRef.setInput('scenario', 'mod-2');
      fixture.detectChanges();

      expect(component.form.controls.hoursPerYear.value).toBe(4000);
      expect(component.implementationCost.value).toBeNull();
      expect(assessmentService.updateModificationProperty).not.toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('stops saving after the component is destroyed', () => {
      render('mod-1');
      fixture.destroy();
      assessmentService.updateModificationProperty.calls.reset();

      component.form.controls.hoursPerYear.setValue(1000);
      component.implementationCost.setValue(1);

      expect(assessmentService.updateModificationProperty).not.toHaveBeenCalled();
    });
  });
});
