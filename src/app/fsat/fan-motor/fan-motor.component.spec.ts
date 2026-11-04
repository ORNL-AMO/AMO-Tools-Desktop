import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { FanMotorComponent } from './fan-motor.component';
import { FanMotorService } from './fan-motor.service';
import { PsatService } from '../../psat/psat.service';
import { CompareService } from '../compare.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { FanMotorWarnings, FsatWarningService } from '../fsat-warning.service';
import { motorEfficiencyConstants } from '../../psat/psatConstants';
import { FanMotor, FSAT } from '../../shared/models/fans';
import { Settings } from '../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', fanPowerMeasurement: 'hp' } as Settings;
const BASELINE_ID = 'fsat_baseline';
const MOD_ID = 'fsat_modification_0';
const SPECIFIED_CLASS = 3;
const NO_WARNINGS: FanMotorWarnings = {
  rpmError: null,
  voltageError: null,
  flaError: null,
  efficiencyError: null,
  ratedPowerError: null,
};

function makeFanMotor(overrides: Partial<FanMotor> = {}): FanMotor {
  return {
    lineFrequency: 60,
    motorRatedPower: 200,
    motorRpm: 1780,
    efficiencyClass: 1,
    specifiedEfficiency: 95,
    motorRatedVoltage: 460,
    fullLoadAmps: 225,
    ...overrides,
  };
}

function makeFsat(fanMotor: FanMotor): FSAT {
  return { fanMotor } as FSAT;
}

describe('FanMotorComponent', () => {
  let component: FanMotorComponent;
  let fixture: ComponentFixture<FanMotorComponent>;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let warningServiceSpy: jasmine.SpyObj<FsatWarningService>;
  let compareServiceSpy: jasmine.SpyObj<CompareService>;
  let currentField: BehaviorSubject<string>;
  let root: HTMLElement;

  interface InputOverrides {
    fanMotor?: FanMotor;
    baseline?: boolean;
    selected?: boolean;
    inSetup?: boolean;
  }

  function createComponent(overrides: InputOverrides = {}): void {
    fixture = TestBed.createComponent(FanMotorComponent);
    component = fixture.componentInstance;
    component.fanMotor = overrides.fanMotor ?? makeFanMotor();
    component.fsat = makeFsat(component.fanMotor);
    component.settings = MOCK_SETTINGS;
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

  function setWarnings(warnings: Partial<FanMotorWarnings>): void {
    warningServiceSpy.checkMotorWarnings.and.returnValue({ ...NO_WARNINGS, ...warnings });
    component.checkWarnings();
    fixture.detectChanges();
  }

  function makeInvalidDirty(controlName: string, value: number | null): void {
    component.fanMotorForm.controls[controlName].setValue(value);
    component.fanMotorForm.controls[controlName].markAsDirty();
    fixture.detectChanges();
  }

  function makePristine(controlName: string): void {
    component.fanMotorForm.controls[controlName].markAsPristine();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    psatServiceSpy = jasmine.createSpyObj('PsatService', ['estFLA']);
    psatServiceSpy.estFLA.and.returnValue(231.5);
    warningServiceSpy = jasmine.createSpyObj('FsatWarningService', ['checkMotorWarnings']);
    warningServiceSpy.checkMotorWarnings.and.returnValue({ ...NO_WARNINGS });
    compareServiceSpy = jasmine.createSpyObj('CompareService', [
      'isLineFrequencyDifferent', 'isMotorRatedPowerDifferent', 'isMotorRpmDifferent', 'isEfficiencyClassDifferent',
      'isSpecifiedEfficiencyDifferent', 'isMotorRatedVoltageDifferent', 'isMotorFullLoadAmpsDifferent'
    ]);
    currentField = new BehaviorSubject<string>('default');

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FanMotorComponent],
      providers: [
        FanMotorService,
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: FsatWarningService, useValue: warningServiceSpy },
        { provide: CompareService, useValue: compareServiceSpy },
        { provide: HelpPanelService, useValue: jasmine.createSpyObj('HelpPanelService', [], { currentField }) },
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
      expect(root.querySelector(`#motorRpm_${BASELINE_ID}`)).not.toBeNull();
    });

    it('uses the modification id string with the modification index otherwise', () => {
      createComponent({ baseline: false });
      expect(component.idString).toBe(MOD_ID);
      expect(root.querySelector(`#motorRpm_${MOD_ID}`)).not.toBeNull();
    });

    it('builds the form from the fan motor', () => {
      createComponent();
      expect(component.fanMotorForm.controls.motorRatedPower.value).toBe(200);
      expect(component.fanMotorForm.controls.motorRatedVoltage.value).toBe(460);
    });

    it('assigns the efficiency classes', () => {
      createComponent();
      expect(component.efficiencyClasses).toBe(motorEfficiencyConstants);
    });

    it('checks motor warnings for the baseline', () => {
      createComponent({ baseline: true });
      expect(warningServiceSpy.checkMotorWarnings).toHaveBeenCalledWith(component.fsat, MOCK_SETTINGS, false);
    });

    it('checks motor warnings for a modification', () => {
      createComponent({ baseline: false });
      expect(warningServiceSpy.checkMotorWarnings).toHaveBeenCalledWith(component.fsat, MOCK_SETTINGS, true);
    });

    it('disables line frequency and efficiency class when not selected', () => {
      createComponent({ selected: false });
      expect(component.fanMotorForm.controls.lineFrequency.disabled).toBeTrue();
      expect(component.fanMotorForm.controls.efficiencyClass.disabled).toBeTrue();
      expect(component.fanMotorForm.controls.motorRatedPower.enabled).toBeTrue();
    });

    it('keeps the form enabled when selected', () => {
      createComponent({ selected: true });
      expect(component.fanMotorForm.enabled).toBeTrue();
    });
  });

  describe('ngOnChanges', () => {
    it('enables line frequency and efficiency class when selected changes to true', () => {
      createComponent({ selected: false });
      component.selected = true;
      component.ngOnChanges({ selected: { currentValue: true, previousValue: false, firstChange: false, isFirstChange: () => false } });
      expect(component.fanMotorForm.controls.lineFrequency.enabled).toBeTrue();
      expect(component.fanMotorForm.controls.efficiencyClass.enabled).toBeTrue();
    });

    it('disables line frequency and efficiency class when selected changes to false', () => {
      createComponent({ selected: true });
      component.selected = false;
      component.ngOnChanges({ selected: { currentValue: false, previousValue: true, firstChange: false, isFirstChange: () => false } });
      expect(component.fanMotorForm.controls.lineFrequency.disabled).toBeTrue();
      expect(component.fanMotorForm.controls.efficiencyClass.disabled).toBeTrue();
    });

    it('rebuilds the form when the modification index changes', () => {
      createComponent();
      const previousForm = component.fanMotorForm;
      component.ngOnChanges({ modificationIndex: { currentValue: 1, previousValue: 0, firstChange: false, isFirstChange: () => false } });
      expect(component.fanMotorForm).not.toBe(previousForm);
    });
  });

  describe('template visibility', () => {
    describe('setup header', () => {
      it('hides the header when not in setup', () => {
        createComponent({ inSetup: false });
        expect(root.querySelector('.header')).toBeNull();
      });

      it('shows the Motor header when in setup', () => {
        createComponent({ inSetup: true });
        expect(root.querySelector('.header h3').textContent.trim()).toBe('Motor');
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

    describe('dropdown options', () => {
      beforeEach(() => createComponent());

      it('renders one line frequency option per frequency', () => {
        const options = Array.from(root.querySelectorAll('[formControlName="lineFrequency"] option')).map((o: Element) => o.textContent.trim());
        expect(options).toEqual(['50 Hz', '60 Hz']);
      });

      it('renders no line frequency options when there are no frequencies', () => {
        component.frequencies = [];
        fixture.detectChanges();
        expect(root.querySelector('[formControlName="lineFrequency"]')).not.toBeNull();
        expect(root.querySelectorAll('[formControlName="lineFrequency"] option').length).toBe(0);
      });

      it('renders one efficiency class option per class', () => {
        const options = Array.from(root.querySelectorAll('[formControlName="efficiencyClass"] option')).map((o: Element) => o.textContent.trim());
        expect(options).toEqual(motorEfficiencyConstants.map(efficiencyClass => efficiencyClass.display));
      });

      it('renders no efficiency class options when there are no classes', () => {
        component.efficiencyClasses = [];
        fixture.detectChanges();
        expect(root.querySelector('[formControlName="efficiencyClass"]')).not.toBeNull();
        expect(root.querySelectorAll('[formControlName="efficiencyClass"] option').length).toBe(0);
      });
    });

    describe('rated motor power', () => {
      beforeEach(() => createComponent());

      it('hides the error and warning when valid with no warning', () => {
        const powerGroup = group(`motorRatedPower_${idString()}`);
        expect(powerGroup.querySelector('.alert-danger')).toBeNull();
        expect(powerGroup.querySelector('.alert-warning')).toBeNull();
      });

      it('hides the error when invalid but pristine', () => {
        component.fanMotorForm.controls.motorRatedPower.setValue(null);
        makePristine('motorRatedPower');
        expect(group(`motorRatedPower_${idString()}`).querySelector('.alert-danger')).toBeNull();
      });

      it('shows the required error when empty and dirty', () => {
        makeInvalidDirty('motorRatedPower', null);
        const powerGroup = group(`motorRatedPower_${idString()}`);
        expect(powerGroup.querySelector('.alert-danger').textContent).toContain('Value');
        expect(powerGroup.querySelector('.alert-danger').textContent).toContain('Required');
        expect(powerGroup.classList).toContain('invalid');
      });

      it('shows the rated power warning when one exists and the field is dirty', () => {
        setWarnings({ ratedPowerError: 'Rated power warning' });
        const powerGroup = group(`motorRatedPower_${idString()}`);
        expect(powerGroup.querySelector('.alert-warning').textContent.trim()).toBe('Rated power warning');
        expect(powerGroup.classList).toContain('error');
      });

      it('hides the rated power warning when the field is pristine', () => {
        makePristine('motorRatedPower');
        setWarnings({ ratedPowerError: 'Rated power warning' });
        expect(group(`motorRatedPower_${idString()}`).querySelector('.alert-warning')).toBeNull();
      });
    });

    describe('motor rpm', () => {
      beforeEach(() => createComponent());

      it('hides the error and warning when valid with no warning', () => {
        const rpmGroup = group(`motorRpm_${idString()}`);
        expect(rpmGroup.querySelector('.alert-danger')).toBeNull();
        expect(rpmGroup.querySelector('.alert-warning')).toBeNull();
      });

      it('hides the error when invalid but pristine', () => {
        component.fanMotorForm.controls.motorRpm.setValue(null);
        makePristine('motorRpm');
        expect(group(`motorRpm_${idString()}`).querySelector('.alert-danger')).toBeNull();
      });

      it('shows the required error when empty and dirty', () => {
        makeInvalidDirty('motorRpm', null);
        expect(group(`motorRpm_${idString()}`).querySelector('.alert-danger').textContent).toContain('Required');
        expect(group(`motorRpm_${idString()}`).classList).toContain('invalid');
      });

      it('shows the rpm warning when valid and dirty', () => {
        setWarnings({ rpmError: 'Rpm warning' });
        const rpmGroup = group(`motorRpm_${idString()}`);
        expect(rpmGroup.querySelector('.alert-warning').textContent.trim()).toBe('Rpm warning');
        expect(rpmGroup.classList).toContain('error');
      });

      it('hides the rpm warning when the field is pristine', () => {
        makePristine('motorRpm');
        setWarnings({ rpmError: 'Rpm warning' });
        expect(group(`motorRpm_${idString()}`).querySelector('.alert-warning')).toBeNull();
      });

      it('hides the rpm warning when the field is invalid', () => {
        component.fanMotorForm.controls.motorRpm.setValue(null);
        component.fanMotorForm.controls.motorRpm.markAsDirty();
        setWarnings({ rpmError: 'Rpm warning' });
        expect(group(`motorRpm_${idString()}`).querySelector('.alert-warning')).toBeNull();
      });
    });

    describe('specified efficiency', () => {
      it('hides the specified efficiency group when the efficiency class is not specified', () => {
        createComponent({ fanMotor: makeFanMotor({ efficiencyClass: 1 }) });
        expect(root.querySelector('[formControlName="specifiedEfficiency"]')).toBeNull();
        expect(group(`specifiedEfficiency_${idString()}`)).toBeNull();
      });

      it('shows the specified efficiency group when the efficiency class is specified', () => {
        createComponent({ fanMotor: makeFanMotor({ efficiencyClass: SPECIFIED_CLASS }) });
        expect(root.querySelector('[formControlName="specifiedEfficiency"]')).not.toBeNull();
        expect(group(`specifiedEfficiency_${idString()}`)).not.toBeNull();
      });

      it('shows the group when the efficiency class changes to specified', () => {
        createComponent({ fanMotor: makeFanMotor({ efficiencyClass: 1 }) });
        component.fanMotorForm.controls.efficiencyClass.setValue(SPECIFIED_CLASS);
        fixture.detectChanges();
        expect(root.querySelector('[formControlName="specifiedEfficiency"]')).not.toBeNull();
      });

      it('hides the group when the efficiency class changes away from specified', () => {
        createComponent({ fanMotor: makeFanMotor({ efficiencyClass: SPECIFIED_CLASS }) });
        component.fanMotorForm.controls.efficiencyClass.setValue(0);
        fixture.detectChanges();
        expect(root.querySelector('[formControlName="specifiedEfficiency"]')).toBeNull();
      });

      describe('errors', () => {
        const efficiencyGroup = () => group(`specifiedEfficiency_${idString()}`);

        beforeEach(() => createComponent({ fanMotor: makeFanMotor({ efficiencyClass: SPECIFIED_CLASS, specifiedEfficiency: 95 }) }));

        it('hides the error when valid', () => {
          expect(efficiencyGroup().querySelector('.alert-danger')).toBeNull();
        });

        it('hides the error when invalid but pristine', () => {
          component.fanMotorForm.controls.specifiedEfficiency.setValue(null);
          makePristine('specifiedEfficiency');
          expect(efficiencyGroup().querySelector('.alert-danger')).toBeNull();
        });

        it('shows only the required message when empty and dirty', () => {
          makeInvalidDirty('specifiedEfficiency', null);
          const error = efficiencyGroup().querySelector('.alert-danger');
          expect(error.querySelectorAll('span').length).toBe(1);
          expect(error.textContent).toContain('Value Required');
          expect(efficiencyGroup().classList).toContain('invalid');
        });

        it('shows only the max message when above 100', () => {
          makeInvalidDirty('specifiedEfficiency', 150);
          const error = efficiencyGroup().querySelector('.alert-danger');
          expect(error.querySelectorAll('span').length).toBe(1);
          expect(error.textContent).toContain("Value can't be greater than");
          expect(error.textContent).toContain('100 %');
        });

        it('shows only the min message when below 0', () => {
          makeInvalidDirty('specifiedEfficiency', -5);
          const error = efficiencyGroup().querySelector('.alert-danger');
          expect(error.querySelectorAll('span').length).toBe(1);
          expect(error.textContent).toContain("Value can't be less than");
          expect(error.textContent).toContain('0 %');
        });
      });
    });

    describe('rated voltage', () => {
      beforeEach(() => createComponent());

      it('hides the error and warning when valid with no warning', () => {
        const voltageGroup = group(`motorRatedVoltage_${idString()}`);
        expect(voltageGroup.querySelector('.alert-danger')).toBeNull();
        expect(voltageGroup.querySelector('.alert-warning')).toBeNull();
      });

      it('hides the error when invalid but pristine', () => {
        component.fanMotorForm.controls.motorRatedVoltage.setValue(null);
        makePristine('motorRatedVoltage');
        expect(group(`motorRatedVoltage_${idString()}`).querySelector('.alert-danger')).toBeNull();
      });

      it('shows the required error when empty and dirty', () => {
        makeInvalidDirty('motorRatedVoltage', null);
        expect(group(`motorRatedVoltage_${idString()}`).querySelector('.alert-danger').textContent).toContain('Required');
        expect(group(`motorRatedVoltage_${idString()}`).classList).toContain('invalid');
      });

      it('shows the voltage warning when one exists and the field is dirty', () => {
        setWarnings({ voltageError: 'Voltage warning' });
        const voltageGroup = group(`motorRatedVoltage_${idString()}`);
        expect(voltageGroup.querySelector('.alert-warning').textContent.trim()).toBe('Voltage warning');
        expect(voltageGroup.classList).toContain('error');
      });

      it('hides the voltage warning when the field is pristine', () => {
        makePristine('motorRatedVoltage');
        setWarnings({ voltageError: 'Voltage warning' });
        expect(group(`motorRatedVoltage_${idString()}`).querySelector('.alert-warning')).toBeNull();
      });
    });

    describe('full load amps', () => {
      beforeEach(() => createComponent());

      it('hides the error and warning when valid with no warning', () => {
        const flaGroup = group(`fullLoadAmps_${idString()}`);
        expect(flaGroup.querySelector('.alert-danger')).toBeNull();
        expect(flaGroup.querySelector('.alert-warning')).toBeNull();
      });

      it('shows the estimate link', () => {
        expect(group(`fullLoadAmps_${idString()}`).querySelector('a.click-link').textContent.trim()).toBe('Estimate Full-Load Amps');
      });

      it('hides the error when invalid but pristine', () => {
        component.fanMotorForm.controls.fullLoadAmps.setValue(null);
        makePristine('fullLoadAmps');
        expect(group(`fullLoadAmps_${idString()}`).querySelector('.alert-danger')).toBeNull();
      });

      it('shows the required error when empty and dirty', () => {
        makeInvalidDirty('fullLoadAmps', null);
        expect(group(`fullLoadAmps_${idString()}`).querySelector('.alert-danger').textContent).toContain('Required');
        expect(group(`fullLoadAmps_${idString()}`).classList).toContain('invalid');
      });

      it('shows the full load amps warning when one exists and the field is valid', () => {
        setWarnings({ flaError: 'Amps warning' });
        const flaGroup = group(`fullLoadAmps_${idString()}`);
        expect(flaGroup.querySelector('.alert-warning').textContent.trim()).toBe('Amps warning');
        expect(flaGroup.classList).toContain('error');
      });

      it('hides the full load amps warning when the field is invalid', () => {
        component.fanMotorForm.controls.fullLoadAmps.setValue(null);
        component.fanMotorForm.controls.fullLoadAmps.markAsDirty();
        setWarnings({ flaError: 'Amps warning' });
        expect(group(`fullLoadAmps_${idString()}`).querySelector('.alert-warning')).toBeNull();
      });
    });

    describe('difference indicators', () => {
      beforeEach(() => {
        compareServiceSpy.baselineFSAT = makeFsat(makeFanMotor());
        compareServiceSpy.modifiedFSAT = makeFsat(makeFanMotor());
      });

      it('shows no indicators when nothing differs', () => {
        createComponent({ fanMotor: makeFanMotor({ efficiencyClass: SPECIFIED_CLASS }) });
        expect(root.querySelector('.indicate-different')).toBeNull();
      });

      it('shows no indicators while in setup even when values differ', () => {
        compareServiceSpy.isLineFrequencyDifferent.and.returnValue(true);
        compareServiceSpy.isMotorRpmDifferent.and.returnValue(true);
        createComponent({ inSetup: true });
        expect(root.querySelector('.indicate-different')).toBeNull();
      });

      const cases: Array<{ method: keyof CompareService, labelFor: string, specifiedClass?: boolean }> = [
        { method: 'isLineFrequencyDifferent', labelFor: 'lineFrequency_' },
        { method: 'isMotorRatedPowerDifferent', labelFor: 'motorRatedPower_' },
        { method: 'isMotorRpmDifferent', labelFor: 'motorRpm_' },
        { method: 'isEfficiencyClassDifferent', labelFor: 'efficiencyClass_' },
        { method: 'isSpecifiedEfficiencyDifferent', labelFor: 'specifiedEfficiency_', specifiedClass: true },
        { method: 'isMotorRatedVoltageDifferent', labelFor: 'motorRatedVoltage_' },
        { method: 'isMotorFullLoadAmpsDifferent', labelFor: 'fullLoadAmps_' },
      ];

      cases.forEach(({ method, labelFor, specifiedClass }) => {
        it(`marks only the ${labelFor.replace('_', '')} group when ${method} is true`, () => {
          (compareServiceSpy[method] as jasmine.Spy).and.returnValue(true);
          createComponent({ fanMotor: makeFanMotor({ efficiencyClass: specifiedClass ? SPECIFIED_CLASS : 1 }) });
          expect(group(labelFor + idString()).classList).toContain('indicate-different');
          expect(root.querySelectorAll('.indicate-different').length).toBe(1);
        });
      });
    });
  });

  describe('changeLineFreq', () => {
    beforeEach(() => createComponent());

    it('moves the 50 Hz default rpm to the 60 Hz default when switching to 60 Hz', () => {
      component.fanMotorForm.controls.motorRpm.setValue(1485);
      component.fanMotorForm.controls.lineFrequency.setValue(60);
      component.changeLineFreq();
      expect(component.fanMotorForm.controls.motorRpm.value).toBe(1780);
    });

    it('moves the 60 Hz default rpm to the 50 Hz default when switching to 50 Hz', () => {
      component.fanMotorForm.controls.motorRpm.setValue(1780);
      component.fanMotorForm.controls.lineFrequency.setValue(50);
      component.changeLineFreq();
      expect(component.fanMotorForm.controls.motorRpm.value).toBe(1485);
    });

    it('leaves a custom rpm unchanged', () => {
      component.fanMotorForm.controls.motorRpm.setValue(1200);
      component.fanMotorForm.controls.lineFrequency.setValue(50);
      component.changeLineFreq();
      expect(component.fanMotorForm.controls.motorRpm.value).toBe(1200);
    });

    it('emits the saved fan motor', () => {
      const emitted: FanMotor[] = [];
      component.emitSave.subscribe((motor: FanMotor) => emitted.push(motor));
      component.fanMotorForm.controls.motorRpm.setValue(1780);
      component.fanMotorForm.controls.lineFrequency.setValue(50);
      component.changeLineFreq();
      expect(emitted.length).toBe(1);
      expect(emitted[0].lineFrequency).toBe(50);
      expect(emitted[0].motorRpm).toBe(1485);
    });
  });

  describe('changeEfficiencyClass', () => {
    beforeEach(() => createComponent({ fanMotor: makeFanMotor({ efficiencyClass: 1 }) }));

    it('marks the efficiency class dirty and emits the saved fan motor', () => {
      const emitted: FanMotor[] = [];
      component.emitSave.subscribe((motor: FanMotor) => emitted.push(motor));
      component.fanMotorForm.controls.efficiencyClass.setValue(2);
      component.changeEfficiencyClass();
      expect(component.fanMotorForm.controls.efficiencyClass.dirty).toBeTrue();
      expect(emitted[0].efficiencyClass).toBe(2);
    });
  });

  describe('save', () => {
    beforeEach(() => createComponent());

    it('emits a fan motor built from the form values', () => {
      const emitted: FanMotor[] = [];
      component.emitSave.subscribe((motor: FanMotor) => emitted.push(motor));
      component.fanMotorForm.controls.motorRatedPower.setValue(300);
      component.save();
      expect(emitted.length).toBe(1);
      expect(emitted[0].motorRatedPower).toBe(300);
    });

    it('re-checks warnings after saving', () => {
      warningServiceSpy.checkMotorWarnings.calls.reset();
      component.save();
      expect(warningServiceSpy.checkMotorWarnings).toHaveBeenCalledWith(component.fsat, MOCK_SETTINGS, false);
    });
  });

  describe('disableFLA', () => {
    beforeEach(() => createComponent());

    it('is false when every FLA input is valid', () => {
      expect(component.disableFLA()).toBeFalse();
    });

    it('is true when the optimization flag is set', () => {
      component.disableFLAOptimized = true;
      expect(component.disableFLA()).toBeTrue();
    });

    it('is true when an FLA input is invalid', () => {
      component.fanMotorForm.controls.motorRpm.setValue(null);
      expect(component.disableFLA()).toBeTrue();
    });

    it('is true when an FLA input is disabled', () => {
      component.fanMotorForm.controls.lineFrequency.disable();
      expect(component.disableFLA()).toBeTrue();
    });

    it('is false for a specified efficiency class with a line frequency', () => {
      component.fanMotorForm.controls.efficiencyClass.setValue(SPECIFIED_CLASS);
      expect(component.disableFLA()).toBeFalse();
    });
  });

  describe('estimating full load amps', () => {
    it('calcFla passes the efficiency class value for a standard class', () => {
      createComponent({ fanMotor: makeFanMotor({ efficiencyClass: 2 }) });
      const fla = component.calcFla();
      expect(psatServiceSpy.estFLA).toHaveBeenCalledWith(200, 1780, 60, 2, 2, 460, MOCK_SETTINGS);
      expect(fla).toBe(231.5);
    });

    it('calcFla passes the specified efficiency for the specified class', () => {
      createComponent({ fanMotor: makeFanMotor({ efficiencyClass: SPECIFIED_CLASS, specifiedEfficiency: 94 }) });
      component.calcFla();
      expect(psatServiceSpy.estFLA).toHaveBeenCalledWith(200, 1780, 60, SPECIFIED_CLASS, 94, 460, MOCK_SETTINGS);
    });

    it('calcFla returns null without estimating when the estimate is disabled', () => {
      createComponent();
      component.disableFLAOptimized = true;
      expect(component.calcFla()).toBeNull();
      expect(psatServiceSpy.estFLA).not.toHaveBeenCalled();
    });

    it('getFullLoadAmps patches the estimate into the form and emits the saved fan motor', () => {
      createComponent();
      const emitted: FanMotor[] = [];
      component.emitSave.subscribe((motor: FanMotor) => emitted.push(motor));
      component.getFullLoadAmps();
      expect(component.fanMotorForm.controls.fullLoadAmps.value).toBe(231.5);
      expect(emitted[0].fullLoadAmps).toBe(231.5);
    });

    it('getFullLoadAmps does nothing when the estimate is disabled', () => {
      createComponent();
      component.fanMotorForm.controls.motorRpm.setValue(null);
      const emitted: FanMotor[] = [];
      component.emitSave.subscribe((motor: FanMotor) => emitted.push(motor));
      component.getFullLoadAmps();
      expect(component.fanMotorForm.controls.fullLoadAmps.value).toBe(225);
      expect(emitted.length).toBe(0);
    });

    it('re-renders the estimated amps in the input', () => {
      createComponent();
      group(`fullLoadAmps_${idString()}`).querySelector<HTMLElement>('a.click-link').click();
      fixture.detectChanges();
      expect(group(`fullLoadAmps_${idString()}`).querySelector<HTMLInputElement>('input').value).toBe('231.5');
    });
  });

  describe('focusField', () => {
    it('publishes the field name to the help panel', () => {
      createComponent();
      component.focusField('motorRatedPower');
      expect(currentField.value).toBe('motorRatedPower');
    });
  });

  describe('difference helpers', () => {
    beforeEach(() => createComponent());

    it('canCompare is false without both fsats', () => {
      compareServiceSpy.baselineFSAT = makeFsat(makeFanMotor());
      compareServiceSpy.modifiedFSAT = undefined;
      expect(component.canCompare()).toBeFalse();
      compareServiceSpy.baselineFSAT = undefined;
      compareServiceSpy.modifiedFSAT = makeFsat(makeFanMotor());
      expect(component.canCompare()).toBeFalse();
    });

    it('canCompare is false while in setup', () => {
      compareServiceSpy.baselineFSAT = makeFsat(makeFanMotor());
      compareServiceSpy.modifiedFSAT = makeFsat(makeFanMotor());
      component.inSetup = true;
      expect(component.canCompare()).toBeFalse();
    });

    it('return false without calling the compare service when comparison is not possible', () => {
      compareServiceSpy.baselineFSAT = undefined;
      expect(component.isLineFrequencyDifferent()).toBeFalse();
      expect(component.isMotorRatedPowerDifferent()).toBeFalse();
      expect(component.isMotorRpmDifferent()).toBeFalse();
      expect(component.isEfficiencyClassDifferent()).toBeFalse();
      expect(component.isSpecifiedEfficiencyDifferent()).toBeFalse();
      expect(component.isMotorRatedVoltageDifferent()).toBeFalse();
      expect(component.isMotorFullLoadAmpsDifferent()).toBeFalse();
      expect(compareServiceSpy.isLineFrequencyDifferent).not.toHaveBeenCalled();
    });

    it('delegate to the compare service when comparison is possible', () => {
      compareServiceSpy.baselineFSAT = makeFsat(makeFanMotor());
      compareServiceSpy.modifiedFSAT = makeFsat(makeFanMotor());
      compareServiceSpy.isLineFrequencyDifferent.and.returnValue(true);
      compareServiceSpy.isMotorRatedPowerDifferent.and.returnValue(true);
      compareServiceSpy.isMotorRpmDifferent.and.returnValue(true);
      compareServiceSpy.isEfficiencyClassDifferent.and.returnValue(true);
      compareServiceSpy.isSpecifiedEfficiencyDifferent.and.returnValue(true);
      compareServiceSpy.isMotorRatedVoltageDifferent.and.returnValue(true);
      compareServiceSpy.isMotorFullLoadAmpsDifferent.and.returnValue(true);
      expect(component.isLineFrequencyDifferent()).toBeTrue();
      expect(component.isMotorRatedPowerDifferent()).toBeTrue();
      expect(component.isMotorRpmDifferent()).toBeTrue();
      expect(component.isEfficiencyClassDifferent()).toBeTrue();
      expect(component.isSpecifiedEfficiencyDifferent()).toBeTrue();
      expect(component.isMotorRatedVoltageDifferent()).toBeTrue();
      expect(component.isMotorFullLoadAmpsDifferent()).toBeTrue();
    });
  });
});
