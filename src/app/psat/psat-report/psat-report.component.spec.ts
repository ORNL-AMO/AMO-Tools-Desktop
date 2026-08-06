import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ElementRef, NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { of } from 'rxjs';

import { PsatReportComponent } from './psat-report.component';
import { SettingsService } from '../../settings/settings.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { PsatService } from '../psat.service';
import { PsatReportAdapter } from './psat-report.adapter';
import { PSAT, PsatOutputs, PsatValid, Modification } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { Directory } from '../../shared/models/directory';
import { ReportDocument } from '../../shared/report-builder/models/report-document.model';

const MOCK_SETTINGS: Settings = { temperatureMeasurement: 'F', unitsOfMeasure: 'Imperial' } as Settings;

function makeValid(overrides: Partial<PsatValid> = {}): PsatValid {
  return { isValid: true, pumpFluidValid: true, motorValid: true, fieldDataValid: true, ...overrides };
}

function makeOutputs(overrides: Partial<PsatOutputs> = {}): PsatOutputs {
  return { annual_cost: 60000, annual_energy: 1000, ...overrides };
}

function makeModification(annualCost: number, whatIfScenario = true, id = 'mod-1'): Modification {
  return {
    id,
    psat: {
      name: 'Modification 1',
      inputs: { whatIfScenario },
      outputs: makeOutputs({ annual_cost: annualCost }),
    },
  } as Modification;
}

function makePsat(overrides: Partial<PSAT> = {}): PSAT {
  return {
    name: 'Baseline',
    inputs: {},
    outputs: makeOutputs(),
    valid: makeValid(),
    setupDone: true,
    ...overrides,
  } as PSAT;
}

function makeAssessment(psat: PSAT, overrides: Partial<Assessment> = {}): Assessment {
  return { id: 1, name: 'Test Assessment', psat, type: 'PSAT', ...overrides } as Assessment;
}

describe('PsatReportComponent', () => {
  let component: PsatReportComponent;
  let fixture: ComponentFixture<PsatReportComponent>;
  let settingsServiceSpy: jasmine.SpyObj<SettingsService>;
  let settingsDbServiceSpy: jasmine.SpyObj<SettingsDbService>;
  let directoryDbServiceSpy: jasmine.SpyObj<DirectoryDbService>;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let reportAdapterSpy: jasmine.SpyObj<PsatReportAdapter>;

  beforeEach(() => {
    settingsServiceSpy = jasmine.createSpyObj('SettingsService', ['setTemperatureUnit']);
    settingsServiceSpy.setTemperatureUnit.and.callFake((settings: Settings) => ({ ...settings, temperatureMeasurement: 'F' }));

    settingsDbServiceSpy = jasmine.createSpyObj('SettingsDbService', ['getByAssessmentId']);
    settingsDbServiceSpy.getByAssessmentId.and.returnValue(MOCK_SETTINGS);

    directoryDbServiceSpy = jasmine.createSpyObj('DirectoryDbService', ['getById']);

    psatServiceSpy = jasmine.createSpyObj('PsatService', ['isPsatValid', 'resultsExisting', 'resultsModified', 'emptyResults']);
    psatServiceSpy.isPsatValid.and.returnValue(makeValid());
    psatServiceSpy.resultsExisting.and.returnValue(makeOutputs());
    psatServiceSpy.resultsModified.and.returnValue(makeOutputs());
    psatServiceSpy.emptyResults.and.returnValue(makeOutputs({ annual_cost: 0, annual_energy: 0 }));

    reportAdapterSpy = jasmine.createSpyObj('PsatReportAdapter', ['buildDocument']);
    reportAdapterSpy.buildDocument.and.returnValue(of({} as ReportDocument));

    TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [PsatReportComponent],
      providers: [
        { provide: SettingsService, useValue: settingsServiceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceSpy },
        { provide: DirectoryDbService, useValue: directoryDbServiceSpy },
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: PsatReportAdapter, useValue: reportAdapterSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(PsatReportComponent);
    component = fixture.componentInstance;
    component.settings = MOCK_SETTINGS;
    component.assessment = makeAssessment(makePsat());
    component.inPsat = false;
    component.inRollup = false;
  });

  describe('initialization', () => {
    it('creates the component', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('sets createdDate on init', () => {
      fixture.detectChanges();
      expect(component.createdDate).toBeInstanceOf(Date);
    });

    it('does not fetch settings from the db when settings are already provided', () => {
      fixture.detectChanges();
      expect(settingsDbServiceSpy.getByAssessmentId).not.toHaveBeenCalled();
      expect(component.settings).toBe(MOCK_SETTINGS);
    });

    it('fetches settings from the db when settings are not provided', () => {
      component.settings = undefined;
      fixture.detectChanges();
      expect(settingsDbServiceSpy.getByAssessmentId).toHaveBeenCalledWith(component.assessment);
      expect(component.settings.temperatureMeasurement).toBe('F');
    });

    it('sets the temperature unit when fetched settings are missing a temperatureMeasurement', () => {
      component.settings = undefined;
      settingsDbServiceSpy.getByAssessmentId.and.returnValue({ unitsOfMeasure: 'Imperial' } as Settings);
      fixture.detectChanges();
      expect(settingsServiceSpy.setTemperatureUnit).toHaveBeenCalled();
      expect(component.settings.temperatureMeasurement).toBe('F');
    });

    it('does not set the temperature unit when fetched settings already have one', () => {
      component.settings = undefined;
      fixture.detectChanges();
      expect(settingsServiceSpy.setTemperatureUnit).not.toHaveBeenCalled();
    });

    it('defaults psat.modifications to an empty array when missing', () => {
      const psat = makePsat();
      delete psat.modifications;
      component.assessment = makeAssessment(psat);
      fixture.detectChanges();
      expect(component.assessment.psat.modifications).toEqual([]);
    });

    it('builds the assessment directory list by walking up to the root directory', () => {
      const subDirectory = { id: 5, name: 'Sub', parentDirectoryId: 2 } as Directory;
      const parentDirectory = { id: 2, name: 'Parent', parentDirectoryId: 1 } as Directory;
      directoryDbServiceSpy.getById.and.callFake((id: number) => id === 5 ? subDirectory : id === 2 ? parentDirectory : undefined);
      component.assessment = makeAssessment(makePsat(), { directoryId: 5 });

      fixture.detectChanges();

      expect(component.assessmentDirectories).toEqual([subDirectory, parentDirectory]);
    });

    it('does not walk the directory list when directoryId is the root (1)', () => {
      component.assessment = makeAssessment(makePsat(), { directoryId: 1 });
      fixture.detectChanges();
      expect(component.assessmentDirectories).toEqual([]);
      expect(directoryDbServiceSpy.getById).not.toHaveBeenCalled();
    });

    it('builds the report document from the adapter and assigns it to reportDocument$', () => {
      const doc$ = of({} as ReportDocument);
      reportAdapterSpy.buildDocument.and.returnValue(doc$);
      fixture.detectChanges();
      expect(reportAdapterSpy.buildDocument).toHaveBeenCalledWith(component.assessment);
      expect(component.reportDocument$).toBe(doc$);
    });
  });

  describe('ngOnChanges', () => {
    it('recalculates the container height when containerHeight changes on a non-first change', () => {
      fixture.detectChanges();
      spyOn(component, 'getContainerHeight');
      component.ngOnChanges({ containerHeight: new SimpleChange(400, 500, false) });
      expect(component.getContainerHeight).toHaveBeenCalled();
    });

    it('does not recalculate the container height on the first containerHeight change', () => {
      fixture.detectChanges();
      spyOn(component, 'getContainerHeight');
      component.ngOnChanges({ containerHeight: new SimpleChange(undefined, 500, true) });
      expect(component.getContainerHeight).not.toHaveBeenCalled();
    });

    it('does not recalculate the container height when an unrelated input changes', () => {
      fixture.detectChanges();
      spyOn(component, 'getContainerHeight');
      component.ngOnChanges({ inPsat: new SimpleChange(false, true, false) });
      expect(component.getContainerHeight).not.toHaveBeenCalled();
    });
  });

  describe('getContainerHeight', () => {
    it('computes reportContainerHeight from containerHeight minus button and header heights', () => {
      fixture.detectChanges();
      component.containerHeight = 500;
      component.reportBtns = { nativeElement: { clientHeight: 40 } } as ElementRef;
      component.reportHeader = { nativeElement: { clientHeight: 60 } } as ElementRef;

      component.getContainerHeight();

      expect(component.reportContainerHeight).toBe(500 - 40 - 60 - 2);
    });

    it('does nothing when the button or header view children are not yet available', () => {
      fixture.detectChanges();
      component.reportBtns = undefined;
      component.reportHeader = undefined;

      component.getContainerHeight();

      expect(component.reportContainerHeight).toBeUndefined();
    });

    it('is invoked automatically shortly after the view initializes', fakeAsync(() => {
      fixture.detectChanges();
      spyOn(component, 'getContainerHeight');
      tick(100);
      expect(component.getContainerHeight).toHaveBeenCalled();
    }));
  });

  describe('setTab / collapseTabs', () => {
    it('sets currentTab and collapses the tab menu', () => {
      fixture.detectChanges();
      component.tabsCollapsed = false;
      component.setTab('reportGraphs');
      expect(component.currentTab).toBe('reportGraphs');
      expect(component.tabsCollapsed).toBeTrue();
    });

    it('collapseTabs toggles tabsCollapsed', () => {
      fixture.detectChanges();
      const initial = component.tabsCollapsed;
      component.collapseTabs();
      expect(component.tabsCollapsed).toBe(!initial);
    });
  });

  describe('closeAssessment', () => {
    it('emits true on closeReport', () => {
      fixture.detectChanges();
      const emitted: boolean[] = [];
      component.closeReport.subscribe((value: boolean) => emitted.push(value));

      component.closeAssessment();

      expect(emitted).toEqual([true]);
    });
  });

  describe('setOutputs (calculation triggers & output rendering)', () => {
    it('sets baseline outputs from resultsExisting when the baseline is valid', () => {
      fixture.detectChanges();
      expect(psatServiceSpy.resultsExisting).toHaveBeenCalled();
      expect(component.assessment.psat.outputs.annual_cost).toBe(60000);
      expect(component.assessment.psat.outputs.percent_annual_savings).toBe(0);
    });

    it('sets baseline outputs from emptyResults when the baseline is invalid', () => {
      psatServiceSpy.isPsatValid.and.returnValue(makeValid({ isValid: false }));
      fixture.detectChanges();
      expect(psatServiceSpy.emptyResults).toHaveBeenCalled();
      expect(component.assessment.psat.outputs.annual_cost).toBe(0);
    });

    it('sets modification outputs from resultsModified when valid and whatIfScenario is true', () => {
      const psat = makePsat({ modifications: [makeModification(48000, true)] });
      component.assessment = makeAssessment(psat);
      fixture.detectChanges();
      expect(psatServiceSpy.resultsModified).toHaveBeenCalled();
      expect(component.assessment.psat.modifications[0].psat.outputs.annual_cost).toBe(60000); // from resultsModified mock return value
    });

    it('sets modification outputs from resultsExisting when valid and whatIfScenario is false', () => {
      const psat = makePsat({ modifications: [makeModification(48000, false)] });
      component.assessment = makeAssessment(psat);
      fixture.detectChanges();
      expect(psatServiceSpy.resultsExisting).toHaveBeenCalledTimes(2); // baseline + this modification
    });

    it('computes percent_annual_savings for a modification from the baseline and modification annual cost', () => {
      psatServiceSpy.resultsModified.and.returnValue(makeOutputs({ annual_cost: 45000 }));
      const psat = makePsat({ outputs: makeOutputs({ annual_cost: 60000 }), modifications: [makeModification(45000, true)] });
      component.assessment = makeAssessment(psat);
      fixture.detectChanges();
      expect(component.assessment.psat.modifications[0].psat.outputs.percent_annual_savings).toBe(25);
    });
  });

  describe('getSavingsPercentage', () => {
    it('computes rounded percent savings between baseline and modification annual cost', () => {
      fixture.detectChanges();
      const baseline = makePsat({ outputs: makeOutputs({ annual_cost: 1000 }) });
      const modification = makePsat({ outputs: makeOutputs({ annual_cost: 750 }) });
      expect(component.getSavingsPercentage(baseline, modification)).toBe(25);
    });
  });

  describe('template visibility', () => {
    it('shows the report cover when inPsat is true', () => {
      component.inPsat = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.report-cover')).not.toBeNull();
    });

    it('hides the report cover when inPsat is false', () => {
      component.inPsat = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.report-cover')).toBeNull();
    });

    it('shows the assessment title header when there is an assessment and not inPsat', () => {
      component.inPsat = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.assessment-name')).not.toBeNull();
      expect(fixture.nativeElement.textContent).toContain('Test Assessment');
    });

    it('hides the assessment title header when inPsat is true', () => {
      component.inPsat = true;
      fixture.detectChanges();
      const header = fixture.nativeElement.querySelector('.report-header');
      expect(header.textContent).not.toContain('Test Assessment');
    });

    it('shows the report-data block when the assessment is set up and valid', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.report-data')).not.toBeNull();
      expect(fixture.nativeElement.textContent).not.toContain('has not been completed');
    });

    it('hides the report-data block and shows the incomplete-assessment message when setupDone is false', () => {
      component.assessment = makeAssessment(makePsat({ setupDone: false }));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.report-data')).toBeNull();
      expect(fixture.nativeElement.textContent).toContain('has not been completed');
    });

    it('hides the report-data block when the baseline is invalid, even if setupDone is true', () => {
      psatServiceSpy.isPsatValid.and.returnValue(makeValid({ isValid: false }));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.report-data')).toBeNull();
      expect(fixture.nativeElement.textContent).toContain('has not been completed');
    });

    it('shows the output-summary tab content when currentTab is "results" and hides the other tab panels', () => {
      fixture.detectChanges(); // default currentTab === 'results'
      expect(fixture.nativeElement.querySelector('app-output-summary')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-input-summary')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-psat-report-graphs')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-psat-report-sankey')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-facility-info-summary')).toBeNull();
    });

    it('shows the input-summary tab content when currentTab is "inputData"', () => {
      fixture.detectChanges();
      component.setTab('inputData');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-input-summary')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-output-summary')).toBeNull();
    });

    it('shows the report-graphs tab content when currentTab is "reportGraphs"', () => {
      fixture.detectChanges();
      component.setTab('reportGraphs');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-psat-report-graphs')).not.toBeNull();
    });

    it('shows the report-sankey tab content when currentTab is "reportSankey"', () => {
      fixture.detectChanges();
      component.setTab('reportSankey');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-psat-report-sankey')).not.toBeNull();
    });

    it('shows the facility-info tab content when currentTab is "facilityInfo"', () => {
      fixture.detectChanges();
      component.setTab('facilityInfo');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-facility-info-summary')).not.toBeNull();
    });

    it('marks the active tab link with the "active" class', () => {
      fixture.detectChanges();
      const resultsTabs = fixture.nativeElement.querySelectorAll('.tabs.primary li');
      expect(resultsTabs[0].classList.contains('active')).toBeTrue();
      expect(resultsTabs[1].classList.contains('active')).toBeFalse();
    });

    it('shows the caret-down icon and collapses the mobile menu items when tabsCollapsed is true', () => {
      fixture.detectChanges();
      expect(component.tabsCollapsed).toBeTrue();
      const mobileMenu = fixture.nativeElement.querySelectorAll('.d-flex.d-lg-none .tabs.primary')[0];
      expect(mobileMenu.querySelector('.fa-caret-down')).not.toBeNull();
      expect(mobileMenu.querySelector('.fa-caret-up')).toBeNull();
    });

    it('shows the caret-up icon when tabsCollapsed is false', () => {
      fixture.detectChanges();
      component.collapseTabs(); // toggles tabsCollapsed to false
      fixture.detectChanges();
      const mobileMenu = fixture.nativeElement.querySelectorAll('.d-flex.d-lg-none .tabs.primary')[0];
      expect(mobileMenu.querySelector('.fa-caret-up')).not.toBeNull();
      expect(mobileMenu.querySelector('.fa-caret-down')).toBeNull();
    });
  });
});
