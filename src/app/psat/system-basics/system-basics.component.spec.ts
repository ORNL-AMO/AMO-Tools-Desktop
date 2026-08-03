import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SystemBasicsComponent } from './system-basics.component';
import { SettingsService } from '../../settings/settings.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { PsatService } from '../psat.service';

describe('SystemBasicsComponent', () => {
  let component: SystemBasicsComponent;
  let fixture: ComponentFixture<SystemBasicsComponent>;

  const mockAssessment: any = {
    id: 1,
    psat: {
      inputs: {},
      existingDataUnits: null,
    },
  };

  const mockSettings: any = {
    id: 1,
    unitsOfMeasure: 'Imperial',
    assessmentId: 1,
  };

  beforeEach(async () => {
    const mockForm: any = {
      value: mockSettings,
      get: () => null,
      patchValue: () => {},
    };

    const settingsServiceSpy = jasmine.createSpyObj('SettingsService', [
      'getFormFromSettings',
      'getSettingsFromForm',
      'setUnits',
    ]);
    settingsServiceSpy.getFormFromSettings.and.returnValue(mockForm);
    settingsServiceSpy.getSettingsFromForm.and.returnValue({ ...mockSettings });

    const settingsDbServiceSpy = jasmine.createSpyObj('SettingsDbService', [
      'updateWithObservable',
      'getAllSettings',
      'setAll',
    ]);
    settingsDbServiceSpy.globalSettings = null;

    const psatServiceSpy = jasmine.createSpyObj('PsatService', ['convertExistingData']);
    psatServiceSpy.convertExistingData.and.returnValue(mockAssessment.psat);

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
    component.assessment = JSON.parse(JSON.stringify(mockAssessment));
    component.assessmentPsat = { inputs: {}, connectedItem: undefined } as any;
    component.settings = { ...mockSettings };
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  describe('showUpdateDataReminder', () => {
    it('hides update data reminder when showUpdateDataReminder is false', () => {
      component.showUpdateDataReminder = false;
      fixture.detectChanges();
      const reminder = fixture.nativeElement.querySelector('.alert-warning');
      expect(reminder).toBeNull();
    });

    it('shows update data reminder when showUpdateDataReminder is true', () => {
      component.showUpdateDataReminder = true;
      fixture.detectChanges();
      const reminder = fixture.nativeElement.querySelector('.alert-warning');
      expect(reminder).not.toBeNull();
    });
  });

  describe('showSuccessMessage', () => {
    it('hides success message when showSuccessMessage is false', () => {
      component.showSuccessMessage = false;
      fixture.detectChanges();
      const successMsg = fixture.nativeElement.querySelector('.alert-success');
      expect(successMsg).toBeNull();
    });

    it('shows success message when showSuccessMessage is true', () => {
      component.showSuccessMessage = true;
      fixture.detectChanges();
      const successMsg = fixture.nativeElement.querySelector('.alert-success');
      expect(successMsg).not.toBeNull();
    });
  });
});
