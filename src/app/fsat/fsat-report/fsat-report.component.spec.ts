import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';

import { FsatReportComponent } from './fsat-report.component';
import { FsatReportAdapter } from './fsat-report.adapter';
import { FsatService } from '../fsat.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { SettingsService } from '../../settings/settings.service';
import { Assessment } from '../../shared/models/assessment';
import { Directory } from '../../shared/models/directory';
import { FSAT, FsatOutput, FsatValid, Modification } from '../../shared/models/fans';
import { Settings } from '../../shared/models/settings';

const VALID: FsatValid = {
  isValid: true,
  fluidValid: true,
  fanValid: true,
  motorValid: true,
  fieldDataValid: true,
  fsatOperationsValid: true,
};

const INVALID: FsatValid = { ...VALID, isValid: false, fluidValid: false };

const MESSAGE_INCOMPLETE = 'This assessment has not been completed';

const PANEL_SELECTORS: Array<{ tab: string, selector: string }> = [
  { tab: 'results', selector: 'app-results-summary' },
  { tab: 'reportGraphs', selector: 'app-fsat-report-graphs' },
  { tab: 'detailedResults', selector: 'app-detailed-results' },
  { tab: 'reportSankey', selector: 'app-fsat-report-sankey' },
  { tab: 'inputData', selector: 'app-input-summary' },
  { tab: 'facilityInfo', selector: 'app-facility-info-summary' },
];

function makeOutputs(overrides: Partial<FsatOutput> = {}): FsatOutput {
  return { annualEnergy: 500, annualCost: 4000, ...overrides } as FsatOutput;
}

function makeAssessment(overrides: Partial<FSAT> = {}, assessmentOverrides: Partial<Assessment> = {}): Assessment {
  return {
    id: 7,
    name: 'Fan 1',
    directoryId: 1,
    modifiedDate: new Date(2024, 0, 15, 10, 30),
    fsat: { setupDone: true, modifications: [] as Modification[], ...overrides } as FSAT,
    ...assessmentOverrides,
  } as Assessment;
}

function makeSettings(overrides: Partial<Settings> = {}): Settings {
  return { temperatureMeasurement: 'F', ...overrides } as Settings;
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('FsatReportComponent', () => {
  let component: FsatReportComponent;
  let fixture: ComponentFixture<FsatReportComponent>;
  let fsatServiceSpy: jasmine.SpyObj<FsatService>;
  let settingsDbServiceSpy: jasmine.SpyObj<SettingsDbService>;
  let directoryDbServiceSpy: jasmine.SpyObj<DirectoryDbService>;
  let settingsServiceSpy: jasmine.SpyObj<SettingsService>;
  let reportAdapterSpy: jasmine.SpyObj<FsatReportAdapter>;
  let serviceContainerHeight: BehaviorSubject<number>;
  let serviceSettings: BehaviorSubject<Settings>;
  let serviceAssessment: BehaviorSubject<Assessment>;
  let validResult: FsatValid;

  function render(assessment: Assessment, inputs: { settings?: Settings, inFsat?: boolean, inRollup?: boolean } = {}) {
    component.assessment = assessment;
    component.settings = inputs.settings ?? makeSettings();
    component.inFsat = inputs.inFsat ?? false;
    component.inRollup = inputs.inRollup ?? false;
    fixture.detectChanges();
  }

  function hasPanel(selector: string): boolean {
    return fixture.nativeElement.querySelector(selector) !== null;
  }

  beforeEach(async () => {
    serviceContainerHeight = new BehaviorSubject<number>(500);
    serviceSettings = new BehaviorSubject<Settings>(makeSettings());
    serviceAssessment = new BehaviorSubject<Assessment>(undefined);
    validResult = VALID;

    fsatServiceSpy = jasmine.createSpyObj(
      'FsatService',
      ['checkValid', 'getResults', 'getSavingsPercentage', 'getPaybackPeriod'],
      { containerHeight: serviceContainerHeight, settings: serviceSettings, assessment: serviceAssessment }
    );
    fsatServiceSpy.checkValid.and.callFake(() => validResult);
    fsatServiceSpy.getResults.and.callFake((fsat: FSAT, isBaseline: boolean) =>
      isBaseline ? makeOutputs() : makeOutputs({ annualEnergy: 400, annualCost: 3000 }));
    fsatServiceSpy.getSavingsPercentage.and.returnValue(25);
    fsatServiceSpy.getPaybackPeriod.and.returnValue(12);

    settingsDbServiceSpy = jasmine.createSpyObj('SettingsDbService', ['getByAssessmentId']);
    settingsDbServiceSpy.getByAssessmentId.and.returnValue(makeSettings());
    directoryDbServiceSpy = jasmine.createSpyObj('DirectoryDbService', ['getById']);
    settingsServiceSpy = jasmine.createSpyObj('SettingsService', ['setTemperatureUnit']);
    reportAdapterSpy = jasmine.createSpyObj('FsatReportAdapter', ['buildDocument']);
    reportAdapterSpy.buildDocument.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      declarations: [FsatReportComponent],
      providers: [
        { provide: FsatService, useValue: fsatServiceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceSpy },
        { provide: DirectoryDbService, useValue: directoryDbServiceSpy },
        { provide: SettingsService, useValue: settingsServiceSpy },
        { provide: FsatReportAdapter, useValue: reportAdapterSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FsatReportComponent);
    component = fixture.componentInstance;
  });

  describe('initialization with an assessment input', () => {
    it('creates the component, calculates outputs, and builds the report document', () => {
      const assessment = makeAssessment();
      render(assessment);

      expect(component).toBeTruthy();
      expect(fsatServiceSpy.checkValid).toHaveBeenCalledWith(assessment.fsat, true, component.settings);
      expect(fsatServiceSpy.getResults).toHaveBeenCalledWith(assessment.fsat, true, component.settings);
      expect(assessment.fsat.outputs.annualEnergy).toBe(500);
      expect(reportAdapterSpy.buildDocument).toHaveBeenCalledWith(assessment);
    });

    it('does not subscribe to the fsat service state', () => {
      serviceAssessment.next(makeAssessment({}, { name: 'From service' }));
      const assessment = makeAssessment();
      render(assessment);

      expect(component.assessment).toBe(assessment);
    });

    it('creates an empty modification list when the fsat has none', () => {
      const assessment = makeAssessment({ modifications: undefined });
      render(assessment);

      expect(assessment.fsat.modifications).toEqual([]);
    });

    it('loads settings from the database when none are provided', () => {
      const loaded = makeSettings({ temperatureMeasurement: 'C' });
      settingsDbServiceSpy.getByAssessmentId.and.returnValue(loaded);
      const assessment = makeAssessment();
      component.assessment = assessment;
      component.settings = undefined;

      fixture.detectChanges();

      expect(settingsDbServiceSpy.getByAssessmentId).toHaveBeenCalledWith(assessment);
      expect(component.settings).toBe(loaded);
      expect(settingsServiceSpy.setTemperatureUnit).not.toHaveBeenCalled();
    });

    it('sets the temperature unit on loaded settings that lack one', () => {
      const loaded = makeSettings({ temperatureMeasurement: undefined });
      const withUnit = makeSettings({ temperatureMeasurement: 'F' });
      settingsDbServiceSpy.getByAssessmentId.and.returnValue(loaded);
      settingsServiceSpy.setTemperatureUnit.and.returnValue(withUnit);
      component.assessment = makeAssessment();
      component.settings = undefined;

      fixture.detectChanges();

      expect(settingsServiceSpy.setTemperatureUnit).toHaveBeenCalledWith(loaded);
      expect(component.settings).toBe(withUnit);
    });

    it('does not reload settings when they are provided', () => {
      render(makeAssessment());

      expect(settingsDbServiceSpy.getByAssessmentId).not.toHaveBeenCalled();
    });
  });

  describe('calculation of modification outputs', () => {
    it('computes validity, outputs, and savings for each modification against the baseline', () => {
      const modification = { id: 'm1', fsat: { name: 'Mod A', implementationCosts: 1000 } as FSAT } as Modification;
      const assessment = makeAssessment({ modifications: [modification] });
      render(assessment);

      expect(fsatServiceSpy.getResults).toHaveBeenCalledWith(modification.fsat, false, component.settings);
      expect(fsatServiceSpy.getSavingsPercentage).toHaveBeenCalledWith(4000, 3000);
      expect(fsatServiceSpy.getPaybackPeriod).toHaveBeenCalledWith(1000, 1000);
      expect(modification.fsat.outputs.percentSavings).toBe(25);
      expect(modification.fsat.outputs.energySavings).toBe(100);
      expect(modification.fsat.outputs.annualSavings).toBe(1000);
      expect(modification.fsat.outputs.paybackPeriod).toBe(12);
    });

    it('skips modifications that have no fsat', () => {
      const assessment = makeAssessment({ modifications: [{ id: 'm1' } as Modification] });
      render(assessment);

      expect(fsatServiceSpy.getResults).toHaveBeenCalledTimes(1);
    });
  });

  describe('initialization from the fsat service', () => {
    it('subscribes to the service, marks the report as in fsat, and builds state once an assessment arrives', () => {
      const assessment = makeAssessment();
      serviceAssessment.next(assessment);
      fixture.detectChanges();

      expect(component.inFsat).toBeTrue();
      expect(component.assessment).toBe(assessment);
      expect(component.settings).toBe(serviceSettings.value);
      expect(component.containerHeight).toBe(500);
      expect(reportAdapterSpy.buildDocument).toHaveBeenCalledWith(assessment);
    });

    it('ignores empty settings emitted by the service', () => {
      const settings = makeSettings();
      serviceSettings.next(settings);
      serviceAssessment.next(makeAssessment());
      fixture.detectChanges();

      serviceSettings.next(undefined);

      expect(component.settings).toBe(settings);
    });

    it('rebuilds report state when the service emits a different assessment', () => {
      serviceAssessment.next(makeAssessment());
      fixture.detectChanges();
      const next = makeAssessment({}, { name: 'Fan 2' });

      serviceAssessment.next(next);

      expect(component.assessment).toBe(next);
      expect(reportAdapterSpy.buildDocument).toHaveBeenCalledWith(next);
    });

    it('stops reacting to service state after the component is destroyed', () => {
      const first = makeAssessment();
      serviceAssessment.next(first);
      fixture.detectChanges();
      reportAdapterSpy.buildDocument.calls.reset();

      fixture.destroy();
      serviceAssessment.next(makeAssessment({}, { name: 'Fan 2' }));
      serviceContainerHeight.next(900);

      expect(component.assessment).toBe(first);
      expect(component.containerHeight).toBe(500);
      expect(reportAdapterSpy.buildDocument).not.toHaveBeenCalled();
    });
  });

  describe('template visibility: report cover (inFsat)', () => {
    it('shows the cover with the assessment name when in fsat', () => {
      render(makeAssessment(), { inFsat: true });

      const cover = fixture.nativeElement.querySelector('.report-cover');
      expect(cover).not.toBeNull();
      const titles = Array.from(cover.querySelectorAll('.report-title h4')) as HTMLElement[];
      expect(titles.map(title => normalize(title.textContent))).toEqual(['Fan Efficiency Report:', 'Fan 1']);
    });

    it('hides the cover when not in fsat', () => {
      render(makeAssessment(), { inFsat: false });

      expect(fixture.nativeElement.querySelector('.report-cover')).toBeNull();
    });
  });

  describe('template visibility: header', () => {
    it('hides the generic header title when an assessment exists', () => {
      render(makeAssessment(), { inFsat: false });

      expect(fixture.nativeElement.querySelector('h2.assessment-name')).toBeNull();
    });

    it('shows the rollup header with the assessment name and last modified date when not in fsat', () => {
      render(makeAssessment(), { inFsat: false });

      const header = fixture.nativeElement.querySelector('.assessment-title');
      expect(header).not.toBeNull();
      expect(normalize(header.textContent)).toBe('Fan 1');
      expect(normalize(fixture.nativeElement.querySelector('.date-modified').textContent)).toBe('Last Modified 1/15/24, 10:30 AM');
    });

    it('hides the rollup header when in fsat', () => {
      render(makeAssessment(), { inFsat: true });

      expect(fixture.nativeElement.querySelector('.assessment-title')).toBeNull();
      expect(fixture.nativeElement.querySelector('.date-modified')).toBeNull();
    });

    it('lists the parent directories of the assessment in the rollup header', () => {
      directoryDbServiceSpy.getById.and.callFake((id: number) =>
        (id === 3 ? { name: 'Plant', parentDirectoryId: 2 } : { name: 'Company', parentDirectoryId: 1 }) as Directory);
      render(makeAssessment({}, { directoryId: 3 }), { inFsat: false });

      const names = Array.from(fixture.nativeElement.querySelectorAll('.assessment-title .d-flex span')) as HTMLElement[];
      expect(names.map(span => normalize(span.textContent))).toEqual(['Plant /', 'Company /']);
    });

    it('lists no directories for an assessment in the root directory', () => {
      render(makeAssessment({}, { directoryId: 1 }), { inFsat: false });

      expect(fixture.nativeElement.querySelectorAll('.assessment-title .d-flex span').length).toBe(0);
      expect(directoryDbServiceSpy.getById).not.toHaveBeenCalled();
    });
  });

  describe('template visibility: report data or incomplete message', () => {
    it('shows the report data and hides the incomplete message for a completed valid assessment', () => {
      render(makeAssessment());

      expect(fixture.nativeElement.querySelector('.report-data')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
    });

    it('shows the incomplete message instead of the report data when setup is not done', () => {
      render(makeAssessment({ setupDone: false }));

      expect(fixture.nativeElement.querySelector('.report-data')).toBeNull();
      expect(normalize(fixture.nativeElement.querySelector('.alert-warning').textContent)).toContain(MESSAGE_INCOMPLETE);
    });

    it('shows the incomplete message instead of the report data when the assessment is invalid', () => {
      validResult = INVALID;
      render(makeAssessment());

      expect(fixture.nativeElement.querySelector('.report-data')).toBeNull();
      expect(normalize(fixture.nativeElement.querySelector('.alert-warning').textContent)).toContain(MESSAGE_INCOMPLETE);
    });

    it('shows an export button for both the wide and narrow menus when report data is shown', () => {
      render(makeAssessment());

      expect(fixture.nativeElement.querySelectorAll('app-export-button').length).toBe(2);
    });

    it('shows no export button when the incomplete message is shown', () => {
      render(makeAssessment({ setupDone: false }));

      expect(fixture.nativeElement.querySelectorAll('app-export-button').length).toBe(0);
    });
  });

  describe('template visibility: report tab panels', () => {
    it('shows only the results summary panel by default', () => {
      render(makeAssessment());

      PANEL_SELECTORS.forEach(({ tab, selector }) => {
        expect(hasPanel(selector)).withContext(tab).toBe(tab === 'results');
      });
    });

    PANEL_SELECTORS.forEach(({ tab, selector }) => {
      it(`shows only the ${tab} panel when that tab is selected`, () => {
        render(makeAssessment());

        component.setTab(tab);
        fixture.detectChanges();

        PANEL_SELECTORS.forEach(other => {
          expect(hasPanel(other.selector)).withContext(other.tab).toBe(other.tab === tab);
        });
      });
    });

    it('lists every report tab in both the wide and narrow menus', () => {
      render(makeAssessment());

      const wide = Array.from(fixture.nativeElement.querySelectorAll('ul.tabs li')) as HTMLElement[];
      const narrow = Array.from(fixture.nativeElement.querySelectorAll('div.tabs > div[class]:not(.mx-auto)')) as HTMLElement[];
      const labels = ['Result Data', 'Report Graphs', 'Detailed Results', 'Sankey', 'Input Summary', 'Facility Info'];
      expect(wide.map(li => normalize(li.textContent))).toEqual(labels);
      expect(narrow.map(div => normalize(div.textContent))).toEqual(labels);
    });
  });

  describe('template visibility: menu collapse indicator', () => {
    it('shows the down caret while the menu is collapsed', () => {
      render(makeAssessment());

      expect(fixture.nativeElement.querySelector('.fa-caret-down')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.fa-caret-up')).toBeNull();
    });

    it('shows the up caret after the menu is expanded', () => {
      render(makeAssessment());

      component.collapseTabs();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.fa-caret-up')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.fa-caret-down')).toBeNull();
    });
  });

  describe('user actions', () => {
    it('setTab selects the tab and toggles the menu collapse state', () => {
      render(makeAssessment());
      expect(component.tabsCollapsed).toBeTrue();

      component.setTab('inputData');

      expect(component.currentTab).toBe('inputData');
      expect(component.tabsCollapsed).toBeFalse();
    });

    it('emits closeReport with true when the assessment is closed', () => {
      render(makeAssessment());
      const emitted: unknown[] = [];
      component.closeReport.subscribe(value => emitted.push(value));

      component.closeAssessment();

      expect(emitted).toEqual([true]);
    });

    it('emits selectModification with the chosen modification', () => {
      render(makeAssessment());
      const emitted: unknown[] = [];
      component.selectModification.subscribe(value => emitted.push(value));

      component.useModification(2);

      expect(emitted).toEqual([2]);
    });
  });

  describe('container height', () => {
    it('does nothing while the report menu is not rendered', () => {
      render(makeAssessment({ setupDone: false }));
      component.containerHeight = 800;

      component.getContainerHeight();

      expect(component.reportContainerHeight).toBeUndefined();
    });

    it('subtracts the menu and header heights from the container height', () => {
      render(makeAssessment());
      component.containerHeight = 800;
      const buttons: number = component.reportBtns.nativeElement.clientHeight;
      const header: number = component.reportHeader.nativeElement.clientHeight;

      component.getContainerHeight();

      expect(component.reportContainerHeight).toBe(800 - buttons - header - 2);
    });

    it('recalculates the height shortly after the view initializes', fakeAsync(() => {
      render(makeAssessment());
      component.containerHeight = 800;

      tick(100);

      expect(component.reportContainerHeight).toBeDefined();
    }));

    it('recalculates the height when the container height input changes after first render', () => {
      component.assessment = makeAssessment();
      component.settings = makeSettings();
      fixture.componentRef.setInput('containerHeight', 800);
      fixture.detectChanges();
      spyOn(component, 'getContainerHeight');

      fixture.componentRef.setInput('containerHeight', 900);
      fixture.detectChanges();

      expect(component.getContainerHeight).toHaveBeenCalled();
    });
  });
});
