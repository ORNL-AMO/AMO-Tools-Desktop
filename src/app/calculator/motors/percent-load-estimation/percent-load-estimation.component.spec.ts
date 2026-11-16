import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PercentLoadEstimationComponent } from './percent-load-estimation.component';
import { FieldMeasurementInputs, FieldMeasurementOutputs, PercentLoadEstimationService } from './percent-load-estimation.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { Settings } from '../../../shared/models/settings';

function makeInputs(overrides: Partial<FieldMeasurementInputs> = {}): FieldMeasurementInputs {
  return {
    phase1Voltage: 0,
    phase1Amps: 0,
    phase2Voltage: 0,
    phase2Amps: 0,
    phase3Voltage: 0,
    phase3Amps: 0,
    ratedVoltage: 0,
    ratedCurrent: 0,
    powerFactor: 0,
    ...overrides,
  };
}

function makeResults(percentLoad: number = 0): FieldMeasurementOutputs {
  return {
    averageVoltage: 0,
    averageCurrent: 0,
    inputPower: 0,
    percentLoad: percentLoad,
    maxVoltageDeviation: 0,
    voltageUnbalance: 0,
  };
}

const HELP_FIELDS: Array<{ field: string, heading: string }> = [
  { field: 'powerFactor', heading: 'Average Power Factor' },
  { field: 'ratedCurrent', heading: 'Rated Current' },
  { field: 'ratedVoltage', heading: 'Rated Voltage' },
  { field: 'amps', heading: 'Table: Amps' },
  { field: 'volts', heading: 'Table: Volts' },
];

describe('PercentLoadEstimationComponent', () => {
  let component: PercentLoadEstimationComponent;
  let fixture: ComponentFixture<PercentLoadEstimationComponent>;
  let serviceSpy: jasmine.SpyObj<PercentLoadEstimationService>;
  let settingsDbServiceSpy: jasmine.SpyObj<SettingsDbService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let globalSettings: Settings;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getHelpHeadings(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('.help-info .my-2 h6'))
      .map((h6: HTMLElement) => h6.firstChild.textContent.trim());
  }

  function createComponent(settings?: Settings): void {
    fixture = TestBed.createComponent(PercentLoadEstimationComponent);
    component = fixture.componentInstance;
    if (settings !== undefined) {
      fixture.componentRef.setInput('settings', settings);
    }
    fixture.detectChanges();
  }

  beforeEach(async () => {
    globalSettings = { defaultPanelTab: undefined } as Settings;
    serviceSpy = jasmine.createSpyObj('PercentLoadEstimationService',
      ['getResults', 'initFieldMeasurementInputs', 'generateFieldMeasurementInputsExample']);
    serviceSpy.fieldMeasurementInputs = makeInputs({ powerFactor: 50 });
    serviceSpy.getResults.and.returnValue(makeResults(42));
    serviceSpy.initFieldMeasurementInputs.and.returnValue(makeInputs());
    serviceSpy.generateFieldMeasurementInputsExample.and.returnValue(makeInputs({ powerFactor: 77, ratedVoltage: 460 }));

    settingsDbServiceSpy = jasmine.createSpyObj('SettingsDbService', [], { globalSettings: globalSettings });
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);

    await TestBed.configureTestingModule({
      declarations: [PercentLoadEstimationComponent],
      providers: [
        { provide: PercentLoadEstimationService, useValue: serviceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceSpy },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('sends the analytics event', () => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-MOTOR-percent-load-estimation');
    });

    it('falls back to the global settings when no settings input is given', () => {
      createComponent();
      expect(component.settings).toBe(globalSettings);
    });

    it('keeps the settings input when given', () => {
      const settings = { unitsOfMeasure: 'Metric' } as Settings;
      createComponent(settings);
      expect(component.settings).toBe(settings);
    });

    it('defaults to the results tab when no default panel tab is set', () => {
      createComponent();
      expect(component.tabSelect).toBe('results');
    });

    it('uses the global default panel tab when set', () => {
      globalSettings.defaultPanelTab = 'help';
      createComponent();
      expect(component.tabSelect).toBe('help');
    });

    it('loads the service inputs and calculates results', () => {
      const savedInputs = serviceSpy.fieldMeasurementInputs;
      createComponent();
      expect(component.fieldMeasurementData).toBe(savedInputs);
      expect(serviceSpy.getResults).toHaveBeenCalledWith(savedInputs);
      expect(component.fieldMeasurementResults).toEqual(makeResults(42));
    });
  });

  describe('calculation triggers', () => {
    beforeEach(() => {
      createComponent();
    });

    it('calculateFieldMeasurementMethod stores the data on the service and updates results', () => {
      const data = makeInputs({ phase1Amps: 36 });
      serviceSpy.getResults.and.returnValue(makeResults(55));
      component.calculateFieldMeasurementMethod(data);
      expect(component.fieldMeasurementData).toBe(data);
      expect(serviceSpy.fieldMeasurementInputs).toBe(data);
      expect(serviceSpy.getResults).toHaveBeenCalledWith(data);
      expect(component.fieldMeasurementResults.percentLoad).toBe(55);
    });

    it('recalculates with new results when the data changes again', () => {
      serviceSpy.getResults.and.returnValue(makeResults(10));
      component.calculateFieldMeasurementMethod(makeInputs({ phase1Amps: 1 }));
      serviceSpy.getResults.and.returnValue(makeResults(20));
      component.calculateFieldMeasurementMethod(makeInputs({ phase1Amps: 2 }));
      expect(component.fieldMeasurementResults.percentLoad).toBe(20);
    });

    it('passes the results to the results table and graph', () => {
      serviceSpy.getResults.and.returnValue(makeResults(66));
      component.calculateFieldMeasurementMethod(makeInputs());
      fixture.detectChanges();
      expect(component.fieldMeasurementResults.percentLoad).toBe(66);
      expect(query('app-field-measurement-table')).not.toBeNull();
      expect(query('app-percent-graph')).not.toBeNull();
    });
  });

  describe('user actions', () => {
    beforeEach(() => {
      createComponent();
    });

    it('btnResetData loads fresh inputs and recalculates', () => {
      serviceSpy.getResults.calls.reset();
      component.btnResetData();
      expect(serviceSpy.initFieldMeasurementInputs).toHaveBeenCalled();
      expect(component.fieldMeasurementData).toEqual(makeInputs());
      expect(serviceSpy.getResults).toHaveBeenCalledWith(makeInputs());
    });

    it('btnGenerateExample loads the example inputs and recalculates', () => {
      serviceSpy.getResults.calls.reset();
      component.btnGenerateExample();
      const example = makeInputs({ powerFactor: 77, ratedVoltage: 460 });
      expect(component.fieldMeasurementData).toEqual(example);
      expect(serviceSpy.getResults).toHaveBeenCalledWith(example);
    });

    it('setTab, setSmallScreenTab, and changeField update the view state', () => {
      component.setTab('help');
      component.setSmallScreenTab('details');
      component.changeField('amps');
      expect(component.tabSelect).toBe('help');
      expect(component.smallScreenTab).toBe('details');
      expect(component.currentField).toBe('amps');
    });
  });

  describe('template visibility', () => {
    beforeEach(() => {
      createComponent();
    });

    describe('results/help tabs', () => {
      it('shows the graph and results table and hides help on the results tab', () => {
        expect(query('app-percent-graph')).not.toBeNull();
        expect(query('app-field-measurement-table')).not.toBeNull();
        expect(query('.help-info')).toBeNull();
      });

      it('shows help and hides the graph and results table on the help tab', () => {
        component.setTab('help');
        fixture.detectChanges();
        expect(query('.help-info')).not.toBeNull();
        expect(query('app-percent-graph')).toBeNull();
        expect(query('app-field-measurement-table')).toBeNull();
      });

      it('shows neither results nor help for an unrecognized tab', () => {
        component.setTab('other');
        fixture.detectChanges();
        expect(query('.help-info')).toBeNull();
        expect(query('app-percent-graph')).toBeNull();
        expect(query('app-field-measurement-table')).toBeNull();
      });
    });

    describe('field help', () => {
      it('shows no field help on the help tab when no field is focused', () => {
        component.setTab('help');
        fixture.detectChanges();
        expect(getHelpHeadings()).toEqual([]);
      });

      HELP_FIELDS.forEach(helpField => {
        it(`shows only the ${helpField.field} help on the help tab`, () => {
          component.setTab('help');
          component.changeField(helpField.field);
          fixture.detectChanges();
          expect(getHelpHeadings()).toEqual([helpField.heading]);
        });

        it(`hides the ${helpField.field} help on the results tab`, () => {
          component.changeField(helpField.field);
          fixture.detectChanges();
          expect(query('.help-info')).toBeNull();
          expect(fixture.nativeElement.textContent).not.toContain(helpField.heading);
        });
      });

      it('shows the rated voltage range table only with the rated voltage help', () => {
        component.setTab('help');
        component.changeField('ratedVoltage');
        fixture.detectChanges();
        const cells = Array.from(fixture.nativeElement.querySelectorAll('.help-info td'))
          .map((td: HTMLElement) => td.textContent.trim());
        expect(cells).toEqual(['200 V', '15180 V']);
        component.changeField('powerFactor');
        fixture.detectChanges();
        expect(query('.help-info table')).toBeNull();
      });

      it('shows no field help for an unknown field', () => {
        component.setTab('help');
        component.changeField('unknownField');
        fixture.detectChanges();
        expect(getHelpHeadings()).toEqual([]);
      });
    });
  });
});
