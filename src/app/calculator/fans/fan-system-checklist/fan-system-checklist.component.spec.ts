import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { FanSystemChecklistComponent } from './fan-system-checklist.component';
import { FanSystemChecklistService } from './fan-system-checklist.service';
import { FanSystemChecklistFormService } from './fan-system-checklist-form.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

describe('FanSystemChecklistComponent', () => {
  let component: FanSystemChecklistComponent;
  let fixture: ComponentFixture<FanSystemChecklistComponent>;
  let checklistService: FanSystemChecklistService;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let settingsDbServiceMock: Partial<SettingsDbService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getFormWrappers(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('app-fan-system-checklist-form'))
      .map((form: HTMLElement) => form.parentElement);
  }

  function createComponent(inputs: { [key: string]: any } = { settings: MOCK_SETTINGS }): void {
    fixture = TestBed.createComponent(FanSystemChecklistComponent);
    component = fixture.componentInstance;
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, inputs[key]));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    settingsDbServiceMock = { globalSettings: { unitsOfMeasure: 'Metric' } as Settings };

    await TestBed.configureTestingModule({
      declarations: [FanSystemChecklistComponent],
      providers: [
        UntypedFormBuilder,
        FanSystemChecklistFormService,
        FanSystemChecklistService,
        { provide: SettingsDbService, useValue: settingsDbServiceMock },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    checklistService = TestBed.inject(FanSystemChecklistService);
  });

  describe('initialization', () => {
    it('creates the component and sends the analytics event', () => {
      createComponent();
      expect(component).toBeTruthy();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-FAN-system-checklist');
    });

    it('initializes one empty equipment input when none exist', () => {
      spyOn(checklistService, 'initDefaultEmptyInputs').and.callThrough();
      createComponent();
      expect(checklistService.initDefaultEmptyInputs).toHaveBeenCalledWith(1);
      expect(component.fanSystemChecklistInputs.length).toBe(1);
    });

    it('keeps existing equipment inputs', () => {
      checklistService.fanSystemChecklistInputs.next([checklistService.initEmptyObject(1), checklistService.initEmptyObject(2)]);
      spyOn(checklistService, 'initDefaultEmptyInputs').and.callThrough();
      createComponent();
      expect(checklistService.initDefaultEmptyInputs).not.toHaveBeenCalled();
      expect(component.fanSystemChecklistInputs.length).toBe(2);
    });

    it('falls back to global settings when no settings input is given', () => {
      createComponent({});
      expect(component.settings).toBe(settingsDbServiceMock.globalSettings);
    });

    it('uses the global default panel tab when set', () => {
      settingsDbServiceMock.globalSettings.defaultPanelTab = 'help';
      createComponent();
      expect(component.tabSelect).toBe('help');
    });

    it('defaults to the results tab when no global default panel tab is set', () => {
      createComponent();
      expect(component.tabSelect).toBe('results');
    });
  });

  describe('observe inputs and output', () => {
    beforeEach(() => createComponent());

    it('calculates when the inputs emit', () => {
      spyOn(checklistService, 'calculate').and.callThrough();
      checklistService.initDefaultEmptyInputs(1);
      expect(checklistService.calculate).toHaveBeenCalled();
    });

    it('assigns the calculated output', () => {
      expect(component.fanSystemChecklistOutput).toBe(checklistService.fanSystemChecklistOutput.getValue());
      expect(component.fanSystemChecklistOutput.equipmentResults.length).toBe(1);
    });
  });

  describe('user actions', () => {
    const operatingHours = { hoursPerYear: 5000 } as OperatingHours;

    beforeEach(() => createComponent({ settings: MOCK_SETTINGS, operatingHours: operatingHours }));

    it('adds equipment with the current settings and operating hours', () => {
      spyOn(checklistService, 'addEquipment').and.callThrough();
      component.addEquipment();
      expect(checklistService.addEquipment).toHaveBeenCalledWith(MOCK_SETTINGS, operatingHours);
      expect(component.fanSystemChecklistInputs.length).toBe(2);
      expect(component.fanSystemChecklistInputs[1].operatingHours).toBe(5000);
    });

    it('signals resetData and re-initializes one empty input on reset', () => {
      component.addEquipment();
      component.btnResetData();
      expect(checklistService.resetData.getValue()).toBeTrue();
      expect(component.fanSystemChecklistInputs.length).toBe(1);
    });

    it('generates example data', () => {
      spyOn(checklistService, 'generateExampleData').and.callThrough();
      component.btnGenerateExample();
      expect(checklistService.generateExampleData).toHaveBeenCalledWith(MOCK_SETTINGS);
      expect(component.fanSystemChecklistInputs[0].fanType).toBe(1);
    });

    it('sets the selected tab', () => {
      component.setTab('chart');
      expect(component.tabSelect).toBe('chart');
    });

    it('sets the small screen tab', () => {
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
    });
  });

  describe('template rendering', () => {
    beforeEach(() => createComponent());

    it('renders one equipment form per input', () => {
      expect(getFormWrappers().length).toBe(1);
      component.addEquipment();
      fixture.detectChanges();
      expect(getFormWrappers().length).toBe(2);
    });

    it('keeps the DOM node of remaining equipment when an earlier one is removed', () => {
      component.addEquipment();
      component.addEquipment();
      fixture.detectChanges();
      const [first, , third] = getFormWrappers();
      checklistService.removeEquipment(1);
      fixture.detectChanges();
      const remaining = getFormWrappers();
      expect(remaining.length).toBe(2);
      expect(remaining[0]).toBe(first);
      expect(remaining[1]).toBe(third);
    });

    const TAB_CASES: Array<{ tab: string, shown: string }> = [
      { tab: 'results', shown: 'app-fan-system-checklist-results' },
      { tab: 'chart', shown: 'app-fan-system-checklist-chart' },
      { tab: 'help', shown: 'app-fan-system-checklist-help' },
    ];
    TAB_CASES.forEach(testCase => {
      it(`shows only ${testCase.shown} on the ${testCase.tab} tab`, () => {
        component.setTab(testCase.tab);
        fixture.detectChanges();
        TAB_CASES.forEach(other => {
          if (other.shown === testCase.shown) {
            expect(query(other.shown)).withContext(other.shown).not.toBeNull();
          } else {
            expect(query(other.shown)).withContext(other.shown).toBeNull();
          }
        });
      });
    });

    it('shows no panel on an unknown tab', () => {
      component.setTab('other');
      fixture.detectChanges();
      TAB_CASES.forEach(testCase => expect(query(testCase.shown)).withContext(testCase.shown).toBeNull());
    });
  });

  describe('destroy', () => {
    it('stops calculating and updating inputs after the component is destroyed', () => {
      createComponent();
      const inputsBefore = component.fanSystemChecklistInputs;
      spyOn(checklistService, 'calculate');
      fixture.destroy();
      checklistService.initDefaultEmptyInputs(1);
      expect(checklistService.calculate).not.toHaveBeenCalled();
      expect(component.fanSystemChecklistInputs).toBe(inputsBefore);
    });
  });
});
