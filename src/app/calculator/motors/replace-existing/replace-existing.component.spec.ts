import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ReplaceExistingComponent } from './replace-existing.component';
import { ReplaceExistingService } from './replace-existing.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { ReplaceExistingData, ReplaceExistingResults } from '../../../shared/models/calculators';
import { Treasure } from '../../../shared/models/treasure-hunt';

const GLOBAL_SETTINGS = { unitsOfMeasure: 'Imperial', electricityCost: 0.066, defaultPanelTab: 'results' } as Settings;

function makeData(operatingHours: number, motorSize: number = 150): ReplaceExistingData {
  return {
    operatingHours: operatingHours,
    motorSize: motorSize,
    load: 75,
    electricityCost: 0.066,
    existingEfficiency: 92,
    newEfficiency: 96,
    purchaseCost: 13000,
    rewindCost: 8000,
    rewindEfficiencyLoss: 1,
  };
}

function makeResults(annualEnergySavings: number): ReplaceExistingResults {
  return { annualEnergySavings: annualEnergySavings } as ReplaceExistingResults;
}

function makeForm(data: ReplaceExistingData): UntypedFormGroup {
  const controls = {};
  Object.keys(data).forEach(key => controls[key] = new UntypedFormControl(data[key]));
  return new UntypedFormGroup(controls);
}

describe('ReplaceExistingComponent', () => {
  let component: ReplaceExistingComponent;
  let fixture: ComponentFixture<ReplaceExistingComponent>;
  let serviceSpy: jasmine.SpyObj<ReplaceExistingService>;
  let settingsDbServiceSpy: jasmine.SpyObj<SettingsDbService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getHeaderTitles(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('h3'))
      .map((title: HTMLElement) => title.textContent.trim())
      .filter(title => title !== 'Motor Properties');
  }

  function createComponent(inputs: { inTreasureHunt?: boolean, settings?: Settings, opperatingHours?: OperatingHours } = {}): void {
    fixture = TestBed.createComponent(ReplaceExistingComponent);
    component = fixture.componentInstance;
    if (inputs.inTreasureHunt !== undefined) {
      fixture.componentRef.setInput('inTreasureHunt', inputs.inTreasureHunt);
    }
    if (inputs.settings !== undefined) {
      fixture.componentRef.setInput('settings', inputs.settings);
    }
    if (inputs.opperatingHours !== undefined) {
      fixture.componentRef.setInput('opperatingHours', inputs.opperatingHours);
    }
    fixture.detectChanges();
  }

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('ReplaceExistingService',
      ['initReplaceExistingData', 'resetReplaceExistingData', 'getFormFromObj', 'getObjFromForm', 'getResults']);
    serviceSpy.replaceExistingData = undefined;
    serviceSpy.initReplaceExistingData.and.callFake((settings: Settings, operatingHours: number) => makeData(operatingHours));
    serviceSpy.resetReplaceExistingData.and.callFake((settings: Settings, operatingHours: number) => makeData(operatingHours, 0));
    serviceSpy.getFormFromObj.and.callFake((data: ReplaceExistingData) => makeForm(data));
    serviceSpy.getObjFromForm.and.callFake((form: UntypedFormGroup) => form.getRawValue());
    serviceSpy.getResults.and.callFake((data: ReplaceExistingData) => makeResults(data.operatingHours));

    settingsDbServiceSpy = jasmine.createSpyObj('SettingsDbService', [], { globalSettings: GLOBAL_SETTINGS });
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);

    await TestBed.configureTestingModule({
      declarations: [ReplaceExistingComponent],
      providers: [
        { provide: ReplaceExistingService, useValue: serviceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceSpy },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('sends the analytics event', () => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-MOTOR-replace-existing');
    });

    it('falls back to the global settings and default panel tab', () => {
      createComponent();
      expect(component.settings).toBe(GLOBAL_SETTINGS);
      expect(component.tabSelect).toBe('results');
    });

    it('keeps settings passed as an input', () => {
      const settings = { unitsOfMeasure: 'Metric' } as Settings;
      createComponent({ settings: settings });
      expect(component.settings).toBe(settings);
    });

    it('initializes inputs with 8760 hours when no operating hours are given', () => {
      createComponent();
      expect(serviceSpy.initReplaceExistingData).toHaveBeenCalledWith(GLOBAL_SETTINGS, 8760);
      expect(component.inputs).toEqual(makeData(8760));
    });

    it('initializes inputs from the operating hours input', () => {
      createComponent({ opperatingHours: { hoursPerYear: 5000 } as OperatingHours });
      expect(serviceSpy.initReplaceExistingData).toHaveBeenCalledWith(GLOBAL_SETTINGS, 5000);
    });

    it('reuses data saved on the service instead of initializing', () => {
      serviceSpy.replaceExistingData = makeData(1234);
      createComponent();
      expect(serviceSpy.initReplaceExistingData).not.toHaveBeenCalled();
      expect(serviceSpy.getFormFromObj).toHaveBeenCalledWith(makeData(1234));
    });

    it('builds the form and calculates results', () => {
      createComponent();
      expect(component.replaceExistingForm.controls.operatingHours.value).toBe(8760);
      expect(serviceSpy.getResults).toHaveBeenCalledWith(makeData(8760), GLOBAL_SETTINGS);
      expect(component.results).toEqual(makeResults(8760));
    });
  });

  describe('calculation triggers', () => {
    beforeEach(() => {
      createComponent();
    });

    it('recalculates from the current form values', () => {
      component.replaceExistingForm.controls.operatingHours.setValue(2000);
      component.calculate();
      expect(component.inputs.operatingHours).toBe(2000);
      expect(component.results).toEqual(makeResults(2000));
    });

    it('resets data with zero hours and recalculates', () => {
      component.resetData();
      expect(serviceSpy.resetReplaceExistingData).toHaveBeenCalledWith(GLOBAL_SETTINGS, 0);
      expect(component.replaceExistingForm.controls.motorSize.value).toBe(0);
      expect(component.results).toEqual(makeResults(0));
    });

    it('generates the example data and recalculates', () => {
      component.resetData();
      component.btnGenerateExample();
      expect(component.replaceExistingForm.controls.motorSize.value).toBe(150);
      expect(component.results).toEqual(makeResults(8760));
    });
  });

  describe('reset with operating hours input', () => {
    it('resets using the operating hours input', () => {
      createComponent({ opperatingHours: { hoursPerYear: 5000 } as OperatingHours });
      component.resetData();
      expect(serviceSpy.resetReplaceExistingData).toHaveBeenCalledWith(GLOBAL_SETTINGS, 5000);
    });
  });

  describe('header visibility', () => {
    it('shows the standalone title and hides treasure hunt actions outside treasure hunt', () => {
      createComponent({ inTreasureHunt: false });
      expect(getHeaderTitles()).toEqual(['Replace vs Rewind']);
      expect(query('.treasure-hunt-help')).toBeNull();
      expect(query('.fa-save')).toBeNull();
      expect(query('.fa-times')).toBeNull();
    });

    it('shows the treasure hunt title and actions in treasure hunt', () => {
      createComponent({ inTreasureHunt: true });
      expect(getHeaderTitles()).toEqual(['Replace Existing Motor - Efficiency Upgrade']);
      expect(query('.treasure-hunt-help')).not.toBeNull();
      expect(query('.fa-save')).not.toBeNull();
      expect(query('.fa-times')).not.toBeNull();
    });
  });

  describe('panel tab visibility', () => {
    beforeEach(() => {
      createComponent();
    });

    it('shows results and hides help on the results tab', () => {
      expect(query('app-replace-existing-results')).not.toBeNull();
      expect(query('app-replace-existing-help')).toBeNull();
    });

    it('shows help and hides results on the help tab', () => {
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-replace-existing-help')).not.toBeNull();
      expect(query('app-replace-existing-results')).toBeNull();
    });

    it('shows neither panel for an unknown tab', () => {
      component.setTab('other');
      fixture.detectChanges();
      expect(query('app-replace-existing-help')).toBeNull();
      expect(query('app-replace-existing-results')).toBeNull();
    });

    it('always renders the form', () => {
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-replace-existing-form')).not.toBeNull();
    });
  });

  describe('user actions', () => {
    beforeEach(() => {
      createComponent({ inTreasureHunt: true });
    });

    it('stores the focused field', () => {
      component.changeField('load');
      expect(component.currentField).toBe('load');
    });

    it('emits the inputs as a treasure on save', () => {
      const saveSpy = jasmine.createSpy('emitSave');
      component.emitSave.subscribe(saveSpy);
      (query('.fa-save').parentElement as HTMLElement).click();
      expect(saveSpy).toHaveBeenCalledWith({ replaceExistingData: makeData(8760), opportunityType: Treasure.replaceExisting });
    });

    it('emits cancel', () => {
      const cancelSpy = jasmine.createSpy('emitCancel');
      component.emitCancel.subscribe(cancelSpy);
      (query('.fa-times').parentElement as HTMLElement).click();
      expect(cancelSpy).toHaveBeenCalledWith(true);
    });

    it('switches the small screen tab', () => {
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
    });
  });

  describe('destroy', () => {
    it('saves the inputs to the service outside treasure hunt', () => {
      createComponent({ inTreasureHunt: false });
      fixture.destroy();
      expect(serviceSpy.replaceExistingData).toEqual(makeData(8760));
    });

    it('clears the service data in treasure hunt', () => {
      serviceSpy.replaceExistingData = makeData(1234);
      createComponent({ inTreasureHunt: true });
      fixture.destroy();
      expect(serviceSpy.replaceExistingData).toBeUndefined();
    });
  });
});
