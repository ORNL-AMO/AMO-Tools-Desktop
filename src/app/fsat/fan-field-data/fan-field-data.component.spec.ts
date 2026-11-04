import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Directive, Input, NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { FanFieldDataComponent } from './fan-field-data.component';
import { FanFieldDataService } from './fan-field-data.service';
import { FsatService } from '../fsat.service';
import { CompareService } from '../compare.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { FanFieldDataWarnings, FsatWarningService } from '../fsat-warning.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FansSuiteApiService } from '../../tools-suite-api/fans-suite-api.service';
import { FieldData, FSAT, FsatOutput, InletPressureData, OutletPressureData } from '../../shared/models/fans';
import { Settings } from '../../shared/models/settings';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

@Directive({ selector: '[bsModal]', exportAs: 'bs-modal', standalone: false })
class BsModalStubDirective {
  @Input() config: unknown;
  onShown = new Subject<void>();
  show = jasmine.createSpy('show');
  hide = jasmine.createSpy('hide');
}

const BASELINE_ID = 'fsat_baseline';
const MOD_ID = 'fsat_modification_0';
const DASHES = '— —';
const NO_WARNINGS: FanFieldDataWarnings = {
  voltageError: null,
  ratedPowerError: null,
  suggestedVoltage: null,
  inletPressureError: null,
  outletPressureError: null,
  calcInletVelocityPressureError: null,
};

function makeSettings(overrides: Partial<Settings> = {}): Settings {
  return { unitsOfMeasure: 'Imperial', fanFlowRate: 'ft3/min', fanPressureMeasurement: 'inH2o', ...overrides } as Settings;
}

function makeFieldData(overrides: Partial<FieldData> = {}): FieldData {
  return {
    flowRate: 100000,
    inletPressure: -10,
    outletPressure: 5,
    loadEstimatedMethod: 0,
    motorPower: 200,
    compressibilityFactor: 0.99,
    measuredVoltage: 460,
    usingStaticPressure: false,
    ductArea: 20,
    inletVelocityPressure: 1.5,
    userDefinedCompressibilityFactor: true,
    userDefinedVelocityPressure: true,
    ...overrides,
  };
}

function makeFsat(fieldData: FieldData): FSAT {
  return {
    fieldData,
    baseGasDensity: { gasDensity: 0.07, barometricPressure: 29.92, specificHeatRatio: 1.4 },
  } as FSAT;
}

describe('FanFieldDataComponent', () => {
  let component: FanFieldDataComponent;
  let fixture: ComponentFixture<FanFieldDataComponent>;
  let fanFieldDataServiceSpy: jasmine.SpyObj<FanFieldDataService>;
  let fsatServiceSpy: jasmine.SpyObj<FsatService>;
  let warningServiceSpy: jasmine.SpyObj<FsatWarningService>;
  let compareServiceSpy: jasmine.SpyObj<CompareService>;
  let helpPanelSpy: jasmine.SpyObj<HelpPanelService>;
  let modalOpen: BehaviorSubject<boolean>;
  let currentField: BehaviorSubject<string>;
  let root: HTMLElement;

  interface InputOverrides {
    fieldData?: FieldData;
    settings?: Settings;
    baseline?: boolean;
    selected?: boolean;
    inSetup?: boolean;
  }

  function createComponent(overrides: InputOverrides = {}): void {
    fixture = TestBed.createComponent(FanFieldDataComponent);
    component = fixture.componentInstance;
    component.fieldData = overrides.fieldData ?? makeFieldData();
    component.fsat = makeFsat(component.fieldData);
    component.settings = overrides.settings ?? makeSettings();
    component.baseline = overrides.baseline ?? true;
    component.selected = overrides.selected ?? true;
    component.inSetup = overrides.inSetup ?? false;
    component.modificationIndex = 0;
    fixture.detectChanges();
    root = fixture.nativeElement;
  }

  function idString(): string {
    return component.baseline ? BASELINE_ID : MOD_ID;
  }

  /** Finds the form-group wrapper of a field via its label's `for` attribute. */
  function group(labelFor: string): HTMLElement | null {
    return root.querySelector(`label[for="${labelFor}"]`)?.closest('.form-group') ?? null;
  }

  function setWarnings(warnings: Partial<FanFieldDataWarnings>): void {
    warningServiceSpy.checkFieldDataWarnings.and.returnValue({ ...NO_WARNINGS, ...warnings });
    component.checkForWarnings();
    fixture.detectChanges();
  }

  function linkTexts(element: HTMLElement): string[] {
    return Array.from(element.querySelectorAll('a.click-link')).map((a: Element) => a.textContent.replace(/\s+/g, ' ').trim());
  }

  function makeInvalidDirty(controlName: string, value: number | null): void {
    component.fieldDataForm.controls[controlName].setValue(value);
    component.fieldDataForm.controls[controlName].markAsDirty();
    fixture.detectChanges();
  }

  function modalStub(): BsModalStubDirective {
    return component.pressureModal as unknown as BsModalStubDirective;
  }

  beforeEach(async () => {
    // Only the form builders are used from the real service; its suite-backed calculations are mocked
    const realFormService = new FanFieldDataService({} as FansSuiteApiService, new UntypedFormBuilder(), {} as ConvertUnitsService);
    fanFieldDataServiceSpy = jasmine.createSpyObj('FanFieldDataService', ['getFormFromObj', 'getObjFromForm', 'calculateCompressibilityFactor']);
    fanFieldDataServiceSpy.getFormFromObj.and.callFake((obj: FieldData) => realFormService.getFormFromObj(obj));
    fanFieldDataServiceSpy.getObjFromForm.and.callFake(form => realFormService.getObjFromForm(form));
    fanFieldDataServiceSpy.calculateCompressibilityFactor.and.returnValue(0.985);

    modalOpen = new BehaviorSubject<boolean>(false);
    fsatServiceSpy = jasmine.createSpyObj('FsatService', ['getResults', 'calculateInletVelocityPressure'], { modalOpen });
    fsatServiceSpy.getResults.and.returnValue({ fanShaftPower: 50 } as FsatOutput);
    fsatServiceSpy.calculateInletVelocityPressure.and.returnValue(0.5);

    warningServiceSpy = jasmine.createSpyObj('FsatWarningService', ['checkFieldDataWarnings']);
    warningServiceSpy.checkFieldDataWarnings.and.returnValue({ ...NO_WARNINGS });

    compareServiceSpy = jasmine.createSpyObj('CompareService', [
      'isFlowRateDifferent', 'isInletPressureDifferent', 'isInletVelocityPressureDifferent', 'isDuctAreaDifferent',
      'isOutletPressureDifferent', 'isCompressibilityFactorDifferent', 'isMeasuredVoltageDifferent'
    ]);

    currentField = new BehaviorSubject<string>('default');
    helpPanelSpy = jasmine.createSpyObj('HelpPanelService', [], { currentField });

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FanFieldDataComponent, SettingsLabelStubPipe, BsModalStubDirective],
      providers: [
        { provide: FanFieldDataService, useValue: fanFieldDataServiceSpy },
        { provide: FsatService, useValue: fsatServiceSpy },
        { provide: FsatWarningService, useValue: warningServiceSpy },
        { provide: CompareService, useValue: compareServiceSpy },
        { provide: HelpPanelService, useValue: helpPanelSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      createComponent();
      expect(component).toBeTruthy();
    });

    it('uses the baseline id string for the baseline', () => {
      createComponent({ baseline: true });
      expect(component.idString).toBe(BASELINE_ID);
      expect(root.querySelector(`#flowRate_${BASELINE_ID}`)).not.toBeNull();
    });

    it('uses the modification id string with the modification index otherwise', () => {
      createComponent({ baseline: false });
      expect(component.idString).toBe(MOD_ID);
      expect(root.querySelector(`#flowRate_${MOD_ID}`)).not.toBeNull();
    });

    it('builds the form from the field data', () => {
      const fieldData = makeFieldData();
      createComponent({ fieldData });
      expect(fanFieldDataServiceSpy.getFormFromObj).toHaveBeenCalledWith(fieldData);
      expect(component.fieldDataForm.controls.flowRate.value).toBe(100000);
    });

    it('saves and checks warnings for the fsat during init', () => {
      createComponent({ baseline: false });
      expect(warningServiceSpy.checkFieldDataWarnings).toHaveBeenCalledWith(component.fsat, component.settings, true);
      expect(component.warnings).toEqual(NO_WARNINGS);
    });

    it('disables only the load estimation method when not selected', () => {
      createComponent({ selected: false });
      expect(component.fieldDataForm.controls.loadEstimatedMethod.disabled).toBeTrue();
      expect(component.fieldDataForm.controls.flowRate.enabled).toBeTrue();
    });

    it('keeps the form enabled when selected', () => {
      createComponent({ selected: true });
      expect(component.fieldDataForm.enabled).toBeTrue();
    });

    it('calculates the compressibility factor during init when it is not user defined', () => {
      createComponent({ fieldData: makeFieldData({ userDefinedCompressibilityFactor: false }) });
      expect(fsatServiceSpy.getResults).toHaveBeenCalled();
      expect(component.fieldDataForm.controls.compressibilityFactor.value).toBe(0.985);
    });

    it('does not calculate the compressibility factor during init when it is user defined', () => {
      createComponent({ fieldData: makeFieldData({ userDefinedCompressibilityFactor: true }) });
      expect(fanFieldDataServiceSpy.calculateCompressibilityFactor).not.toHaveBeenCalled();
      expect(component.fieldDataForm.controls.compressibilityFactor.value).toBe(0.99);
    });

    it('calculates the inlet velocity pressure during init for static pressure when not user defined', () => {
      createComponent({ fieldData: makeFieldData({ usingStaticPressure: true, userDefinedVelocityPressure: false }) });
      expect(fsatServiceSpy.calculateInletVelocityPressure).toHaveBeenCalledWith(
        { ductArea: 20, gasDensity: 0.07, flowRate: 100000 }, component.settings);
      expect(component.fieldDataForm.controls.inletVelocityPressure.value).toBe(0.5);
    });

    it('zeroes the inlet velocity pressure during init for total pressure', () => {
      createComponent({ fieldData: makeFieldData({ usingStaticPressure: false }) });
      expect(component.fieldDataForm.controls.inletVelocityPressure.value).toBe(0);
    });
  });

  describe('ngOnChanges', () => {
    it('enables the load estimation method when selected changes to true', () => {
      createComponent({ selected: false });
      component.selected = true;
      component.ngOnChanges({ selected: { currentValue: true, previousValue: false, firstChange: false, isFirstChange: () => false } });
      expect(component.fieldDataForm.controls.loadEstimatedMethod.enabled).toBeTrue();
    });

    it('disables the load estimation method when selected changes to false', () => {
      createComponent({ selected: true });
      component.selected = false;
      component.ngOnChanges({ selected: { currentValue: false, previousValue: true, firstChange: false, isFirstChange: () => false } });
      expect(component.fieldDataForm.controls.loadEstimatedMethod.disabled).toBeTrue();
    });

    it('rebuilds the form when the modification index changes', () => {
      createComponent();
      const previousForm = component.fieldDataForm;
      component.ngOnChanges({ modificationIndex: { currentValue: 1, previousValue: 0, firstChange: false, isFirstChange: () => false } });
      expect(component.fieldDataForm).not.toBe(previousForm);
    });
  });

  describe('template visibility', () => {
    describe('setup header', () => {
      it('hides the header when not in setup', () => {
        createComponent({ inSetup: false });
        expect(root.querySelector('.header')).toBeNull();
      });

      it('shows the Field Data header when in setup', () => {
        createComponent({ inSetup: true });
        expect(root.querySelector('.header h3').textContent.trim()).toBe('Field Data');
      });

      it('applies the larger padding class only when in setup', () => {
        createComponent({ inSetup: true });
        expect(root.querySelector('.p-4')).not.toBeNull();
        expect(root.querySelector('.p-3')).toBeNull();
      });

      it('applies the smaller padding class when not in setup', () => {
        createComponent({ inSetup: false });
        expect(root.querySelector('.p-3')).not.toBeNull();
        expect(root.querySelector('.p-4')).toBeNull();
      });
    });

    describe('pressure type toggle', () => {
      it('marks the static pressure button active when using static pressure', () => {
        createComponent({ fieldData: makeFieldData({ usingStaticPressure: true }) });
        const buttons = root.querySelectorAll('.toggle-btn');
        expect(buttons.length).toBe(2);
        expect(buttons[0].classList).toContain('active');
        expect(buttons[1].classList).not.toContain('active');
      });

      it('marks the total pressure button active when not using static pressure', () => {
        createComponent({ fieldData: makeFieldData({ usingStaticPressure: false }) });
        const buttons = root.querySelectorAll('.toggle-btn');
        expect(buttons[0].classList).not.toContain('active');
        expect(buttons[1].classList).toContain('active');
      });
    });

    describe('flow rate errors', () => {
      beforeEach(() => createComponent());

      it('hides the error when the flow rate is valid', () => {
        expect(group(`flowRate_${idString()}`).querySelector('.alert-danger')).toBeNull();
      });

      it('hides the error when the flow rate is invalid but pristine', () => {
        component.fieldDataForm.controls.flowRate.setValue(null);
        component.fieldDataForm.controls.flowRate.markAsPristine();
        fixture.detectChanges();
        expect(group(`flowRate_${idString()}`).querySelector('.alert-danger')).toBeNull();
      });

      it('shows only the required message when the flow rate is empty', () => {
        makeInvalidDirty('flowRate', null);
        const error = group(`flowRate_${idString()}`).querySelector('.alert-danger');
        expect(error.querySelectorAll('span').length).toBe(1);
        expect(error.textContent).toContain('Value Required');
        expect(group(`flowRate_${idString()}`).classList).toContain('invalid');
      });

      it('shows only the greater than zero message when the flow rate is zero', () => {
        makeInvalidDirty('flowRate', 0);
        const error = group(`flowRate_${idString()}`).querySelector('.alert-danger');
        expect(error.querySelectorAll('span').length).toBe(1);
        expect(error.textContent).toContain('Flow Rate must be greater than zero');
      });
    });

    describe('static pressure section', () => {
      it('hides the duct area and inlet velocity pressure groups when not using static pressure', () => {
        createComponent({ fieldData: makeFieldData({ usingStaticPressure: false }) });
        expect(root.querySelector('[formControlName="ductArea"]')).toBeNull();
        expect(group(`inletVelocityPressure_${idString()}`)).toBeNull();
      });

      it('shows the inlet velocity pressure group when using static pressure', () => {
        createComponent({ fieldData: makeFieldData({ usingStaticPressure: true }) });
        expect(group(`inletVelocityPressure_${idString()}`)).not.toBeNull();
      });

      it('shows the section when the pressure type switches to static pressure', () => {
        createComponent({ fieldData: makeFieldData({ usingStaticPressure: false }) });
        component.setPressureType(true);
        fixture.detectChanges();
        expect(group(`inletVelocityPressure_${idString()}`)).not.toBeNull();
      });

      describe('duct area', () => {
        it('hides the duct area group when the inlet velocity pressure is user defined', () => {
          createComponent({ fieldData: makeFieldData({ usingStaticPressure: true, userDefinedVelocityPressure: true }) });
          expect(root.querySelector('[formControlName="ductArea"]')).toBeNull();
          expect(group(`duct${idString()}`)).toBeNull();
        });

        it('shows the duct area group when the inlet velocity pressure is estimated', () => {
          createComponent({ fieldData: makeFieldData({ usingStaticPressure: true, userDefinedVelocityPressure: false }) });
          expect(root.querySelector('[formControlName="ductArea"]')).not.toBeNull();
          expect(group(`duct${idString()}`)).not.toBeNull();
        });

        it('shows square feet units for imperial settings only', () => {
          createComponent({
            fieldData: makeFieldData({ usingStaticPressure: true, userDefinedVelocityPressure: false }),
            settings: makeSettings({ unitsOfMeasure: 'Imperial' })
          });
          const units = group(`duct${idString()}`).querySelector('.units');
          expect(units.textContent.trim()).toBe('ft2');
          expect(units.querySelectorAll('span').length).toBe(1);
        });

        it('shows square meter units for metric settings only', () => {
          createComponent({
            fieldData: makeFieldData({ usingStaticPressure: true, userDefinedVelocityPressure: false }),
            settings: makeSettings({ unitsOfMeasure: 'Metric' })
          });
          const units = group(`duct${idString()}`).querySelector('.units');
          expect(units.textContent.trim()).toBe('m2');
          expect(units.querySelectorAll('span').length).toBe(1);
        });

        it('shows no unit label for unrecognized units of measure', () => {
          createComponent({
            fieldData: makeFieldData({ usingStaticPressure: true, userDefinedVelocityPressure: false }),
            settings: makeSettings({ unitsOfMeasure: 'Other' })
          });
          expect(group(`duct${idString()}`).querySelector('.units').querySelectorAll('span').length).toBe(0);
        });
      });

      describe('inlet velocity pressure when user defined', () => {
        beforeEach(() => {
          createComponent({ fieldData: makeFieldData({ usingStaticPressure: true, userDefinedVelocityPressure: true, inletVelocityPressure: 1.5 }) });
        });

        it('shows the Estimate link and not the Define link', () => {
          expect(linkTexts(group(`inletVelocityPressure_${idString()}`))).toEqual(['Estimate Inlet Velocity Pressure']);
        });

        it('shows the input and hides the calculated value', () => {
          const velocityGroup = group(`inletVelocityPressure_${idString()}`);
          expect(velocityGroup.querySelector('[formControlName="inletVelocityPressure"]')).not.toBeNull();
          expect(velocityGroup.querySelector('.bold')).toBeNull();
        });

        it('hides the error when the value is valid', () => {
          expect(group(`inletVelocityPressure_${idString()}`).querySelector('.alert-danger')).toBeNull();
        });

        it('hides the error when the value is invalid but pristine', () => {
          component.fieldDataForm.controls.inletVelocityPressure.setValue(null);
          component.fieldDataForm.controls.inletVelocityPressure.markAsPristine();
          fixture.detectChanges();
          expect(group(`inletVelocityPressure_${idString()}`).querySelector('.alert-danger')).toBeNull();
        });

        it('shows the required error when the value is empty and dirty', () => {
          makeInvalidDirty('inletVelocityPressure', null);
          expect(group(`inletVelocityPressure_${idString()}`).querySelector('.alert-danger').textContent).toContain('Value Required');
        });

        it('hides the calculation warning even when one exists', () => {
          component.fieldDataForm.controls.ductArea.markAsDirty();
          setWarnings({ calcInletVelocityPressureError: 'Velocity warning' });
          expect(group(`inletVelocityPressure_${idString()}`).querySelector('.alert-warning')).toBeNull();
        });
      });

      describe('inlet velocity pressure when estimated', () => {
        beforeEach(() => {
          createComponent({ fieldData: makeFieldData({ usingStaticPressure: true, userDefinedVelocityPressure: false }) });
        });

        it('shows the Define link and not the Estimate link', () => {
          expect(linkTexts(group(`inletVelocityPressure_${idString()}`))).toEqual(['Define Inlet Velocity Pressure']);
        });

        it('hides the input and shows the calculated value with its unit', () => {
          const velocityGroup = group(`inletVelocityPressure_${idString()}`);
          expect(velocityGroup.querySelector('[formControlName="inletVelocityPressure"]')).toBeNull();
          expect(velocityGroup.querySelector('.bold').textContent).toContain('0.5');
          expect(velocityGroup.querySelector('.bold .calculated-error')).toBeNull();
        });

        it('shows dashes instead of a value when the inlet velocity pressure is undefined', () => {
          component.fieldDataForm.controls.inletVelocityPressure.setValue(undefined);
          fixture.detectChanges();
          const velocityGroup = group(`inletVelocityPressure_${idString()}`);
          expect(velocityGroup.querySelector('.calculated-error').textContent.trim()).toBe(DASHES);
          expect(velocityGroup.querySelector('.bold .mr-2:not(.calculated-error)')).toBeNull();
        });

        it('still shows the required error span while the value is calculated', () => {
          makeInvalidDirty('inletVelocityPressure', null);
          expect(group(`inletVelocityPressure_${idString()}`).querySelector('.alert-danger')).not.toBeNull();
        });

        it('hides the calculation warning when there is none', () => {
          expect(group(`inletVelocityPressure_${idString()}`).querySelector('.alert-warning')).toBeNull();
        });

        it('shows the calculation warning when one exists and the duct area is dirty', () => {
          component.fieldDataForm.controls.ductArea.markAsDirty();
          setWarnings({ calcInletVelocityPressureError: 'Velocity warning' });
          expect(group(`inletVelocityPressure_${idString()}`).querySelector('.alert-warning').textContent.trim()).toBe('Velocity warning');
        });

        it('hides the calculation warning when the duct area is pristine', () => {
          component.fieldDataForm.controls.ductArea.markAsPristine();
          setWarnings({ calcInletVelocityPressureError: 'Velocity warning' });
          expect(group(`inletVelocityPressure_${idString()}`).querySelector('.alert-warning')).toBeNull();
        });
      });
    });

    describe('inlet pressure', () => {
      beforeEach(() => createComponent());

      it('hides the error and warning when valid with no warning', () => {
        const inletGroup = group(`inletPressure_${idString()}`);
        expect(inletGroup.querySelector('.alert-danger')).toBeNull();
        expect(inletGroup.querySelector('.alert-warning')).toBeNull();
      });

      it('hides the error when invalid but pristine', () => {
        component.fieldDataForm.controls.inletPressure.setValue(null);
        component.fieldDataForm.controls.inletPressure.markAsPristine();
        fixture.detectChanges();
        expect(group(`inletPressure_${idString()}`).querySelector('.alert-danger')).toBeNull();
      });

      it('shows the required error when empty and dirty', () => {
        makeInvalidDirty('inletPressure', null);
        expect(group(`inletPressure_${idString()}`).querySelector('.alert-danger').textContent).toContain('Value Required');
      });

      it('shows the warning when one exists and the field is dirty', () => {
        setWarnings({ inletPressureError: 'Inlet warning' });
        const inletGroup = group(`inletPressure_${idString()}`);
        expect(inletGroup.querySelector('.alert-warning').textContent.trim()).toBe('Inlet warning');
        expect(inletGroup.classList).toContain('error');
      });

      it('hides the warning when one exists but the field is pristine', () => {
        component.fieldDataForm.controls.inletPressure.markAsPristine();
        setWarnings({ inletPressureError: 'Inlet warning' });
        expect(group(`inletPressure_${idString()}`).querySelector('.alert-warning')).toBeNull();
      });
    });

    describe('outlet pressure', () => {
      beforeEach(() => createComponent());

      it('hides the error and warning when valid with no warning', () => {
        const outletGroup = group(`outletPressure_${idString()}`);
        expect(outletGroup.querySelector('.alert-danger')).toBeNull();
        expect(outletGroup.querySelector('.alert-warning')).toBeNull();
      });

      it('hides the error when invalid but pristine', () => {
        component.fieldDataForm.controls.outletPressure.setValue(null);
        component.fieldDataForm.controls.outletPressure.markAsPristine();
        fixture.detectChanges();
        expect(group(`outletPressure_${idString()}`).querySelector('.alert-danger')).toBeNull();
      });

      it('shows the required error when empty and dirty', () => {
        makeInvalidDirty('outletPressure', null);
        expect(group(`outletPressure_${idString()}`).querySelector('.alert-danger').textContent).toContain('Value Required');
      });

      it('shows the warning when one exists and the field is dirty', () => {
        setWarnings({ outletPressureError: 'Outlet warning' });
        const outletGroup = group(`outletPressure_${idString()}`);
        expect(outletGroup.querySelector('.alert-warning').textContent.trim()).toBe('Outlet warning');
        expect(outletGroup.classList).toContain('error');
      });

      it('hides the warning when one exists but the field is pristine', () => {
        component.fieldDataForm.controls.outletPressure.markAsPristine();
        setWarnings({ outletPressureError: 'Outlet warning' });
        expect(group(`outletPressure_${idString()}`).querySelector('.alert-warning')).toBeNull();
      });
    });

    describe('baseline-only load fields', () => {
      it('hides the load estimation method and motor power groups for a modification', () => {
        createComponent({ baseline: false });
        expect(root.querySelector('[formControlName="loadEstimatedMethod"]')).toBeNull();
        expect(root.querySelector('[formControlName="motorPower"]')).toBeNull();
        expect(group(`motorPower_${MOD_ID}`)).toBeNull();
      });

      it('shows the load estimation method and motor power groups for the baseline', () => {
        createComponent({ baseline: true });
        expect(root.querySelector('[formControlName="loadEstimatedMethod"]')).not.toBeNull();
        expect(root.querySelector('[formControlName="motorPower"]')).not.toBeNull();
      });

      it('renders one load estimation method option per method', () => {
        createComponent({ baseline: true });
        const options = Array.from(root.querySelectorAll('[formControlName="loadEstimatedMethod"] option')).map((o: Element) => o.textContent.trim());
        expect(options).toEqual(['Power', 'Current']);
      });

      it('renders no load estimation method options when there are no methods', () => {
        createComponent({ baseline: true });
        component.loadEstimateMethods = [];
        fixture.detectChanges();
        expect(root.querySelector('[formControlName="loadEstimatedMethod"]')).not.toBeNull();
        expect(root.querySelectorAll('[formControlName="loadEstimatedMethod"] option').length).toBe(0);
      });

      describe('when estimating by power', () => {
        beforeEach(() => createComponent({ baseline: true, fieldData: makeFieldData({ loadEstimatedMethod: 0 }) }));

        it('labels the field Motor Power and not Motor Current', () => {
          const labels = Array.from(root.querySelectorAll(`label[for="motorPower_${BASELINE_ID}"]`)).map((l: Element) => l.textContent.trim());
          expect(labels).toEqual(['Motor Power']);
        });

        it('shows the kW unit and not the A unit', () => {
          const units = Array.from(group(`motorPower_${BASELINE_ID}`).querySelectorAll('.input-group .units')).map((u: Element) => u.textContent.trim());
          expect(units).toEqual(['kW']);
        });
      });

      describe('when estimating by current', () => {
        beforeEach(() => createComponent({ baseline: true, fieldData: makeFieldData({ loadEstimatedMethod: 1 }) }));

        it('labels the field Motor Current and not Motor Power', () => {
          const labels = Array.from(root.querySelectorAll(`label[for="motorPower_${BASELINE_ID}"]`)).map((l: Element) => l.textContent.trim());
          expect(labels).toEqual(['Motor Current']);
        });

        it('shows the A unit and not the kW unit', () => {
          const units = Array.from(group(`motorPower_${BASELINE_ID}`).querySelectorAll('.input-group .units')).map((u: Element) => u.textContent.trim());
          expect(units).toEqual(['A']);
        });
      });

      describe('when estimating by neither method', () => {
        it('shows no label and no unit', () => {
          createComponent({ baseline: true, fieldData: makeFieldData({ loadEstimatedMethod: 2 }) });
          expect(root.querySelector(`label[for="motorPower_${BASELINE_ID}"]`)).toBeNull();
          expect(group(`motorPower_${BASELINE_ID}`)).toBeNull();
          expect(root.querySelector('[formControlName="motorPower"]').closest('.form-group').querySelector('.units')).toBeNull();
        });
      });

      describe('motor power messages', () => {
        const motorGroup = () => root.querySelector('[formControlName="motorPower"]').closest('.form-group') as HTMLElement;

        beforeEach(() => createComponent({ baseline: true }));

        it('hides the error and warning when valid with no warning', () => {
          expect(motorGroup().querySelector('.alert-danger')).toBeNull();
          expect(motorGroup().querySelector('.alert-warning')).toBeNull();
        });

        it('hides the error when invalid but pristine', () => {
          component.fieldDataForm.controls.motorPower.setValue(null);
          component.fieldDataForm.controls.motorPower.markAsPristine();
          fixture.detectChanges();
          expect(motorGroup().querySelector('.alert-danger')).toBeNull();
        });

        it('shows the required error when empty and dirty', () => {
          makeInvalidDirty('motorPower', null);
          expect(motorGroup().querySelector('.alert-danger').textContent).toContain('Value Required');
          expect(motorGroup().classList).toContain('invalid');
        });

        it('shows the rated power warning when valid and dirty', () => {
          setWarnings({ ratedPowerError: 'Rated power warning' });
          expect(motorGroup().querySelector('.alert-warning').textContent.trim()).toBe('Rated power warning');
          expect(motorGroup().classList).toContain('error');
        });

        it('hides the rated power warning when the field is pristine', () => {
          component.fieldDataForm.controls.motorPower.markAsPristine();
          setWarnings({ ratedPowerError: 'Rated power warning' });
          expect(motorGroup().querySelector('.alert-warning')).toBeNull();
        });

        it('hides the rated power warning when the field is invalid', () => {
          component.fieldDataForm.controls.motorPower.setValue(null);
          component.fieldDataForm.controls.motorPower.markAsDirty();
          setWarnings({ ratedPowerError: 'Rated power warning' });
          expect(motorGroup().querySelector('.alert-warning')).toBeNull();
        });
      });
    });

    describe('measured voltage', () => {
      beforeEach(() => createComponent({ baseline: true }));

      it('hides the error and warnings when valid with no warnings', () => {
        const voltageGroup = group(`measuredVoltage_${BASELINE_ID}`);
        expect(voltageGroup.querySelector('.alert-danger')).toBeNull();
        expect(voltageGroup.querySelector('.alert-warning')).toBeNull();
      });

      it('hides the error when invalid but pristine', () => {
        component.fieldDataForm.controls.measuredVoltage.setValue(null);
        component.fieldDataForm.controls.measuredVoltage.markAsPristine();
        fixture.detectChanges();
        expect(group(`measuredVoltage_${BASELINE_ID}`).querySelector('.alert-danger')).toBeNull();
      });

      it('shows the required error when empty and dirty', () => {
        makeInvalidDirty('measuredVoltage', null);
        expect(group(`measuredVoltage_${BASELINE_ID}`).querySelector('.alert-danger').textContent).toContain('Value Required');
      });

      it('shows the voltage warning when valid and dirty', () => {
        setWarnings({ voltageError: 'Voltage warning' });
        const voltageGroup = group(`measuredVoltage_${BASELINE_ID}`);
        expect(voltageGroup.querySelector('.alert-warning').textContent.trim()).toBe('Voltage warning');
        expect(voltageGroup.classList).toContain('error');
      });

      it('hides the voltage warning when the field is pristine', () => {
        component.fieldDataForm.controls.measuredVoltage.markAsPristine();
        setWarnings({ voltageError: 'Voltage warning' });
        expect(group(`measuredVoltage_${BASELINE_ID}`).querySelector('.alert-warning')).toBeNull();
      });

      it('hides the voltage warning when the field is invalid', () => {
        component.fieldDataForm.controls.measuredVoltage.setValue(null);
        component.fieldDataForm.controls.measuredVoltage.markAsDirty();
        setWarnings({ voltageError: 'Voltage warning' });
        expect(group(`measuredVoltage_${BASELINE_ID}`).querySelector('.alert-warning')).toBeNull();
      });

      it('hides the suggested voltage for the baseline', () => {
        setWarnings({ suggestedVoltage: 'Try 480 V' });
        expect(group(`measuredVoltage_${BASELINE_ID}`).querySelector('.alert-warning')).toBeNull();
      });
    });

    describe('suggested voltage for a modification', () => {
      beforeEach(() => createComponent({ baseline: false }));

      it('shows the suggested voltage when it exists and the field is dirty', () => {
        setWarnings({ suggestedVoltage: 'Try 480 V' });
        expect(group(`measuredVoltage_${MOD_ID}`).querySelector('.alert-warning').textContent.trim()).toBe('Try 480 V');
      });

      it('hides the suggested voltage when none exists', () => {
        setWarnings({ suggestedVoltage: null });
        expect(group(`measuredVoltage_${MOD_ID}`).querySelector('.alert-warning')).toBeNull();
      });

      it('hides the suggested voltage when the field is pristine', () => {
        component.fieldDataForm.controls.measuredVoltage.markAsPristine();
        setWarnings({ suggestedVoltage: 'Try 480 V' });
        expect(group(`measuredVoltage_${MOD_ID}`).querySelector('.alert-warning')).toBeNull();
      });
    });

    describe('compressibility factor', () => {
      describe('when user defined', () => {
        beforeEach(() => createComponent({ fieldData: makeFieldData({ userDefinedCompressibilityFactor: true, compressibilityFactor: 0.99 }) }));

        it('shows the Calculate link and not the Define link', () => {
          expect(linkTexts(group(`compressibilityFactor_${idString()}`))).toEqual(['Calculate Compressibility Factor']);
        });

        it('shows the input and hides the calculated value', () => {
          const factorGroup = group(`compressibilityFactor_${idString()}`);
          expect(factorGroup.querySelector('[formControlName="compressibilityFactor"]')).not.toBeNull();
          expect(factorGroup.querySelector('.bold')).toBeNull();
        });

        it('hides the error when the value is valid', () => {
          expect(group(`compressibilityFactor_${idString()}`).querySelector('.alert-danger')).toBeNull();
        });

        it('hides the error when invalid but pristine', () => {
          component.fieldDataForm.controls.compressibilityFactor.setValue(null);
          component.fieldDataForm.controls.compressibilityFactor.markAsPristine();
          fixture.detectChanges();
          expect(group(`compressibilityFactor_${idString()}`).querySelector('.alert-danger')).toBeNull();
        });

        it('shows only the required message when empty and dirty', () => {
          makeInvalidDirty('compressibilityFactor', null);
          const error = group(`compressibilityFactor_${idString()}`).querySelector('.alert-danger');
          expect(error.querySelectorAll('span').length).toBe(1);
          expect(error.textContent).toContain('Value Required');
        });

        it('shows only the min message when negative and dirty', () => {
          makeInvalidDirty('compressibilityFactor', -1);
          const error = group(`compressibilityFactor_${idString()}`).querySelector('.alert-danger');
          expect(error.querySelectorAll('span').length).toBe(1);
          expect(error.textContent).toContain("Value can't be less than");
        });
      });

      describe('when calculated', () => {
        beforeEach(() => createComponent({ fieldData: makeFieldData({ userDefinedCompressibilityFactor: false }) }));

        it('shows the Define link and not the Calculate link', () => {
          expect(linkTexts(group(`compressibilityFactor_${idString()}`))).toEqual(['Define Compressibility Factor']);
        });

        it('hides the input and shows the calculated value', () => {
          const factorGroup = group(`compressibilityFactor_${idString()}`);
          expect(factorGroup.querySelector('[formControlName="compressibilityFactor"]')).toBeNull();
          expect(factorGroup.querySelector('.bold').textContent.trim()).toBe('0.985');
        });

        it('shows dashes instead of a value when the factor is empty', () => {
          component.fieldDataForm.controls.compressibilityFactor.setValue(null);
          fixture.detectChanges();
          expect(group(`compressibilityFactor_${idString()}`).querySelector('.bold').textContent.trim()).toBe(DASHES);
        });
      });
    });

    describe('difference indicators', () => {
      beforeEach(() => {
        compareServiceSpy.baselineFSAT = makeFsat(makeFieldData());
        compareServiceSpy.modifiedFSAT = makeFsat(makeFieldData());
      });

      it('shows no indicators when nothing differs', () => {
        createComponent({ fieldData: makeFieldData({ usingStaticPressure: true, userDefinedVelocityPressure: false }) });
        expect(root.querySelector('.indicate-different')).toBeNull();
      });

      it('shows no indicators while in setup even when values differ', () => {
        compareServiceSpy.isFlowRateDifferent.and.returnValue(true);
        compareServiceSpy.isInletPressureDifferent.and.returnValue(true);
        createComponent({ inSetup: true });
        expect(root.querySelector('.indicate-different')).toBeNull();
      });

      it('marks the flow rate group when it differs', () => {
        compareServiceSpy.isFlowRateDifferent.and.returnValue(true);
        createComponent();
        expect(group(`flowRate_${idString()}`).classList).toContain('indicate-different');
      });

      it('marks the inlet pressure group when it differs', () => {
        compareServiceSpy.isInletPressureDifferent.and.returnValue(true);
        createComponent();
        expect(group(`inletPressure_${idString()}`).classList).toContain('indicate-different');
      });

      it('marks the outlet pressure group when it differs', () => {
        compareServiceSpy.isOutletPressureDifferent.and.returnValue(true);
        createComponent();
        expect(group(`outletPressure_${idString()}`).classList).toContain('indicate-different');
      });

      it('marks the measured voltage group when it differs', () => {
        compareServiceSpy.isMeasuredVoltageDifferent.and.returnValue(true);
        createComponent();
        expect(group(`measuredVoltage_${idString()}`).classList).toContain('indicate-different');
      });

      it('marks the compressibility factor group when it differs', () => {
        compareServiceSpy.isCompressibilityFactorDifferent.and.returnValue(true);
        createComponent();
        expect(group(`compressibilityFactor_${idString()}`).classList).toContain('indicate-different');
      });

      it('marks the duct area group when it differs', () => {
        compareServiceSpy.isDuctAreaDifferent.and.returnValue(true);
        createComponent({ fieldData: makeFieldData({ usingStaticPressure: true, userDefinedVelocityPressure: false }) });
        expect(group(`duct${idString()}`).classList).toContain('indicate-different');
      });

      it('marks the inlet velocity pressure group when it differs', () => {
        compareServiceSpy.isInletVelocityPressureDifferent.and.returnValue(true);
        createComponent({ fieldData: makeFieldData({ usingStaticPressure: true }) });
        expect(group(`inletVelocityPressure_${idString()}`).classList).toContain('indicate-different');
      });
    });

    describe('pressure modal body', () => {
      beforeEach(() => createComponent());

      it('renders no calculator while no calculation type is selected', () => {
        component.bodyHeight = 500;
        fixture.detectChanges();
        expect(root.querySelector('app-calculate-inlet-pressure')).toBeNull();
        expect(root.querySelector('app-calculate-outlet-pressure')).toBeNull();
        expect(root.querySelector('app-calculate-flow-pressure')).toBeNull();
      });

      it('renders no calculator when a type is selected but the body height is zero', () => {
        component.pressureCalcType = 'inlet';
        component.bodyHeight = 0;
        fixture.detectChanges();
        expect(root.querySelector('app-calculate-inlet-pressure')).toBeNull();
      });

      it('renders only the inlet pressure calculator for the inlet type', () => {
        component.pressureCalcType = 'inlet';
        component.bodyHeight = 500;
        fixture.detectChanges();
        expect(root.querySelectorAll('app-calculate-inlet-pressure').length).toBe(1);
        expect(root.querySelector('app-calculate-outlet-pressure')).toBeNull();
        expect(root.querySelector('app-calculate-flow-pressure')).toBeNull();
      });

      it('renders only the outlet pressure calculator for the outlet type', () => {
        component.pressureCalcType = 'outlet';
        component.bodyHeight = 500;
        fixture.detectChanges();
        expect(root.querySelectorAll('app-calculate-outlet-pressure').length).toBe(1);
        expect(root.querySelector('app-calculate-inlet-pressure')).toBeNull();
        expect(root.querySelector('app-calculate-flow-pressure')).toBeNull();
      });

      it('renders only the flow and pressure calculator for the flow type', () => {
        component.pressureCalcType = 'flow';
        component.bodyHeight = 500;
        fixture.detectChanges();
        expect(root.querySelectorAll('app-calculate-flow-pressure').length).toBe(1);
        expect(root.querySelector('app-calculate-inlet-pressure')).toBeNull();
        expect(root.querySelector('app-calculate-outlet-pressure')).toBeNull();
      });

      it('removes the calculator once the modal is hidden', () => {
        component.pressureCalcType = 'inlet';
        component.bodyHeight = 500;
        fixture.detectChanges();
        component.hidePressureModal();
        fixture.detectChanges();
        expect(root.querySelector('app-calculate-inlet-pressure')).toBeNull();
      });
    });
  });

  describe('pressure modal observer', () => {
    it('measures the modal body height when the modal is shown', () => {
      createComponent();
      spyOn(component, 'getBodyHeight');
      modalStub().onShown.next();
      expect(component.getBodyHeight).toHaveBeenCalled();
    });

    it('measures the modal body height on window resize', () => {
      createComponent();
      spyOn(component, 'getBodyHeight');
      window.dispatchEvent(new Event('resize'));
      expect(component.getBodyHeight).toHaveBeenCalled();
    });
  });

  describe('getBodyHeight', () => {
    beforeEach(() => createComponent());

    it('sets the body height from the modal body', () => {
      component.modalBody = { nativeElement: { clientHeight: 420 } };
      component.getBodyHeight();
      expect(component.bodyHeight).toBe(420);
    });

    it('sets the body height to zero without a modal body', () => {
      component.bodyHeight = 420;
      component.modalBody = undefined;
      component.getBodyHeight();
      expect(component.bodyHeight).toBe(0);
    });
  });

  describe('destroy', () => {
    it('stops measuring the modal body height after the component is destroyed', () => {
      createComponent();
      const stub = modalStub();
      spyOn(component, 'getBodyHeight');
      fixture.destroy();
      stub.onShown.next();
      expect(component.getBodyHeight).not.toHaveBeenCalled();
    });
  });

  describe('save', () => {
    beforeEach(() => createComponent());

    it('emits field data built from the form', () => {
      const emitted: FieldData[] = [];
      component.emitSave.subscribe((data: FieldData) => emitted.push(data));
      component.fieldDataForm.controls.flowRate.setValue(123456);
      component.save();
      expect(emitted.length).toBe(1);
      expect(emitted[0].flowRate).toBe(123456);
    });

    it('recomputes the compressibility factor when it is not user defined', () => {
      component.fieldDataForm.controls.userDefinedCompressibilityFactor.setValue(false);
      fanFieldDataServiceSpy.calculateCompressibilityFactor.calls.reset();
      component.save();
      expect(fanFieldDataServiceSpy.calculateCompressibilityFactor).toHaveBeenCalled();
    });

    it('does not recompute the compressibility factor when it is user defined', () => {
      fanFieldDataServiceSpy.calculateCompressibilityFactor.calls.reset();
      component.save();
      expect(fanFieldDataServiceSpy.calculateCompressibilityFactor).not.toHaveBeenCalled();
    });

    it('recomputes the inlet velocity pressure unless the modal velocity pressure is used', () => {
      component.fieldDataForm.controls.usingStaticPressure.setValue(true);
      component.fieldDataForm.controls.userDefinedVelocityPressure.setValue(false);
      fsatServiceSpy.calculateInletVelocityPressure.calls.reset();
      component.save(true);
      expect(fsatServiceSpy.calculateInletVelocityPressure).not.toHaveBeenCalled();
      component.save(false);
      expect(fsatServiceSpy.calculateInletVelocityPressure).toHaveBeenCalledTimes(1);
    });

    it('does not calculate the inlet velocity pressure when the flow rate is invalid', () => {
      component.fieldDataForm.controls.usingStaticPressure.setValue(true);
      component.fieldDataForm.controls.userDefinedVelocityPressure.setValue(false);
      component.fieldDataForm.controls.flowRate.setValue(null);
      fsatServiceSpy.calculateInletVelocityPressure.calls.reset();
      component.save();
      expect(fsatServiceSpy.calculateInletVelocityPressure).not.toHaveBeenCalled();
    });

    it('uses the fsat warnings for the current mode', () => {
      component.baseline = false;
      component.save();
      expect(warningServiceSpy.checkFieldDataWarnings).toHaveBeenCalledWith(component.fsat, component.settings, true);
    });
  });

  describe('toggles', () => {
    beforeEach(() => createComponent());

    it('setPressureType updates the form and emits the saved field data', () => {
      const emitted: FieldData[] = [];
      component.emitSave.subscribe((data: FieldData) => emitted.push(data));
      component.setPressureType(true);
      expect(component.fieldDataForm.controls.usingStaticPressure.value).toBeTrue();
      expect(emitted[0].usingStaticPressure).toBeTrue();
    });

    it('toggleUserDefinedCompressibilityFactor flips the flag and emits', () => {
      const emitted: FieldData[] = [];
      component.emitSave.subscribe((data: FieldData) => emitted.push(data));
      component.toggleUserDefinedCompressibilityFactor();
      expect(component.fieldDataForm.controls.userDefinedCompressibilityFactor.value).toBeFalse();
      expect(emitted[0].userDefinedCompressibilityFactor).toBeFalse();
      component.toggleUserDefinedCompressibilityFactor();
      expect(component.fieldDataForm.controls.userDefinedCompressibilityFactor.value).toBeTrue();
    });

    it('toggleUserDefinedVelocityPressure flips the flag and emits', () => {
      const emitted: FieldData[] = [];
      component.emitSave.subscribe((data: FieldData) => emitted.push(data));
      component.toggleUserDefinedVelocityPressure();
      expect(component.fieldDataForm.controls.userDefinedVelocityPressure.value).toBeFalse();
      expect(emitted[0].userDefinedVelocityPressure).toBeFalse();
    });

    it('swaps the compressibility factor link and field after toggling', () => {
      component.toggleUserDefinedCompressibilityFactor();
      fixture.detectChanges();
      expect(linkTexts(group(`compressibilityFactor_${idString()}`))).toEqual(['Define Compressibility Factor']);
      expect(root.querySelector('[formControlName="compressibilityFactor"]')).toBeNull();
    });
  });

  describe('focusField', () => {
    it('publishes the field name to the help panel', () => {
      createComponent({ baseline: true });
      component.focusField('flowRate');
      expect(currentField.value).toBe('flowRate');
    });

    it('publishes the modification voltage field name for a modification', () => {
      createComponent({ baseline: false });
      component.focusField('measuredVoltage');
      expect(currentField.value).toBe('modMeasuredVoltage');
    });

    it('publishes the plain voltage field name for the baseline', () => {
      createComponent({ baseline: true });
      component.focusField('measuredVoltage');
      expect(currentField.value).toBe('measuredVoltage');
    });
  });

  describe('modal actions', () => {
    const INLET_DATA = { calculatedInletPressure: -3.2 } as InletPressureData;
    const OUTLET_DATA = { calculatedOutletPressure: 7.1 } as OutletPressureData;

    beforeEach(() => {
      createComponent();
      component.fieldData.inletPressureData = INLET_DATA;
      component.fieldData.outletPressureData = OUTLET_DATA;
    });

    it('showInletPressureModal copies the inlet data, opens the modal, and sets the type', () => {
      component.showInletPressureModal();
      expect(component.pressureCalcType).toBe('inlet');
      expect(component.inletPressureCopy).toEqual(INLET_DATA);
      expect(component.inletPressureCopy).not.toBe(INLET_DATA);
      expect(modalOpen.value).toBeTrue();
      expect(modalStub().show).toHaveBeenCalled();
      expect(component.inletVelocityPressureInputs).toEqual({ ductArea: 20, gasDensity: 0.07, flowRate: 100000 });
    });

    it('showOutletPressureModal copies the outlet data, opens the modal, and sets the type', () => {
      component.showOutletPressureModal();
      expect(component.pressureCalcType).toBe('outlet');
      expect(component.outletPressureCopy).toEqual(OUTLET_DATA);
      expect(component.outletPressureCopy).not.toBe(OUTLET_DATA);
      expect(modalOpen.value).toBeTrue();
      expect(modalStub().show).toHaveBeenCalled();
    });

    it('showAmcaModal copies the fsat, preferring the modal field data, opens the modal, and sets the type', () => {
      const modalFieldData = makeFieldData({ flowRate: 555 });
      component.fsat.modalFieldData = modalFieldData;
      component.showAmcaModal();
      expect(component.pressureCalcType).toBe('flow');
      expect(component.modalFsatCopy.fieldData).toEqual(modalFieldData);
      expect(modalOpen.value).toBeTrue();
      expect(modalStub().show).toHaveBeenCalled();
    });

    it('showAmcaModal keeps the fsat field data when there is no modal field data', () => {
      component.showAmcaModal();
      expect(component.modalFsatCopy.fieldData.flowRate).toBe(100000);
    });

    it('hidePressureModal clears the type, closes the modal, and hides it', () => {
      component.pressureCalcType = 'inlet';
      modalOpen.next(true);
      component.hidePressureModal();
      expect(component.pressureCalcType).toBeUndefined();
      expect(modalOpen.value).toBeFalse();
      expect(modalStub().hide).toHaveBeenCalled();
    });

    it('resetModalData discards modal field data, enables apply, and hides the modal', () => {
      component.fsat.modalFieldData = makeFieldData();
      component.resetModalData();
      expect(component.fsat.modalFieldData).toBeUndefined();
      expect(component.disableApplyData).toBeFalse();
      expect(modalStub().hide).toHaveBeenCalled();
    });

    it('setCalcInvalid stores the validity flag as the apply-disabled state', () => {
      component.setCalcInvalid(false);
      expect(component.disableApplyData).toBeFalse();
      component.setCalcInvalid(true);
      expect(component.disableApplyData).toBeTrue();
    });

    it('updateFsatWithModalData stores a copy of the modal field data', () => {
      const modalFieldData = makeFieldData({ flowRate: 777 });
      component.updateFsatWithModalData(modalFieldData);
      expect(component.fsat.modalFieldData).toEqual(modalFieldData);
      expect(component.fsat.modalFieldData).not.toBe(modalFieldData);
    });

    it('saveInletPressure patches the calculated inlet pressure and emits', () => {
      const emitted: FieldData[] = [];
      component.emitSave.subscribe((data: FieldData) => emitted.push(data));
      component.saveInletPressure({ calculatedInletPressure: -4.4 } as InletPressureData);
      expect(component.fieldDataForm.controls.inletPressure.value).toBe(-4.4);
      expect(emitted[0].inletPressure).toBe(-4.4);
    });

    it('saveOutletPressure patches the calculated outlet pressure and emits', () => {
      const emitted: FieldData[] = [];
      component.emitSave.subscribe((data: FieldData) => emitted.push(data));
      component.saveOutletPressure({ calculatedOutletPressure: 9.9 } as OutletPressureData);
      expect(component.fieldDataForm.controls.outletPressure.value).toBe(9.9);
      expect(emitted[0].outletPressure).toBe(9.9);
    });

    it('saveFlowAndPressure patches the flow and pressures from the modal data', () => {
      component.saveFlowAndPressure(makeFieldData({ flowRate: 321, inletPressure: -2, outletPressure: 8, usingStaticPressure: false }));
      expect(component.fieldDataForm.controls.flowRate.value).toBe(321);
      expect(component.fieldDataForm.controls.inletPressure.value).toBe(-2);
      expect(component.fieldDataForm.controls.outletPressure.value).toBe(8);
    });

    it('saveFlowAndPressure uses the modal velocity pressure and marks it user defined for static pressure', () => {
      component.fieldDataForm.controls.userDefinedVelocityPressure.setValue(false);
      component.saveFlowAndPressure(makeFieldData({ usingStaticPressure: true, inletVelocityPressure: 2.5 }));
      expect(component.fieldDataForm.controls.inletVelocityPressure.value).toBe(2.5);
      expect(component.fieldDataForm.controls.userDefinedVelocityPressure.value).toBeTrue();
    });

    it('applyModalData applies the flow data and clears the modal field data for the flow type', () => {
      component.pressureCalcType = 'flow';
      component.fsat.modalFieldData = makeFieldData({ flowRate: 888 });
      component.applyModalData();
      expect(component.fieldDataForm.controls.flowRate.value).toBe(888);
      expect(component.fsat.modalFieldData).toBeUndefined();
      expect(modalStub().hide).toHaveBeenCalled();
    });

    it('applyModalData applies the inlet copy for the inlet type', () => {
      component.pressureCalcType = 'inlet';
      component.inletPressureCopy = { calculatedInletPressure: -6 } as InletPressureData;
      component.applyModalData();
      expect(component.fieldDataForm.controls.inletPressure.value).toBe(-6);
      expect(modalStub().hide).toHaveBeenCalled();
    });

    it('applyModalData applies the outlet copy for the outlet type', () => {
      component.pressureCalcType = 'outlet';
      component.outletPressureCopy = { calculatedOutletPressure: 12 } as OutletPressureData;
      component.applyModalData();
      expect(component.fieldDataForm.controls.outletPressure.value).toBe(12);
      expect(modalStub().hide).toHaveBeenCalled();
    });

    it('applyModalData only hides the modal for an unknown type', () => {
      component.pressureCalcType = undefined;
      component.applyModalData();
      expect(component.fieldDataForm.controls.flowRate.value).toBe(100000);
      expect(modalStub().hide).toHaveBeenCalled();
    });
  });

  describe('difference helpers', () => {
    beforeEach(() => createComponent());

    it('canCompare is false without both fsats', () => {
      compareServiceSpy.baselineFSAT = makeFsat(makeFieldData());
      compareServiceSpy.modifiedFSAT = undefined;
      expect(component.canCompare()).toBeFalse();
      compareServiceSpy.baselineFSAT = undefined;
      compareServiceSpy.modifiedFSAT = makeFsat(makeFieldData());
      expect(component.canCompare()).toBeFalse();
    });

    it('canCompare is false while in setup', () => {
      compareServiceSpy.baselineFSAT = makeFsat(makeFieldData());
      compareServiceSpy.modifiedFSAT = makeFsat(makeFieldData());
      component.inSetup = true;
      expect(component.canCompare()).toBeFalse();
    });

    it('return false without calling the compare service when comparison is not possible', () => {
      compareServiceSpy.baselineFSAT = undefined;
      expect(component.isFlowRateDifferent()).toBeFalse();
      expect(component.isInletPressureDifferent()).toBeFalse();
      expect(component.isInletVelocityPressureDifferent()).toBeFalse();
      expect(component.isDuctAreaDifferent()).toBeFalse();
      expect(component.isOutletPressureDifferent()).toBeFalse();
      expect(component.isCompressibilityFactorDifferent()).toBeFalse();
      expect(component.isMeasuredVoltageDifferent()).toBeFalse();
      expect(compareServiceSpy.isFlowRateDifferent).not.toHaveBeenCalled();
    });

    it('delegate to the compare service when comparison is possible', () => {
      compareServiceSpy.baselineFSAT = makeFsat(makeFieldData());
      compareServiceSpy.modifiedFSAT = makeFsat(makeFieldData());
      compareServiceSpy.isFlowRateDifferent.and.returnValue(true);
      compareServiceSpy.isInletPressureDifferent.and.returnValue(true);
      compareServiceSpy.isInletVelocityPressureDifferent.and.returnValue(true);
      compareServiceSpy.isDuctAreaDifferent.and.returnValue(true);
      compareServiceSpy.isOutletPressureDifferent.and.returnValue(true);
      compareServiceSpy.isCompressibilityFactorDifferent.and.returnValue(true);
      compareServiceSpy.isMeasuredVoltageDifferent.and.returnValue(true);
      expect(component.isFlowRateDifferent()).toBeTrue();
      expect(component.isInletPressureDifferent()).toBeTrue();
      expect(component.isInletVelocityPressureDifferent()).toBeTrue();
      expect(component.isDuctAreaDifferent()).toBeTrue();
      expect(component.isOutletPressureDifferent()).toBeTrue();
      expect(component.isCompressibilityFactorDifferent()).toBeTrue();
      expect(component.isMeasuredVoltageDifferent()).toBeTrue();
    });
  });
});
