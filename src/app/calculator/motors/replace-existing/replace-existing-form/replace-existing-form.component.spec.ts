import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ReplaceExistingFormComponent } from './replace-existing-form.component';
import { ReplaceExistingService } from '../replace-existing.service';
import { Settings } from '../../../../shared/models/settings';
import { OperatingHours } from '../../../../shared/models/operations';

// Mirrors ReplaceExistingService.getFormFromObj validators.
function makeForm(): UntypedFormGroup {
  return new UntypedFormGroup({
    operatingHours: new UntypedFormControl(8760, [Validators.required, Validators.min(0)]),
    motorSize: new UntypedFormControl(150, [Validators.required, Validators.min(0)]),
    load: new UntypedFormControl(75, [Validators.required, Validators.min(0), Validators.max(100)]),
    electricityCost: new UntypedFormControl(0.066, [Validators.required, Validators.min(0)]),
    newEfficiency: new UntypedFormControl(96, [Validators.required, Validators.min(0), Validators.max(100)]),
    existingEfficiency: new UntypedFormControl(92, [Validators.required, Validators.min(0), Validators.max(100)]),
    purchaseCost: new UntypedFormControl(13000, [Validators.required, Validators.min(0)]),
    rewindEfficiencyLoss: new UntypedFormControl(1, [Validators.required, Validators.min(0), Validators.max(100)]),
    rewindCost: new UntypedFormControl(8000, [Validators.required, Validators.min(0)]),
  });
}

interface FieldErrorCase {
  field: string;
  minMessage: string;
  maxMessage?: string;
  treasureHuntHidden?: boolean;
}

const FIELD_ERROR_CASES: Array<FieldErrorCase> = [
  { field: 'operatingHours', minMessage: 'Value cannot not be lower than 0 hrs/yr.' },
  { field: 'load', minMessage: 'Value cannot not be lower than 0%.', maxMessage: 'Value cannot not be greater than 100%.' },
  { field: 'electricityCost', minMessage: 'Value cannot not be lower than 0 $/kWh.' },
  { field: 'existingEfficiency', minMessage: 'Value cannot not be lower than 0%.', maxMessage: 'Value cannot not be greater than 100%.' },
  { field: 'newEfficiency', minMessage: 'Value cannot not be lower than 0%.', maxMessage: 'Value cannot not be greater than 100%.' },
  { field: 'purchaseCost', minMessage: 'Value cannot not be lower than $0.' },
  { field: 'rewindEfficiencyLoss', minMessage: 'Value cannot not be lower than 0%.', maxMessage: 'Value cannot not be greater than 100%.', treasureHuntHidden: true },
  { field: 'rewindCost', minMessage: 'Value cannot not be lower than $0.', treasureHuntHidden: true },
];

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('ReplaceExistingFormComponent', () => {
  let component: ReplaceExistingFormComponent;
  let fixture: ComponentFixture<ReplaceExistingFormComponent>;
  let form: UntypedFormGroup;
  let serviceStub: Partial<ReplaceExistingService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  // The field's own error span is a direct child of its .form-group
  // (newEfficiency's group also contains the nested purchaseCost group).
  function getFieldAlert(field: string): HTMLElement | null {
    const formGroup = query('#' + field).closest('.form-group');
    return formGroup.querySelector(':scope > span.alert-danger');
  }

  function getAlertMessages(field: string): Array<string> {
    const alert = getFieldAlert(field);
    return Array.from(alert.querySelectorAll(':scope > span')).map((span: HTMLElement) => normalize(span.textContent));
  }

  function getGroupLabels(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('label.group-label'))
      .map((label: HTMLElement) => label.textContent.trim());
  }

  function setDirtyValue(field: string, value: number | null): void {
    form.controls[field].setValue(value);
    form.controls[field].markAsDirty();
    fixture.detectChanges();
  }

  function render(inputs: { unitsOfMeasure?: string, inTreasureHunt?: boolean } = {}): void {
    fixture.componentRef.setInput('replaceExistingForm', form);
    fixture.componentRef.setInput('settings', { unitsOfMeasure: inputs.unitsOfMeasure ?? 'Imperial' } as Settings);
    fixture.componentRef.setInput('inTreasureHunt', inputs.inTreasureHunt ?? false);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    serviceStub = { operatingHours: undefined };
    form = makeForm();

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ReplaceExistingFormComponent],
      providers: [{ provide: ReplaceExistingService, useValue: serviceStub }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReplaceExistingFormComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('creates the component and binds the form values', () => {
      render();
      expect(component).toBeTruthy();
      expect((query('#motorSize') as HTMLInputElement).value).toBe('150');
    });

    it('renders no validation errors for a valid, pristine form', () => {
      render();
      expect(fixture.nativeElement.querySelectorAll('.alert-danger').length).toBe(0);
    });
  });

  describe('field validation messages', () => {
    FIELD_ERROR_CASES.forEach(testCase => {
      describe(testCase.field, () => {
        beforeEach(() => {
          render();
        });

        it('hides the error while the invalid control is pristine', () => {
          form.controls[testCase.field].setValue(null);
          fixture.detectChanges();
          expect(getFieldAlert(testCase.field)).toBeNull();
        });

        it('hides the error when the dirty control is valid', () => {
          setDirtyValue(testCase.field, 5);
          expect(getFieldAlert(testCase.field)).toBeNull();
        });

        it('shows only the required message when empty', () => {
          setDirtyValue(testCase.field, null);
          expect(getAlertMessages(testCase.field)).toEqual(['Value required.']);
        });

        it('shows only the min message when below the minimum', () => {
          setDirtyValue(testCase.field, -1);
          expect(getAlertMessages(testCase.field)).toEqual([testCase.minMessage]);
        });

        if (testCase.maxMessage) {
          it('shows only the max message when above the maximum', () => {
            setDirtyValue(testCase.field, 101);
            expect(getAlertMessages(testCase.field)).toEqual([testCase.maxMessage]);
          });
        }
      });
    });
  });

  describe('motor size units', () => {
    it('shows hp for imperial settings', () => {
      render({ unitsOfMeasure: 'Imperial' });
      const units = Array.from(query('#motorSize').parentElement.querySelectorAll('.units'))
        .map((unit: HTMLElement) => unit.textContent.trim());
      expect(units).toEqual(['hp']);
    });

    it('shows kW for metric settings', () => {
      render({ unitsOfMeasure: 'Metric' });
      const units = Array.from(query('#motorSize').parentElement.querySelectorAll('.units'))
        .map((unit: HTMLElement) => unit.textContent.trim());
      expect(units).toEqual(['kW']);
    });

    it('hides the motor size error while pristine', () => {
      render();
      form.controls.motorSize.setValue(null);
      fixture.detectChanges();
      expect(getFieldAlert('motorSize')).toBeNull();
    });

    it('shows the required motor size message', () => {
      render();
      setDirtyValue('motorSize', null);
      expect(getAlertMessages('motorSize')).toEqual(['Value required.']);
    });

    it('shows the min motor size message in hp for imperial settings', () => {
      render({ unitsOfMeasure: 'Imperial' });
      setDirtyValue('motorSize', -1);
      // Whitespace-insensitive: the unit spans sit between template whitespace.
      expect(getAlertMessages('motorSize').map(message => message.replace(/\s/g, ''))).toEqual(['Valuecannotnotbelowerthan0hp.']);
    });

    it('shows the min motor size message in kW for metric settings', () => {
      render({ unitsOfMeasure: 'Metric' });
      setDirtyValue('motorSize', -1);
      expect(getAlertMessages('motorSize').map(message => message.replace(/\s/g, ''))).toEqual(['Valuecannotnotbelowerthan0kW.']);
    });
  });

  describe('treasure hunt visibility', () => {
    it('shows the rewound motor fields outside treasure hunt', () => {
      render({ inTreasureHunt: false });
      expect(getGroupLabels()).toEqual(['Existing Motor', 'Replacement Motor', 'Rewound Motor']);
      expect(query('#rewindEfficiencyLoss')).not.toBeNull();
      expect(query('#rewindCost')).not.toBeNull();
    });

    it('hides the rewound motor fields in treasure hunt', () => {
      render({ inTreasureHunt: true });
      expect(getGroupLabels()).toEqual(['Existing Motor', 'Replacement Motor']);
      expect(query('#rewindEfficiencyLoss')).toBeNull();
      expect(query('#rewindCost')).toBeNull();
    });

    it('keeps the shared fields in treasure hunt', () => {
      render({ inTreasureHunt: true });
      ['operatingHours', 'motorSize', 'load', 'electricityCost', 'existingEfficiency', 'newEfficiency', 'purchaseCost']
        .forEach(field => expect(query('#' + field)).withContext(field).not.toBeNull());
    });

    it('does not render rewound field errors in treasure hunt even when invalid', () => {
      render({ inTreasureHunt: true });
      setDirtyValue('rewindCost', null);
      setDirtyValue('rewindEfficiencyLoss', null);
      expect(fixture.nativeElement.querySelectorAll('.alert-danger').length).toBe(0);
    });
  });

  describe('operating hours modal', () => {
    beforeEach(() => {
      render();
    });

    it('is hidden initially', () => {
      expect(query('app-operating-hours-modal')).toBeNull();
    });

    it('opens from the calculator link', () => {
      (query('a.click-link') as HTMLElement).click();
      fixture.detectChanges();
      expect(component.showOperatingHoursModal).toBeTrue();
      expect(query('app-operating-hours-modal')).not.toBeNull();
    });

    it('closes when closeOperatingHoursModal is called', () => {
      component.openOperatingHoursModal();
      fixture.detectChanges();
      component.closeOperatingHoursModal();
      fixture.detectChanges();
      expect(query('app-operating-hours-modal')).toBeNull();
    });

    it('saves operating hours to the service and form, recalculates and closes', () => {
      const calculateSpy = jasmine.createSpy('emitCalculate');
      component.emitCalculate.subscribe(calculateSpy);
      const operatingHours = { hoursPerYear: 4000 } as OperatingHours;
      component.openOperatingHoursModal();
      fixture.detectChanges();

      component.updateOperatingHours(operatingHours);
      fixture.detectChanges();

      expect(serviceStub.operatingHours).toBe(operatingHours);
      expect(form.controls.operatingHours.value).toBe(4000);
      expect(calculateSpy).toHaveBeenCalledWith(true);
      expect(query('app-operating-hours-modal')).toBeNull();
    });
  });

  describe('user actions', () => {
    beforeEach(() => {
      render();
    });

    it('emits calculate when a field is edited', () => {
      const calculateSpy = jasmine.createSpy('emitCalculate');
      component.emitCalculate.subscribe(calculateSpy);
      query('#load').dispatchEvent(new Event('input'));
      expect(calculateSpy).toHaveBeenCalledWith(true);
    });

    it('emits the focused field name', () => {
      const changeFieldSpy = jasmine.createSpy('emitChangeField');
      component.emitChangeField.subscribe(changeFieldSpy);
      query('#rewindCost').dispatchEvent(new Event('focus'));
      expect(changeFieldSpy).toHaveBeenCalledWith('rewindCost');
    });
  });
});
