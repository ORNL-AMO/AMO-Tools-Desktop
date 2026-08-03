import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { PsatReportComponent } from './psat-report.component';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { SettingsService } from '../../settings/settings.service';
import { PsatService } from '../psat.service';
import { PsatReportAdapter } from './psat-report.adapter';

const MOCK_SETTINGS: any = { unitsOfMeasure: 'Imperial', emissionsUnit: 'Imperial' };

function makeAssessment(overrides: any = {}): any {
  return {
    id: 1,
    name: 'Test PSAT',
    directoryId: 1,
    psat: {
      setupDone: true,
      valid: { isValid: true },
      inputs: {
        flow_rate: 100,
        head: 200,
        motor_rated_power: 50,
        fluidTemperature: 60,
      },
      outputs: { pump_efficiency: 80, annual_energy: 1000, annual_cost: 5000, co2EmissionsOutput: 100 },
      modifications: [],
      ...overrides.psat,
    },
    ...overrides,
  };
}

describe('PsatReportComponent', () => {
  let component: PsatReportComponent;
  let fixture: ComponentFixture<PsatReportComponent>;

  beforeEach(async () => {
    const settingsDbServiceSpy = jasmine.createSpyObj('SettingsDbService', [
      'getByAssessmentId',
    ]);
    settingsDbServiceSpy.getByAssessmentId.and.returnValue(MOCK_SETTINGS);

    const directoryDbServiceSpy = jasmine.createSpyObj('DirectoryDbService', ['getById']);
    directoryDbServiceSpy.getById.and.returnValue({ id: 1, parentDirectoryId: 1, name: 'Root' });

    const settingsServiceSpy = jasmine.createSpyObj('SettingsService', [
      'setTemperatureUnit',
    ]);
    settingsServiceSpy.setTemperatureUnit.and.returnValue(MOCK_SETTINGS);

    const mockOutputs = {
      pump_efficiency: 80,
      annual_energy: 1000,
      annual_cost: 5000,
      co2EmissionsOutput: 100,
      percent_annual_savings: 0,
    };
    const psatServiceSpy = jasmine.createSpyObj('PsatService', [
      'resultsExisting',
      'getResults',
      'isPsatValid',
    ]);
    psatServiceSpy.resultsExisting.and.returnValue(mockOutputs);
    psatServiceSpy.isPsatValid.and.returnValue({ isValid: true, pumpFluidValid: true, motorValid: true, fieldDataValid: true });

    const reportAdapterSpy = jasmine.createSpyObj('PsatReportAdapter', ['buildDocument']);
    reportAdapterSpy.buildDocument.and.returnValue(of({ sections: [] }));

    await TestBed.configureTestingModule({
      declarations: [PsatReportComponent],
      providers: [
        { provide: SettingsDbService, useValue: settingsDbServiceSpy },
        { provide: DirectoryDbService, useValue: directoryDbServiceSpy },
        { provide: SettingsService, useValue: settingsServiceSpy },
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: PsatReportAdapter, useValue: reportAdapterSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PsatReportComponent);
    component = fixture.componentInstance;
    component.assessment = makeAssessment();
    component.settings = MOCK_SETTINGS;
    component.inPsat = true;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  describe('report cover visibility', () => {
    it('shows report cover when inPsat is true', () => {
      component.inPsat = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.report-cover')).not.toBeNull();
    });

    it('hides report cover when inPsat is false', () => {
      component.inPsat = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.report-cover')).toBeNull();
    });
  });

  describe('report data visibility', () => {
    it('shows report data when setupDone and isValid', () => {
      component.assessment.psat.setupDone = true;
      component.assessment.psat.valid.isValid = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.report-data')).not.toBeNull();
    });

    it('hides report data when setupDone is false', () => {
      component.assessment.psat.setupDone = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.report-data')).toBeNull();
    });

    it('hides report data when isValid is false', () => {
      component.assessment.psat.valid.isValid = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.report-data')).toBeNull();
    });
  });

  describe('tab content rendering', () => {
    beforeEach(() => {
      component.assessment.psat.setupDone = true;
      component.assessment.psat.valid.isValid = true;
    });

    it('shows facilityInfo tab content when currentTab is "facilityInfo"', () => {
      component.currentTab = 'facilityInfo';
      fixture.detectChanges();
      const tab = fixture.nativeElement.querySelector('.results.scroll-item.print-height');
      expect(tab).not.toBeNull();
    });

    it('shows results tab content when currentTab is "results"', () => {
      component.currentTab = 'results';
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-output-summary')).not.toBeNull();
    });
  });

  describe('tabsCollapsed icon', () => {
    beforeEach(() => {
      component.assessment.psat.setupDone = true;
      component.assessment.psat.valid.isValid = true;
    });

    it('shows caret-up when tabsCollapsed is false', () => {
      component.tabsCollapsed = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.fa.fa-caret-up')).not.toBeNull();
    });

    it('shows caret-down when tabsCollapsed is true', () => {
      component.tabsCollapsed = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.fa.fa-caret-down')).not.toBeNull();
    });
  });
});
