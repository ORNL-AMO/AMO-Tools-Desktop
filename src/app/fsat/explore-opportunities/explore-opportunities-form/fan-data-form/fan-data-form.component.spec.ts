import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { FanDataFormComponent } from './fan-data-form.component';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { ModifyConditionsService } from '../../../modify-conditions/modify-conditions.service';
import { HelpPanelService } from '../../../help-panel/help-panel.service';
import { FanSetupService } from '../../../fan-setup/fan-setup.service';
import { FsatService } from '../../../fsat.service';
import { FanTypes, Drives } from '../../../fanOptions';
import { FSAT } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = {} as Settings;
const BASELINE_FAN_EFFICIENCY = 60;
const SPECIFIED_DRIVE = 4;
const SPECIFIED_FAN_EFFICIENCY_TYPE = 12;

interface FormValues {
  drive?: number,
  specifiedDriveEfficiency?: number | null,
  fanType?: number,
  fanEfficiency?: number | null
}

function makeSetupForm(overrides: FormValues = {}): UntypedFormGroup {
  const values: FormValues = { drive: 1, specifiedDriveEfficiency: 90, fanType: 0, fanEfficiency: 70, ...overrides };
  return new UntypedFormGroup({
    drive: new UntypedFormControl(values.drive),
    specifiedDriveEfficiency: new UntypedFormControl(values.specifiedDriveEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]),
    fanType: new UntypedFormControl(values.fanType),
    fanEfficiency: new UntypedFormControl(values.fanEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]),
  });
}

function makeFsat(whatIfScenario: boolean = true): FSAT {
  return {
    modifications: [{
      id: 'mod-1',
      fsat: {
        whatIfScenario,
        fanSetup: { fanSpeed: 1780 },
        fieldData: { inletPressure: -1, outletPressure: 5, flowRate: 1000, compressibilityFactor: 1 },
      },
    }],
  } as FSAT;
}

describe('FanDataFormComponent', () => {
  let component: FanDataFormComponent;
  let fixture: ComponentFixture<FanDataFormComponent>;
  let fsat: FSAT;
  let fsatServiceSpy: jasmine.SpyObj<FsatService>;
  let fanSetupServiceSpy: jasmine.SpyObj<FanSetupService>;
  let convertUnitsServiceSpy: jasmine.SpyObj<ConvertUnitsService>;

  function createComponent(baselineForm: UntypedFormGroup, modificationForm: UntypedFormGroup, isVFD: boolean = false): void {
    fixture = TestBed.createComponent(FanDataFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('exploreModIndex', 0);
    fixture.componentRef.setInput('fsat', fsat);
    fixture.componentRef.setInput('baselineForm', baselineForm);
    fixture.componentRef.setInput('modificationForm', modificationForm);
    fixture.componentRef.setInput('baselineFanEfficiency', BASELINE_FAN_EFFICIENCY);
    fixture.componentRef.setInput('isVFD', isVFD);
    fixture.detectChanges();
  }

  function getItemByLabel(labelText: string): HTMLElement | undefined {
    const items: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('li.explore-opps-item'));
    return items.find(item => item.querySelector('label.baseline-value-label')?.textContent.includes(labelText));
  }

  function getDriveItem(): HTMLElement | undefined {
    return getItemByLabel('Motor Drive');
  }

  function getFanItem(): HTMLElement | undefined {
    return getItemByLabel('Fan Type');
  }

  function getHelpItem(): HTMLElement | null {
    return fixture.nativeElement.querySelector('li:not(.explore-opps-item)');
  }

  function getErrorMessages(form: HTMLElement): string[] {
    return Array.from(form.querySelectorAll('.alert-danger > span')).map((span: HTMLElement) => span.textContent.trim());
  }

  beforeEach(async () => {
    fsat = makeFsat();
    fsatServiceSpy = jasmine.createSpyObj('FsatService', ['optimalFanEfficiency']);
    fanSetupServiceSpy = jasmine.createSpyObj('FanSetupService', ['changeDriveType']);
    convertUnitsServiceSpy = jasmine.createSpyObj('ConvertUnitsService', ['roundVal']);
    convertUnitsServiceSpy.roundVal.and.callFake((value: number) => value);

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, ReactiveFormsModule],
      declarations: [FanDataFormComponent],
      providers: [
        HelpPanelService,
        ModifyConditionsService,
        { provide: FsatService, useValue: fsatServiceSpy },
        { provide: FanSetupService, useValue: fanSetupServiceSpy },
        { provide: ConvertUnitsService, useValue: convertUnitsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('creates the component and populates the drive and fan type options', () => {
      createComponent(makeSetupForm(), makeSetupForm());
      expect(component).toBeTruthy();
      expect(component.drives).toBe(Drives);
      expect(component.fanTypes).toBe(FanTypes);
    });

    it('sets the baseline fan type display from the baseline form', () => {
      createComponent(makeSetupForm({ fanType: 0 }), makeSetupForm());
      expect(component.baselineFanType).toBe('Airfoil (SWSI)');
    });

    it('flags a drive opportunity when the modification drive differs from baseline', () => {
      createComponent(makeSetupForm({ drive: 1 }), makeSetupForm({ drive: 2 }));
      expect(fsat.modifications[0].exploreOppsShowDrive.hasOpportunity).toBeTrue();
    });

    it('flags no drive opportunity when the modification drive matches baseline', () => {
      createComponent(makeSetupForm({ drive: 1 }), makeSetupForm({ drive: 1 }));
      expect(fsat.modifications[0].exploreOppsShowDrive.hasOpportunity).toBeFalse();
    });

    it('flags a fan type opportunity when the modification fan type is not the specified-efficiency type', () => {
      createComponent(makeSetupForm(), makeSetupForm({ fanType: 1 }));
      expect(fsat.modifications[0].exploreOppsShowFanType.hasOpportunity).toBeTrue();
    });

    it('flags a fan type opportunity when the specified-efficiency type has an efficiency different from baseline', () => {
      createComponent(makeSetupForm(), makeSetupForm({ fanType: SPECIFIED_FAN_EFFICIENCY_TYPE, fanEfficiency: 75 }));
      expect(fsat.modifications[0].exploreOppsShowFanType.hasOpportunity).toBeTrue();
    });

    it('flags no fan type opportunity when the specified-efficiency type matches the baseline efficiency', () => {
      createComponent(makeSetupForm(), makeSetupForm({ fanType: SPECIFIED_FAN_EFFICIENCY_TYPE, fanEfficiency: BASELINE_FAN_EFFICIENCY }));
      expect(fsat.modifications[0].exploreOppsShowFanType.hasOpportunity).toBeFalse();
    });

    it('re-evaluates opportunities when isVFD changes after the first change detection', () => {
      const modificationForm: UntypedFormGroup = makeSetupForm({ drive: 1 });
      createComponent(makeSetupForm({ drive: 1 }), modificationForm);
      expect(fsat.modifications[0].exploreOppsShowDrive.hasOpportunity).toBeFalse();

      modificationForm.controls.drive.setValue(2);
      fixture.componentRef.setInput('isVFD', true);
      fixture.detectChanges();

      expect(fsat.modifications[0].exploreOppsShowDrive.hasOpportunity).toBeTrue();
    });

    it('re-evaluates opportunities when exploreModIndex changes after the first change detection', () => {
      const modificationForm: UntypedFormGroup = makeSetupForm({ drive: 1 });
      createComponent(makeSetupForm({ drive: 1 }), modificationForm);
      fsat.modifications.push(JSON.parse(JSON.stringify(fsat.modifications[0])));

      modificationForm.controls.drive.setValue(3);
      fixture.componentRef.setInput('exploreModIndex', 1);
      fixture.detectChanges();

      expect(fsat.modifications[1].exploreOppsShowDrive.hasOpportunity).toBeTrue();
    });
  });

  describe('template visibility: opportunity checkboxes', () => {
    it('shows the drive and fan type checkboxes when isVFD is false', () => {
      createComponent(makeSetupForm(), makeSetupForm(), false);
      expect(fixture.nativeElement.querySelector('#modifyMotorDrive')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('#showFanType')).not.toBeNull();
    });

    it('hides the drive and fan type checkboxes when isVFD is true', () => {
      createComponent(makeSetupForm(), makeSetupForm(), true);
      expect(fixture.nativeElement.querySelector('#modifyMotorDrive')).toBeNull();
      expect(fixture.nativeElement.querySelector('#showFanType')).toBeNull();
    });

    it('renders the opportunity display text beside each checkbox', () => {
      createComponent(makeSetupForm(), makeSetupForm(), false);
      expect(fixture.nativeElement.querySelector('label[for="modifyMotorDrive"]').textContent).toContain('Install More Efficient Drive Type');
      expect(fixture.nativeElement.querySelector('label[for="showFanType"]').textContent).toContain('Install More Efficient Fan');
    });
  });

  describe('template visibility: drive item', () => {
    it('hides the drive item when there is no drive opportunity and isVFD is false', () => {
      createComponent(makeSetupForm({ drive: 1 }), makeSetupForm({ drive: 1 }), false);
      expect(getDriveItem()).toBeUndefined();
    });

    it('shows the drive item when there is a drive opportunity', () => {
      createComponent(makeSetupForm({ drive: 1 }), makeSetupForm({ drive: 2 }), false);
      expect(getDriveItem()).toBeDefined();
    });

    it('shows the drive item when isVFD is true even without a drive opportunity', () => {
      createComponent(makeSetupForm({ drive: 1 }), makeSetupForm({ drive: 1 }), true);
      expect(getDriveItem()).toBeDefined();
    });

    it('shows the baseline drive display name', () => {
      createComponent(makeSetupForm({ drive: 1 }), makeSetupForm({ drive: 2 }));
      expect(getDriveItem().querySelector('.baseline-value-input').textContent).toContain('V-Belt Drive');
    });

    it('shows the "Baseline" prefix when isVFD is false', () => {
      createComponent(makeSetupForm({ drive: 1 }), makeSetupForm({ drive: 2 }), false);
      expect(getDriveItem().querySelector('label.baseline-value-label span')).not.toBeNull();
    });

    it('shows the "Baseline" prefix when isVFD is true but there is no drive opportunity', () => {
      createComponent(makeSetupForm({ drive: 1 }), makeSetupForm({ drive: 1 }), true);
      expect(getDriveItem().querySelector('label.baseline-value-label span')).not.toBeNull();
    });

    it('hides the "Baseline" prefix when isVFD is true and there is a drive opportunity', () => {
      createComponent(makeSetupForm({ drive: 1 }), makeSetupForm({ drive: 2 }), true);
      expect(getDriveItem().querySelector('label.baseline-value-label span')).toBeNull();
    });

    it('shows the modification drive select with one option per drive when isVFD is false', () => {
      createComponent(makeSetupForm({ drive: 1 }), makeSetupForm({ drive: 2 }), false);
      const select: HTMLSelectElement = getDriveItem().querySelector('select#drive2');
      expect(select).not.toBeNull();
      expect(select.querySelectorAll('option').length).toBe(Drives.length);
    });

    it('hides the modification drive select when isVFD is true', () => {
      createComponent(makeSetupForm({ drive: 1 }), makeSetupForm({ drive: 2 }), true);
      expect(getDriveItem().querySelector('select#drive2')).toBeNull();
    });
  });

  describe('template visibility: specified drive efficiency', () => {
    it('hides both specified drive efficiency fields when neither drive is the specified-efficiency drive', () => {
      createComponent(makeSetupForm({ drive: 1 }), makeSetupForm({ drive: 2 }));
      expect(getDriveItem().querySelector('#baselineSpecifiedDriveEfficiency')).toBeNull();
      expect(getDriveItem().querySelector('#modificationSpecifiedDriveEfficiency')).toBeNull();
    });

    it('shows only the baseline specified drive efficiency when only the baseline drive is specified-efficiency', () => {
      createComponent(makeSetupForm({ drive: SPECIFIED_DRIVE }), makeSetupForm({ drive: 2 }));
      expect(getDriveItem().querySelector('#baselineSpecifiedDriveEfficiency')).not.toBeNull();
      expect(getDriveItem().querySelector('#modificationSpecifiedDriveEfficiency')).toBeNull();
    });

    it('shows only the modification specified drive efficiency when only the modification drive is specified-efficiency', () => {
      createComponent(makeSetupForm({ drive: 1 }), makeSetupForm({ drive: SPECIFIED_DRIVE }));
      expect(getDriveItem().querySelector('#baselineSpecifiedDriveEfficiency')).toBeNull();
      expect(getDriveItem().querySelector('#modificationSpecifiedDriveEfficiency')).not.toBeNull();
    });

    it('shows the "Modification" prefix on the drive efficiency label when isVFD is false', () => {
      createComponent(makeSetupForm({ drive: 1 }), makeSetupForm({ drive: SPECIFIED_DRIVE }), false);
      expect(getDriveItem().querySelector('label[for="modificationSpecifiedDriveEfficiency"] span')).not.toBeNull();
    });

    it('hides the "Modification" prefix on the drive efficiency label when isVFD is true', () => {
      createComponent(makeSetupForm({ drive: 1 }), makeSetupForm({ drive: SPECIFIED_DRIVE }), true);
      expect(getDriveItem().querySelector('label[for="modificationSpecifiedDriveEfficiency"] span')).toBeNull();
    });

    it('hides drive efficiency errors when both fields are valid', () => {
      createComponent(makeSetupForm({ drive: SPECIFIED_DRIVE }), makeSetupForm({ drive: SPECIFIED_DRIVE }), true);
      expect(getDriveItem().querySelector('.alert-danger')).toBeNull();
    });

    it('hides drive efficiency errors when the fields are invalid but pristine', () => {
      createComponent(
        makeSetupForm({ drive: SPECIFIED_DRIVE, specifiedDriveEfficiency: null }),
        makeSetupForm({ drive: SPECIFIED_DRIVE, specifiedDriveEfficiency: null }),
        true
      );
      expect(getDriveItem().querySelector('.alert-danger')).toBeNull();
    });

    const driveEfficiencyErrorCases: Array<{ description: string, value: number | null, message: string }> = [
      { description: 'is empty', value: null, message: 'Value Required' },
      { description: 'exceeds the maximum', value: 101, message: "Value can't be greater than 100 %." },
      { description: 'is below the minimum', value: -1, message: "Value can't be less than 0 %." },
    ];

    driveEfficiencyErrorCases.forEach(({ description, value, message }) => {
      it(`shows only the "${message}" baseline error when the baseline drive efficiency ${description} and is dirty`, () => {
        const baselineForm: UntypedFormGroup = makeSetupForm({ drive: SPECIFIED_DRIVE, specifiedDriveEfficiency: value });
        baselineForm.controls.specifiedDriveEfficiency.markAsDirty();
        createComponent(baselineForm, makeSetupForm({ drive: SPECIFIED_DRIVE }), true);

        const forms: NodeListOf<HTMLElement> = getDriveItem().querySelectorAll('form');
        expect(getErrorMessages(forms[0]).map(text => text.replace(/\s+/g, ' '))).toEqual([message]);
        expect(getErrorMessages(forms[1])).toEqual([]);
      });

      it(`shows only the "${message}" modification error when the modification drive efficiency ${description} and is dirty`, () => {
        const modificationForm: UntypedFormGroup = makeSetupForm({ drive: SPECIFIED_DRIVE, specifiedDriveEfficiency: value });
        modificationForm.controls.specifiedDriveEfficiency.markAsDirty();
        createComponent(makeSetupForm({ drive: SPECIFIED_DRIVE }), modificationForm, true);

        const forms: NodeListOf<HTMLElement> = getDriveItem().querySelectorAll('form');
        expect(getErrorMessages(forms[1]).map(text => text.replace(/\s+/g, ' '))).toEqual([message]);
        expect(getErrorMessages(forms[0])).toEqual([]);
      });
    });
  });

  describe('template visibility: fan type item', () => {
    it('hides the fan type item and help text when there is no fan opportunity and isVFD is false', () => {
      createComponent(makeSetupForm(), makeSetupForm({ fanType: SPECIFIED_FAN_EFFICIENCY_TYPE, fanEfficiency: BASELINE_FAN_EFFICIENCY }), false);
      expect(getFanItem()).toBeUndefined();
      expect(getHelpItem()).toBeNull();
    });

    it('shows the fan type item and help item when there is a fan opportunity', () => {
      createComponent(makeSetupForm(), makeSetupForm({ fanType: 1 }), false);
      expect(getFanItem()).toBeDefined();
      expect(getHelpItem()).not.toBeNull();
    });

    it('shows the fan type item and help item when isVFD is true even without a fan opportunity', () => {
      createComponent(makeSetupForm(), makeSetupForm({ fanType: SPECIFIED_FAN_EFFICIENCY_TYPE, fanEfficiency: BASELINE_FAN_EFFICIENCY }), true);
      expect(getFanItem()).toBeDefined();
      expect(getHelpItem()).not.toBeNull();
    });

    it('shows the baseline fan type display name', () => {
      createComponent(makeSetupForm({ fanType: 0 }), makeSetupForm({ fanType: 1 }));
      expect(getFanItem().querySelector('.baseline-value-input').textContent).toContain('Airfoil (SWSI)');
    });

    it('shows the "Baseline" and "Modification" prefixes when isVFD is false', () => {
      createComponent(makeSetupForm(), makeSetupForm({ fanType: 1 }), false);
      expect(getFanItem().querySelector('label.baseline-value-label span')).not.toBeNull();
      expect(getFanItem().querySelector('label.mod-value-label span')).not.toBeNull();
      expect(getFanItem().querySelector('label.mod-eff-label span')).not.toBeNull();
    });

    it('hides the "Baseline" and "Modification" prefixes when isVFD is true and there is a fan opportunity', () => {
      createComponent(makeSetupForm(), makeSetupForm({ fanType: 1 }), true);
      expect(getFanItem().querySelector('label.baseline-value-label span')).toBeNull();
      expect(getFanItem().querySelector('label.mod-value-label span')).toBeNull();
      expect(getFanItem().querySelector('label.mod-eff-label span')).toBeNull();
    });

    it('shows the "Baseline" and "Modification" prefixes when isVFD is true but there is no fan opportunity', () => {
      createComponent(makeSetupForm(), makeSetupForm({ fanType: SPECIFIED_FAN_EFFICIENCY_TYPE, fanEfficiency: BASELINE_FAN_EFFICIENCY }), true);
      expect(getFanItem().querySelector('label.baseline-value-label span')).not.toBeNull();
      expect(getFanItem().querySelector('label.mod-eff-label span')).not.toBeNull();
    });
  });

  describe('template visibility: modification fan type is not specified-efficiency', () => {
    beforeEach(() => createComponent(makeSetupForm(), makeSetupForm({ fanType: 1, fanEfficiency: 72.5 })));

    it('shows the fan type select with one option per fan type', () => {
      const select: HTMLSelectElement = getFanItem().querySelector('select#modificationFanType');
      expect(select).not.toBeNull();
      expect(select.querySelectorAll('option').length).toBe(FanTypes.length);
    });

    it('shows the calculated efficiency text and the "Known Efficiency" link', () => {
      expect(getFanItem().querySelector('.flex-shrink-0').textContent).toContain('72.5 %');
      expect(getFanItem().querySelector('a.click-link').textContent).toContain('Known Efficiency');
    });

    it('hides the efficiency input and the "Optimize Fan" link', () => {
      expect(getFanItem().querySelector('#modificationFanSpecified')).toBeNull();
      expect(Array.from(getFanItem().querySelectorAll('a.click-link')).some(link => link.textContent.includes('Optimize Fan'))).toBeFalse();
    });

    it('shows the help text for a selected fan type and hides the baseline-efficiency help text', () => {
      const helpText: HTMLElement[] = Array.from(getHelpItem().querySelectorAll('.help-text'));
      expect(helpText.length).toBe(1);
      expect(helpText[0].textContent).toContain('Known Efficiency');
    });
  });

  describe('template visibility: modification fan type is specified-efficiency', () => {
    beforeEach(() => createComponent(makeSetupForm(), makeSetupForm({ fanType: SPECIFIED_FAN_EFFICIENCY_TYPE, fanEfficiency: 75 })));

    it('hides the fan type select', () => {
      expect(getFanItem().querySelector('select#modificationFanType')).toBeNull();
    });

    it('shows the efficiency input and the "Optimize Fan" link', () => {
      expect(getFanItem().querySelector('#modificationFanSpecified')).not.toBeNull();
      const links: HTMLElement[] = Array.from(getFanItem().querySelectorAll('a.click-link'));
      expect(links.length).toBe(1);
      expect(links[0].textContent).toContain('Optimize Fan');
    });

    it('hides the calculated efficiency text', () => {
      expect(getFanItem().querySelector('.flex-shrink-0')).toBeNull();
    });

    it('shows the baseline-efficiency help text and hides the selected-fan-type help text', () => {
      const helpText: HTMLElement[] = Array.from(getHelpItem().querySelectorAll('.help-text'));
      expect(helpText.length).toBe(1);
      expect(helpText[0].textContent).toContain('Optimize Fan');
    });
  });

  describe('template visibility: fan efficiency errors', () => {
    it('hides fan efficiency errors when the efficiency is valid', () => {
      createComponent(makeSetupForm(), makeSetupForm({ fanType: SPECIFIED_FAN_EFFICIENCY_TYPE, fanEfficiency: 75 }));
      expect(getFanItem().querySelector('.alert-danger')).toBeNull();
    });

    it('hides fan efficiency errors when the efficiency is invalid but pristine', () => {
      createComponent(makeSetupForm(), makeSetupForm({ fanType: SPECIFIED_FAN_EFFICIENCY_TYPE, fanEfficiency: null }));
      expect(getFanItem().querySelector('.alert-danger')).toBeNull();
    });

    const fanEfficiencyErrorCases: Array<{ description: string, value: number | null, message: string }> = [
      { description: 'is empty', value: null, message: 'Value Required' },
      { description: 'exceeds the maximum', value: 101, message: "Value can't be greater than 100 %." },
      { description: 'is below the minimum', value: -1, message: "Value can't be less than 0 %." },
    ];

    fanEfficiencyErrorCases.forEach(({ description, value, message }) => {
      it(`shows only the "${message}" error when the fan efficiency ${description} and is dirty`, () => {
        const modificationForm: UntypedFormGroup = makeSetupForm({ fanType: SPECIFIED_FAN_EFFICIENCY_TYPE, fanEfficiency: value });
        modificationForm.controls.fanEfficiency.markAsDirty();
        createComponent(makeSetupForm(), modificationForm);

        const messages: string[] = getErrorMessages(getFanItem()).map(text => text.replace(/\s+/g, ' '));
        expect(messages).toEqual([message]);
      });
    });
  });

  describe('toggleMotorDrive', () => {
    it('resets the modification drive to baseline and emits when the drive opportunity is unchecked', () => {
      createComponent(makeSetupForm({ drive: 1 }), makeSetupForm({ drive: 2 }));
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));

      fsat.modifications[0].exploreOppsShowDrive.hasOpportunity = false;
      component.toggleMotorDrive();

      expect(component.modificationForm.controls.drive.value).toBe(1);
      expect(emitted).toEqual([true]);
    });

    it('leaves the modification drive alone and does not emit when the drive opportunity is checked', () => {
      createComponent(makeSetupForm({ drive: 1 }), makeSetupForm({ drive: 2 }));
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));

      component.toggleMotorDrive();

      expect(component.modificationForm.controls.drive.value).toBe(2);
      expect(emitted).toEqual([]);
    });
  });

  describe('toggleFanType', () => {
    it('sets the modification to the specified-efficiency type with the baseline efficiency and emits when unchecked', () => {
      createComponent(makeSetupForm(), makeSetupForm({ fanType: 1 }));
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));

      fsat.modifications[0].exploreOppsShowFanType.hasOpportunity = false;
      component.toggleFanType();

      expect(component.modificationForm.controls.fanType.value).toBe(SPECIFIED_FAN_EFFICIENCY_TYPE);
      expect(component.modificationForm.controls.fanEfficiency.value).toBe(BASELINE_FAN_EFFICIENCY);
      expect(emitted).toEqual([true]);
    });

    it('does nothing when the fan type opportunity is checked', () => {
      createComponent(makeSetupForm(), makeSetupForm({ fanType: 1 }));
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));

      component.toggleFanType();

      expect(component.modificationForm.controls.fanType.value).toBe(1);
      expect(emitted).toEqual([]);
    });
  });

  describe('fan efficiency links', () => {
    it('clicking "Known Efficiency" switches to the specified-efficiency type with the baseline efficiency', () => {
      createComponent(makeSetupForm(), makeSetupForm({ fanType: 1, fanEfficiency: 72.5 }));
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));

      getFanItem().querySelector<HTMLElement>('a.click-link').click();
      fixture.detectChanges();

      expect(component.modificationForm.controls.fanType.value).toBe(SPECIFIED_FAN_EFFICIENCY_TYPE);
      expect(component.modificationForm.controls.fanEfficiency.value).toBe(BASELINE_FAN_EFFICIENCY);
      expect(emitted).toEqual([true]);
      expect(getFanItem().querySelector('#modificationFanSpecified')).not.toBeNull();
    });

    it('clicking "Optimize Fan" restores the baseline fan type and renders the optimal efficiency from the fsat service', () => {
      fsatServiceSpy.optimalFanEfficiency.and.returnValue(81.234);
      convertUnitsServiceSpy.roundVal.and.returnValue(81.23);
      createComponent(makeSetupForm({ fanType: 0 }), makeSetupForm({ fanType: SPECIFIED_FAN_EFFICIENCY_TYPE, fanEfficiency: 75 }));
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));

      getFanItem().querySelector<HTMLElement>('a.click-link').click();
      fixture.detectChanges();

      expect(fsatServiceSpy.optimalFanEfficiency).toHaveBeenCalledWith({
        fanType: 0,
        fanSpeed: 1780,
        inletPressure: -1,
        outletPressure: 5,
        flowRate: 1000,
        compressibility: 1,
      }, MOCK_SETTINGS);
      expect(convertUnitsServiceSpy.roundVal).toHaveBeenCalledWith(81.234, 2);
      expect(component.modificationForm.controls.fanEfficiency.value).toBe(81.23);
      expect(emitted).toEqual([true]);
      expect(getFanItem().querySelector('.flex-shrink-0').textContent).toContain('81.23 %');
    });
  });

  describe('changeDriveType', () => {
    it('replaces the modification form with the one returned by the fan setup service and emits', () => {
      const updatedForm: UntypedFormGroup = makeSetupForm({ drive: SPECIFIED_DRIVE });
      fanSetupServiceSpy.changeDriveType.and.returnValue(updatedForm);
      createComponent(makeSetupForm({ drive: 1 }), makeSetupForm({ drive: 2 }));
      const originalForm: UntypedFormGroup = component.modificationForm;
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));

      component.changeDriveType();

      expect(fanSetupServiceSpy.changeDriveType).toHaveBeenCalledWith(originalForm);
      expect(component.modificationForm).toBe(updatedForm);
      expect(emitted).toEqual([true]);
    });
  });
});
