import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { UntypedFormGroup } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SystemBasicsComponent } from './system-basics.component';
import { SettingsService } from '../../settings/settings.service';
import { ConvertFsatService } from '../convert-fsat.service';
import { Assessment } from '../../shared/models/assessment';
import { FSAT } from '../../shared/models/fans';
import { Settings } from '../../shared/models/settings';

function makeSettings(unitsOfMeasure: string): Settings {
  return { unitsOfMeasure, id: 1 } as Settings;
}

function makeAssessment(existingDataUnits?: string): Assessment {
  return { name: 'Test Fan', type: 'FSAT', fsat: { existingDataUnits } as FSAT } as Assessment;
}

describe('SystemBasicsComponent', () => {
  let component: SystemBasicsComponent;
  let fixture: ComponentFixture<SystemBasicsComponent>;
  let settingsServiceSpy: jasmine.SpyObj<SettingsService>;
  let convertFsatServiceSpy: jasmine.SpyObj<ConvertFsatService>;

  beforeEach(async () => {
    settingsServiceSpy = jasmine.createSpyObj('SettingsService', ['getFormFromSettings', 'getSettingsFromForm', 'setUnits']);
    settingsServiceSpy.getFormFromSettings.and.returnValue(new UntypedFormGroup({}));
    settingsServiceSpy.getSettingsFromForm.and.callFake(() => makeSettings('Imperial'));
    settingsServiceSpy.setUnits.and.callFake((form: UntypedFormGroup) => form);

    convertFsatServiceSpy = jasmine.createSpyObj('ConvertFsatService', ['convertExistingData']);
    convertFsatServiceSpy.convertExistingData.and.callFake((fsat: FSAT) => fsat);

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [SystemBasicsComponent],
      providers: [
        { provide: SettingsService, useValue: settingsServiceSpy },
        { provide: ConvertFsatService, useValue: convertFsatServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  function createComponent(existingDataUnits?: string): void {
    fixture = TestBed.createComponent(SystemBasicsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', makeSettings('Imperial'));
    fixture.componentRef.setInput('assessment', makeAssessment(existingDataUnits));
    fixture.detectChanges();
  }

  const reminder = (): HTMLElement => fixture.nativeElement.querySelector('.alert-warning');
  const successMessage = (): HTMLElement => fixture.nativeElement.querySelector('.alert-success');

  describe('initialization', () => {
    it('builds the settings form and remembers the current settings', () => {
      createComponent();
      expect(component).toBeTruthy();
      expect(settingsServiceSpy.getFormFromSettings).toHaveBeenCalledWith(component.settings);
      expect(component.oldSettings.unitsOfMeasure).toBe('Imperial');
      expect(component.showUpdateDataReminder).toBeFalse();
    });

    it('shows the update data reminder when existing data units differ from the current units', () => {
      createComponent('Metric');
      expect(settingsServiceSpy.setUnits).toHaveBeenCalled();
      expect(component.showUpdateDataReminder).toBeTrue();
    });
  });

  describe('template visibility', () => {
    describe('update data reminder', () => {
      it('is hidden when existing data units match the current units', () => {
        createComponent('Imperial');
        expect(reminder()).toBeNull();
      });

      it('is hidden when no existing data units are recorded', () => {
        createComponent();
        expect(reminder()).toBeNull();
      });

      it('is shown when existing data units differ from the current units', () => {
        createComponent('Metric');
        expect(reminder()).not.toBeNull();
        expect(reminder().textContent).toContain('Units of measure were changed');
      });
    });

    describe('success message', () => {
      it('is hidden by default', () => {
        createComponent();
        expect(successMessage()).toBeNull();
      });

      it('is shown after data is updated and hides again after 3 seconds', fakeAsync(() => {
        createComponent('Metric');

        component.updateData(true);
        fixture.detectChanges();
        expect(successMessage()).not.toBeNull();
        expect(reminder()).toBeNull();

        tick(3000);
        fixture.detectChanges();
        expect(successMessage()).toBeNull();
      }));

      it('is not shown when data is updated without the success flag', () => {
        createComponent('Metric');
        component.updateData();
        fixture.detectChanges();
        expect(successMessage()).toBeNull();
      });

      it('is hidden when dismissed', () => {
        createComponent();
        component.showSuccessMessage = true;
        fixture.detectChanges();
        expect(successMessage()).not.toBeNull();

        component.dismissSuccessMessage();
        fixture.detectChanges();
        expect(successMessage()).toBeNull();
      });
    });
  });

  describe('updateData', () => {
    it('converts existing data, clears the reminder and emits the updated fsat', () => {
      createComponent('Metric');
      const emitted: FSAT[] = [];
      component.emitSaveFsat.subscribe((f: FSAT) => emitted.push(f));

      component.updateData();

      expect(convertFsatServiceSpy.convertExistingData).toHaveBeenCalled();
      expect(component.showUpdateDataReminder).toBeFalse();
      expect(component.assessment.fsat.existingDataUnits).toBe('Imperial');
      expect(emitted).toEqual([component.assessment.fsat]);
    });
  });

  describe('save', () => {
    it('emits the settings without flagging a reminder when units are unchanged', () => {
      createComponent();
      const emitted: Settings[] = [];
      component.emitSave.subscribe((s: Settings) => emitted.push(s));

      component.save();

      expect(emitted.length).toBe(1);
      expect(component.showUpdateDataReminder).toBeFalse();
    });

    it('records the old units and shows the reminder when units change', () => {
      createComponent();
      const fsatEmitted: FSAT[] = [];
      component.emitSaveFsat.subscribe((f: FSAT) => fsatEmitted.push(f));
      settingsServiceSpy.getSettingsFromForm.and.returnValue(makeSettings('Metric'));

      component.save();
      fixture.detectChanges();

      expect(component.assessment.fsat.existingDataUnits).toBe('Imperial');
      expect(fsatEmitted.length).toBe(1);
      expect(reminder()).not.toBeNull();
    });
  });

  describe('destroy', () => {
    it('opens the update units modal with the old settings when a reminder is pending', () => {
      createComponent('Metric');
      const emitted: Settings[] = [];
      component.openUpdateUnitsModal.subscribe((s: Settings) => emitted.push(s));

      fixture.destroy();

      expect(emitted).toEqual([component.oldSettings]);
    });

    it('does not open the modal when no reminder is pending', () => {
      createComponent();
      const emitted: Settings[] = [];
      component.openUpdateUnitsModal.subscribe((s: Settings) => emitted.push(s));

      fixture.destroy();

      expect(emitted).toEqual([]);
    });
  });
});
