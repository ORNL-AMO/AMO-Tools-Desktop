import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HeatSystemEfficiencyComponent } from './heat-system-efficiency.component';
import { SharedPipesModule } from '../../../../shared/shared-pipes/shared-pipes.module';
import { ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { ProcessHeatingResultsService } from '../../../services/process-heating-results.service';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;

interface MockPhast {
  systemEfficiency?: number;
}

describe('HeatSystemEfficiencyComponent', () => {
  let component: HeatSystemEfficiencyComponent;
  let fixture: ComponentFixture<HeatSystemEfficiencyComponent>;
  let assessmentServiceSpy: jasmine.SpyObj<ProcessHeatingAssessmentService>;
  let resultsServiceSpy: jasmine.SpyObj<ProcessHeatingResultsService>;
  let settingsSignal: WritableSignal<Settings>;
  let phastSignal: WritableSignal<MockPhast | undefined>;

  beforeEach(async () => {
    settingsSignal = signal(MOCK_SETTINGS);
    phastSignal = signal<MockPhast | undefined>({ systemEfficiency: 80 });

    assessmentServiceSpy = jasmine.createSpyObj(
      'ProcessHeatingAssessmentService',
      ['scenarioPhastSignal', 'scenarioPhast', 'updateProcessHeatingProperty', 'updateModificationProperty'],
      { settingsSignal },
    );
    assessmentServiceSpy.scenarioPhastSignal.and.callFake(() => phastSignal() as never);
    assessmentServiceSpy.scenarioPhast.and.callFake(() => phastSignal() as never);

    resultsServiceSpy = jasmine.createSpyObj('ProcessHeatingResultsService', ['getResults']);
    resultsServiceSpy.getResults.and.returnValue({ totalInput: 800, exothermicHeat: -5 } as never);

    await TestBed.configureTestingModule({
      declarations: [HeatSystemEfficiencyComponent],
      imports: [ReactiveFormsModule, SharedPipesModule],
      providers: [
        { provide: ProcessHeatingAssessmentService, useValue: assessmentServiceSpy },
        { provide: ProcessHeatingResultsService, useValue: resultsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  function create(scenario?: string): void {
    fixture = TestBed.createComponent(HeatSystemEfficiencyComponent);
    component = fixture.componentInstance;
    if (scenario) {
      fixture.componentRef.setInput('scenario', scenario);
    }
    fixture.detectChanges();
  }

  describe('initialization', () => {
    it('loads the saved efficiency into the form without re-saving it', () => {
      create();
      expect(component.form.controls.efficiency.value).toBe(80);
      expect(assessmentServiceSpy.updateProcessHeatingProperty).not.toHaveBeenCalled();
    });

    it('leaves the field empty and saves nothing when no efficiency is saved', () => {
      phastSignal.set({});
      create();
      expect(component.form.controls.efficiency.value).toBeNull();
      expect(assessmentServiceSpy.updateProcessHeatingProperty).not.toHaveBeenCalled();
      expect(assessmentServiceSpy.updateModificationProperty).not.toHaveBeenCalled();
    });
  });

  describe('efficiency changes', () => {
    it('saves a valid baseline value', () => {
      create();
      component.form.controls.efficiency.setValue(85);
      expect(assessmentServiceSpy.updateProcessHeatingProperty).toHaveBeenCalledWith('systemEfficiency', 85);
    });

    it('saves a valid modification value against its scenario', () => {
      create('mod-1');
      component.form.controls.efficiency.setValue(85);
      expect(assessmentServiceSpy.updateModificationProperty).toHaveBeenCalledWith('mod-1', 'systemEfficiency', 85);
    });

    it('does not save an out-of-range value', () => {
      create();
      component.form.controls.efficiency.setValue(150);
      expect(assessmentServiceSpy.updateProcessHeatingProperty).not.toHaveBeenCalled();
    });

    it('does not save an empty value', () => {
      create();
      component.form.controls.efficiency.setValue(null);
      expect(assessmentServiceSpy.updateProcessHeatingProperty).not.toHaveBeenCalled();
    });

    it('stops saving after destroy', () => {
      create();
      const control = component.form.controls.efficiency;
      fixture.destroy();
      control.setValue(85);
      expect(assessmentServiceSpy.updateProcessHeatingProperty).not.toHaveBeenCalled();
    });
  });

  describe('results', () => {
    it('derives gross heat and system losses from total input, exothermic heat and efficiency', () => {
      create();
      // (800 / 80 - 5) * 100 = 500 gross heat; 500 * (1 - 0.8) = 100 losses
      expect(component.results()?.grossHeat).toBeCloseTo(500, 6);
      expect(component.results()?.systemLosses).toBeCloseTo(100, 6);
    });

    it('updates when the saved efficiency changes', () => {
      create();
      phastSignal.set({ systemEfficiency: 50 });
      // (800 / 50 - 5) * 100 = 1100 gross heat; 1100 * 0.5 = 550 losses
      expect(component.results()?.grossHeat).toBeCloseTo(1100, 6);
      expect(component.results()?.systemLosses).toBeCloseTo(550, 6);
    });

    it('is null when no efficiency is saved', () => {
      phastSignal.set({});
      create();
      expect(component.results()).toBeNull();
    });

    it('is null when results are unavailable', () => {
      create();
      resultsServiceSpy.getResults.and.returnValue(undefined as never);
      phastSignal.set({ systemEfficiency: 81 });
      expect(component.results()).toBeNull();
    });
  });

  describe('resultsUnit', () => {
    it('is kW when energyResultUnit is kWh', () => {
      create();
      settingsSignal.set({ ...MOCK_SETTINGS, energyResultUnit: 'kWh' });
      expect(component.resultsUnit).toBe('kW');
    });

    it('is <unit>/hr for other energy result units', () => {
      create();
      expect(component.resultsUnit).toBe('Btu/hr');
    });
  });

  describe('template rendering', () => {
    it('shows gross heat and system losses when results exist', () => {
      create();
      const text = fixture.nativeElement.querySelector('.loss-results').textContent;
      expect(text).toContain('500');
      expect(text).toContain('100');
    });

    it('shows placeholders when results are unavailable', () => {
      resultsServiceSpy.getResults.and.returnValue(undefined as never);
      create();
      const text = fixture.nativeElement.querySelector('.loss-results').textContent;
      expect(text).toContain('——');
    });
  });
});
