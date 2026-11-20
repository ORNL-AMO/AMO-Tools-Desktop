import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { FanShaftPowerFormComponent } from './fan-shaft-power-form.component';
import { FanShaftPowerFormService } from './fan-shaft-power-form.service';
import { FanAnalysisService } from '../../fan-analysis.service';
import { ConvertFanAnalysisService } from '../../convert-fan-analysis.service';
import { PsatService } from '../../../../../psat/psat.service';
import { GasDensityFormService } from '../gas-density-form/gas-density-form.service';
import { PlaneDataFormService } from '../plane-data-form/plane-data-form.service';
import { FanInfoFormService } from '../fan-info-form/fan-info-form.service';
import { FsatService } from '../../../../../fsat/fsat.service';
import { FanShaftPower } from '../../../../../shared/models/fans';
import { Settings } from '../../../../../shared/models/settings';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

@Pipe({ name: 'sigFigs', standalone: false })
class SigFigsStubPipe implements PipeTransform {
  transform(value: number): string {
    return String(value);
  }
}

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', fanPowerMeasurement: 'hp' } as Settings;

function makeValidShaftPower(overrides: Partial<FanShaftPower> = {}): FanShaftPower {
  const service = new FanAnalysisService(null, null, null, null);
  return {
    ...service.getDefaultData().FanShaftPower,
    isMethodOne: true,
    synchronousSpeed: 1800,
    npv: 460,
    fla: 225,
    motorShaftPower: 150,
    efficiencyMotor: 95,
    ...overrides,
  };
}

function makeFanAnalysisService(shaftPower: FanShaftPower): FanAnalysisService {
  const service = new FanAnalysisService(null, null, null, null);
  service.inputData = service.getDefaultData();
  service.inputData.FanShaftPower = shaftPower;
  return service;
}

// Error messages per field: the value that triggers each message and the message text.
const FIELD_ERRORS: Array<{ name: string, cases: Array<{ value: number, message: string }> }> = [
  { name: 'synchronousSpeed', cases: [{ value: null, message: 'Value Required' }] },
  {
    name: 'npv', cases: [
      { value: null, message: 'Value Required' },
      { value: 20001, message: `Value can't be greater than 20000.` },
      { value: -1, message: `Value can't be less than 0.` },
    ]
  },
  { name: 'fullLoadAmps', cases: [{ value: null, message: 'Value Required' }] },
  {
    name: 'powerFactorAtLoad', cases: [
      { value: null, message: 'Value Required' },
      { value: 1.5, message: `Value can't be greater than 1.` },
    ]
  },
  {
    name: 'efficiencyMotor', cases: [
      { value: null, message: 'Value Required' },
      { value: 101, message: `Value can't be greater than 100.` },
    ]
  },
  {
    name: 'efficiencyBelt', cases: [
      { value: null, message: 'Value Required' },
      { value: 101, message: `Value can't be greater than 100.` },
      { value: -1, message: `Value can't be less than 0.` },
    ]
  },
];

const PHASE_ERRORS: Array<{ name: string, message: string }> = [
  { name: 'phase1Voltage', message: `Phase 1 voltage can't be less than 0.` },
  { name: 'phase1Amps', message: `Phase 1 current can't be less than 0.` },
  { name: 'phase2Voltage', message: `Phase 2 voltage can't be less than 0.` },
  { name: 'phase2Amps', message: `Phase 2 current can't be less than 0.` },
  { name: 'phase3Voltage', message: `Phase 3 voltage can't be less than 0.` },
  { name: 'phase3Amps', message: `Phase 3 current can't be less than 0.` },
];

describe('FanShaftPowerFormComponent', () => {
  let component: FanShaftPowerFormComponent;
  let fixture: ComponentFixture<FanShaftPowerFormComponent>;
  let fanAnalysisService: FanAnalysisService;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let fsatServiceSpy: jasmine.SpyObj<FsatService>;
  let planeDataValidSpy: jasmine.Spy;

  async function createComponent(shaftPower: FanShaftPower = makeValidShaftPower()) {
    fanAnalysisService = makeFanAnalysisService(shaftPower);
    const convertSpy = jasmine.createSpyObj('ConvertFanAnalysisService', ['convertNum']);
    convertSpy.convertNum.and.callFake((val: number) => val);
    psatServiceSpy = jasmine.createSpyObj('PsatService', ['estFanFLA']);
    psatServiceSpy.estFanFLA.and.returnValue(230.4);
    fsatServiceSpy = jasmine.createSpyObj('FsatService', ['fan203']);
    fsatServiceSpy.fan203.and.returnValue({ power: 180.25, powerCorrected: 175.75 } as any);
    planeDataValidSpy = jasmine.createSpy('checkPlaneDataValid').and.returnValue(true);
    const fanInfoFormServiceSpy = jasmine.createSpyObj('FanInfoFormService', ['getBasicsFormFromObject']);
    fanInfoFormServiceSpy.getBasicsFormFromObject.and.returnValue({ valid: true });
    const gasDensityFormServiceSpy = jasmine.createSpyObj('GasDensityFormService', ['getGasDensityFormFromObj']);
    gasDensityFormServiceSpy.getGasDensityFormFromObj.and.returnValue({ valid: true });

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FanShaftPowerFormComponent, SettingsLabelStubPipe, SigFigsStubPipe],
      providers: [
        FanShaftPowerFormService,
        UntypedFormBuilder,
        { provide: ConvertFanAnalysisService, useValue: convertSpy },
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: FanAnalysisService, useValue: fanAnalysisService },
        { provide: GasDensityFormService, useValue: gasDensityFormServiceSpy },
        { provide: PlaneDataFormService, useValue: { checkPlaneDataValid: planeDataValidSpy } },
        { provide: FanInfoFormService, useValue: fanInfoFormServiceSpy },
        { provide: FsatService, useValue: fsatServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FanShaftPowerFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  }

  function query(selector: string): HTMLElement {
    return fixture.nativeElement.querySelector(selector);
  }

  function field(name: string): HTMLElement {
    return query(`[formControlName="${name}"]`);
  }

  function clean(el: Element): string {
    return el.textContent.replace(/\s+/g, ' ').trim();
  }

  function groupFor(labelFor: string): HTMLElement {
    return query(`label[for="${labelFor}"]`).closest('.form-group') as HTMLElement;
  }

  function errorTexts(labelFor: string): Array<string> {
    return Array.from(groupFor(labelFor).querySelectorAll('.alert-danger span')).map(clean);
  }

  function setDirtyValue(name: string, value: any) {
    component.shaftPowerForm.controls[name].setValue(value);
    component.shaftPowerForm.controls[name].markAsDirty();
    fixture.detectChanges();
  }

  function optionTexts(name: string): Array<string> {
    return Array.from(field(name).querySelectorAll('option')).map(clean);
  }

  function resultText(labelFor: string): string {
    return clean(groupFor(labelFor).querySelector('.text-center'));
  }

  describe('initialization', () => {
    beforeEach(async () => await createComponent());

    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('builds the form from the shaft power input data', () => {
      expect(component.shaftPowerForm.controls.npv.value).toBe(460);
      expect(component.fanShaftPower).toBe(fanAnalysisService.inputData.FanShaftPower);
    });

    it('enables FLA estimation when the nameplate fields are valid', () => {
      expect(component.flaDisabled).toBeFalse();
    });

    it('calculates power results when every step is valid', () => {
      expect(fsatServiceSpy.fan203).toHaveBeenCalledWith(fanAnalysisService.inputData, MOCK_SETTINGS);
      expect(component.results).toEqual({ power: 180.25, powerCorrected: 175.75 });
    });
  });

  describe('calculation triggers', () => {
    it('does not calculate results while another step is incomplete', async () => {
      await createComponent();
      fsatServiceSpy.fan203.calls.reset();
      component.results = undefined;
      planeDataValidSpy.and.returnValue(false);
      component.save();
      expect(fsatServiceSpy.fan203).not.toHaveBeenCalled();
      expect(component.results).toBeUndefined();
    });

    it('recalculates results with new values on save', async () => {
      await createComponent();
      fsatServiceSpy.fan203.and.returnValue({ power: 90, powerCorrected: 85 } as any);
      component.shaftPowerForm.controls.efficiencyMotor.setValue(90);
      component.save();
      expect(fanAnalysisService.inputData.FanShaftPower.efficiencyMotor).toBe(90);
      expect(component.results).toEqual({ power: 90, powerCorrected: 85 });
    });

    it('calcAverageVoltage and calcAverageAmps average the phases and compute motor input power', async () => {
      await createComponent(makeValidShaftPower({ isMethodOne: false, powerFactorAtLoad: 0.9 }));
      component.shaftPowerForm.patchValue({ phase1Voltage: 460, phase2Voltage: 470, phase3Voltage: 480 });
      component.calcAverageVoltage();
      component.shaftPowerForm.patchValue({ phase1Amps: 10, phase2Amps: 20, phase3Amps: 30 });
      component.calcAverageAmps();
      expect(fanAnalysisService.inputData.FanShaftPower.voltage).toBe(470);
      expect(fanAnalysisService.inputData.FanShaftPower.amps).toBe(20);
      expect(component.shaftPowerForm.controls.motorShaftPower.value).toBeCloseTo(470 * 20 * Math.sqrt(3) * (0.9 / 745), 6);
    });
  });

  describe('user actions', () => {
    beforeEach(async () => await createComponent());

    it('estimateFla fills full load amps from the psat estimate', () => {
      component.estimateFla();
      expect(psatServiceSpy.estFanFLA).toHaveBeenCalledWith(200, 1800, 60, 1, 100, 460, MOCK_SETTINGS);
      expect(component.shaftPowerForm.controls.fullLoadAmps.value).toBe(230);
    });

    it('estimateFla does nothing while FLA estimation is disabled', () => {
      component.shaftPowerForm.controls.npv.setValue(null);
      component.save();
      expect(component.flaDisabled).toBeTrue();
      component.estimateFla();
      expect(psatServiceSpy.estFanFLA).not.toHaveBeenCalled();
    });

    it('setBeltEfficiency sets belt efficiency from the drive type', () => {
      component.shaftPowerForm.controls.driveType.setValue('V-Belt Drive');
      component.setBeltEfficiency();
      expect(component.shaftPowerForm.controls.efficiencyBelt.value).toBe(93);
    });

    it('setIsVfd resets VFD efficiency to 100', () => {
      component.shaftPowerForm.controls.efficiencyVFD.setValue(95);
      component.setIsVfd();
      expect(component.shaftPowerForm.controls.efficiencyVFD.value).toBe(100);
    });

    it('focusField sets the current field', () => {
      component.focusField('npv');
      expect(fanAnalysisService.currentField.value).toBe('npv');
    });

    it('rebuilds the form when resetForms emits true', () => {
      const original = component.shaftPowerForm;
      fanAnalysisService.resetForms.next(true);
      expect(component.shaftPowerForm).not.toBe(original);
    });
  });

  describe('template visibility', () => {
    describe('form', () => {
      beforeEach(async () => await createComponent());

      it('renders the form when it exists', () => {
        expect(query('form')).not.toBeNull();
      });

      it('renders nothing without a form', () => {
        component.shaftPowerForm = undefined;
        fixture.detectChanges();
        expect(query('form')).toBeNull();
      });
    });

    describe('select options', () => {
      beforeEach(async () => await createComponent());

      it('lists every rated horsepower with the power unit', () => {
        const options = optionTexts('ratedHP');
        expect(options.length).toBe(component.horsePowers.length);
        expect(options[0]).toBe('5 hp');
        expect(options[options.length - 1]).toBe('50000 hp');
      });

      it('lists line frequencies', () => {
        expect(optionTexts('frequency')).toEqual(['50 Hz', '60 Hz']);
      });

      it('lists efficiency classes', () => {
        expect(optionTexts('efficiencyClass')).toEqual(['Standard Efficiency', 'Energy Efficient', 'Premium Efficient']);
      });

      it('lists drive types', () => {
        expect(optionTexts('driveType')).toEqual(['Direct Drive', 'V-Belt Drive', 'Notched V-Belt Drive', 'Synchronous Belt Drive']);
      });
    });

    describe('validation messages', () => {
      beforeEach(async () => await createComponent());

      it('hides messages for invalid fields that are still pristine', () => {
        component.shaftPowerForm.controls.npv.setValue(null);
        fixture.detectChanges();
        expect(errorTexts('npv')).toEqual([]);
      });

      FIELD_ERRORS.forEach(f => {
        it(`hides the ${f.name} message when the value is valid`, () => {
          component.shaftPowerForm.controls[f.name].markAsDirty();
          fixture.detectChanges();
          expect(errorTexts(f.name)).toEqual([]);
        });

        f.cases.forEach(c => {
          it(`shows "${c.message}" for ${f.name} = ${c.value}`, () => {
            setDirtyValue(f.name, c.value);
            expect(errorTexts(f.name)).toEqual([c.message]);
          });
        });
      });

      // The greaterThan error value is the threshold (0), which is falsy, so its message never renders.
      ['powerFactorAtLoad', 'efficiencyMotor'].forEach(name => {
        it(`shows an empty alert for ${name} = 0`, () => {
          setDirtyValue(name, 0);
          expect(groupFor(name).querySelector('.alert-danger')).not.toBeNull();
          expect(errorTexts(name)).toEqual([]);
        });
      });

      it('shows the motor input power required message', () => {
        setDirtyValue('motorShaftPower', null);
        expect(errorTexts('motorShaftPower')).toEqual(['Value required.']);
      });
    });

    describe('VFD efficiency', () => {
      it('hides VFD efficiency when the fan has no VFD', async () => {
        await createComponent(makeValidShaftPower({ isVFD: 'No' }));
        expect(field('efficiencyVFD')).toBeNull();
      });

      it('shows VFD efficiency when the fan has a VFD', async () => {
        await createComponent(makeValidShaftPower({ isVFD: 'Yes' }));
        expect(field('efficiencyVFD')).not.toBeNull();
      });

      [
        { value: null, message: 'Value Required' },
        { value: 101, message: `Value can't be greater than 100.` },
        { value: -1, message: `Value can't be less than 0.` },
      ].forEach(c => {
        it(`shows "${c.message}" for efficiencyVFD = ${c.value}`, async () => {
          await createComponent(makeValidShaftPower({ isVFD: 'Yes' }));
          setDirtyValue('efficiencyVFD', c.value);
          expect(errorTexts('efficiencyVFD')).toEqual([c.message]);
        });
      });
    });

    describe('method one (known motor input power)', () => {
      beforeEach(async () => await createComponent(makeValidShaftPower({ isMethodOne: true })));

      it('shows the motor input power field', () => {
        expect(field('motorShaftPower')).not.toBeNull();
      });

      it('hides the phase data and calculated motor input power', () => {
        expect(field('phase1Voltage')).toBeNull();
        expect(groupFor('motorShaftPower').querySelector('.text-center')).toBeNull();
      });
    });

    describe('method two (calculated motor input power)', () => {
      beforeEach(async () => await createComponent(makeValidShaftPower({ isMethodOne: false, motorShaftPower: undefined })));

      function averages(): Array<string> {
        return Array.from(field('phase1Voltage').closest('.form-group').querySelectorAll('.text-center.w-50')).map(clean);
      }

      it('shows the phase data and hides the motor input power field', () => {
        expect(field('phase1Voltage')).not.toBeNull();
        expect(field('phase3Amps')).not.toBeNull();
        expect(field('motorShaftPower')).toBeNull();
      });

      it('shows placeholders when there are no averages or motor input power', () => {
        expect(averages()).toEqual(['— —', '— —']);
        expect(resultText('motorShaftPower')).toBe('— —');
      });

      it('shows calculated averages and motor input power', () => {
        component.shaftPowerForm.patchValue({ phase1Voltage: 460, phase2Voltage: 470, phase3Voltage: 480 });
        component.calcAverageVoltage();
        component.shaftPowerForm.patchValue({ phase1Amps: 10, phase2Amps: 20, phase3Amps: 30 });
        component.calcAverageAmps();
        fixture.detectChanges();
        expect(averages()).toEqual(['470', '20']);
        expect(resultText('motorShaftPower')).toBe(`${component.fanShaftPower.motorShaftPower} hp`);
      });

      it('hides phase messages when phase values are valid', () => {
        PHASE_ERRORS.forEach(p => component.shaftPowerForm.controls[p.name].markAsDirty());
        fixture.detectChanges();
        expect(errorTexts('phase1')).toEqual([]);
      });

      PHASE_ERRORS.forEach(p => {
        it(`shows only the ${p.name} message when it is negative`, () => {
          setDirtyValue(p.name, -1);
          expect(errorTexts('phase1')).toEqual([p.message]);
        });
      });
    });

    describe('results', () => {
      it('shows fan shaft power results', async () => {
        await createComponent();
        expect(resultText('power')).toBe('180.3 hp');
        expect(resultText('powerCorrected')).toBe('175.8 hp');
      });

      it('shows placeholders without results', async () => {
        await createComponent();
        component.results = undefined;
        fixture.detectChanges();
        expect(resultText('power')).toBe('— —');
        expect(resultText('powerCorrected')).toBe('— —');
      });

      it('shows placeholders when result values are zero', async () => {
        await createComponent();
        component.results = { power: 0, powerCorrected: 0 };
        fixture.detectChanges();
        expect(resultText('power')).toBe('— —');
        expect(resultText('powerCorrected')).toBe('— —');
      });
    });
  });

  describe('destroy', () => {
    it('stops rebuilding the form after the component is destroyed', async () => {
      await createComponent();
      const original = component.shaftPowerForm;
      fixture.destroy();
      fanAnalysisService.resetForms.next(true);
      expect(component.shaftPowerForm).toBe(original);
    });
  });
});
