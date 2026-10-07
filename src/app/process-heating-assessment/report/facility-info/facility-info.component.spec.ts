import { OperatingHours } from '../../../shared/models/operations';
import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhonePipe } from '../../../shared/shared-pipes/phone.pipe';
import { Settings } from '../../../shared/models/settings';
import { PHAST } from '../../models/phast';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { FacilityInfoComponent } from './facility-info.component';

describe('FacilityInfoComponent', () => {
  let fixture: ComponentFixture<FacilityInfoComponent>;
  let settings: WritableSignal<Partial<Settings>>;
  let processHeating: WritableSignal<Partial<PHAST>>;

  function rowValue(label: string): string {
    const row = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('tr')).find(
      (el) => el.querySelector('td')?.textContent.trim() === label
    );
    return row?.querySelectorAll('td')[1].textContent.trim();
  }

  beforeEach(() => {
    settings = signal<Partial<Settings>>({
      facilityInfo: {
        companyName: 'Acme',
        facilityName: 'Plant 1',
        date: '2026-01-01',
        address: { street: '1 Main', city: 'Oak Ridge', state: 'TN', zip: '37830', country: 'USA' },
        facilityContact: { contactName: 'Pat', phoneNumber: 8655551234, email: 'pat@acme.com' },
        assessmentContact: { contactName: 'Sam', phoneNumber: 8655551234, email: 'sam@acme.com' }
      }
    });
    processHeating = signal<Partial<PHAST>>({
      equipmentNotes: 'Batch furnace',
      operatingHours: { operatingConditions: 'Two shifts' } as OperatingHours
    });

    const assessmentService = jasmine.createSpyObj('ProcessHeatingAssessmentService', [], {
      settingsSignal: settings,
      processHeatingSignal: processHeating
    });

    TestBed.configureTestingModule({
      declarations: [FacilityInfoComponent, PhonePipe],
      providers: [{ provide: ProcessHeatingAssessmentService, useValue: assessmentService }],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(FacilityInfoComponent);
    fixture.detectChanges();
  });

  it('renders general, location, and contact details from settings', () => {
    expect(rowValue('Company Name')).toBe('Acme');
    expect(rowValue('Facility Name')).toBe('Plant 1');
    expect(rowValue('City')).toBe('Oak Ridge');
    expect(fixture.nativeElement.textContent).toContain('(865) 555-1234');
    expect(fixture.nativeElement.textContent).toContain('pat@acme.com');
    expect(fixture.nativeElement.textContent).toContain('sam@acme.com');
  });

  it('renders equipment notes and operating conditions from the assessment', () => {
    expect(rowValue('Equipment Notes')).toBe('Batch furnace');
    expect(rowValue('Operating Conditions')).toBe('Two shifts');
  });

  it('updates when the assessment values change', () => {
    processHeating.set({ equipmentNotes: 'Updated', operatingHours: { operatingConditions: 'Three shifts' } as OperatingHours });
    fixture.detectChanges();
    expect(rowValue('Equipment Notes')).toBe('Updated');
    expect(rowValue('Operating Conditions')).toBe('Three shifts');
  });

  it('renders no table when facility info is missing', () => {
    settings.set({});
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
  });
});
