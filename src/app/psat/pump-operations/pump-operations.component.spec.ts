import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PumpOperationsComponent } from './pump-operations.component';
import { PumpOperationsService } from './pump-operations.service';
import { PsatService } from '../psat.service';
import { PsatWarningService, OperationsWarnings } from '../psat-warning.service';
import { CompareService } from '../compare.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { AssessmentCo2SavingsService } from '../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { FeatureFlagService } from '../../shared/feature-flag.service';
import { PSAT, PsatInputs } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { OperatingHours } from '../../shared/models/operations';
import { Co2SavingsData } from '../../calculator/utilities/co2-savings/co2-savings.service';

const MOCK_SETTINGS: Settings = { unitsOfMeasure: 'Imperial' } as Settings;

const MOCK_PSAT_INPUTS: PsatInputs = {
  operating_hours: 8760,
  cost_kw_hour: 0.066,
  fluidType: 'WATER',
  fluidTemperature: 70,
  co2SavingsData: undefined,
};

const MOCK_OPERATIONS_WARNINGS: OperationsWarnings = { cost: null };

const MOCK_CO2_SAVINGS_DATA: Co2SavingsData = {
  energyType: 'Electricity',
  totalEmissionOutputRate: 1,
  electricityUse: 100,
  totalEmissionOutput: 100,
};

function makePsat(): PSAT {
  return { inputs: { ...MOCK_PSAT_INPUTS }, operatingHours: { hoursPerYear: 8760 } as OperatingHours };
}

function makeAssessment(psat: PSAT): Assessment {
  return { id: 1, name: 'Test Assessment', type: 'PSAT', psat };
}

// Mirrors the shape built by PumpOperationsService.getFormFromObj for the mocked input values.
function makePumpOperationsForm(inputs: PsatInputs = MOCK_PSAT_INPUTS): UntypedFormGroup {
  return new UntypedFormGroup({
    operatingHours: new UntypedFormControl(inputs.operating_hours, [Validators.required, Validators.min(0), Validators.max(8760)]),
    costKwHr: new UntypedFormControl(inputs.cost_kw_hour, [Validators.required, Validators.min(0)]),
  });
}

describe('PumpOperationsComponent', () => {
  let component: PumpOperationsComponent;
  let fixture: ComponentFixture<PumpOperationsComponent>;
  let pumpOperationsServiceSpy: jasmine.SpyObj<PumpOperationsService>;
  let psatWarningServiceSpy: jasmine.SpyObj<PsatWarningService>;
  let compareServiceSpy: jasmine.SpyObj<CompareService>;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let assessmentCo2SavingsServiceSpy: jasmine.SpyObj<AssessmentCo2SavingsService>;
  let featureFlagServiceSpy: jasmine.SpyObj<FeatureFlagService>;
  let helpPanelService: HelpPanelService;
  let mockForm: UntypedFormGroup;
  let mockPsat: PSAT;

  beforeEach(async () => {
    mockPsat = makePsat();
    mockForm = makePumpOperationsForm();

    pumpOperationsServiceSpy = jasmine.createSpyObj('PumpOperationsService', ['getFormFromObj', 'getPsatInputsFromForm']);
    pumpOperationsServiceSpy.getFormFromObj.and.returnValue(mockForm);
    pumpOperationsServiceSpy.getPsatInputsFromForm.and.callFake((form: UntypedFormGroup, psatInputs: PsatInputs) => ({
      ...psatInputs,
      operating_hours: form.controls.operatingHours.value,
      cost_kw_hour: form.controls.costKwHr.value,
    }));

    psatWarningServiceSpy = jasmine.createSpyObj('PsatWarningService', ['checkPumpOperations']);
    psatWarningServiceSpy.checkPumpOperations.and.returnValue({ ...MOCK_OPERATIONS_WARNINGS });

    compareServiceSpy = jasmine.createSpyObj(
      'CompareService',
      ['isOperatingHoursDifferent', 'isCostKwhrDifferent', 'isTotalEmissionOutputRateDifferent'],
      { totalEmissionOutputRateDifferent: new BehaviorSubject<boolean>(false) }
    );
    (compareServiceSpy as any).baselinePSAT = undefined;
    (compareServiceSpy as any).modifiedPSAT = undefined;

    psatServiceSpy = jasmine.createSpyObj('PsatService', [], { modalOpen: new BehaviorSubject<boolean>(true) });

    assessmentCo2SavingsServiceSpy = jasmine.createSpyObj('AssessmentCo2SavingsService', ['getCo2SavingsDataFromSettingsObject']);
    assessmentCo2SavingsServiceSpy.getCo2SavingsDataFromSettingsObject.and.returnValue({ ...MOCK_CO2_SAVINGS_DATA });

    featureFlagServiceSpy = jasmine.createSpyObj('FeatureFlagService', [], { showOperationalImpacts: signal(false) });

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PumpOperationsComponent],
      providers: [
        { provide: PumpOperationsService, useValue: pumpOperationsServiceSpy },
        { provide: PsatWarningService, useValue: psatWarningServiceSpy },
        { provide: CompareService, useValue: compareServiceSpy },
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: AssessmentCo2SavingsService, useValue: assessmentCo2SavingsServiceSpy },
        { provide: FeatureFlagService, useValue: featureFlagServiceSpy },
        HelpPanelService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    helpPanelService = TestBed.inject(HelpPanelService);

    fixture = TestBed.createComponent(PumpOperationsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('psat', mockPsat);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('baseline', true);
    fixture.componentRef.setInput('selected', true);
    fixture.componentRef.setInput('inSetup', false);
    fixture.componentRef.setInput('assessment', makeAssessment(mockPsat));
    fixture.componentRef.setInput('modificationIndex', undefined);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('sets idString to psat_baseline for a baseline component', () => {
      expect(component.idString).toBe('psat_baseline');
    });

    it('calls getFormFromObj with psat.inputs', () => {
      expect(pumpOperationsServiceSpy.getFormFromObj).toHaveBeenCalledWith(mockPsat.inputs);
    });

    it('assigns the form returned by the form service', () => {
      expect(component.psatForm).toBe(mockForm);
    });

    it('assigns operationsWarnings from checkPumpOperations', () => {
      expect(psatWarningServiceSpy.checkPumpOperations).toHaveBeenCalledWith(mockPsat, MOCK_SETTINGS, true);
      expect(component.operationsWarnings).toEqual(MOCK_OPERATIONS_WARNINGS);
    });

    it('uses co2SavingsData already on psat.inputs when present', () => {
      const psatWithCo2 = makePsat();
      psatWithCo2.inputs.co2SavingsData = { ...MOCK_CO2_SAVINGS_DATA, energyType: 'Fuel' };
      pumpOperationsServiceSpy.getFormFromObj.and.returnValue(makePumpOperationsForm());
      assessmentCo2SavingsServiceSpy.getCo2SavingsDataFromSettingsObject.calls.reset();

      const withCo2Fixture = TestBed.createComponent(PumpOperationsComponent);
      withCo2Fixture.componentRef.setInput('psat', psatWithCo2);
      withCo2Fixture.componentRef.setInput('settings', MOCK_SETTINGS);
      withCo2Fixture.componentRef.setInput('baseline', true);
      withCo2Fixture.componentRef.setInput('selected', true);
      withCo2Fixture.componentRef.setInput('inSetup', false);
      withCo2Fixture.componentRef.setInput('assessment', makeAssessment(psatWithCo2));
      withCo2Fixture.detectChanges();

      expect(withCo2Fixture.componentInstance.co2SavingsData.energyType).toBe('Fuel');
      expect(assessmentCo2SavingsServiceSpy.getCo2SavingsDataFromSettingsObject).not.toHaveBeenCalled();
    });

    it('builds co2SavingsData from settings when psat.inputs has none', () => {
      expect(assessmentCo2SavingsServiceSpy.getCo2SavingsDataFromSettingsObject).toHaveBeenCalledWith(MOCK_SETTINGS);
      expect(component.co2SavingsData).toEqual(MOCK_CO2_SAVINGS_DATA);
    });

    it('disables the form when the component is created unselected', () => {
      pumpOperationsServiceSpy.getFormFromObj.and.returnValue(makePumpOperationsForm());
      const unselectedFixture = TestBed.createComponent(PumpOperationsComponent);
      unselectedFixture.componentRef.setInput('psat', makePsat());
      unselectedFixture.componentRef.setInput('settings', MOCK_SETTINGS);
      unselectedFixture.componentRef.setInput('baseline', true);
      unselectedFixture.componentRef.setInput('selected', false);
      unselectedFixture.componentRef.setInput('inSetup', false);
      unselectedFixture.componentRef.setInput('assessment', makeAssessment(makePsat()));
      unselectedFixture.detectChanges();

      expect(unselectedFixture.componentInstance.psatForm.controls.operatingHours.disabled).toBeTrue();
      expect(unselectedFixture.componentInstance.co2SavingsFormDisabled).toBeTrue();
    });
  });

  describe('ngOnChanges', () => {
    it('disables operatingHours and co2SavingsFormDisabled when selected becomes false', () => {
      fixture.componentRef.setInput('selected', false);
      fixture.detectChanges();
      expect(component.psatForm.controls.operatingHours.disabled).toBeTrue();
      expect(component.co2SavingsFormDisabled).toBeTrue();
    });

    it('enables operatingHours and co2SavingsFormDisabled when selected becomes true again', () => {
      fixture.componentRef.setInput('selected', false);
      fixture.detectChanges();
      fixture.componentRef.setInput('selected', true);
      fixture.detectChanges();
      expect(component.psatForm.controls.operatingHours.disabled).toBeFalse();
      expect(component.co2SavingsFormDisabled).toBeFalse();
    });

    it('re-runs init when modificationIndex changes to a new value', () => {
      pumpOperationsServiceSpy.getFormFromObj.calls.reset();
      fixture.componentRef.setInput('modificationIndex', 3);
      fixture.detectChanges();
      expect(pumpOperationsServiceSpy.getFormFromObj).toHaveBeenCalled();
    });
  });

  describe('observeTotalEmissionOutputRateDifferentChange', () => {
    it('updates totalEmissionOutputRateDifferent when the compare service subject changes', () => {
      (compareServiceSpy.totalEmissionOutputRateDifferent as BehaviorSubject<boolean>).next(true);
      expect(component.totalEmissionOutputRateDifferent).toBeTrue();

      (compareServiceSpy.totalEmissionOutputRateDifferent as BehaviorSubject<boolean>).next(false);
      expect(component.totalEmissionOutputRateDifferent).toBeFalse();
    });
  });

  describe('save', () => {
    it('updates psat.inputs from the form, refreshes warnings, and emits saved', () => {
      const emitted: boolean[] = [];
      component.saved.subscribe(value => emitted.push(value));
      psatWarningServiceSpy.checkPumpOperations.calls.reset();

      component.psatForm.controls.operatingHours.setValue(4000);
      component.save();

      expect(pumpOperationsServiceSpy.getPsatInputsFromForm).toHaveBeenCalledWith(
        component.psatForm, jasmine.objectContaining({ operating_hours: 8760 })
      );
      expect(mockPsat.inputs.operating_hours).toBe(4000);
      expect(psatWarningServiceSpy.checkPumpOperations).toHaveBeenCalledWith(mockPsat, MOCK_SETTINGS, true);
      expect(emitted).toEqual([true]);
    });
  });

  describe('focusField', () => {
    it('sets currentField on the help panel service to the given field name', () => {
      component.focusField('costKwHr');
      expect(helpPanelService.currentField.value).toBe('costKwHr');
    });
  });

  describe('operating hours modal actions', () => {
    it('opens the operating hours modal and marks it open', () => {
      component.openOperatingHoursModal();
      expect(component.showOperatingHoursModal).toBeTrue();
      expect(psatServiceSpy.modalOpen.value).toBeTrue();
    });

    it('closes the operating hours modal and marks it not open', () => {
      component.openOperatingHoursModal();
      component.closeOperatingHoursModal();
      expect(component.showOperatingHoursModal).toBeFalse();
      expect(psatServiceSpy.modalOpen.value).toBeFalse();
    });

    it('applies updated operating hours, saves, and closes the modal', () => {
      component.openOperatingHoursModal();
      const newHours: OperatingHours = { hoursPerYear: 5000 };

      component.updateOperatingHours(newHours);

      expect(component.psat.operatingHours).toBe(newHours);
      expect(component.psatForm.controls.operatingHours.value).toBe(5000);
      expect(component.showOperatingHoursModal).toBeFalse();
    });
  });

  describe('updatePsatCo2SavingsData', () => {
    it('saves the new co2SavingsData and refreshes the emission-different comparison', () => {
      const newCo2: Co2SavingsData = { ...MOCK_CO2_SAVINGS_DATA, totalEmissionOutputRate: 42 };
      (compareServiceSpy as any).baselinePSAT = mockPsat;
      (compareServiceSpy as any).modifiedPSAT = mockPsat;
      fixture.componentRef.setInput('inSetup', false);
      fixture.detectChanges();

      component.updatePsatCo2SavingsData(newCo2);

      expect(mockPsat.inputs.co2SavingsData).toBe(newCo2);
      expect(compareServiceSpy.isTotalEmissionOutputRateDifferent).toHaveBeenCalled();
    });
  });

  describe('template visibility', () => {
    it('hides the inSetup header by default', () => {
      expect(fixture.nativeElement.querySelector('.header')).toBeNull();
    });

    it('shows the inSetup header when inSetup is true', () => {
      fixture.componentRef.setInput('inSetup', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.header')).not.toBeNull();
    });

    it('hides the carbon emissions section when showOperationalImpacts is false', () => {
      expect(fixture.nativeElement.querySelector('app-assessment-co2-savings')).toBeNull();
    });

    it('shows the carbon emissions section when showOperationalImpacts is true and co2SavingsData is set', () => {
      featureFlagServiceSpy.showOperationalImpacts.set(true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-assessment-co2-savings')).not.toBeNull();
    });

    it('hides the carbon emissions data section when the outer flag is true but co2SavingsData is falsy', () => {
      featureFlagServiceSpy.showOperationalImpacts.set(true);
      component.co2SavingsData = undefined;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-assessment-co2-savings')).toBeNull();
    });

    it('hides the operating hours modal by default', () => {
      expect(fixture.nativeElement.querySelector('app-operating-hours-modal')).toBeNull();
    });

    it('shows the operating hours modal once opened', () => {
      component.openOperatingHoursModal();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-operating-hours-modal')).not.toBeNull();
    });
  });

  describe('destroy', () => {
    it('resets totalEmissionOutputRateDifferent to false on the compare service', () => {
      (compareServiceSpy.totalEmissionOutputRateDifferent as BehaviorSubject<boolean>).next(true);
      fixture.destroy();
      expect((compareServiceSpy.totalEmissionOutputRateDifferent as BehaviorSubject<boolean>).value).toBeFalse();
    });

    it('stops updating totalEmissionOutputRateDifferent after the component is destroyed', () => {
      fixture.destroy();
      (compareServiceSpy.totalEmissionOutputRateDifferent as BehaviorSubject<boolean>).next(true);
      expect(component.totalEmissionOutputRateDifferent).toBeFalse();
    });
  });
});
