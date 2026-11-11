import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { RatedMotorFormComponent } from './rated-motor-form.component';
import { MotorService } from '../../../motor/motor.service';
import { PsatService } from '../../../psat.service';
import { Modification } from '../../../../shared/models/psat';
import { Settings } from '../../../../shared/models/settings';
import { motorEfficiencyConstants } from '../../../psatConstants';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

function makeMotorForm(overrides: { efficiencyClass?: number; efficiency?: number; fullLoadAmps?: number } = {}): UntypedFormGroup {
  return new UntypedFormGroup({
    efficiencyClass: new UntypedFormControl(overrides.efficiencyClass ?? 1),
    efficiency: new UntypedFormControl(overrides.efficiency ?? 90, [Validators.required, Validators.max(100), Validators.min(0)]),
    fullLoadAmps: new UntypedFormControl(overrides.fullLoadAmps ?? 10),
  });
}

function makeModification(): Modification {
  return {
    id: 'mod-1',
    psat: {
      inputs: { operating_hours: 8760, fluidType: 'water', fluidTemperature: 60, whatIfScenario: true },
      name: 'Mod 1',
    },
  };
}

describe('RatedMotorFormComponent', () => {
  let component: RatedMotorFormComponent;
  let fixture: ComponentFixture<RatedMotorFormComponent>;
  let motorServiceSpy: jasmine.SpyObj<MotorService>;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;

  function setupComponent(target: RatedMotorFormComponent) {
    target.settings = MOCK_SETTINGS;
    target.exploreModIndex = 0;
    target.baselineForm = makeMotorForm({ efficiencyClass: 1, efficiency: 90, fullLoadAmps: 10 });
    target.modificationForm = makeMotorForm({ efficiencyClass: 1, efficiency: 90, fullLoadAmps: 10 });
    target.baselineWarnings = { rpmError: '', voltageError: '', flaError: '', ratedPowerError: '' };
    target.modificationWarnings = { rpmError: '', voltageError: '', flaError: '', ratedPowerError: '' };
    target.currentModification = makeModification();
  }

  beforeEach(async () => {
    motorServiceSpy = jasmine.createSpyObj('MotorService', ['updateFormEfficiencyValidators', 'disableFLA']);
    motorServiceSpy.updateFormEfficiencyValidators.and.callFake((form: UntypedFormGroup) => form);
    motorServiceSpy.disableFLA.and.returnValue(false);

    psatServiceSpy = jasmine.createSpyObj('PsatService', ['setFormFullLoadAmps']);
    psatServiceSpy.setFormFullLoadAmps.and.callFake((form: UntypedFormGroup) => form);

    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [RatedMotorFormComponent],
      providers: [
        { provide: MotorService, useValue: motorServiceSpy },
        { provide: PsatService, useValue: psatServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RatedMotorFormComponent);
    component = fixture.componentInstance;
    setupComponent(component);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('assigns the efficiency class constants', () => {
      expect(component.efficiencyClasses).toBe(motorEfficiencyConstants);
    });

    it('hides efficiency class/motor efficiency and marks no opportunity when baseline and modification match', () => {
      expect(component.showEfficiencyClass).toBeFalse();
      expect(component.showMotorEfficiency).toBeFalse();
      expect(component.currentModification.exploreOppsShowRatedMotorData).toEqual({ hasOpportunity: false, display: 'Install More Efficient Motor' });
    });

    it('shows efficiency class and marks an opportunity when baseline and modification efficiency class differ', () => {
      const freshFixture = TestBed.createComponent(RatedMotorFormComponent);
      const freshComponent = freshFixture.componentInstance;
      setupComponent(freshComponent);
      freshComponent.modificationForm = makeMotorForm({ efficiencyClass: 2, efficiency: 90, fullLoadAmps: 10 });

      freshFixture.detectChanges();

      expect(freshComponent.showEfficiencyClass).toBeTrue();
      expect(freshComponent.currentModification.exploreOppsShowRatedMotorData).toEqual({ hasOpportunity: true, display: 'Install More Efficient Motor' });
    });

    it('shows motor efficiency and marks an opportunity when baseline and modification efficiency differ', () => {
      const freshFixture = TestBed.createComponent(RatedMotorFormComponent);
      const freshComponent = freshFixture.componentInstance;
      setupComponent(freshComponent);
      freshComponent.modificationForm = makeMotorForm({ efficiencyClass: 1, efficiency: 95, fullLoadAmps: 10 });

      freshFixture.detectChanges();

      expect(freshComponent.showMotorEfficiency).toBeTrue();
      expect(freshComponent.currentModification.exploreOppsShowRatedMotorData.hasOpportunity).toBeTrue();
    });

    it('emits emitCalculate as part of the initial calculation', () => {
      const freshFixture = TestBed.createComponent(RatedMotorFormComponent);
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
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe(v => emitted.push(v));

      component.ngOnChanges({ exploreModIndex: new SimpleChange(undefined, 0, true) });

      expect(emitted).toEqual([]);
    });

    it('re-runs init when exploreModIndex changes after the first change', () => {
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe(v => emitted.push(v));

      component.ngOnChanges({ exploreModIndex: new SimpleChange(0, 0, false) });

      expect(emitted).toEqual([true]);
    });
  });

  describe('toggleRatedMotorData', () => {
    it('resets efficiency class, efficiency, and FLA to baseline values when there is no opportunity', () => {
      component.currentModification.exploreOppsShowRatedMotorData = { hasOpportunity: false, display: 'Install More Efficient Motor' };
      component.baselineForm.controls.efficiencyClass.setValue(2);
      component.baselineForm.controls.efficiency.setValue(93);
      component.baselineForm.controls.fullLoadAmps.setValue(12);
      component.showEfficiencyClass = true;
      component.showMotorEfficiency = true;

      component.toggleRatedMotorData();

      expect(component.modificationForm.controls.efficiencyClass.value).toBe(2);
      expect(component.modificationForm.controls.efficiency.value).toBe(93);
      expect(component.modificationForm.controls.fullLoadAmps.value).toBe(12);
      expect(component.showEfficiencyClass).toBeFalse();
      expect(component.showMotorEfficiency).toBeFalse();
    });

    it('does nothing when there is an opportunity', () => {
      component.currentModification.exploreOppsShowRatedMotorData = { hasOpportunity: true, display: 'Install More Efficient Motor' };
      component.modificationForm.controls.fullLoadAmps.setValue(99);

      component.toggleRatedMotorData();

      expect(component.modificationForm.controls.fullLoadAmps.value).toBe(99);
    });
  });

  describe('changeBaselineEfficiencyClass', () => {
    it('updates baseline efficiency validators and recalculates', () => {
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe(v => emitted.push(v));
      motorServiceSpy.updateFormEfficiencyValidators.calls.reset();

      component.changeBaselineEfficiencyClass();

      expect(motorServiceSpy.updateFormEfficiencyValidators).toHaveBeenCalledWith(component.baselineForm);
      expect(emitted).toEqual([true]);
    });
  });

  describe('changeModificationEfficiencyClass', () => {
    it('updates modification efficiency validators, updates FLA, and recalculates', () => {
      motorServiceSpy.updateFormEfficiencyValidators.calls.reset();
      motorServiceSpy.disableFLA.and.returnValue(false);
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe(v => emitted.push(v));

      component.changeModificationEfficiencyClass();

      expect(motorServiceSpy.updateFormEfficiencyValidators).toHaveBeenCalledWith(component.modificationForm);
      expect(psatServiceSpy.setFormFullLoadAmps).toHaveBeenCalledWith(component.modificationForm, component.settings);
      // calculate() fires once inside getModificationFLA() and once more explicitly afterward.
      expect(emitted).toEqual([true, true]);
    });
  });

  describe('getModificationFLA', () => {
    it('recalculates full load amps when FLA is not disabled', () => {
      motorServiceSpy.disableFLA.and.returnValue(false);

      component.getModificationFLA();

      expect(psatServiceSpy.setFormFullLoadAmps).toHaveBeenCalledWith(component.modificationForm, component.settings);
    });

    it('does not recalculate full load amps when FLA is disabled', () => {
      motorServiceSpy.disableFLA.and.returnValue(true);
      psatServiceSpy.setFormFullLoadAmps.calls.reset();

      component.getModificationFLA();

      expect(psatServiceSpy.setFormFullLoadAmps).not.toHaveBeenCalled();
    });

    it('emits emitCalculate regardless of whether FLA is disabled', () => {
      motorServiceSpy.disableFLA.and.returnValue(true);
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe(v => emitted.push(v));

      component.getModificationFLA();

      expect(emitted).toEqual([true]);
    });
  });

  describe('disableFla', () => {
    it('returns the result of motorService.disableFLA for the modification form', () => {
      motorServiceSpy.disableFLA.and.returnValue(true);

      expect(component.disableFla()).toBeTrue();
      expect(motorServiceSpy.disableFLA).toHaveBeenCalledWith(component.modificationForm);
    });
  });

  describe('focusField', () => {
    it('emits changeField with the given field name', () => {
      const emitted: string[] = [];
      component.changeField.subscribe(v => emitted.push(v));

      component.focusField('efficiencyClass');

      expect(emitted).toEqual(['efficiencyClass']);
    });
  });

  describe('template visibility', () => {
    it('hides the rated motor data section when there is no opportunity', () => {
      expect(fixture.nativeElement.querySelector('#modificationEfficiencyClass')).toBeNull();
    });

    it('shows the rated motor data section when there is an opportunity', () => {
      component.currentModification.exploreOppsShowRatedMotorData.hasOpportunity = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#modificationEfficiencyClass')).not.toBeNull();
    });

    it('hides the baseline motor efficiency field when baseline efficiencyClass is not Specified (3)', () => {
      component.currentModification.exploreOppsShowRatedMotorData.hasOpportunity = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('label[for="baselineMotorEfficiency"]')).toBeNull();
    });

    it('shows the baseline motor efficiency field when baseline efficiencyClass is Specified (3)', () => {
      component.currentModification.exploreOppsShowRatedMotorData.hasOpportunity = true;
      component.baselineForm.controls.efficiencyClass.setValue(3);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('label[for="baselineMotorEfficiency"]')).not.toBeNull();
    });

    it('shows the baseline efficiency required error when invalid and dirty', () => {
      component.currentModification.exploreOppsShowRatedMotorData.hasOpportunity = true;
      component.baselineForm.controls.efficiencyClass.setValue(3);
      component.baselineForm.controls.efficiency.setValue(null);
      component.baselineForm.controls.efficiency.markAsDirty();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Value Required');
    });

    it('hides the modification motor efficiency field when modification efficiencyClass is not Specified (3)', () => {
      component.currentModification.exploreOppsShowRatedMotorData.hasOpportunity = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#modificationMotorEfficiency')).toBeNull();
    });

    it('shows the modification motor efficiency field when modification efficiencyClass is Specified (3)', () => {
      component.currentModification.exploreOppsShowRatedMotorData.hasOpportunity = true;
      component.modificationForm.controls.efficiencyClass.setValue(3);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#modificationMotorEfficiency')).not.toBeNull();
    });

    it('shows the modification efficiency required error when invalid and dirty', () => {
      component.currentModification.exploreOppsShowRatedMotorData.hasOpportunity = true;
      component.modificationForm.controls.efficiencyClass.setValue(3);
      component.modificationForm.controls.efficiency.setValue(null);
      component.modificationForm.controls.efficiency.markAsDirty();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Value Required');
    });
  });
});
