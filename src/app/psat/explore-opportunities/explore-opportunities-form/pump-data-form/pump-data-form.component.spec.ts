import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { PumpDataFormComponent } from './pump-data-form.component';
import { PumpFluidService } from '../../../pump-fluid/pump-fluid.service';
import { PsatService } from '../../../psat.service';
import { PSAT, PsatInputs, PsatOutputs } from '../../../../shared/models/psat';
import { Settings } from '../../../../shared/models/settings';
import { pumpTypesConstant } from '../../../psatConstants';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', flowMeasurement: 'gpm', distanceMeasurement: 'ft' } as Settings;
const BASELINE_PUMP_EFFICIENCY = 80;

function makePsatInputs(overrides: Partial<PsatInputs> = {}): PsatInputs {
  return {
    operating_hours: 8760,
    fluidType: 'water',
    fluidTemperature: 60,
    flow_rate: 100,
    pump_rated_speed: 1780,
    kinematic_viscosity: 1.0,
    stages: 1,
    head: 100,
    ...overrides,
  };
}

function makePsat(): PSAT {
  return {
    inputs: makePsatInputs(),
    modifications: [
      {
        id: 'mod-1',
        psat: { inputs: makePsatInputs(), name: 'Mod 1' },
      },
    ],
  };
}

function makePumpDataForm(overrides: { pumpType?: number; specifiedPumpEfficiency?: number; drive?: number; specifiedDriveEfficiency?: number } = {}): UntypedFormGroup {
  return new UntypedFormGroup({
    pumpType: new UntypedFormControl(overrides.pumpType ?? 11),
    specifiedPumpEfficiency: new UntypedFormControl(overrides.specifiedPumpEfficiency ?? BASELINE_PUMP_EFFICIENCY, [Validators.required, Validators.max(100), Validators.min(0)]),
    drive: new UntypedFormControl(overrides.drive ?? 0),
    specifiedDriveEfficiency: new UntypedFormControl(overrides.specifiedDriveEfficiency ?? 95, [Validators.required, Validators.max(100), Validators.min(0)]),
  });
}

describe('PumpDataFormComponent', () => {
  let component: PumpDataFormComponent;
  let fixture: ComponentFixture<PumpDataFormComponent>;
  let pumpFluidServiceSpy: jasmine.SpyObj<PumpFluidService>;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;

  function setupComponent(target: PumpDataFormComponent) {
    target.settings = MOCK_SETTINGS;
    target.exploreModIndex = 0;
    target.isVFD = false;
    target.psat = makePsat();
    target.baselineForm = makePumpDataForm({ pumpType: 0, drive: 0 });
    target.modificationForm = makePumpDataForm({ pumpType: 11, drive: 0, specifiedPumpEfficiency: BASELINE_PUMP_EFFICIENCY });
  }

  beforeEach(async () => {
    pumpFluidServiceSpy = jasmine.createSpyObj('PumpFluidService', ['updateSpecifiedPumpEfficiency', 'updateSpecifiedDriveEfficiency']);
    pumpFluidServiceSpy.updateSpecifiedPumpEfficiency.and.callFake((form: UntypedFormGroup) => form);
    pumpFluidServiceSpy.updateSpecifiedDriveEfficiency.and.callFake((form: UntypedFormGroup) => form);

    psatServiceSpy = jasmine.createSpyObj('PsatService', ['resultsExisting', 'pumpEfficiency']);
    psatServiceSpy.resultsExisting.and.returnValue({ pump_efficiency: BASELINE_PUMP_EFFICIENCY } as PsatOutputs);
    psatServiceSpy.pumpEfficiency.and.returnValue({ average: 0.7, max: 0.8 });

    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [PumpDataFormComponent],
      providers: [
        { provide: PumpFluidService, useValue: pumpFluidServiceSpy },
        { provide: PsatService, useValue: psatServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PumpDataFormComponent);
    component = fixture.componentInstance;
    setupComponent(component);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('drops the last pump type option from the constant list', () => {
      expect(component.pumpTypes.length).toBe(pumpTypesConstant.length - 1);
    });

    it('sets baselinePumpEfficiency from the baseline psat results', () => {
      expect(psatServiceSpy.resultsExisting).toHaveBeenCalledWith(component.psat.inputs, component.settings);
      expect(component.baselinePumpEfficiency).toBe(BASELINE_PUMP_EFFICIENCY);
    });

    it('sets exploreOppsShowMotorDrive based on whether baseline and modification drive match', () => {
      expect(component.psat.modifications[0].exploreOppsShowMotorDrive).toEqual({ hasOpportunity: false, display: 'Install More Efficient Drive' });
    });

    it('sets exploreOppsShowPumpType based on whether specified efficiency matches the baseline', () => {
      expect(component.psat.modifications[0].exploreOppsShowPumpType).toEqual({ hasOpportunity: false, display: 'Install More Efficient Pump' });
    });

    it('emits emitCalculate as part of the initial calculation', () => {
      const freshFixture = TestBed.createComponent(PumpDataFormComponent);
      const freshComponent = freshFixture.componentInstance;
      setupComponent(freshComponent);
      const emitted: boolean[] = [];
      freshComponent.emitCalculate.subscribe(v => emitted.push(v));

      freshFixture.detectChanges();

      expect(emitted).toEqual([true]);
    });
  });

  describe('ngOnChanges', () => {
    it('does not re-run init when exploreModIndex changes for the first time', () => {
      psatServiceSpy.pumpEfficiency.calls.reset();
      component.ngOnChanges({ exploreModIndex: new SimpleChange(undefined, 0, true) });
      // init() does not call pumpEfficiency directly; verify no crash and motor drive flag recomputed instead
      expect(component.psat.modifications[0].exploreOppsShowMotorDrive).toBeDefined();
    });

    it('sets modification drive to VFD (4) and updates drive efficiency when isVFD becomes true', () => {
      component.isVFD = true;
      component.ngOnChanges({ isVFD: new SimpleChange(false, true, false) });

      expect(component.modificationForm.controls.drive.value).toBe(4);
      expect(pumpFluidServiceSpy.updateSpecifiedDriveEfficiency).toHaveBeenCalledWith(component.modificationForm);
    });

    it('resets modification drive to the baseline value and clears the motor drive opportunity when isVFD becomes false', () => {
      component.baselineForm.controls.drive.setValue(2);
      component.isVFD = false;
      component.ngOnChanges({ isVFD: new SimpleChange(true, false, false) });

      expect(component.modificationForm.controls.drive.value).toBe(2);
      expect(component.psat.modifications[0].exploreOppsShowMotorDrive.hasOpportunity).toBeFalse();
    });

    it('does not react to isVFD on the first change', () => {
      pumpFluidServiceSpy.updateSpecifiedDriveEfficiency.calls.reset();
      component.ngOnChanges({ isVFD: new SimpleChange(undefined, false, true) });
      expect(pumpFluidServiceSpy.updateSpecifiedDriveEfficiency).not.toHaveBeenCalled();
    });
  });

  describe('toggleMotorDrive', () => {
    it('resets modification drive to the baseline value and recalculates when there is no drive opportunity', () => {
      component.psat.modifications[0].exploreOppsShowMotorDrive = { hasOpportunity: false, display: 'Install More Efficient Drive' };
      component.baselineForm.controls.drive.setValue(3);
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe(v => emitted.push(v));

      component.toggleMotorDrive();

      expect(component.modificationForm.controls.drive.value).toBe(3);
      expect(emitted).toEqual([true]);
    });

    it('does nothing when there is a drive opportunity', () => {
      component.psat.modifications[0].exploreOppsShowMotorDrive = { hasOpportunity: true, display: 'Install More Efficient Drive' };
      component.modificationForm.controls.drive.setValue(1);
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe(v => emitted.push(v));

      component.toggleMotorDrive();

      expect(component.modificationForm.controls.drive.value).toBe(1);
      expect(emitted).toEqual([]);
    });
  });

  describe('togglePumpType', () => {
    it('disables specified pump type, resets efficiency and pumpType to 11, and recalculates when there is no pump type opportunity', () => {
      component.psat.modifications[0].exploreOppsShowPumpType = { hasOpportunity: false, display: 'Install More Efficient Pump' };
      component.modificationForm.controls.pumpType.setValue(3);

      component.togglePumpType();

      expect(component.modificationForm.controls.specifiedPumpEfficiency.value).toBe(BASELINE_PUMP_EFFICIENCY);
      expect(component.modificationForm.controls.pumpType.value).toBe(11);
    });

    it('does nothing when there is a pump type opportunity', () => {
      component.psat.modifications[0].exploreOppsShowPumpType = { hasOpportunity: true, display: 'Install More Efficient Pump' };
      component.modificationForm.controls.pumpType.setValue(3);

      component.togglePumpType();

      expect(component.modificationForm.controls.pumpType.value).toBe(3);
    });
  });

  describe('enablePumpType', () => {
    it('restores the baseline pump type, enables the control, and recalculates efficiency', () => {
      component.baselineForm.controls.pumpType.setValue(5);
      component.modificationForm.controls.pumpType.disable();

      component.enablePumpType();

      expect(component.modificationForm.controls.pumpType.value).toBe(5);
      expect(component.modificationForm.controls.pumpType.enabled).toBeTrue();
      expect(psatServiceSpy.pumpEfficiency).toHaveBeenCalled();
    });
  });

  describe('disablePumpType', () => {
    it('sets specified efficiency to the baseline efficiency and pumpType to 11', () => {
      component.disablePumpType();

      expect(component.modificationForm.controls.specifiedPumpEfficiency.value).toBe(BASELINE_PUMP_EFFICIENCY);
      expect(component.modificationForm.controls.pumpType.value).toBe(11);
    });
  });

  describe('getPumpEfficiency', () => {
    it('computes and patches specifiedPumpEfficiency from the psatService result, then recalculates', () => {
      psatServiceSpy.pumpEfficiency.and.returnValue({ average: 0.7, max: 0.85 });
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe(v => emitted.push(v));
      const modInputs = component.psat.modifications[0].psat.inputs;

      component.getPumpEfficiency();

      expect(psatServiceSpy.pumpEfficiency).toHaveBeenCalledWith(
        component.modificationForm.controls.pumpType.value,
        modInputs.flow_rate,
        modInputs.pump_rated_speed,
        modInputs.kinematic_viscosity,
        modInputs.stages,
        modInputs.head,
        100,
        component.settings
      );
      expect(component.modificationForm.controls.specifiedPumpEfficiency.value).toBe(85);
      expect(emitted).toEqual([true]);
    });
  });

  describe('setPumpTypes', () => {
    it('updates specified pump efficiency validators and recalculates pump efficiency', () => {
      pumpFluidServiceSpy.updateSpecifiedPumpEfficiency.calls.reset();

      component.setPumpTypes();

      expect(pumpFluidServiceSpy.updateSpecifiedPumpEfficiency).toHaveBeenCalledWith(component.modificationForm);
      expect(psatServiceSpy.pumpEfficiency).toHaveBeenCalled();
    });
  });

  describe('setMotorDrive', () => {
    it('updates specified drive efficiency validators and recalculates', () => {
      pumpFluidServiceSpy.updateSpecifiedDriveEfficiency.calls.reset();
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe(v => emitted.push(v));

      component.setMotorDrive();

      expect(pumpFluidServiceSpy.updateSpecifiedDriveEfficiency).toHaveBeenCalledWith(component.modificationForm);
      expect(emitted).toEqual([true]);
    });
  });

  describe('focusField', () => {
    it('emits changeField with the given field name', () => {
      const emitted: string[] = [];
      component.changeField.subscribe(v => emitted.push(v));

      component.focusField('drive');

      expect(emitted).toEqual(['drive']);
    });
  });

  describe('template visibility', () => {
    it('shows the motor drive checkbox when isVFD is false', () => {
      expect(fixture.nativeElement.querySelector('#modifyMotorDrive')).not.toBeNull();
    });

    it('hides the motor drive checkbox when isVFD is true', () => {
      component.isVFD = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#modifyMotorDrive')).toBeNull();
    });

    it('hides the motor drive section when there is no opportunity and isVFD is false', () => {
      expect(fixture.nativeElement.querySelector('label[for="baselineMotorDrive"]')).toBeNull();
    });

    it('shows the motor drive section when there is a drive opportunity', () => {
      component.psat.modifications[0].exploreOppsShowMotorDrive.hasOpportunity = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('label[for="baselineMotorDrive"]')).not.toBeNull();
    });

    it('shows the motor drive section when isVFD is true even without an opportunity', () => {
      component.isVFD = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('label[for="baselineMotorDrive"]')).not.toBeNull();
    });

    it('hides the baseline drive efficiency field when baseline drive is not Specified Efficiency (4)', () => {
      component.isVFD = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[formcontrolname="specifiedDriveEfficiency"]')).toBeNull();
    });

    it('shows the baseline drive efficiency field when baseline drive is Specified Efficiency (4)', () => {
      component.isVFD = true;
      component.baselineForm.controls.drive.setValue(4);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('input[name="baselineSpecifiedDriveEfficiency"]')).not.toBeNull();
    });

    it('hides the baseline drive efficiency error when the control is valid', () => {
      component.isVFD = true;
      component.baselineForm.controls.drive.setValue(4);
      component.baselineForm.controls.specifiedDriveEfficiency.setValue(50);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Value Required');
    });

    it('shows the baseline drive efficiency required error when the control is invalid and dirty', () => {
      component.isVFD = true;
      component.baselineForm.controls.drive.setValue(4);
      component.baselineForm.controls.specifiedDriveEfficiency.setValue(null);
      component.baselineForm.controls.specifiedDriveEfficiency.markAsDirty();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Value Required');
    });

    it('hides the modification drive select when isVFD is true', () => {
      component.isVFD = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#modificationMotorDrive')).toBeNull();
    });

    it('shows the modification drive select when there is a drive opportunity and isVFD is false', () => {
      component.psat.modifications[0].exploreOppsShowMotorDrive.hasOpportunity = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#modificationMotorDrive')).not.toBeNull();
    });

    it('hides the modification drive efficiency field when modification drive is not Specified Efficiency (4)', () => {
      component.isVFD = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#modificationSpecifiedDriveEfficiency')).toBeNull();
    });

    it('shows the modification drive efficiency field when modification drive is Specified Efficiency (4)', () => {
      component.isVFD = true;
      component.modificationForm.controls.drive.setValue(4);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#modificationSpecifiedDriveEfficiency')).not.toBeNull();
    });

    it('shows the modification drive efficiency required error when invalid and dirty', () => {
      component.isVFD = true;
      component.modificationForm.controls.drive.setValue(4);
      component.modificationForm.controls.specifiedDriveEfficiency.setValue(null);
      component.modificationForm.controls.specifiedDriveEfficiency.markAsDirty();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Value Required');
    });

    it('shows the pump type checkbox when isVFD is false', () => {
      expect(fixture.nativeElement.querySelector('#modifyPumpType')).not.toBeNull();
    });

    it('hides the pump type checkbox when isVFD is true', () => {
      component.isVFD = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#modifyPumpType')).toBeNull();
    });

    it('hides the pump type section when there is no opportunity and isVFD is false', () => {
      expect(fixture.nativeElement.querySelector('label[for="baselinePumpType"]')).toBeNull();
    });

    it('shows the pump type section when there is a pump type opportunity', () => {
      component.psat.modifications[0].exploreOppsShowPumpType.hasOpportunity = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('label[for="baselinePumpType"]')).not.toBeNull();
    });

    it('hides the modification pump type select when pumpType is 11 (specified)', () => {
      component.isVFD = true;
      component.modificationForm.controls.pumpType.setValue(11);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#modificationPumpType')).toBeNull();
    });

    it('shows the modification pump type select when pumpType is not 11', () => {
      component.isVFD = true;
      component.modificationForm.controls.pumpType.setValue(3);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#modificationPumpType')).not.toBeNull();
    });

    it('shows the Optimize Pump link and specified efficiency input when pumpType is 11', () => {
      component.isVFD = true;
      component.modificationForm.controls.pumpType.setValue(11);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Optimize Pump');
      expect(fixture.nativeElement.textContent).not.toContain('Known Efficiency');
      expect(fixture.nativeElement.querySelector('#modificationPumpSpecifiedEfficiency')).not.toBeNull();
    });

    it('shows the Known Efficiency link and the read-only efficiency value when pumpType is not 11', () => {
      component.isVFD = true;
      component.modificationForm.controls.pumpType.setValue(3);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Known Efficiency');
      expect(fixture.nativeElement.textContent).not.toContain('Optimize Pump');
      expect(fixture.nativeElement.querySelector('#modificationPumpSpecifiedEfficiency')).toBeNull();
    });

    it('shows the specified pump efficiency required error when invalid and dirty', () => {
      component.isVFD = true;
      component.modificationForm.controls.pumpType.setValue(11);
      component.modificationForm.controls.specifiedPumpEfficiency.setValue(null);
      component.modificationForm.controls.specifiedPumpEfficiency.markAsDirty();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Value Required');
    });

    it('hides the pump type help text block when there is no opportunity and isVFD is false', () => {
      expect(fixture.nativeElement.textContent).not.toContain('The efficiency of your pump has been calculated');
    });

    it('shows the optimize-pump help text when pumpType is 11 and there is an opportunity', () => {
      component.psat.modifications[0].exploreOppsShowPumpType.hasOpportunity = true;
      component.modificationForm.controls.pumpType.setValue(11);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('to estimate your pump efficiency based on');
    });

    it('shows the known-efficiency help text when pumpType is not 11 and there is an opportunity', () => {
      component.psat.modifications[0].exploreOppsShowPumpType.hasOpportunity = true;
      component.modificationForm.controls.pumpType.setValue(3);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('to use the efficiency calculated by your baseline');
    });
  });
});
