import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { PlaneInfoFormComponent } from './plane-info-form.component';
import { PlaneDataFormService } from '../plane-data-form.service';
import { FanAnalysisService } from '../../../fan-analysis.service';
import { ConvertUnitsService } from '../../../../../../shared/convert-units/convert-units.service';
import { Fan203Inputs } from '../../../../../../shared/models/fans';
import { Settings } from '../../../../../../shared/models/settings';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

const MOCK_SETTINGS = {
  unitsOfMeasure: 'Imperial',
  fanPressureMeasurement: 'inH2o',
  fanBarometricPressure: 'inHg',
  fanTemperatureMeasurement: 'F',
  fanFlowRate: 'ft3/min',
} as Settings;

function makeInputData(): Fan203Inputs {
  const data = FanAnalysisService.prototype.getDefaultData();
  Object.assign(data.PlaneData, {
    totalPressureLossBtwnPlanes1and4: 1.5,
    totalPressureLossBtwnPlanes2and5: 2.5,
    inletSEF: 2,
    outletSEF: 3,
  });
  return data;
}

function makeFanAnalysisServiceMock(inputData: Fan203Inputs) {
  const mock = jasmine.createSpyObj('FanAnalysisService', ['updateBarometricPressure']);
  mock.inputData = inputData;
  mock.getResults = new BehaviorSubject<boolean>(true);
  mock.resetForms = new BehaviorSubject<boolean>(false);
  mock.currentField = new BehaviorSubject<string>('default');
  return mock;
}

function text(el: Element): string {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : null;
}

describe('PlaneInfoFormComponent', () => {
  let component: PlaneInfoFormComponent;
  let fixture: ComponentFixture<PlaneInfoFormComponent>;
  let fanAnalysisServiceMock: any;
  let inputData: Fan203Inputs;

  beforeEach(async () => {
    inputData = makeInputData();
    fanAnalysisServiceMock = makeFanAnalysisServiceMock(inputData);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PlaneInfoFormComponent, SettingsLabelStubPipe],
      providers: [
        PlaneDataFormService,
        ConvertUnitsService,
        { provide: FanAnalysisService, useValue: fanAnalysisServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaneInfoFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  });

  function alertFor(controlName: string): Element {
    const input = fixture.nativeElement.querySelector(`[formControlName="${controlName}"]`);
    return input.closest('.form-group').querySelector('.alert-danger');
  }

  function setDirty(controlName: string, value: any) {
    const control = component.planeInfoForm.controls[controlName];
    control.setValue(value);
    control.markAsDirty();
    fixture.detectChanges();
  }

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('builds the form from the plane data', () => {
      expect(component.planeInfoForm.value).toEqual({
        totalPressureLossBtwnPlanes1and4: 1.5,
        totalPressureLossBtwnPlanes2and5: 2.5,
        inletSEF: 2,
        outletSEF: 3,
        variationInBarometricPressure: false,
      });
    });

    it('sums the system effect factors and renders the total', () => {
      expect(component.sumSEF).toBe(5);
      expect(text(fixture.nativeElement.querySelector('.sef-results'))).toBe('5 inH2o');
    });
  });

  describe('save', () => {
    it('writes the form back to the plane data, re-sums, and requests results', () => {
      spyOn(fanAnalysisServiceMock.getResults, 'next').and.callThrough();
      component.planeInfoForm.controls.inletSEF.setValue(4);
      component.save();
      fixture.detectChanges();
      expect(inputData.PlaneData.inletSEF).toBe(4);
      expect(component.sumSEF).toBe(7);
      expect(text(fixture.nativeElement.querySelector('.sef-results'))).toBe('7 inH2o');
      expect(fanAnalysisServiceMock.getResults.next).toHaveBeenCalledWith(true);
    });
  });

  describe('updateBarometricPressure', () => {
    it('updates the global barometric pressure when there is no variation', () => {
      component.planeInfoForm.controls.variationInBarometricPressure.setValue(false);
      component.updateBarometricPressure();
      expect(fanAnalysisServiceMock.updateBarometricPressure).toHaveBeenCalled();
      expect(inputData.PlaneData.variationInBarometricPressure).toBe(false);
    });

    it('does not update the global barometric pressure when there is variation', () => {
      component.planeInfoForm.controls.variationInBarometricPressure.setValue(true);
      component.updateBarometricPressure();
      expect(fanAnalysisServiceMock.updateBarometricPressure).not.toHaveBeenCalled();
      expect(inputData.PlaneData.variationInBarometricPressure).toBe(true);
    });
  });

  describe('resetForms observer', () => {
    it('rebuilds the form from the plane data when reset is requested', () => {
      inputData.PlaneData.inletSEF = 9;
      fanAnalysisServiceMock.resetForms.next(true);
      expect(component.planeInfoForm.controls.inletSEF.value).toBe(9);
    });

    it('keeps the current form when reset is false', () => {
      const form = component.planeInfoForm;
      fanAnalysisServiceMock.resetForms.next(false);
      expect(component.planeInfoForm).toBe(form);
    });
  });

  describe('template visibility: validation messages', () => {
    const minControls = ['totalPressureLossBtwnPlanes1and4', 'totalPressureLossBtwnPlanes2and5'];
    const requiredOnlyControls = ['inletSEF', 'outletSEF'];

    [...minControls, ...requiredOnlyControls].forEach(name => {
      it(`hides the ${name} alert when the value is valid`, () => {
        setDirty(name, 1);
        expect(alertFor(name)).toBeNull();
      });

      it(`hides the ${name} alert when invalid but pristine`, () => {
        component.planeInfoForm.controls[name].setValue(null);
        component.planeInfoForm.controls[name].markAsPristine();
        fixture.detectChanges();
        expect(alertFor(name)).toBeNull();
      });

      it(`shows only "Value Required" for an empty, dirty ${name}`, () => {
        setDirty(name, null);
        expect(text(alertFor(name))).toBe('Value Required');
      });
    });

    minControls.forEach(name => {
      it(`shows only the min message for a negative ${name}`, () => {
        setDirty(name, -1);
        expect(text(alertFor(name))).toBe("Value can't be less than 0.");
      });
    });

    requiredOnlyControls.forEach(name => {
      it(`shows no alert for a negative ${name} (no min validator)`, () => {
        setDirty(name, -1);
        expect(alertFor(name)).toBeNull();
      });
    });
  });

  describe('destroy', () => {
    it('stops rebuilding the form on reset after destroy', () => {
      const form = component.planeInfoForm;
      fixture.destroy();
      fanAnalysisServiceMock.resetForms.next(true);
      expect(component.planeInfoForm).toBe(form);
    });
  });
});
