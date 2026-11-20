import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { FanSystemChecklistFormComponent } from './fan-system-checklist-form.component';
import { FanSystemChecklistService } from '../fan-system-checklist.service';
import { FanSystemChecklistFormService } from '../fan-system-checklist-form.service';
import { fanChecklistQuestions, FanSystemChecklistInput } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';

const IMPERIAL_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC_SETTINGS = { unitsOfMeasure: 'Metric' } as Settings;

const PRODUCTION_QUESTIONS = [
  'excessFlowOrPressure', 'unstableSystem', 'unreliableSystem', 'lowFlowOrPressure',
  'systemNoisy', 'fanBladeBuildup', 'weldingDuctwork', 'radialFanCleanAir'
];

function makeInput(name: string, motorPower: number = 50): FanSystemChecklistInput {
  return {
    operatingHours: 8760,
    motorPower: motorPower,
    fanType: 0,
    notes: '',
    name: name,
    control: { motorOverloads: 0, spillOrBypass: 0, dischargeDamper: 0, inletDamper: 0, variableInletVane: 0, systemDamper: 0, damperClosed: 0 },
    system: { turnRight: 0, turnNear: 0, dirtLeg: 0, noOutletDuct: 0, restrictedInlet: 0 },
    production: { excessFlowOrPressure: 0, unstableSystem: 0, unreliableSystem: 0, lowFlowOrPressure: 0, systemNoisy: 0, fanBladeBuildup: 0, weldingDuctwork: 0, radialFanCleanAir: 0 }
  };
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('FanSystemChecklistFormComponent', () => {
  let component: FanSystemChecklistFormComponent;
  let fixture: ComponentFixture<FanSystemChecklistFormComponent>;
  let checklistServiceSpy: jasmine.SpyObj<FanSystemChecklistService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function queryAll(selector: string): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll(selector));
  }

  function getErrorMessages(controlName: string): Array<string> {
    const container = query(`[formControlName="${controlName}"]`).closest('.form-group').querySelector('.alert-danger');
    if (!container) {
      return [];
    }
    return Array.from(container.children).map((child: HTMLElement) => normalize(child.textContent));
  }

  function createComponent(index: number = 0, settings: Settings = IMPERIAL_SETTINGS): void {
    fixture = TestBed.createComponent(FanSystemChecklistFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('index', index);
    fixture.componentRef.setInput('settings', settings);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    checklistServiceSpy = jasmine.createSpyObj('FanSystemChecklistService', ['removeEquipment', 'updateInputsArray'], {
      fanSystemChecklistInputs: new BehaviorSubject<Array<FanSystemChecklistInput>>([makeInput('Equipment #1', 50), makeInput('Equipment #2', 150)]),
      resetData: new BehaviorSubject<boolean>(undefined),
      generateExample: new BehaviorSubject<boolean>(undefined),
      currentField: new BehaviorSubject<string>(undefined),
    });

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FanSystemChecklistFormComponent],
      providers: [
        UntypedFormBuilder,
        FanSystemChecklistFormService,
        { provide: FanSystemChecklistService, useValue: checklistServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    beforeEach(() => createComponent(1));

    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('assigns the checklist questions', () => {
      expect(component.checklistQuestions).toBe(fanChecklistQuestions);
    });

    it('builds the form from the input at its index', () => {
      expect(component.form.controls.name.value).toBe('Equipment #2');
      expect(component.form.controls.motorPower.value).toBe(150);
    });
  });

  describe('observe resetData and generateExample', () => {
    beforeEach(() => createComponent(0));

    it('rebuilds the form from the current inputs when resetData emits', () => {
      checklistServiceSpy.fanSystemChecklistInputs.next([makeInput('Reset', 0)]);
      checklistServiceSpy.resetData.next(true);
      expect(component.form.controls.name.value).toBe('Reset');
    });

    it('rebuilds the form from the current inputs when generateExample emits', () => {
      checklistServiceSpy.fanSystemChecklistInputs.next([makeInput('Example', 1)]);
      checklistServiceSpy.generateExample.next(true);
      expect(component.form.controls.name.value).toBe('Example');
    });
  });

  describe('user actions', () => {
    it('removes the equipment at its index when index is greater than 0', () => {
      createComponent(1);
      component.removeEquipment();
      expect(checklistServiceSpy.removeEquipment).toHaveBeenCalledWith(1);
    });

    it('does not remove the first equipment', () => {
      createComponent(0);
      component.removeEquipment();
      expect(checklistServiceSpy.removeEquipment).not.toHaveBeenCalled();
    });

    it('pushes the focused field to the service', () => {
      createComponent(0);
      component.focusField('operatingHours');
      expect(checklistServiceSpy.currentField.getValue()).toBe('operatingHours');
    });

    it('sends the form input and index to updateInputsArray on calculate', () => {
      createComponent(1);
      component.form.controls.motorPower.setValue(300);
      component.calculate();
      const [updatedInput, index] = checklistServiceSpy.updateInputsArray.calls.mostRecent().args;
      expect(index).toBe(1);
      expect(updatedInput.motorPower).toBe(300);
      expect(updatedInput.name).toBe('Equipment #2');
    });

    it('sets a production radio value and recalculates', () => {
      createComponent(0);
      component.setFormControlRadioValue('systemNoisy', 2 as any);
      expect(component.form.controls.systemNoisy.value).toBe(2);
      expect(checklistServiceSpy.updateInputsArray.calls.mostRecent().args[0].production.systemNoisy).toBe(2);
    });

    it('sets a checkbox value as 1 or 0 and recalculates', () => {
      createComponent(0);
      component.setFormControlCheckbox({ target: { checked: true } }, 'dirtLeg');
      expect(component.form.controls.dirtLeg.value).toBe(1);
      expect(checklistServiceSpy.updateInputsArray.calls.mostRecent().args[0].system.dirtLeg).toBe(1);
      component.setFormControlCheckbox({ target: { checked: false } }, 'dirtLeg');
      expect(component.form.controls.dirtLeg.value).toBe(0);
    });

    it('updates operating hours from the modal, recalculates, and closes the modal', () => {
      createComponent(0);
      component.openOperatingHoursModal();
      component.updateOperatingHours({ hoursPerYear: 4000 } as any);
      expect(component.form.controls.operatingHours.value).toBe(4000);
      expect(checklistServiceSpy.updateInputsArray.calls.mostRecent().args[0].operatingHours).toBe(4000);
      expect(component.showOpHoursModal).toBeFalse();
    });
  });

  describe('template visibility', () => {
    describe('header', () => {
      it('shows the expanded chevron and form content when not collapsed', () => {
        createComponent(0);
        expect(query('.form-card > .d-flex > label .fa-chevron-down')).not.toBeNull();
        expect(query('.form-card > .d-flex > label .fa-chevron-right')).toBeNull();
        expect(query('[formControlName="motorPower"]')).not.toBeNull();
      });

      it('shows the collapsed chevron and hides form content when collapsed', () => {
        createComponent(0);
        component.toggleCollapse();
        fixture.detectChanges();
        expect(query('.form-card > .d-flex > label .fa-chevron-right')).not.toBeNull();
        expect(query('.form-card > .d-flex > label .fa-chevron-down')).toBeNull();
        expect(query('[formControlName="motorPower"]')).toBeNull();
        expect(query('form')).toBeNull();
      });

      it('hides the remove link for the first equipment', () => {
        createComponent(0);
        expect(query('.form-card > .d-flex > label a.text-danger')).toBeNull();
        expect(normalize(query('.form-card > .d-flex > label').textContent)).toBe('Equipment # 1');
      });

      it('shows the remove link for later equipment', () => {
        createComponent(1);
        expect(normalize(query('.form-card > .d-flex > label a.text-danger').textContent)).toBe('Remove Equipment');
        expect(normalize(query('.form-card > .d-flex > label').textContent)).toBe('Equipment # 2 Remove Equipment');
      });
    });

    describe('motor power units', () => {
      it('shows hp for Imperial settings', () => {
        createComponent(0, IMPERIAL_SETTINGS);
        const units = query('[formControlName="motorPower"]').parentElement.querySelectorAll('.units');
        expect(Array.from(units).map((unit: HTMLElement) => unit.textContent.trim())).toEqual(['hp']);
      });

      it('shows kW for Metric settings', () => {
        createComponent(0, METRIC_SETTINGS);
        const units = query('[formControlName="motorPower"]').parentElement.querySelectorAll('.units');
        expect(Array.from(units).map((unit: HTMLElement) => unit.textContent.trim())).toEqual(['kW']);
      });

      it('shows no unit for other unit systems', () => {
        createComponent(0, { unitsOfMeasure: 'Other' } as Settings);
        const units = query('[formControlName="motorPower"]').parentElement.querySelectorAll('.units');
        expect(units.length).toBe(0);
      });
    });

    describe('validation messages', () => {
      beforeEach(() => createComponent(0));

      it('hides motor power errors when valid', () => {
        expect(getErrorMessages('motorPower')).toEqual([]);
      });

      it('shows the motor power required message when it has a required error and is dirty', () => {
        component.form.controls.motorPower.markAsDirty();
        component.form.controls.motorPower.setErrors({ required: true });
        fixture.detectChanges();
        expect(getErrorMessages('motorPower')).toEqual(['Value required.']);
      });

      it('hides operating hours errors when valid', () => {
        expect(getErrorMessages('operatingHours')).toEqual([]);
      });

      it('hides operating hours errors when invalid but pristine', () => {
        component.form.controls.operatingHours.setValue(null);
        fixture.detectChanges();
        expect(getErrorMessages('operatingHours')).toEqual([]);
      });

      const OPERATING_HOURS_CASES: Array<{ value: number | null, message: string }> = [
        { value: null, message: 'Value required.' },
        { value: 9000, message: "Value can't be greater than 8760." },
        { value: -1, message: "Value can't be less than 0." },
      ];
      OPERATING_HOURS_CASES.forEach(testCase => {
        it(`shows only "${testCase.message}" for operating hours ${testCase.value}`, () => {
          component.form.controls.operatingHours.setValue(testCase.value);
          component.form.controls.operatingHours.markAsDirty();
          fixture.detectChanges();
          expect(getErrorMessages('operatingHours')).toEqual([testCase.message]);
        });
      });
    });

    describe('production options', () => {
      beforeEach(() => createComponent(0));

      it('renders No, Yes, and Severe buttons for every production question', () => {
        PRODUCTION_QUESTIONS.forEach(question => {
          const buttons = queryAll(`button[id="${question}0"]`);
          expect(buttons.map(button => normalize(button.textContent))).withContext(question).toEqual(['No', 'Yes', 'Severe']);
        });
        expect(queryAll('button.toggle-btn').length).toBe(PRODUCTION_QUESTIONS.length * 3);
      });

      it('sets the clicked option value on the form', () => {
        queryAll('button[id="unstableSystem0"]')[2].click();
        expect(component.form.controls.unstableSystem.value).toBe(2);
      });
    });

    describe('notes', () => {
      beforeEach(() => createComponent(0));

      it('hides the notes textarea and shows the collapsed chevron by default', () => {
        expect(query('textarea[formControlName="notes"]')).toBeNull();
        expect(query('div.mb-2 > label .fa-chevron-right')).not.toBeNull();
        expect(query('div.mb-2 > label .fa-chevron-down')).toBeNull();
      });

      it('shows the notes textarea and expanded chevron after toggling notes', () => {
        component.toggleNotes();
        fixture.detectChanges();
        expect(query('textarea[formControlName="notes"]')).not.toBeNull();
        expect(query('div.mb-2 > label .fa-chevron-down')).not.toBeNull();
        expect(query('div.mb-2 > label .fa-chevron-right')).toBeNull();
      });

      it('hides the notes textarea when notes are displayed but the equipment is collapsed', () => {
        component.toggleNotes();
        component.toggleCollapse();
        fixture.detectChanges();
        expect(query('textarea[formControlName="notes"]')).toBeNull();
      });
    });

    describe('operating hours modal', () => {
      beforeEach(() => createComponent(0));

      it('hides the operating hours modal by default', () => {
        expect(query('app-operating-hours-modal')).toBeNull();
      });

      it('shows the operating hours modal when opened', () => {
        component.openOperatingHoursModal();
        fixture.detectChanges();
        expect(query('app-operating-hours-modal')).not.toBeNull();
      });

      it('shows the operating hours modal even when the equipment is collapsed', () => {
        component.toggleCollapse();
        component.openOperatingHoursModal();
        fixture.detectChanges();
        expect(query('app-operating-hours-modal')).not.toBeNull();
      });

      it('hides the operating hours modal after closing', () => {
        component.openOperatingHoursModal();
        fixture.detectChanges();
        component.closeOperatingHoursModal();
        fixture.detectChanges();
        expect(query('app-operating-hours-modal')).toBeNull();
      });
    });
  });

  describe('destroy', () => {
    it('stops rebuilding the form after the component is destroyed', () => {
      createComponent(0);
      const formBefore = component.form;
      fixture.destroy();
      checklistServiceSpy.resetData.next(true);
      checklistServiceSpy.generateExample.next(true);
      expect(component.form).toBe(formBefore);
    });
  });
});
