import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { FanInfoFormComponent } from './fan-info-form.component';
import { FanInfoFormService } from './fan-info-form.service';
import { FanAnalysisService } from '../../fan-analysis.service';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../../shared/models/settings';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

const MOCK_SETTINGS = {
  unitsOfMeasure: 'Imperial',
  fanBarometricPressure: 'inHg',
  densityMeasurement: 'lbscf',
} as Settings;

// Fields with required/max/min messages, and the out-of-range values that trigger them.
const RANGED_FIELDS: Array<{ name: string, tooHigh: number, max: number, tooLow: number, min: number }> = [
  { name: 'fanSpeed', tooHigh: 5001, max: 5000, tooLow: -1, min: 0 },
  { name: 'motorSpeed', tooHigh: 3601, max: 3600, tooLow: -1, min: 0 },
  { name: 'globalBarometricPressure', tooHigh: 61, max: 60, tooLow: 9, min: 10 },
  { name: 'fanSpeedCorrected', tooHigh: 5001, max: 5000, tooLow: -1, min: 0 },
  { name: 'pressureBarometricCorrected', tooHigh: 61, max: 60, tooLow: 9, min: 10 },
];

function makeFanAnalysisService(): FanAnalysisService {
  const service = new FanAnalysisService(null, null, null, null);
  service.inputData = service.getDefaultData();
  return service;
}

describe('FanInfoFormComponent', () => {
  let component: FanInfoFormComponent;
  let fixture: ComponentFixture<FanInfoFormComponent>;
  let fanAnalysisService: FanAnalysisService;

  async function createComponent(options: { inModal?: boolean, inAssessmentModal?: boolean } = {}) {
    fanAnalysisService = makeFanAnalysisService();
    fanAnalysisService.inAssessmentModal = options.inAssessmentModal ?? false;

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FanInfoFormComponent, SettingsLabelStubPipe],
      providers: [
        FanInfoFormService,
        ConvertUnitsService,
        UntypedFormBuilder,
        { provide: FanAnalysisService, useValue: fanAnalysisService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FanInfoFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('inModal', options.inModal ?? false);
    fixture.detectChanges();
  }

  function field(name: string): HTMLElement {
    return fixture.nativeElement.querySelector(`[formControlName="${name}"]`);
  }

  function errorTexts(name: string): Array<string> | null {
    const alert = field(name).closest('.form-group').querySelector('.alert-danger');
    if (!alert) {
      return null;
    }
    return Array.from(alert.querySelectorAll('span')).map((el: HTMLElement) => el.textContent.replace(/\s+/g, ' ').trim());
  }

  function setDirtyValue(name: string, value: any) {
    component.ratedInfoForm.controls[name].setValue(value);
    component.ratedInfoForm.controls[name].markAsDirty();
    fixture.detectChanges();
  }

  describe('initialization', () => {
    beforeEach(async () => await createComponent());

    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('builds the form from the fan rated info', () => {
      expect(component.ratedInfoForm.controls.traversePlanes.value).toBe(2);
      expect(component.ratedInfoForm.controls.includesEvase.value).toBe('Yes');
    });

    it('keeps fields enabled outside the assessment modal', () => {
      expect(component.ratedInfoForm.controls.fanSpeed.enabled).toBeTrue();
    });
  });

  describe('in assessment modal', () => {
    it('disables speed and barometric pressure fields and pushes barometric pressure to planes', async () => {
      await createComponent({ inAssessmentModal: true });
      expect(component.ratedInfoForm.controls.fanSpeed.disabled).toBeTrue();
      expect(component.ratedInfoForm.controls.motorSpeed.disabled).toBeTrue();
      expect(component.ratedInfoForm.controls.globalBarometricPressure.disabled).toBeTrue();
      expect(fanAnalysisService.inputData.PlaneData.FlowTraverse.barometricPressure).toBe(29.92);
    });
  });

  describe('observers', () => {
    beforeEach(async () => await createComponent());

    it('rebuilds the form when resetForms emits true', () => {
      const original = component.ratedInfoForm;
      fanAnalysisService.inputData.FanRatedInfo.fanSpeed = 1500;
      fanAnalysisService.resetForms.next(true);
      expect(component.ratedInfoForm).not.toBe(original);
      expect(component.ratedInfoForm.controls.fanSpeed.value).toBe(1500);
    });

    it('keeps the form when resetForms emits false', () => {
      const original = component.ratedInfoForm;
      fanAnalysisService.resetForms.next(false);
      expect(component.ratedInfoForm).toBe(original);
    });
  });

  describe('user actions', () => {
    beforeEach(async () => await createComponent());

    it('save copies the form into input data and requests results', () => {
      const results: Array<boolean> = [];
      fanAnalysisService.getResults.subscribe(val => results.push(val));
      component.ratedInfoForm.controls.fanSpeed.setValue(1200);
      component.save();
      expect(fanAnalysisService.inputData.FanRatedInfo.fanSpeed).toBe(1200);
      expect(results.length).toBe(2);
    });

    it('updateBarometricPressure pushes the global pressure to every plane when there is no variation', () => {
      component.ratedInfoForm.controls.globalBarometricPressure.setValue(28);
      component.updateBarometricPressure();
      expect(fanAnalysisService.inputData.PlaneData.FanInletFlange.barometricPressure).toBe(28);
      expect(fanAnalysisService.inputData.PlaneData.OutletMstPlane.barometricPressure).toBe(28);
    });

    it('updateBarometricPressure leaves plane pressures when there is variation', () => {
      fanAnalysisService.inputData.PlaneData.variationInBarometricPressure = true;
      component.ratedInfoForm.controls.globalBarometricPressure.setValue(28);
      component.updateBarometricPressure();
      expect(fanAnalysisService.inputData.PlaneData.FanInletFlange.barometricPressure).toBe(29.92);
      expect(fanAnalysisService.inputData.FanRatedInfo.globalBarometricPressure).toBe(28);
    });

    it('focusField sets the current field', () => {
      component.focusField('fanSpeed');
      expect(fanAnalysisService.currentField.value).toBe('fanSpeed');
    });
  });

  describe('template visibility', () => {
    describe('validation messages', () => {
      beforeEach(async () => await createComponent());

      it('hides the message for an invalid field that is still pristine', () => {
        expect(component.ratedInfoForm.controls.fanSpeed.invalid).toBeTrue();
        expect(errorTexts('fanSpeed')).toBeNull();
      });

      RANGED_FIELDS.forEach(f => {
        it(`hides the ${f.name} message when the value is valid`, () => {
          setDirtyValue(f.name, f.min + 1);
          expect(errorTexts(f.name)).toBeNull();
        });

        it(`shows only the required message for ${f.name}`, () => {
          setDirtyValue(f.name, null);
          expect(errorTexts(f.name)).toEqual(['Value Required']);
        });

        it(`shows only the max message for ${f.name}`, () => {
          setDirtyValue(f.name, f.tooHigh);
          expect(errorTexts(f.name)).toEqual([`Value can't be greater than ${f.max}.`]);
        });

        it(`shows only the min message for ${f.name}`, () => {
          setDirtyValue(f.name, f.tooLow);
          expect(errorTexts(f.name)).toEqual([`Value can't be less than ${f.min}.`]);
        });
      });

      it('shows the required message for densityCorrected', () => {
        setDirtyValue('densityCorrected', null);
        expect(errorTexts('densityCorrected')).toEqual(['Value Required']);
      });

      it('hides the densityCorrected message when it has a value', () => {
        setDirtyValue('densityCorrected', 0.07);
        expect(errorTexts('densityCorrected')).toBeNull();
      });
    });

    describe('corrected values block', () => {
      it('shows the corrected fields outside a modal', async () => {
        await createComponent({ inModal: false });
        expect(field('fanSpeedCorrected')).not.toBeNull();
        expect(field('densityCorrected')).not.toBeNull();
        expect(field('pressureBarometricCorrected')).not.toBeNull();
      });

      it('hides the corrected fields in a modal', async () => {
        await createComponent({ inModal: true });
        expect(field('fanSpeedCorrected')).toBeNull();
        expect(field('densityCorrected')).toBeNull();
        expect(field('pressureBarometricCorrected')).toBeNull();
        expect(field('includesEvase')).not.toBeNull();
      });
    });

    describe('evase', () => {
      beforeEach(async () => await createComponent());

      it('shows the upstream/downstream select when the rating includes an evase', () => {
        expect(field('upDownStream')).not.toBeNull();
      });

      it('hides the upstream/downstream select when the rating does not include an evase', () => {
        component.ratedInfoForm.controls.includesEvase.setValue('No');
        fixture.detectChanges();
        expect(field('upDownStream')).toBeNull();
      });
    });

    describe('traverse plane options', () => {
      beforeEach(async () => await createComponent());

      it('lists one option per plane count', () => {
        const options = Array.from(field('traversePlanes').querySelectorAll('option'))
          .map((el: HTMLElement) => el.textContent.trim());
        expect(options).toEqual(['1', '2', '3']);
      });
    });
  });

  describe('destroy', () => {
    it('stops rebuilding the form after the component is destroyed', async () => {
      await createComponent();
      const original = component.ratedInfoForm;
      fixture.destroy();
      fanAnalysisService.resetForms.next(true);
      expect(component.ratedInfoForm).toBe(original);
    });
  });
});
