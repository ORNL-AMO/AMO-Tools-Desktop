import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import { CompressedAirDryerComponent } from './compressed-air-dryer.component';
import { CompressedAirDryerService } from './compressed-air-dryer.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { DryerOperatingCostInput, DryerOperatingCostOutput, DryerType, PurgeInputMode } from '../../../shared/models/standalone';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
import { Treasure } from '../../../shared/models/treasure-hunt';

function makeInput(overrides: Partial<DryerOperatingCostInput> = {}): DryerOperatingCostInput {
  return {
    dryerType: DryerType.Heatless,
    annualOperatingHours: 8760,
    flowRate: 1000,
    pressure: 100,
    temperature: 75,
    costOfElectricity: 0.08,
    costOfCompressedAir: 0.25,
    costOfCoolingWater: 0.5,
    purgeInputMode: PurgeInputMode.PercentOfDryerCapacity,
    purgeRate: 15,
    purgeFlowRate: 0,
    heaterPower: 0,
    heatingHoursPerDay: 0,
    motorPower: 0,
    designDDCPercentage: 16.33,
    regenerationCycleLength: 4,
    ...overrides,
  };
}

function makeOutput(totalCostPerYear: number): DryerOperatingCostOutput {
  return {
    waterRemoved: 5, waterRemovedVolume: 0.6, totalCostPerYear,
    heaterPower: 0, heatingHoursPerDay: 0, purgeRate: 15, designDDCPercentage: 16.33,
    purgeFlowRate: 150, motorPower: 0, regenerationCycleLength: 4,
  };
}

function makeForm(): UntypedFormGroup {
  return new UntypedFormGroup({ dryerType: new UntypedFormControl(DryerType.Heatless) });
}

describe('CompressedAirDryerComponent', () => {
  let component: CompressedAirDryerComponent;
  let fixture: ComponentFixture<CompressedAirDryerComponent>;
  let dryerService: any;
  let calculatorDbService: any;
  let analyticsService: jasmine.SpyObj<AnalyticsService>;
  let settingsDbService: { globalSettings: Settings };

  const settings = { unitsOfMeasure: 'Imperial' } as Settings;
  const operatingHours = { hoursPerYear: 6000 } as OperatingHours;

  beforeEach(async () => {
    // Plain object so the component can read and write the stored inputs like the real service.
    dryerService = {
      ...jasmine.createSpyObj('CompressedAirDryerService', [
        'convertStoredInputsForUnitChange', 'initObject', 'getFormFromObj', 'getObjFromForm', 'calculate',
        'generateExample', 'generateExampleModification', 'getEmptyOutput',
      ]),
      baselineInput: undefined,
      modificationInput: undefined,
      lastUnitsOfMeasure: undefined,
    };
    dryerService.initObject.and.returnValue(makeInput());
    dryerService.getFormFromObj.and.callFake(() => makeForm());
    dryerService.getObjFromForm.and.returnValue(makeInput());
    dryerService.calculate.and.returnValue(makeOutput(1000));

    calculatorDbService = {
      ...jasmine.createSpyObj('CalculatorDbService', ['getByAssessmentId', 'saveAssessmentCalculator']),
      isSaving: true,
    };
    calculatorDbService.saveAssessmentCalculator.and.returnValue(Promise.resolve());
    analyticsService = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    settingsDbService = { globalSettings: { unitsOfMeasure: 'Metric' } as Settings };

    await TestBed.configureTestingModule({
      declarations: [CompressedAirDryerComponent],
      providers: [
        { provide: CompressedAirDryerService, useValue: dryerService },
        { provide: CalculatorDbService, useValue: calculatorDbService },
        { provide: AnalyticsService, useValue: analyticsService },
        { provide: SettingsDbService, useValue: settingsDbService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CompressedAirDryerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', settings);
    fixture.componentRef.setInput('operatingHours', operatingHours);
  });

  describe('initialization', () => {
    it('sends the analytics event and clears the saving flag', () => {
      fixture.detectChanges();

      expect(analyticsService.sendEvent).toHaveBeenCalledWith('calculator-CA-dryer');
      expect(calculatorDbService.isSaving).toBeFalse();
    });

    it('builds a new baseline from the settings and operating hours when none is stored', () => {
      fixture.detectChanges();

      expect(dryerService.convertStoredInputsForUnitChange).toHaveBeenCalledWith(settings);
      expect(dryerService.initObject).toHaveBeenCalledWith(settings, operatingHours);
      expect(component.baselineForm).toBeDefined();
      expect(component.modificationExists).toBeFalse();
      expect(dryerService.lastUnitsOfMeasure).toBe('Imperial');
    });

    it('reuses the stored baseline and modification', () => {
      const storedBaseline = makeInput({ flowRate: 500 });
      const storedModification = makeInput({ dryerType: DryerType.Refrigerated });
      dryerService.baselineInput = storedBaseline;
      dryerService.modificationInput = storedModification;

      fixture.detectChanges();

      expect(dryerService.initObject).not.toHaveBeenCalled();
      expect(dryerService.getFormFromObj).toHaveBeenCalledWith(storedBaseline, settings);
      expect(dryerService.getFormFromObj).toHaveBeenCalledWith(storedModification, settings);
      expect(component.modificationExists).toBeTrue();
    });

    it('falls back to the global settings when no settings are passed in', () => {
      fixture.componentRef.setInput('settings', undefined);
      fixture.detectChanges();

      expect(component.settings).toBe(settingsDbService.globalSettings);
    });

    it('opens the default panel tab from the global settings', () => {
      settingsDbService.globalSettings.defaultPanelTab = 'help';
      fixture.detectChanges();

      expect(component.tabSelect).toBe('help');
    });
  });

  describe('assessment calculator', () => {
    const assessment = { id: 7 } as Assessment;

    it('loads the saved inputs and saves the recalculated calculator', fakeAsync(() => {
      const savedBaseline = makeInput({ flowRate: 800 });
      const savedModification = makeInput({ dryerType: DryerType.Refrigerated });
      const calculator: Calculator = { assessmentId: 7, dryerOperatingCost: { baseline: savedBaseline, modification: savedModification } };
      calculatorDbService.getByAssessmentId.and.returnValue(calculator);
      fixture.componentRef.setInput('assessment', assessment);

      fixture.detectChanges();
      flush();

      expect(calculatorDbService.getByAssessmentId).toHaveBeenCalledWith(7);
      expect(dryerService.getFormFromObj).toHaveBeenCalledWith(savedBaseline, settings);
      expect(dryerService.getFormFromObj).toHaveBeenCalledWith(savedModification, settings);
      expect(calculatorDbService.saveAssessmentCalculator).toHaveBeenCalledWith(assessment, calculator);
      expect(calculator.dryerOperatingCost.baseline).toEqual(makeInput());
    }));

    it('builds a new baseline and saves it when the assessment has no calculator', fakeAsync(() => {
      calculatorDbService.getByAssessmentId.and.returnValue(undefined);
      fixture.componentRef.setInput('assessment', assessment);

      fixture.detectChanges();
      flush();

      expect(dryerService.initObject).toHaveBeenCalledWith(settings, operatingHours);
      expect(component.baselineForm).toBeDefined();
      expect(component.baselineOutput).toEqual(makeOutput(1000));
      expect(calculatorDbService.saveAssessmentCalculator).toHaveBeenCalledOnceWith(assessment, {
        assessmentId: 7,
        dryerOperatingCost: { baseline: makeInput() },
      });
    }));
  });

  describe('calculation triggers', () => {
    beforeEach(() => fixture.detectChanges());

    it('calculates the baseline from the form', () => {
      expect(dryerService.getObjFromForm).toHaveBeenCalledWith(component.baselineForm);
      expect(dryerService.calculate).toHaveBeenCalledWith(makeInput(), settings);
      expect(component.baselineOutput.totalCostPerYear).toBe(1000);
    });

    it('updates the results when the inputs change', () => {
      dryerService.calculate.and.returnValue(makeOutput(2500));

      component.getResults();

      expect(component.baselineOutput.totalCostPerYear).toBe(2500);
    });

    it('returns empty results without calculating when the displayed form is invalid', () => {
      dryerService.getEmptyOutput.and.returnValue(makeOutput(0));
      dryerService.calculate.calls.reset();
      component.baselineForm.setErrors({ invalid: true });

      component.getResults();

      expect(dryerService.calculate).not.toHaveBeenCalled();
      expect(component.baselineOutput.totalCostPerYear).toBe(0);
    });

    it('creates a modification as a copy of the baseline and calculates both', () => {
      const baseline = component.baselineInput;
      dryerService.calculate.calls.reset();

      component.createModification();

      const modificationFormSource = dryerService.getFormFromObj.calls.mostRecent().args[0];
      expect(modificationFormSource).toEqual(baseline);
      expect(modificationFormSource).not.toBe(baseline);
      expect(component.modificationExists).toBeTrue();
      expect(component.baselineSelected).toBeFalse();
      expect(dryerService.calculate).toHaveBeenCalledTimes(2);
      expect(component.modificationOutput).toBeDefined();
    });

    it('generates an example baseline and modification', () => {
      const example = makeInput({ flowRate: 1752 });
      const exampleModification = makeInput({ dryerType: DryerType.Refrigerated });
      dryerService.generateExample.and.returnValue(example);
      dryerService.generateExampleModification.and.returnValue(exampleModification);

      component.btnGenerateExample();

      expect(dryerService.getFormFromObj).toHaveBeenCalledWith(example, settings);
      expect(dryerService.getFormFromObj).toHaveBeenCalledWith(exampleModification, settings);
      expect(component.modificationExists).toBeTrue();
      expect(component.modificationOutput).toBeDefined();
    });

    it('resets to a new baseline and removes the modification', () => {
      component.createModification();
      dryerService.baselineInput = makeInput({ flowRate: 1 });
      dryerService.initObject.calls.reset();

      component.btnResetData();

      expect(dryerService.modificationInput).toBeUndefined();
      expect(dryerService.initObject).toHaveBeenCalledWith(settings, operatingHours);
      expect(component.modificationExists).toBeFalse();
      expect(component.modificationForm).toBeUndefined();
      expect(component.modificationOutput).toBeUndefined();
    });
  });

  describe('user-triggered actions', () => {
    beforeEach(() => fixture.detectChanges());

    it('emits the baseline only when saving without a modification', () => {
      const saveSpy = jasmine.createSpy('emitSave');
      component.emitSave.subscribe(saveSpy);

      component.save();

      expect(saveSpy).toHaveBeenCalledWith({
        baseline: component.baselineInput,
        modification: undefined,
        opportunityType: Treasure.compressedAirDryer,
      });
    });

    it('emits the baseline and modification when saving with a modification', () => {
      const saveSpy = jasmine.createSpy('emitSave');
      component.emitSave.subscribe(saveSpy);
      component.createModification();

      component.save();

      expect(saveSpy).toHaveBeenCalledWith(jasmine.objectContaining({ modification: component.modificationInput }));
    });

    it('selects the matching panel when the small screen tab changes', () => {
      component.setSmallScreenTab('modification');
      expect(component.smallScreenTab).toBe('modification');
      expect(component.baselineSelected).toBeFalse();

      component.setSmallScreenTab('baseline');
      expect(component.baselineSelected).toBeTrue();

      component.setSmallScreenTab('details');
      expect(component.baselineSelected).toBeTrue();
    });
  });

  describe('template visibility', () => {
    it('shows the add modification prompt until a modification exists', () => {
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelectorAll('app-compressed-air-dryer-form').length).toBe(1);
      expect(el.querySelector('.no-data')).not.toBeNull();

      component.createModification();
      fixture.detectChanges();

      expect(el.querySelectorAll('app-compressed-air-dryer-form').length).toBe(2);
      expect(el.querySelector('.no-data')).toBeNull();
    });

    it('shows the save and cancel actions only in a Treasure Hunt', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.fa-save')).toBeNull();

      fixture.componentRef.setInput('inTreasureHunt', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.fa-save')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.fa-times')).not.toBeNull();
    });

    it('switches between the results and help panels', () => {
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('app-compressed-air-dryer-results')).not.toBeNull();
      expect(el.querySelector('app-compressed-air-dryer-help')).toBeNull();

      component.setTab('help');
      fixture.detectChanges();

      expect(el.querySelector('app-compressed-air-dryer-results')).toBeNull();
      expect(el.querySelector('app-compressed-air-dryer-help')).not.toBeNull();
    });
  });

  describe('destroy', () => {
    it('stores the inputs in the service when used as a standalone calculator', () => {
      fixture.detectChanges();
      component.createModification();

      fixture.destroy();

      expect(dryerService.baselineInput).toBe(component.baselineInput);
      expect(dryerService.modificationInput).toBe(component.modificationInput);
    });

    it('does not store a modification that was never created', () => {
      fixture.detectChanges();

      fixture.destroy();

      expect(dryerService.baselineInput).toBe(component.baselineInput);
      expect(dryerService.modificationInput).toBeUndefined();
    });

    it('clears the stored inputs when used in a Treasure Hunt', () => {
      fixture.componentRef.setInput('inTreasureHunt', true);
      fixture.detectChanges();
      component.createModification();

      fixture.destroy();

      expect(dryerService.baselineInput).toBeUndefined();
      expect(dryerService.modificationInput).toBeUndefined();
    });
  });
});
