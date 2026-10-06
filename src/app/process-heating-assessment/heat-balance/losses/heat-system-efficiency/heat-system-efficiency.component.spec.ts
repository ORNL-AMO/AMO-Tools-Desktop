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

    it('does not save zero, which the results engine treats as missing', () => {
      create();
      component.form.controls.efficiency.setValue(0);
      expect(component.form.controls.efficiency.valid).toBeFalse();
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
      // losses = 800 / 0.8 * 0.2 = 200; gross = 800 + 200 - 5 = 995
      expect(component.results()?.grossHeat).toBeCloseTo(995, 6);
      expect(component.results()?.systemLosses).toBeCloseTo(200, 6);
    });

    it('updates when the saved efficiency changes', () => {
      create();
      phastSignal.set({ systemEfficiency: 50 });
      // losses = 800 / 0.5 * 0.5 = 800; gross = 800 + 800 - 5 = 1595
      expect(component.results()?.grossHeat).toBeCloseTo(1595, 6);
      expect(component.results()?.systemLosses).toBeCloseTo(800, 6);
    });

    it('subtracts exothermic heat after applying the efficiency loss', () => {
      resultsServiceSpy.getResults.and.returnValue({ totalInput: 800, exothermicHeat: -20 } as never);
      create();
      expect(component.results()?.grossHeat).toBeCloseTo(980, 6);
      expect(component.results()?.systemLosses).toBeCloseTo(200, 6);
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
      expect(text).toContain('995');
      expect(text).toContain('200');
    });

    it('shows placeholders when results are unavailable', () => {
      resultsServiceSpy.getResults.and.returnValue(undefined as never);
      create();
      const text = fixture.nativeElement.querySelector('.loss-results').textContent;
      expect(text).toContain('——');
    });
  });
});
