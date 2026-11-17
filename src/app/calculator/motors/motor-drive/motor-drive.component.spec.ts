import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MotorDriveComponent } from './motor-drive.component';
import { MotorDriveService } from './motor-drive.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { DriveResult, MotorDriveInputs, MotorDriveOutputs } from '../../../shared/models/calculators';
import { Settings } from '../../../shared/models/settings';
import { Treasure } from '../../../shared/models/treasure-hunt';

const MOCK_SETTINGS = { electricityCost: 0.066, defaultPanelTab: 'results' } as Settings;

function makeInputs(motorPower: number = 5): MotorDriveInputs {
  return {
    motorPower: motorPower,
    annualOperatingHours: 8760,
    averageMotorLoad: 50,
    electricityCost: 0.066,
    baselineDriveType: 0,
    modificationDriveType: 2,
  };
}

function makeDriveResult(energyCost: number): DriveResult {
  return { energyCost: energyCost, annualEnergyUse: 0, driveEfficiency: 0 };
}

function makeOutputs(baselineCost: number, modificationCost: number): MotorDriveOutputs {
  return {
    vBeltResults: makeDriveResult(0),
    notchedResults: makeDriveResult(0),
    synchronousBeltDrive: makeDriveResult(0),
    directDrive: makeDriveResult(0),
    baselineResult: makeDriveResult(baselineCost),
    modificationResult: makeDriveResult(modificationCost),
    annualCostSavings: baselineCost - modificationCost,
    annualEnergySavings: 0,
  };
}

describe('MotorDriveComponent', () => {
  let component: MotorDriveComponent;
  let fixture: ComponentFixture<MotorDriveComponent>;
  let serviceSpy: jasmine.SpyObj<MotorDriveService>;
  let settingsDbServiceSpy: jasmine.SpyObj<SettingsDbService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let globalSettings: Settings;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getHeaderTitles(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('.header h3'))
      .map((h3: HTMLElement) => h3.textContent.trim());
  }

  function getActionItems(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.action-item'));
  }

  function createComponent(inTreasureHunt?: boolean): void {
    fixture = TestBed.createComponent(MotorDriveComponent);
    component = fixture.componentInstance;
    if (inTreasureHunt !== undefined) {
      fixture.componentRef.setInput('inTreasureHunt', inTreasureHunt);
    }
    fixture.detectChanges();
  }

  beforeEach(async () => {
    globalSettings = { ...MOCK_SETTINGS };
    serviceSpy = jasmine.createSpyObj('MotorDriveService',
      ['generateExample', 'getResetData', 'getFormFromObj', 'getResults']);
    serviceSpy.motorDriveData = undefined;
    serviceSpy.generateExample.and.returnValue(makeInputs(5));
    serviceSpy.getResetData.and.returnValue(makeInputs(0));
    serviceSpy.getFormFromObj.and.callFake(() => new UntypedFormGroup({}));
    serviceSpy.getResults.and.returnValue(makeOutputs(100, 75));

    settingsDbServiceSpy = jasmine.createSpyObj('SettingsDbService', [], { globalSettings: globalSettings });
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);

    await TestBed.configureTestingModule({
      declarations: [MotorDriveComponent],
      providers: [
        { provide: MotorDriveService, useValue: serviceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceSpy },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('sends the analytics event and uses the global settings', () => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-MOTOR-drive');
      expect(component.settings).toBe(globalSettings);
    });

    it('uses the global default panel tab', () => {
      globalSettings.defaultPanelTab = 'help';
      createComponent();
      expect(component.tabSelect).toBe('help');
    });

    it('generates example data when the service has no data', () => {
      createComponent();
      expect(serviceSpy.generateExample).toHaveBeenCalledWith(globalSettings);
      expect(serviceSpy.getFormFromObj).toHaveBeenCalledWith(makeInputs(5));
      expect(component.motorDriveData).toEqual(makeInputs(5));
    });

    it('reuses the service data when present', () => {
      const existing = makeInputs(42);
      serviceSpy.motorDriveData = existing;
      createComponent();
      expect(serviceSpy.generateExample).not.toHaveBeenCalled();
      expect(serviceSpy.getFormFromObj).toHaveBeenCalledWith(existing);
      expect(component.motorDriveData).toBe(existing);
    });

    it('calculates the initial results and percent savings', () => {
      createComponent();
      expect(serviceSpy.getResults).toHaveBeenCalledWith(makeInputs(5));
      expect(component.percentSavings).toBe(25);
    });
  });

  describe('header (treasure hunt)', () => {
    it('shows the standalone title and no actions outside treasure hunt', () => {
      createComponent(false);
      expect(getHeaderTitles()).toContain('Motor Drive Comparison');
      expect(getHeaderTitles()).not.toContain('Upgrade Motor Drive');
      expect(query('.treasure-hunt-help')).toBeNull();
      expect(getActionItems().length).toBe(0);
    });

    it('shows the standalone title when inTreasureHunt is not set', () => {
      createComponent();
      expect(getHeaderTitles()).toContain('Motor Drive Comparison');
      expect(getActionItems().length).toBe(0);
    });

    it('shows the treasure hunt title, help, and save/cancel actions in treasure hunt', () => {
      createComponent(true);
      expect(getHeaderTitles()).toContain('Upgrade Motor Drive');
      expect(getHeaderTitles()).not.toContain('Motor Drive Comparison');
      expect(query('.treasure-hunt-help')).not.toBeNull();
      expect(getActionItems().length).toBe(2);
      expect(query('.action-item .fa-save')).not.toBeNull();
      expect(query('.action-item .fa-times')).not.toBeNull();
    });
  });

  describe('results/help tabs', () => {
    beforeEach(() => createComponent());

    it('shows the results panel and hides help on the results tab', () => {
      expect(query('app-percent-graph')).not.toBeNull();
      expect(query('app-motor-drive-table')).not.toBeNull();
      expect(query('app-motor-drive-help')).toBeNull();
    });

    it('shows help and hides the results panel on the help tab', () => {
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-motor-drive-help')).not.toBeNull();
      expect(query('app-percent-graph')).toBeNull();
      expect(query('app-motor-drive-table')).toBeNull();
    });

    it('shows the results panel again after switching back', () => {
      component.setTab('help');
      fixture.detectChanges();
      component.setTab('results');
      fixture.detectChanges();
      expect(query('app-percent-graph')).not.toBeNull();
      expect(query('app-motor-drive-help')).toBeNull();
    });

    it('shows neither panel for an unknown tab', () => {
      component.setTab('other');
      fixture.detectChanges();
      expect(query('app-percent-graph')).toBeNull();
      expect(query('app-motor-drive-help')).toBeNull();
    });
  });

  describe('user actions', () => {
    beforeEach(() => createComponent(true));

    it('recalculates with new data and updates the percent savings', () => {
      serviceSpy.getResults.and.returnValue(makeOutputs(200, 50));
      component.calculate(makeInputs(10));
      expect(serviceSpy.getResults).toHaveBeenCalledWith(makeInputs(10));
      expect(serviceSpy.motorDriveData).toEqual(makeInputs(10));
      expect(component.outputData).toEqual(makeOutputs(200, 50));
      expect(component.percentSavings).toBe(75);
    });

    it('updates the current field', () => {
      component.changeField('motorPower');
      expect(component.currentField).toBe('motorPower');
    });

    it('emits the motor drive treasure on save', () => {
      const emitSpy = spyOn(component.emitSave, 'emit');
      component.save();
      expect(emitSpy).toHaveBeenCalledWith({ motorDriveInputs: makeInputs(5), opportunityType: Treasure.motorDrive });
    });

    it('emits cancel', () => {
      const emitSpy = spyOn(component.emitCancel, 'emit');
      component.cancel();
      expect(emitSpy).toHaveBeenCalledWith(true);
    });

    it('resets the data, rebuilds the form, and recalculates', () => {
      serviceSpy.getFormFromObj.calls.reset();
      serviceSpy.getResults.calls.reset();
      component.btnResetData();
      expect(serviceSpy.getResetData).toHaveBeenCalledWith(globalSettings);
      expect(serviceSpy.getFormFromObj).toHaveBeenCalledWith(makeInputs(0));
      expect(serviceSpy.getResults).toHaveBeenCalledWith(makeInputs(0));
      expect(component.motorDriveData).toEqual(makeInputs(0));
    });

    it('generates the example, rebuilds the form, and recalculates', () => {
      component.motorDriveData = makeInputs(99);
      serviceSpy.generateExample.calls.reset();
      serviceSpy.getResults.calls.reset();
      component.btnGenerateExample();
      expect(serviceSpy.generateExample).toHaveBeenCalledWith(globalSettings);
      expect(serviceSpy.getResults).toHaveBeenCalledWith(makeInputs(5));
      expect(component.motorDriveData).toEqual(makeInputs(5));
    });

    it('switches the small screen tab', () => {
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
    });
  });

  describe('destroy', () => {
    it('keeps the data in the service outside treasure hunt', () => {
      createComponent(false);
      component.calculate(makeInputs(12));
      fixture.destroy();
      expect(serviceSpy.motorDriveData).toEqual(makeInputs(12));
    });

    it('clears the service data in treasure hunt', () => {
      createComponent(true);
      fixture.destroy();
      expect(serviceSpy.motorDriveData).toBeUndefined();
    });
  });
});
