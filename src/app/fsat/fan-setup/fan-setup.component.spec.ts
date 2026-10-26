import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { FanSetupComponent } from './fan-setup.component';
import { FanSetupService } from './fan-setup.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { CompareService } from '../compare.service';
import { FsatWarningService } from '../fsat-warning.service';
import { FsatService } from '../fsat.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FanTypes, Drives } from '../fanOptions';
import { FanSetup, FSAT, FsatOutput } from '../../shared/models/fans';
import { Settings } from '../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const BASELINE_ID = 'fsat_baseline';
const MOD_ID = 'fsat_modification_0';
const SPECIFIED_FAN_TYPE = 12;
const SPECIFIED_DRIVE = 4;

function makeFanSetup(overrides: Partial<FanSetup> = {}): FanSetup {
  return { fanType: 0, fanSpeed: 1180, drive: 0, specifiedDriveEfficiency: 100, fanEfficiency: 85.5, ...overrides };
}

function makeFsat(fanSetup: FanSetup): FSAT {
  return {
    fanSetup,
    fieldData: { inletPressure: -1, outletPressure: 2, flowRate: 1000, compressibilityFactor: 0.99 },
  } as FSAT;
}

describe('FanSetupComponent', () => {
  let component: FanSetupComponent;
  let fixture: ComponentFixture<FanSetupComponent>;
  let warningServiceSpy: jasmine.SpyObj<FsatWarningService>;
  let fsatServiceSpy: jasmine.SpyObj<FsatService>;
  let convertUnitsSpy: jasmine.SpyObj<ConvertUnitsService>;
  let compareServiceSpy: jasmine.SpyObj<CompareService>;
  let helpPanelSpy: jasmine.SpyObj<HelpPanelService>;
  let root: HTMLElement;

  interface InputOverrides {
    fanSetup?: FanSetup;
    baseline?: boolean;
    selected?: boolean;
    inSetup?: boolean;
    condenseDropDown?: boolean;
  }

  function createComponent(overrides: InputOverrides = {}): void {
    fixture = TestBed.createComponent(FanSetupComponent);
    component = fixture.componentInstance;
    component.fanSetup = overrides.fanSetup ?? makeFanSetup();
    component.fsat = makeFsat(component.fanSetup);
    component.settings = MOCK_SETTINGS;
    component.baseline = overrides.baseline ?? false;
    component.selected = overrides.selected ?? true;
    component.inSetup = overrides.inSetup ?? false;
    component.modificationIndex = 0;
    component.condenseDropDown = overrides.condenseDropDown ?? false;
    fixture.detectChanges();
    root = fixture.nativeElement;
  }

  /** Finds the form-group wrapper of a field via its label's `for` attribute. */
  function group(labelFor: string): HTMLElement | null {
    return root.querySelector(`label[for="${labelFor}"]`)?.closest('.form-group') ?? null;
  }

  function markDirty(controlName: string): void {
    component.fanForm.controls[controlName].markAsDirty();
  }

  function rerender(): void {
    fixture.detectChanges();
  }

  beforeEach(async () => {
    warningServiceSpy = jasmine.createSpyObj('FsatWarningService', ['checkFanWarnings']);
    warningServiceSpy.checkFanWarnings.and.returnValue({ fanSpeedError: null });
    fsatServiceSpy = jasmine.createSpyObj('FsatService', ['getResults', 'optimalFanEfficiency']);
    fsatServiceSpy.optimalFanEfficiency.and.returnValue(72.456);
    fsatServiceSpy.getResults.and.returnValue({ fanEfficiency: 64.321 } as FsatOutput);
    convertUnitsSpy = jasmine.createSpyObj('ConvertUnitsService', ['roundVal']);
    convertUnitsSpy.roundVal.and.callFake((val: number, decimals: number) => Number(val.toFixed(decimals)));
    compareServiceSpy = jasmine.createSpyObj('CompareService', [
      'isFanTypeDifferent', 'isFanSpeedDifferent', 'isDriveDifferent',
      'isSpecifiedFanEfficiencyDifferent', 'isSpecifiedDriveEfficiencyDifferent'
    ]);
    helpPanelSpy = jasmine.createSpyObj('HelpPanelService', [], { currentField: new BehaviorSubject<string>('default') });

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FanSetupComponent],
      providers: [
        FanSetupService,
        { provide: FsatWarningService, useValue: warningServiceSpy },
        { provide: FsatService, useValue: fsatServiceSpy },
        { provide: ConvertUnitsService, useValue: convertUnitsSpy },
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
      expect(root.querySelector(`#fanSpeed_${BASELINE_ID}`)).not.toBeNull();
    });

    it('uses the modification id string with the modification index otherwise', () => {
      createComponent({ baseline: false });
      expect(component.idString).toBe(MOD_ID);
      expect(root.querySelector(`#fanSpeed_${MOD_ID}`)).not.toBeNull();
    });

    it('builds the form from the fan setup', () => {
      createComponent();
      expect(component.fanForm.controls.fanSpeed.value).toBe(1180);
      expect(component.fanForm.controls.fanType.value).toBe(0);
    });

    it('forces specified drive efficiency to 100 when the drive is not specified efficiency', () => {
      createComponent({ fanSetup: makeFanSetup({ drive: 1, specifiedDriveEfficiency: 55 }) });
      expect(component.fanForm.controls.specifiedDriveEfficiency.value).toBe(100);
    });

    it('keeps the specified drive efficiency when the drive is specified efficiency', () => {
      createComponent({ fanSetup: makeFanSetup({ drive: SPECIFIED_DRIVE, specifiedDriveEfficiency: 55 }) });
      expect(component.fanForm.controls.specifiedDriveEfficiency.value).toBe(55);
    });

    it('disables fan type, drive, and fan efficiency when not selected and fan type is not specified', () => {
      createComponent({ selected: false });
      expect(component.fanForm.controls.fanType.disabled).toBeTrue();
      expect(component.fanForm.controls.drive.disabled).toBeTrue();
      expect(component.fanForm.controls.fanEfficiency.disabled).toBeTrue();
    });

    it('leaves fan efficiency enabled when not selected and fan type is specified efficiency', () => {
      createComponent({ selected: false, fanSetup: makeFanSetup({ fanType: SPECIFIED_FAN_TYPE }) });
      expect(component.fanForm.controls.fanEfficiency.disabled).toBeFalse();
    });

    it('keeps every control enabled when selected', () => {
      createComponent({ selected: true });
      expect(component.fanForm.enabled).toBeTrue();
    });

    it('reads fan speed warnings from the warning service for the fan setup', () => {
      warningServiceSpy.checkFanWarnings.and.returnValue({ fanSpeedError: 'Too slow' });
      createComponent();
      expect(warningServiceSpy.checkFanWarnings).toHaveBeenCalledWith(component.fanSetup);
      expect(component.fanSpeedError).toBe('Too slow');
    });
  });

  describe('ngOnChanges', () => {
    it('condenses the drop down when the container height is under 325', () => {
      createComponent();
      component.containerHeight = 300;
      component.ngOnChanges({ containerHeight: { currentValue: 300, previousValue: 400, firstChange: false, isFirstChange: () => false } });
      expect(component.condenseDropDown).toBeTrue();
    });

    it('does not condense the drop down when the container height is 325 or more', () => {
      createComponent();
      component.containerHeight = 325;
      component.ngOnChanges({ containerHeight: { currentValue: 325, previousValue: 300, firstChange: false, isFirstChange: () => false } });
      expect(component.condenseDropDown).toBeFalse();
    });

    it('enables the form when selected changes to true', () => {
      createComponent({ selected: false });
      component.selected = true;
      component.ngOnChanges({ selected: { currentValue: true, previousValue: false, firstChange: false, isFirstChange: () => false } });
      expect(component.fanForm.controls.fanType.enabled).toBeTrue();
      expect(component.fanForm.controls.drive.enabled).toBeTrue();
    });

    it('disables the form when selected changes to false', () => {
      createComponent({ selected: true });
      component.selected = false;
      component.ngOnChanges({ selected: { currentValue: false, previousValue: true, firstChange: false, isFirstChange: () => false } });
      expect(component.fanForm.controls.fanType.disabled).toBeTrue();
    });

    it('rebuilds the form when the modification index changes', () => {
      createComponent();
      const previousForm = component.fanForm;
      component.ngOnChanges({ modificationIndex: { currentValue: 1, previousValue: 0, firstChange: false, isFirstChange: () => false } });
      expect(component.fanForm).not.toBe(previousForm);
    });
  });

  describe('template visibility', () => {
    describe('setup header', () => {
      it('hides the header when not in setup', () => {
        createComponent({ inSetup: false });
        expect(root.querySelector('.header')).toBeNull();
      });

      it('shows the Fan header when in setup', () => {
        createComponent({ inSetup: true });
        expect(root.querySelector('.header h3').textContent.trim()).toBe('Fan');
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

    describe('fan type select', () => {
      it('shows the standard fan type select when fan type is not specified and the drop down is not condensed', () => {
        createComponent({ condenseDropDown: false });
        const selects = root.querySelectorAll('select[formControlName="fanType"]');
        expect(selects.length).toBe(1);
        expect(selects[0].hasAttribute('size')).toBeFalse();
      });

      it('shows only the condensed fan type select when the drop down is condensed', () => {
        createComponent({ condenseDropDown: true });
        const selects = root.querySelectorAll('select[formControlName="fanType"]');
        expect(selects.length).toBe(1);
        expect(selects[0].getAttribute('size')).toBe('4');
      });

      it('hides both fan type selects when fan type is specified efficiency and the drop down is not condensed', () => {
        createComponent({ fanSetup: makeFanSetup({ fanType: SPECIFIED_FAN_TYPE }), condenseDropDown: false });
        expect(root.querySelector('select[formControlName="fanType"]')).toBeNull();
      });

      it('hides both fan type selects when fan type is specified efficiency and the drop down is condensed', () => {
        createComponent({ fanSetup: makeFanSetup({ fanType: SPECIFIED_FAN_TYPE }), condenseDropDown: true });
        expect(root.querySelector('select[formControlName="fanType"]')).toBeNull();
      });

      it('hides the fan type select once fan type becomes specified efficiency', () => {
        createComponent();
        component.fanForm.controls.fanType.setValue(SPECIFIED_FAN_TYPE);
        rerender();
        expect(root.querySelector('select[formControlName="fanType"]')).toBeNull();
      });

      it('shows the fan type select again when fan type changes away from specified efficiency', () => {
        createComponent({ fanSetup: makeFanSetup({ fanType: SPECIFIED_FAN_TYPE }) });
        component.fanForm.controls.fanType.setValue(0);
        rerender();
        expect(root.querySelector('select[formControlName="fanType"]')).not.toBeNull();
      });

      it('renders one option per fan type in the standard select', () => {
        createComponent({ condenseDropDown: false });
        expect(root.querySelectorAll('select[formControlName="fanType"] option').length).toBe(FanTypes.length);
      });

      it('renders one option per fan type in the condensed select', () => {
        createComponent({ condenseDropDown: true });
        expect(root.querySelectorAll('select[formControlName="fanType"] option').length).toBe(FanTypes.length);
      });

      it('renders no fan type options when there are no fan types', () => {
        createComponent();
        component.fanTypes = [];
        rerender();
        expect(root.querySelector('select[formControlName="fanType"]')).not.toBeNull();
        expect(root.querySelectorAll('select[formControlName="fanType"] option').length).toBe(0);
      });

      it('renders each fan type display name in order', () => {
        createComponent();
        const text = Array.from(root.querySelectorAll('select[formControlName="fanType"] option')).map((o: Element) => o.textContent.trim());
        expect(text).toEqual(FanTypes.map(fanType => fanType.display));
      });
    });

    describe('fan efficiency group', () => {
      it('hides the fan efficiency group for the baseline', () => {
        createComponent({ baseline: true });
        expect(group(`fanEfficiency_${BASELINE_ID}`)).toBeNull();
        expect(root.querySelector('[formControlName="fanEfficiency"]')).toBeNull();
      });

      it('shows the fan efficiency group for a modification', () => {
        createComponent({ baseline: false });
        expect(group(`fanEfficiency_${MOD_ID}`)).not.toBeNull();
      });

      it('shows the Known Efficiency link, not Optimize Fan, when fan type is not specified efficiency', () => {
        createComponent();
        const links = Array.from(group(`fanEfficiency_${MOD_ID}`).querySelectorAll('a.click-link')).map((a: Element) => a.textContent.trim());
        expect(links).toEqual(['Known Efficiency']);
      });

      it('shows the Optimize Fan link, not Known Efficiency, when fan type is specified efficiency', () => {
        createComponent({ fanSetup: makeFanSetup({ fanType: SPECIFIED_FAN_TYPE }) });
        const links = Array.from(group(`fanEfficiency_${MOD_ID}`).querySelectorAll('a.click-link')).map((a: Element) => a.textContent.trim());
        expect(links).toEqual(['Optimize Fan']);
      });

      it('hides the fan efficiency input and shows the calculated value when fan type is not specified efficiency', () => {
        createComponent({ fanSetup: makeFanSetup({ fanEfficiency: 85.5 }) });
        const efficiencyGroup = group(`fanEfficiency_${MOD_ID}`);
        expect(efficiencyGroup.querySelector('[formControlName="fanEfficiency"]')).toBeNull();
        expect(efficiencyGroup.querySelector('.input-group')).toBeNull();
        expect(efficiencyGroup.querySelector('.text-center').textContent.trim()).toBe('85.5 %');
      });

      it('shows the fan efficiency input and hides the calculated value when fan type is specified efficiency', () => {
        createComponent({ fanSetup: makeFanSetup({ fanType: SPECIFIED_FAN_TYPE, fanEfficiency: 85.5 }) });
        const efficiencyGroup = group(`fanEfficiency_${MOD_ID}`);
        expect(efficiencyGroup.querySelector('[formControlName="fanEfficiency"]')).not.toBeNull();
        expect(efficiencyGroup.querySelector('.text-center')).toBeNull();
      });

      it('switches between the calculated value and the input when fan type changes', () => {
        createComponent();
        component.fanForm.controls.fanType.setValue(SPECIFIED_FAN_TYPE);
        rerender();
        expect(root.querySelector('[formControlName="fanEfficiency"]')).not.toBeNull();
        component.fanForm.controls.fanType.setValue(0);
        rerender();
        expect(root.querySelector('[formControlName="fanEfficiency"]')).toBeNull();
      });
    });

    describe('fan efficiency errors', () => {
      beforeEach(() => {
        createComponent({ fanSetup: makeFanSetup({ fanType: SPECIFIED_FAN_TYPE }) });
      });

      it('hides the error when the fan efficiency is valid', () => {
        expect(group(`fanEfficiency_${MOD_ID}`).querySelector('.alert-danger')).toBeNull();
      });

      it('hides the error when the fan efficiency is invalid but pristine', () => {
        component.fanForm.controls.fanEfficiency.setValue(null);
        component.fanForm.controls.fanEfficiency.markAsPristine();
        rerender();
        expect(group(`fanEfficiency_${MOD_ID}`).querySelector('.alert-danger')).toBeNull();
      });

      it('shows only the required message when the fan efficiency is empty', () => {
        component.fanForm.controls.fanEfficiency.setValue(null);
        markDirty('fanEfficiency');
        rerender();
        const error = group(`fanEfficiency_${MOD_ID}`).querySelector('.alert-danger');
        expect(error.querySelectorAll('span').length).toBe(1);
        expect(error.textContent).toContain('Value Required');
      });

      it('shows only the max message when the fan efficiency is above 100', () => {
        component.fanForm.controls.fanEfficiency.setValue(150);
        markDirty('fanEfficiency');
        rerender();
        const error = group(`fanEfficiency_${MOD_ID}`).querySelector('.alert-danger');
        expect(error.querySelectorAll('span').length).toBe(1);
        expect(error.textContent).toContain("Value can't be greater than");
        expect(error.textContent).toContain('100 %');
      });

      it('shows only the min message when the fan efficiency is below 0', () => {
        component.fanForm.controls.fanEfficiency.setValue(-5);
        markDirty('fanEfficiency');
        rerender();
        const error = group(`fanEfficiency_${MOD_ID}`).querySelector('.alert-danger');
        expect(error.querySelectorAll('span').length).toBe(1);
        expect(error.textContent).toContain("Value can't be less than");
        expect(error.textContent).toContain('0 %');
      });

      it('marks the group invalid when the fan efficiency is invalid', () => {
        component.fanForm.controls.fanEfficiency.setValue(150);
        rerender();
        expect(group(`fanEfficiency_${MOD_ID}`).classList).toContain('invalid');
      });
    });

    describe('fan efficiency help text', () => {
      it('hides all help text for the baseline', () => {
        createComponent({ baseline: true });
        expect(root.querySelector('.help-text')).toBeNull();
      });

      it('shows only the baseline-derived help text when fan type is specified efficiency on a modification', () => {
        createComponent({ fanSetup: makeFanSetup({ fanType: SPECIFIED_FAN_TYPE }) });
        const helpTexts = root.querySelectorAll('.help-text');
        expect(helpTexts.length).toBe(1);
        expect(helpTexts[0].textContent).toContain('calculated based on your baseline');
      });

      it('shows only the fan-type-derived help text when fan type is not specified efficiency on a modification', () => {
        createComponent();
        const helpTexts = root.querySelectorAll('.help-text');
        expect(helpTexts.length).toBe(1);
        expect(helpTexts[0].textContent).toContain('calculated based on your selected');
      });
    });

    describe('fan speed', () => {
      beforeEach(() => {
        createComponent();
      });

      it('hides the required error when fan speed is valid', () => {
        expect(group(`fanSpeed_${MOD_ID}`).querySelector('.alert-danger')).toBeNull();
      });

      it('hides the required error when fan speed is invalid but pristine', () => {
        component.fanForm.controls.fanSpeed.setValue(null);
        component.fanForm.controls.fanSpeed.markAsPristine();
        rerender();
        expect(group(`fanSpeed_${MOD_ID}`).querySelector('.alert-danger')).toBeNull();
      });

      it('shows the required error when fan speed is empty and dirty', () => {
        component.fanForm.controls.fanSpeed.setValue(null);
        markDirty('fanSpeed');
        rerender();
        expect(group(`fanSpeed_${MOD_ID}`).querySelector('.alert-danger').textContent).toContain('Value Required');
        expect(group(`fanSpeed_${MOD_ID}`).classList).toContain('invalid');
      });

      it('hides the warning when there is no fan speed warning', () => {
        expect(group(`fanSpeed_${MOD_ID}`).querySelector('.alert-warning')).toBeNull();
      });

      it('hides the warning when there is a fan speed warning but the field is pristine', () => {
        warningServiceSpy.checkFanWarnings.and.returnValue({ fanSpeedError: 'Fan speed warning' });
        component.checkForWarnings();
        component.fanForm.controls.fanSpeed.markAsPristine();
        rerender();
        expect(group(`fanSpeed_${MOD_ID}`).querySelector('.alert-warning')).toBeNull();
      });

      it('shows the warning when there is a fan speed warning and the field is dirty', () => {
        warningServiceSpy.checkFanWarnings.and.returnValue({ fanSpeedError: 'Fan speed warning' });
        component.checkForWarnings();
        markDirty('fanSpeed');
        rerender();
        const group$ = group(`fanSpeed_${MOD_ID}`);
        expect(group$.querySelector('.alert-warning').textContent.trim()).toBe('Fan speed warning');
        expect(group$.classList).toContain('error');
      });
    });

    describe('drive', () => {
      it('renders one option per drive', () => {
        createComponent();
        expect(root.querySelectorAll('select[formControlName="drive"] option').length).toBe(Drives.length);
      });

      it('renders no drive options when there are no drives', () => {
        createComponent();
        component.drives = [];
        rerender();
        expect(root.querySelector('select[formControlName="drive"]')).not.toBeNull();
        expect(root.querySelectorAll('select[formControlName="drive"] option').length).toBe(0);
      });
    });

    describe('specified drive efficiency', () => {
      it('hides the drive efficiency group when the drive is not specified efficiency', () => {
        createComponent({ fanSetup: makeFanSetup({ drive: 1 }) });
        expect(root.querySelector('[formControlName="specifiedDriveEfficiency"]')).toBeNull();
        expect(group('specifiedDriveEfficiency')).toBeNull();
      });

      it('shows the drive efficiency group when the drive is specified efficiency', () => {
        createComponent({ fanSetup: makeFanSetup({ drive: SPECIFIED_DRIVE, specifiedDriveEfficiency: 90 }) });
        expect(root.querySelector('[formControlName="specifiedDriveEfficiency"]')).not.toBeNull();
        expect(group('specifiedDriveEfficiency')).not.toBeNull();
      });

      describe('errors', () => {
        beforeEach(() => {
          createComponent({ fanSetup: makeFanSetup({ drive: SPECIFIED_DRIVE, specifiedDriveEfficiency: 90 }) });
        });

        it('hides the error when the drive efficiency is valid', () => {
          expect(group('specifiedDriveEfficiency').querySelector('.alert-danger')).toBeNull();
        });

        it('hides the error when the drive efficiency is invalid but pristine', () => {
          component.fanForm.controls.specifiedDriveEfficiency.setValue(null);
          component.fanForm.controls.specifiedDriveEfficiency.markAsPristine();
          rerender();
          expect(group('specifiedDriveEfficiency').querySelector('.alert-danger')).toBeNull();
        });

        it('shows only the required message when the drive efficiency is empty', () => {
          component.fanForm.controls.specifiedDriveEfficiency.setValue(null);
          markDirty('specifiedDriveEfficiency');
          rerender();
          const error = group('specifiedDriveEfficiency').querySelector('.alert-danger');
          expect(error.querySelectorAll('span').length).toBe(1);
          expect(error.textContent).toContain('Value Required');
        });

        it('shows only the max message when the drive efficiency is above 100', () => {
          component.fanForm.controls.specifiedDriveEfficiency.setValue(120);
          markDirty('specifiedDriveEfficiency');
          rerender();
          const error = group('specifiedDriveEfficiency').querySelector('.alert-danger');
          expect(error.querySelectorAll('span').length).toBe(1);
          expect(error.textContent).toContain("Value can't be greater than");
        });

        it('shows only the min message when the drive efficiency is below 0', () => {
          component.fanForm.controls.specifiedDriveEfficiency.setValue(-1);
          markDirty('specifiedDriveEfficiency');
          rerender();
          const error = group('specifiedDriveEfficiency').querySelector('.alert-danger');
          expect(error.querySelectorAll('span').length).toBe(1);
          expect(error.textContent).toContain("Value can't be less than");
        });

        it('marks the group invalid when the drive efficiency is invalid', () => {
          component.fanForm.controls.specifiedDriveEfficiency.setValue(120);
          rerender();
          expect(group('specifiedDriveEfficiency').classList).toContain('invalid');
        });
      });
    });

    describe('difference indicators', () => {
      beforeEach(() => {
        compareServiceSpy.baselineFSAT = makeFsat(makeFanSetup());
        compareServiceSpy.modifiedFSAT = makeFsat(makeFanSetup());
      });

      it('shows no indicators when nothing differs', () => {
        createComponent({ fanSetup: makeFanSetup({ drive: SPECIFIED_DRIVE }) });
        expect(root.querySelector('.indicate-different')).toBeNull();
      });

      it('shows no indicators while in setup even when values differ', () => {
        compareServiceSpy.isFanTypeDifferent.and.returnValue(true);
        compareServiceSpy.isFanSpeedDifferent.and.returnValue(true);
        createComponent({ inSetup: true });
        expect(root.querySelector('.indicate-different')).toBeNull();
      });

      it('marks the fan type group when the fan type differs', () => {
        compareServiceSpy.isFanTypeDifferent.and.returnValue(true);
        createComponent();
        expect(root.querySelectorAll('.indicate-different').length).toBe(1);
        expect(root.querySelector('select[formControlName="fanType"]').closest('.form-group').classList).toContain('indicate-different');
      });

      it('marks the fan speed group when the fan speed differs', () => {
        compareServiceSpy.isFanSpeedDifferent.and.returnValue(true);
        createComponent();
        expect(group(`fanSpeed_${MOD_ID}`).classList).toContain('indicate-different');
      });

      it('marks the drive group when the drive differs', () => {
        compareServiceSpy.isDriveDifferent.and.returnValue(true);
        createComponent();
        expect(group(`drive_${MOD_ID}`).classList).toContain('indicate-different');
      });

      it('marks the fan efficiency group when the specified fan efficiency differs', () => {
        compareServiceSpy.isSpecifiedFanEfficiencyDifferent.and.returnValue(true);
        createComponent();
        expect(group(`fanEfficiency_${MOD_ID}`).classList).toContain('indicate-different');
      });

      it('marks the drive efficiency group when the specified drive efficiency differs', () => {
        compareServiceSpy.isSpecifiedDriveEfficiencyDifferent.and.returnValue(true);
        createComponent({ fanSetup: makeFanSetup({ drive: SPECIFIED_DRIVE, specifiedDriveEfficiency: 90 }) });
        expect(group('specifiedDriveEfficiency').classList).toContain('indicate-different');
      });
    });
  });

  describe('canCompare', () => {
    beforeEach(() => createComponent());

    it('is false without a baseline fsat', () => {
      compareServiceSpy.baselineFSAT = undefined;
      compareServiceSpy.modifiedFSAT = makeFsat(makeFanSetup());
      expect(component.canCompare()).toBeFalse();
    });

    it('is false without a modified fsat', () => {
      compareServiceSpy.baselineFSAT = makeFsat(makeFanSetup());
      compareServiceSpy.modifiedFSAT = undefined;
      expect(component.canCompare()).toBeFalse();
    });

    it('is false while in setup', () => {
      compareServiceSpy.baselineFSAT = makeFsat(makeFanSetup());
      compareServiceSpy.modifiedFSAT = makeFsat(makeFanSetup());
      component.inSetup = true;
      expect(component.canCompare()).toBeFalse();
    });

    it('is true with both fsats outside of setup', () => {
      compareServiceSpy.baselineFSAT = makeFsat(makeFanSetup());
      compareServiceSpy.modifiedFSAT = makeFsat(makeFanSetup());
      expect(component.canCompare()).toBeTrue();
    });
  });

  describe('changeDriveType', () => {
    beforeEach(() => createComponent({ fanSetup: makeFanSetup({ drive: 1 }) }));

    it('applies required, min, and max validators to the specified drive efficiency when drive becomes specified efficiency', () => {
      component.fanForm.controls.drive.setValue(SPECIFIED_DRIVE);
      component.fanForm.controls.specifiedDriveEfficiency.setValue(null);
      component.changeDriveType();
      expect(component.fanForm.controls.specifiedDriveEfficiency.errors).toEqual({ required: true });
      component.fanForm.controls.specifiedDriveEfficiency.setValue(101);
      expect(component.fanForm.controls.specifiedDriveEfficiency.errors.max).toBeDefined();
      component.fanForm.controls.specifiedDriveEfficiency.setValue(-1);
      expect(component.fanForm.controls.specifiedDriveEfficiency.errors.min).toBeDefined();
    });

    it('clears validators from the specified drive efficiency when drive changes away from specified efficiency', () => {
      component.fanForm.controls.drive.setValue(SPECIFIED_DRIVE);
      component.changeDriveType();
      component.fanForm.controls.drive.setValue(2);
      component.changeDriveType();
      component.fanForm.controls.specifiedDriveEfficiency.setValue(null);
      expect(component.fanForm.controls.specifiedDriveEfficiency.valid).toBeTrue();
    });

    it('emits the saved fan setup', () => {
      const emitted: FanSetup[] = [];
      component.emitSave.subscribe((setup: FanSetup) => emitted.push(setup));
      component.fanForm.controls.drive.setValue(3);
      component.changeDriveType();
      expect(emitted.length).toBe(1);
      expect(emitted[0].drive).toBe(3);
    });
  });

  describe('save', () => {
    beforeEach(() => createComponent());

    it('emits a fan setup built from the form values', () => {
      const emitted: FanSetup[] = [];
      component.emitSave.subscribe((setup: FanSetup) => emitted.push(setup));
      component.fanForm.controls.fanSpeed.setValue(1500);
      component.save();
      expect(emitted.length).toBe(1);
      expect(emitted[0].fanSpeed).toBe(1500);
    });

    it('forces specified drive efficiency to 100 when the drive is not specified efficiency', () => {
      let emitted: FanSetup;
      component.emitSave.subscribe((setup: FanSetup) => emitted = setup);
      component.fanForm.controls.specifiedDriveEfficiency.setValue(40);
      component.save();
      expect(emitted.specifiedDriveEfficiency).toBe(100);
    });

    it('keeps the form specified drive efficiency when the drive is specified efficiency', () => {
      let emitted: FanSetup;
      component.emitSave.subscribe((setup: FanSetup) => emitted = setup);
      component.fanForm.controls.drive.setValue(SPECIFIED_DRIVE);
      component.fanForm.controls.specifiedDriveEfficiency.setValue(40);
      component.save();
      expect(emitted.specifiedDriveEfficiency).toBe(40);
    });

    it('re-checks warnings for the new fan setup', () => {
      warningServiceSpy.checkFanWarnings.calls.reset();
      warningServiceSpy.checkFanWarnings.and.returnValue({ fanSpeedError: 'Slow' });
      component.save();
      expect(warningServiceSpy.checkFanWarnings).toHaveBeenCalledWith(component.fanSetup);
      expect(component.fanSpeedError).toBe('Slow');
    });
  });

  describe('fan efficiency actions', () => {
    beforeEach(() => {
      compareServiceSpy.baselineFSAT = makeFsat(makeFanSetup({ fanType: 7 }));
      compareServiceSpy.modifiedFSAT = makeFsat(makeFanSetup());
      createComponent({ fanSetup: makeFanSetup({ fanType: SPECIFIED_FAN_TYPE }) });
    });

    it('calculates the optimal efficiency from the fan setup and field data, rounded to 2 decimals', () => {
      const efficiency = component.calcFanEfficiency();
      expect(fsatServiceSpy.optimalFanEfficiency).toHaveBeenCalledWith({
        fanType: SPECIFIED_FAN_TYPE,
        fanSpeed: 1180,
        inletPressure: -1,
        outletPressure: 2,
        flowRate: 1000,
        compressibility: 0.99
      }, MOCK_SETTINGS);
      expect(convertUnitsSpy.roundVal).toHaveBeenCalledWith(72.456, 2);
      expect(efficiency).toBe(72.46);
    });

    it('enableFanType restores the baseline fan type and sets the optimal efficiency', () => {
      component.enableFanType();
      expect(component.fanForm.controls.fanType.value).toBe(7);
      expect(component.fanForm.controls.fanEfficiency.value).toBe(72.46);
    });

    it('enableFanType shows the fan type select again', () => {
      component.enableFanType();
      rerender();
      expect(root.querySelector('select[formControlName="fanType"]')).not.toBeNull();
    });

    it('disableFanType switches to specified efficiency using the rounded baseline efficiency', () => {
      component.fanForm.controls.fanType.setValue(7);
      component.disableFanType();
      expect(fsatServiceSpy.getResults).toHaveBeenCalledWith(compareServiceSpy.baselineFSAT, true, MOCK_SETTINGS);
      expect(component.fanForm.controls.fanType.value).toBe(SPECIFIED_FAN_TYPE);
      expect(component.fanForm.controls.fanEfficiency.value).toBe(64.32);
    });

    it('disableFanType emits the saved fan setup and shows the efficiency input', () => {
      const emitted: FanSetup[] = [];
      component.emitSave.subscribe((setup: FanSetup) => emitted.push(setup));
      component.fanForm.controls.fanType.setValue(7);
      component.disableFanType();
      rerender();
      expect(emitted[0].fanType).toBe(SPECIFIED_FAN_TYPE);
      expect(root.querySelector('[formControlName="fanEfficiency"]')).not.toBeNull();
    });

    it('getFanEfficiency patches the optimal efficiency and emits the saved fan setup', () => {
      const emitted: FanSetup[] = [];
      component.emitSave.subscribe((setup: FanSetup) => emitted.push(setup));
      component.getFanEfficiency();
      expect(component.fanForm.controls.fanEfficiency.value).toBe(72.46);
      expect(emitted[0].fanEfficiency).toBe(72.46);
    });
  });

  describe('difference helpers', () => {
    beforeEach(() => createComponent());

    it('return false without calling the compare service when comparison is not possible', () => {
      compareServiceSpy.baselineFSAT = undefined;
      expect(component.isFanTypeDifferent()).toBeFalse();
      expect(component.isFanSpeedDifferent()).toBeFalse();
      expect(component.isDriveDifferent()).toBeFalse();
      expect(component.isFanSpecifiedDifferent()).toBeFalse();
      expect(component.isSpecifiedDriveEfficiencyDifferent()).toBeFalse();
      expect(compareServiceSpy.isFanTypeDifferent).not.toHaveBeenCalled();
      expect(compareServiceSpy.isFanSpeedDifferent).not.toHaveBeenCalled();
      expect(compareServiceSpy.isDriveDifferent).not.toHaveBeenCalled();
      expect(compareServiceSpy.isSpecifiedFanEfficiencyDifferent).not.toHaveBeenCalled();
      expect(compareServiceSpy.isSpecifiedDriveEfficiencyDifferent).not.toHaveBeenCalled();
    });

    it('delegate to the compare service when comparison is possible', () => {
      compareServiceSpy.baselineFSAT = makeFsat(makeFanSetup());
      compareServiceSpy.modifiedFSAT = makeFsat(makeFanSetup());
      compareServiceSpy.isFanTypeDifferent.and.returnValue(true);
      compareServiceSpy.isFanSpeedDifferent.and.returnValue(true);
      compareServiceSpy.isDriveDifferent.and.returnValue(true);
      compareServiceSpy.isSpecifiedFanEfficiencyDifferent.and.returnValue(true);
      compareServiceSpy.isSpecifiedDriveEfficiencyDifferent.and.returnValue(true);
      expect(component.isFanTypeDifferent()).toBeTrue();
      expect(component.isFanSpeedDifferent()).toBeTrue();
      expect(component.isDriveDifferent()).toBeTrue();
      expect(component.isFanSpecifiedDifferent()).toBeTrue();
      expect(component.isSpecifiedDriveEfficiencyDifferent()).toBeTrue();
      expect(compareServiceSpy.isSpecifiedFanEfficiencyDifferent).toHaveBeenCalledWith(MOCK_SETTINGS);
    });
  });
});
