import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { SystemBasicsComponent } from './system-basics.component';
import { SettingsService } from '../../settings/settings.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { PsatService } from '../psat.service';
import { PSAT } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';

const MOCK_SETTINGS: Settings = {
  id: 1,
  assessmentId: 1,
  unitsOfMeasure: 'Imperial',
  flowMeasurement: 'gpm',
  distanceMeasurement: 'ft',
  powerMeasurement: 'hp',
  pressureMeasurement: 'psi',
  language: 'English',
  temperatureMeasurement: 'F',
} as Settings;

function makePsat(): PSAT {
  return {
    inputs: {
      flow_rate: 100,
      head: 50,
      motor_rated_power: 10,
      fluidTemperature: 70,
      fluidType: 'WATER',
      operating_hours: 8760,
    },
    existingDataUnits: undefined,
    connectedItem: undefined,
  };
}

function makeAssessment(psat: PSAT): Assessment {
  return { id: 1, name: 'Test Assessment', type: 'PSAT', psat };
}

// Mirrors the shape returned by SettingsService.getFormFromSettings for the mocked settings.
function makeSettingsForm(settings: Settings = MOCK_SETTINGS): UntypedFormGroup {
  return new UntypedFormGroup({
    language: new UntypedFormControl(settings.language),
    unitsOfMeasure: new UntypedFormControl(settings.unitsOfMeasure),
    distanceMeasurement: new UntypedFormControl(settings.distanceMeasurement),
  });
}

describe('SystemBasicsComponent', () => {
  let component: SystemBasicsComponent;
  let fixture: ComponentFixture<SystemBasicsComponent>;
  let settingsServiceSpy: jasmine.SpyObj<SettingsService>;
  let settingsDbServiceSpy: jasmine.SpyObj<SettingsDbService>;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let mockPsat: PSAT;
  let mockAssessment: Assessment;

  beforeEach(async () => {
    mockPsat = makePsat();
    mockAssessment = makeAssessment(mockPsat);

    settingsServiceSpy = jasmine.createSpyObj('SettingsService', ['getFormFromSettings', 'getSettingsFromForm', 'setUnits']);
    settingsServiceSpy.getFormFromSettings.and.callFake((settings: Settings) => makeSettingsForm(settings));
    settingsServiceSpy.getSettingsFromForm.and.callFake((form: UntypedFormGroup) => ({
      ...MOCK_SETTINGS,
      unitsOfMeasure: form.controls.unitsOfMeasure.value,
    }));
    settingsServiceSpy.setUnits.and.callFake((form: UntypedFormGroup) => form);

    settingsDbServiceSpy = jasmine.createSpyObj('SettingsDbService', ['updateWithObservable', 'getAllSettings', 'setAll']);
    settingsDbServiceSpy.updateWithObservable.and.returnValue(of(MOCK_SETTINGS));
    settingsDbServiceSpy.getAllSettings.and.returnValue(of([MOCK_SETTINGS]));
    settingsDbServiceSpy.setAll.and.returnValue(Promise.resolve());

    psatServiceSpy = jasmine.createSpyObj('PsatService', ['convertExistingData']);
    psatServiceSpy.convertExistingData.and.callFake((psat: PSAT) => psat);

    await TestBed.configureTestingModule({
      declarations: [SystemBasicsComponent],
      providers: [
        { provide: SettingsService, useValue: settingsServiceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceSpy },
        { provide: PsatService, useValue: psatServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SystemBasicsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('assessment', mockAssessment);
    fixture.componentRef.setInput('assessmentPsat', mockPsat);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  });

  describe('initialization (ngOnChanges-driven, no ngOnInit on this component)', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('builds settingsForm and oldSettings from the settings input', () => {
      expect(settingsServiceSpy.getFormFromSettings).toHaveBeenCalledWith(MOCK_SETTINGS);
      expect(settingsServiceSpy.getSettingsFromForm).toHaveBeenCalledWith(component.settingsForm);
      expect(component.oldSettings.unitsOfMeasure).toBe('Imperial');
    });

    it('marks connectedAssessmentState as not connected when assessmentPsat has no connectedItem', () => {
      expect(component.connectedAssessmentState.connectedAssessmentStatus).toBeUndefined();
    });

    it('marks connectedAssessmentState as connected-to-inventory when assessmentPsat has a connectedItem', () => {
      const connectedPsat = makePsat();
      connectedPsat.connectedItem = { id: 1 } as any;

      fixture.componentRef.setInput('assessmentPsat', connectedPsat);
      fixture.detectChanges();

      expect(component.connectedAssessmentState.connectedAssessmentStatus).toBe('connected-to-inventory');
    });

    it('does not flag showUpdateDataReminder when existingDataUnits matches the current units', () => {
      expect(component.showUpdateDataReminder).toBeFalse();
    });

    it('flags showUpdateDataReminder and rebuilds oldSettings from existing data units when they differ', () => {
      const psatWithExistingUnits = makePsat();
      psatWithExistingUnits.existingDataUnits = 'Metric';
      const assessmentWithExistingUnits = makeAssessment(psatWithExistingUnits);

      const reminderFixture = TestBed.createComponent(SystemBasicsComponent);
      reminderFixture.componentRef.setInput('assessment', assessmentWithExistingUnits);
      reminderFixture.componentRef.setInput('assessmentPsat', psatWithExistingUnits);
      reminderFixture.componentRef.setInput('settings', MOCK_SETTINGS);
      reminderFixture.detectChanges();

      expect(reminderFixture.componentInstance.showUpdateDataReminder).toBeTrue();
      expect(settingsServiceSpy.setUnits).toHaveBeenCalled();
      expect(reminderFixture.componentInstance.oldSettings.unitsOfMeasure).toBe('Metric');
    });
  });

  describe('saveChanges', () => {
    it('persists settings and emits updateSettings', async () => {
      const emitted: boolean[] = [];
      component.updateSettings.subscribe(value => emitted.push(value));

      await component.saveChanges();

      expect(settingsDbServiceSpy.updateWithObservable).toHaveBeenCalled();
      expect(settingsDbServiceSpy.getAllSettings).toHaveBeenCalled();
      expect(settingsDbServiceSpy.setAll).toHaveBeenCalledWith([MOCK_SETTINGS]);
      expect(emitted).toEqual([true]);
    });

    it('flags showUpdateDataReminder and emits updateAssessment when units change and data already exists', async () => {
      const emittedAssessment: PSAT[] = [];
      component.updateAssessment.subscribe(value => emittedAssessment.push(value));
      component.settingsForm.controls.unitsOfMeasure.setValue('Metric');

      await component.saveChanges();

      expect(component.showUpdateDataReminder).toBeTrue();
      expect(emittedAssessment).toEqual([mockPsat]);
      expect(mockPsat.existingDataUnits).toBe('Imperial');
    });

    it('does not flag showUpdateDataReminder when units are unchanged', async () => {
      await component.saveChanges();
      expect(component.showUpdateDataReminder).toBeFalse();
    });
  });

  describe('startSavePolling', () => {
    it('delegates to saveChanges', () => {
      spyOn(component, 'saveChanges').and.returnValue(Promise.resolve());
      component.startSavePolling();
      expect(component.saveChanges).toHaveBeenCalled();
    });
  });

  describe('updateData', () => {
    it('converts existing data for the baseline and each modification, then emits updateAssessment', () => {
      const emittedAssessment: PSAT[] = [];
      component.updateAssessment.subscribe(value => emittedAssessment.push(value));
      component.assessment.psat.modifications = [{ psat: makePsat() } as any];
      component.showUpdateDataReminder = true;

      component.updateData();

      expect(psatServiceSpy.convertExistingData).toHaveBeenCalledTimes(2);
      expect(component.showUpdateDataReminder).toBeFalse();
      expect(component.assessment.psat.existingDataUnits).toBe(MOCK_SETTINGS.unitsOfMeasure);
      expect(emittedAssessment).toEqual([component.assessment.psat]);
    });

    it('shows and then hides the success message when showSuccess is true', fakeAsync(() => {
      component.updateData(true);
      expect(component.showSuccessMessage).toBeTrue();

      tick(3000);
      expect(component.showSuccessMessage).toBeFalse();
    }));
  });

  describe('dismissSuccessMessage', () => {
    it('hides the success message', () => {
      component.showSuccessMessage = true;
      component.dismissSuccessMessage();
      expect(component.showSuccessMessage).toBeFalse();
    });
  });

  describe('template visibility', () => {
    it('hides the update-data reminder by default', () => {
      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
    });

    it('shows the update-data reminder when showUpdateDataReminder is true', () => {
      component.showUpdateDataReminder = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.alert-warning')).not.toBeNull();
    });

    it('hides the success message by default', () => {
      expect(fixture.nativeElement.querySelector('.alert-success')).toBeNull();
    });

    it('shows the success message when showSuccessMessage is true', () => {
      component.showSuccessMessage = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.alert-success')).not.toBeNull();
    });
  });

  describe('ngOnDestroy (supplemental, outside the 8 mandated categories)', () => {
    it('emits openUpdateUnitsModal with oldSettings when a reminder is pending on destroy', () => {
      const emitted: Settings[] = [];
      component.openUpdateUnitsModal.subscribe(value => emitted.push(value));
      component.showUpdateDataReminder = true;

      fixture.destroy();

      expect(emitted).toEqual([component.oldSettings]);
    });

    it('does not emit openUpdateUnitsModal when no reminder is pending on destroy', () => {
      const emitted: Settings[] = [];
      component.openUpdateUnitsModal.subscribe(value => emitted.push(value));
      component.showUpdateDataReminder = false;

      fixture.destroy();

      expect(emitted).toEqual([]);
    });
  });
});
