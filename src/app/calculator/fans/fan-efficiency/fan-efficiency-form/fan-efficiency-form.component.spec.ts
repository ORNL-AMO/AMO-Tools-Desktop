import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { FanEfficiencyFormComponent } from './fan-efficiency-form.component';
import { FanTypes } from '../../../../fsat/fanOptions';
import { Settings } from '../../../../shared/models/settings';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

const MOCK_SETTINGS = { fanPressureMeasurement: 'inH2o', fanFlowRate: 'ft3/min' } as Settings;

function makeFanEfficiencyForm(): UntypedFormGroup {
  return new UntypedFormBuilder().group({
    fanType: [0, Validators.required],
    fanSpeed: [1180, [Validators.required, Validators.min(0)]],
    inletPressure: [-16.36, [Validators.required, Validators.max(0)]],
    outletPressure: [1.1, [Validators.required, Validators.min(0)]],
    flowRate: [129691, Validators.required],
    compressibility: [0.988, Validators.required]
  });
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('FanEfficiencyFormComponent', () => {
  let component: FanEfficiencyFormComponent;
  let fixture: ComponentFixture<FanEfficiencyFormComponent>;
  let form: UntypedFormGroup;

  function getErrorContainer(inputId: string): HTMLElement | null {
    return fixture.nativeElement.querySelector('#' + inputId).closest('.form-group').querySelector('.alert-danger');
  }

  function getErrorMessages(inputId: string): Array<string> {
    const container = getErrorContainer(inputId);
    if (!container) {
      return [];
    }
    return Array.from(container.children).map((child: HTMLElement) => normalize(child.textContent));
  }

  function setDirtyValue(controlName: string, value: number | null): void {
    form.controls[controlName].setValue(value);
    form.controls[controlName].markAsDirty();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FanEfficiencyFormComponent, SettingsLabelStubPipe],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    form = makeFanEfficiencyForm();
    fixture = TestBed.createComponent(FanEfficiencyFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('fanEfficiencyForm', form);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('assigns the fan type options', () => {
      expect(component.fanTypes).toBe(FanTypes);
    });
  });

  describe('fan type options', () => {
    it('renders one option per fan type with its display text', () => {
      const options = Array.from(fixture.nativeElement.querySelectorAll('#fanType option'))
        .map((option: HTMLElement) => normalize(option.textContent));
      expect(options).toEqual(FanTypes.map(fanType => fanType.display));
    });
  });

  describe('user actions', () => {
    it('emits the focused field name through emitChange', () => {
      const emitted: Array<string> = [];
      component.emitChange.subscribe((value: string) => emitted.push(value));
      component.focusField('fanSpeed');
      expect(emitted).toEqual(['fanSpeed']);
    });

    it('emits true through calculate', () => {
      const emitted: Array<boolean> = [];
      component.calculate.subscribe((value: boolean) => emitted.push(value));
      component.emitCalculate();
      expect(emitted).toEqual([true]);
    });
  });

  describe('template visibility', () => {
    const FIELDS: Array<{ inputId: string, controlName: string }> = [
      { inputId: 'fanSpeed', controlName: 'fanSpeed' },
      { inputId: 'inletPressure', controlName: 'inletPressure' },
      { inputId: 'outletPressure', controlName: 'outletPressure' },
      { inputId: 'flowRate', controlName: 'flowRate' },
      { inputId: 'compressibilityFactor', controlName: 'compressibility' },
    ];

    FIELDS.forEach(field => {
      it(`hides the ${field.controlName} error container when the value is valid`, () => {
        expect(getErrorContainer(field.inputId)).toBeNull();
      });

      it(`hides the ${field.controlName} error container when the value is invalid but pristine`, () => {
        form.controls[field.controlName].setValue(null);
        fixture.detectChanges();
        expect(getErrorContainer(field.inputId)).toBeNull();
      });

      it(`shows only the required message for ${field.controlName} when it is empty and dirty`, () => {
        setDirtyValue(field.controlName, null);
        expect(getErrorMessages(field.inputId)).toEqual(['Value required.']);
      });
    });

    it('shows only the min message for fanSpeed below 0', () => {
      setDirtyValue('fanSpeed', -1);
      expect(getErrorMessages('fanSpeed')).toEqual(["Value can't be less than 0 rpm."]);
    });

    it('shows only the max message for inletPressure above 0', () => {
      setDirtyValue('inletPressure', 1);
      expect(getErrorMessages('inletPressure')).toEqual(["Value can't be greater than 0 inH2o"]);
    });

    it('shows only the min message for outletPressure below the template min of 0.1', () => {
      setDirtyValue('outletPressure', 0.05);
      expect(getErrorMessages('outletPressure')).toEqual(["Value can't be less than 0.1 inH2o"]);
    });
  });
});
