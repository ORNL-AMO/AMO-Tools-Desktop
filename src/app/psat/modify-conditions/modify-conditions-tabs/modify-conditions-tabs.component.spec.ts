import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModifyConditionsTabsComponent } from './modify-conditions-tabs.component';
import { CompareService } from '../../compare.service';
import { PsatService } from '../../psat.service';
import { PsatWarningService, FieldDataWarnings, MotorWarnings, OperationsWarnings, PumpFluidWarnings } from '../../psat-warning.service';
import { PsatTabService } from '../../psat-tab.service';
import { PumpFluidService } from '../../pump-fluid/pump-fluid.service';
import { MotorService } from '../../motor/motor.service';
import { FieldDataService } from '../../field-data/field-data.service';
import { PumpOperationsService } from '../../pump-operations/pump-operations.service';
import { PSAT, PsatInputs } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', powerMeasurement: 'hp' } as Settings;

const MOCK_BASELINE_PSAT: PSAT = {
  inputs: {
    operating_hours: 8760,
    fluidType: 'Water',
    fluidTemperature: 60,
  } as PsatInputs,
  modifications: [],
  setupDone: true,
};

const MOCK_MODIFIED_PSAT: PSAT = {
  inputs: {
    operating_hours: 8000,
    fluidType: 'Water',
    fluidTemperature: 65,
    whatIfScenario: false,
  } as PsatInputs,
};

const NO_FIELD_DATA_WARNINGS: FieldDataWarnings = {
  flowError: null, voltageError: null, measuredPowerOrCurrentError: null, suggestedVoltage: null,
};
const NO_PUMP_FLUID_WARNINGS: PumpFluidWarnings = { rpmError: null, temperatureError: null };
const NO_MOTOR_WARNINGS: MotorWarnings = {
  rpmError: null, voltageError: null, flaError: null, ratedPowerError: null,
};
const NO_OPERATIONS_WARNINGS: OperationsWarnings = { cost: null };

function validForm(): UntypedFormGroup {
  return new UntypedFormGroup({});
}

function invalidForm(): UntypedFormGroup {
  return new UntypedFormGroup({ requiredField: new UntypedFormControl(null, Validators.required) });
}

describe('ModifyConditionsTabsComponent', () => {
  let component: ModifyConditionsTabsComponent;
  let fixture: ComponentFixture<ModifyConditionsTabsComponent>;

  let compareServiceSpy: jasmine.SpyObj<CompareService>;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let psatWarningServiceSpy: jasmine.SpyObj<PsatWarningService>;
  let psatTabServiceSpy: jasmine.SpyObj<PsatTabService>;
  let pumpFluidServiceSpy: jasmine.SpyObj<PumpFluidService>;
  let motorServiceSpy: jasmine.SpyObj<MotorService>;
  let fieldDataServiceSpy: jasmine.SpyObj<FieldDataService>;
  let pumpOperationsServiceSpy: jasmine.SpyObj<PumpOperationsService>;

  let getResults: BehaviorSubject<boolean>;
  let modifyConditionsTab: BehaviorSubject<string>;

  function findMobileTab(label: string): Element | undefined {
    const items = Array.from(
      fixture.nativeElement.querySelectorAll('.d-flex.d-lg-none .page-item')
    ) as Element[];
    return items.find(item => item.textContent.includes(label));
  }

  beforeEach(async () => {
    getResults = new BehaviorSubject<boolean>(true);
    modifyConditionsTab = new BehaviorSubject<string>('operations');

    compareServiceSpy = jasmine.createSpyObj(
      'CompareService',
      ['checkFieldDataDifferent', 'checkPumpDifferent', 'checkMotorDifferent', 'checkOperationsDifferent']
    );
    // Plain (non-signal) data properties: assigned directly rather than through createSpyObj's
    // getter/setter descriptor so tests can reassign modifiedPSAT later and have reads reflect it.
    compareServiceSpy.baselinePSAT = MOCK_BASELINE_PSAT;
    compareServiceSpy.modifiedPSAT = undefined;
    compareServiceSpy.checkFieldDataDifferent.and.returnValue(false);
    compareServiceSpy.checkPumpDifferent.and.returnValue(false);
    compareServiceSpy.checkMotorDifferent.and.returnValue(false);
    compareServiceSpy.checkOperationsDifferent.and.returnValue(false);

    psatServiceSpy = jasmine.createSpyObj('PsatService', [], { getResults });

    psatWarningServiceSpy = jasmine.createSpyObj('PsatWarningService', [
      'checkFieldData', 'checkPumpFluidWarnings', 'checkMotorWarnings', 'checkPumpOperations', 'checkWarningsExist',
    ]);
    psatWarningServiceSpy.checkFieldData.and.returnValue(NO_FIELD_DATA_WARNINGS);
    psatWarningServiceSpy.checkPumpFluidWarnings.and.returnValue(NO_PUMP_FLUID_WARNINGS);
    psatWarningServiceSpy.checkMotorWarnings.and.returnValue(NO_MOTOR_WARNINGS);
    psatWarningServiceSpy.checkPumpOperations.and.returnValue(NO_OPERATIONS_WARNINGS);
    psatWarningServiceSpy.checkWarningsExist.and.returnValue(false);

    psatTabServiceSpy = jasmine.createSpyObj('PsatTabService', [], { modifyConditionsTab });

    pumpFluidServiceSpy = jasmine.createSpyObj('PumpFluidService', ['getFormFromObj']);
    pumpFluidServiceSpy.getFormFromObj.and.returnValue(validForm());

    motorServiceSpy = jasmine.createSpyObj('MotorService', ['getFormFromObj']);
    motorServiceSpy.getFormFromObj.and.returnValue(validForm());

    fieldDataServiceSpy = jasmine.createSpyObj('FieldDataService', ['getFormFromObj']);
    fieldDataServiceSpy.getFormFromObj.and.returnValue(validForm());

    pumpOperationsServiceSpy = jasmine.createSpyObj('PumpOperationsService', ['getFormFromObj']);
    pumpOperationsServiceSpy.getFormFromObj.and.returnValue(validForm());

    await TestBed.configureTestingModule({
      declarations: [ModifyConditionsTabsComponent],
      providers: [
        { provide: CompareService, useValue: compareServiceSpy },
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: PsatWarningService, useValue: psatWarningServiceSpy },
        { provide: PsatTabService, useValue: psatTabServiceSpy },
        { provide: PumpFluidService, useValue: pumpFluidServiceSpy },
        { provide: MotorService, useValue: motorServiceSpy },
        { provide: FieldDataService, useValue: fieldDataServiceSpy },
        { provide: PumpOperationsService, useValue: pumpOperationsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ModifyConditionsTabsComponent);
    component = fixture.componentInstance;
    component.settings = MOCK_SETTINGS;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('initializes tooltip and hover flags to false', () => {
      expect(component.displayPumpFluidTooltip).toBeFalse();
      expect(component.pumpFluidBadgeHover).toBeFalse();
      expect(component.displayMotorTooltip).toBeFalse();
      expect(component.motorBadgeHover).toBeFalse();
      expect(component.displayFieldDataTooltip).toBeFalse();
      expect(component.fieldDataBadgeHover).toBeFalse();
      expect(component.displayOperationsTooltip).toBeFalse();
      expect(component.operationsBadgeHover).toBeFalse();
    });

    it('sets modifyTab from the initial modifyConditionsTab value', () => {
      expect(component.modifyTab).toBe('operations');
    });

    it('calls getFormFromObj for each baseline form with the baseline inputs', () => {
      expect(fieldDataServiceSpy.getFormFromObj).toHaveBeenCalledWith(MOCK_BASELINE_PSAT.inputs, true);
      expect(pumpFluidServiceSpy.getFormFromObj).toHaveBeenCalledWith(MOCK_BASELINE_PSAT.inputs);
      expect(motorServiceSpy.getFormFromObj).toHaveBeenCalledWith(MOCK_BASELINE_PSAT.inputs);
      expect(pumpOperationsServiceSpy.getFormFromObj).toHaveBeenCalledWith(MOCK_BASELINE_PSAT.inputs);
    });

    it('computes success badge classes when forms are valid, no warnings exist, and there is no modification', () => {
      expect(component.fieldDataBadgeClass).toBe('success');
      expect(component.pumpFluidBadgeClass).toBe('success');
      expect(component.motorBadgeClass).toBe('success');
      expect(component.operationsBadgeClass).toBe('success');
    });
  });

  describe('observeGetResultsChange', () => {
    it('recomputes pumpFluidBadgeClass as missing-data when the baseline pump/fluid form becomes invalid', () => {
      pumpFluidServiceSpy.getFormFromObj.and.returnValue(invalidForm());

      getResults.next(false);

      expect(component.pumpFluidBadgeClass).toBe('missing-data');
    });

    it('recomputes fieldDataBadgeClass as input-error when baseline field data warnings exist', () => {
      psatWarningServiceSpy.checkFieldData.and.returnValue({ ...NO_FIELD_DATA_WARNINGS, flowError: 'Flow rate is out of range' });

      getResults.next(true);

      expect(component.fieldDataBadgeClass).toBe('input-error');
    });

    it('recomputes motorBadgeClass as loss-different when a modification exists and differs from baseline', () => {
      compareServiceSpy.modifiedPSAT = MOCK_MODIFIED_PSAT;
      compareServiceSpy.checkMotorDifferent.and.returnValue(true);

      getResults.next(true);

      expect(component.motorBadgeClass).toBe('loss-different');
    });

    it('recomputes operationsBadgeClass as input-error when checkWarningsExist reports a baseline warning', () => {
      psatWarningServiceSpy.checkWarningsExist.and.returnValue(true);

      getResults.next(true);

      expect(component.operationsBadgeClass).toBe('input-error');
    });
  });

  describe('observeModifyConditionsTabChange', () => {
    it('updates modifyTab when the service emits a new tab', () => {
      modifyConditionsTab.next('motor');
      expect(component.modifyTab).toBe('motor');
    });
  });

  describe('tabChange', () => {
    it('pushes the selected tab onto modifyConditionsTab', () => {
      component.tabChange('pump-fluid');
      expect(modifyConditionsTab.value).toBe('pump-fluid');
    });
  });

  describe('showTooltip / hideTooltip', () => {
    it('reveals the tooltip for a badge after the hover delay elapses', fakeAsync(() => {
      component.showTooltip('motor');
      expect(component.motorBadgeHover).toBeTrue();

      tick(1000);

      expect(component.displayMotorTooltip).toBeTrue();
    }));

    it('does not reveal the tooltip if hover ends before the delay elapses', fakeAsync(() => {
      component.showTooltip('pumpFluid');
      component.hideTooltip('pumpFluid');

      tick(1000);

      expect(component.displayPumpFluidTooltip).toBeFalse();
    }));

    it('hides the tooltip and clears hover state immediately', () => {
      component.fieldDataBadgeHover = true;
      component.displayFieldDataTooltip = true;

      component.hideTooltip('fieldData');

      expect(component.fieldDataBadgeHover).toBeFalse();
      expect(component.displayFieldDataTooltip).toBeFalse();
    });
  });

  describe('back', () => {
    it('moves modifyConditionsTab to the previous tab', () => {
      modifyConditionsTab.next('motor');
      component.back();
      expect(modifyConditionsTab.value).toBe('pump-fluid');
    });

    it('does nothing when already on the first tab', () => {
      modifyConditionsTab.next('operations');
      component.back();
      expect(modifyConditionsTab.value).toBe('operations');
    });
  });

  describe('continue', () => {
    it('moves modifyConditionsTab to the next tab', () => {
      modifyConditionsTab.next('pump-fluid');
      component.continue();
      expect(modifyConditionsTab.value).toBe('motor');
    });

    it('does nothing when already on the last tab', () => {
      modifyConditionsTab.next('field-data');
      component.continue();
      expect(modifyConditionsTab.value).toBe('field-data');
    });
  });

  describe('template visibility', () => {
    it('shows only the Operations mobile tab when modifyTab is operations', () => {
      modifyConditionsTab.next('operations');
      fixture.detectChanges();

      expect(findMobileTab('Operations')).toBeDefined();
      expect(findMobileTab('Pump & Fluid')).toBeUndefined();
      expect(findMobileTab('Motor')).toBeUndefined();
      expect(findMobileTab('Field Data')).toBeUndefined();
    });

    it('shows only the Pump & Fluid mobile tab when modifyTab is pump-fluid', () => {
      modifyConditionsTab.next('pump-fluid');
      fixture.detectChanges();

      expect(findMobileTab('Pump & Fluid')).toBeDefined();
      expect(findMobileTab('Operations')).toBeUndefined();
      expect(findMobileTab('Motor')).toBeUndefined();
      expect(findMobileTab('Field Data')).toBeUndefined();
    });

    it('shows only the Motor mobile tab when modifyTab is motor', () => {
      modifyConditionsTab.next('motor');
      fixture.detectChanges();

      expect(findMobileTab('Motor')).toBeDefined();
      expect(findMobileTab('Operations')).toBeUndefined();
      expect(findMobileTab('Pump & Fluid')).toBeUndefined();
      expect(findMobileTab('Field Data')).toBeUndefined();
    });

    it('shows only the Field Data mobile tab when modifyTab is field-data', () => {
      modifyConditionsTab.next('field-data');
      fixture.detectChanges();

      expect(findMobileTab('Field Data')).toBeDefined();
      expect(findMobileTab('Operations')).toBeUndefined();
      expect(findMobileTab('Pump & Fluid')).toBeUndefined();
      expect(findMobileTab('Motor')).toBeUndefined();
    });
  });

  describe('destroy', () => {
    it('stops recomputing badge classes after the component is destroyed', () => {
      pumpFluidServiceSpy.getFormFromObj.calls.reset();
      fixture.destroy();

      getResults.next(false);

      expect(pumpFluidServiceSpy.getFormFromObj).not.toHaveBeenCalled();
    });

    it('stops updating modifyTab after the component is destroyed', () => {
      fixture.destroy();

      modifyConditionsTab.next('field-data');

      expect(component.modifyTab).not.toBe('field-data');
    });
  });
});
