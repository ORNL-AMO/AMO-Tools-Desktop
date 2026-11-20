import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { PlaneThreeFormComponent } from './plane-three-form.component';
import { PlaneDataFormService } from '../plane-data-form.service';
import { FanAnalysisService } from '../../../fan-analysis.service';
import { ConvertUnitsService } from '../../../../../../shared/convert-units/convert-units.service';
import { Fan203Inputs, Plane } from '../../../../../../shared/models/fans';

function makeInputData(): Fan203Inputs {
  const data = FanAnalysisService.prototype.getDefaultData();
  Object.assign(data.PlaneData.FlowTraverse, {
    pitotTubeType: 'Standard',
    pitotTubeCoefficient: 1,
    numTraverseHoles: 3,
    numInsertionPoints: 2,
  });
  return data;
}

function makeFanAnalysisServiceMock(inputData: Fan203Inputs) {
  const mock = jasmine.createSpyObj('FanAnalysisService', ['getPlane', 'setPlane']);
  mock.inputData = inputData;
  mock.getResults = new BehaviorSubject<boolean>(true);
  mock.resetForms = new BehaviorSubject<boolean>(false);
  mock.updateTraverseData = new BehaviorSubject<boolean>(false);
  mock.currentField = new BehaviorSubject<string>('default');
  mock.getPlane.and.callFake((planeNum: string) => FanAnalysisService.prototype.getPlane.call(mock, planeNum));
  mock.setPlane.and.callFake((planeNum: string, plane: Plane) => FanAnalysisService.prototype.setPlane.call(mock, planeNum, plane));
  return mock;
}

function text(el: Element): string {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : null;
}

describe('PlaneThreeFormComponent', () => {
  let component: PlaneThreeFormComponent;
  let fixture: ComponentFixture<PlaneThreeFormComponent>;
  let fanAnalysisServiceMock: any;
  let inputData: Fan203Inputs;

  beforeEach(async () => {
    inputData = makeInputData();
    fanAnalysisServiceMock = makeFanAnalysisServiceMock(inputData);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PlaneThreeFormComponent],
      providers: [
        PlaneDataFormService,
        ConvertUnitsService,
        { provide: FanAnalysisService, useValue: fanAnalysisServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaneThreeFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('planeNum', '3a');
    fixture.detectChanges();
  });

  function alertFor(controlName: string): Element {
    const input = fixture.nativeElement.querySelector(`[formControlName="${controlName}"]`);
    return input.closest('.form-group').querySelector('.alert-danger');
  }

  function setDirty(controlName: string, value: any) {
    const control = component.pitotDataForm.controls[controlName];
    control.setValue(value);
    control.markAsDirty();
    fixture.detectChanges();
  }

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('builds the pitot form from the plane for the given plane number', () => {
      expect(component.planeData).toBe(inputData.PlaneData.FlowTraverse);
      expect(component.pitotDataForm.value).toEqual({
        pitotTubeType: 'Standard',
        pitotTubeCoefficient: 1,
        numTraverseHoles: 3,
        numInsertionPoints: 2,
      });
    });
  });

  describe('setCoefficient', () => {
    const cases = [
      { type: 'Standard', expected: 1 },
      { type: 'S-Type', expected: .86 },
    ];
    cases.forEach(({ type, expected }) => {
      it(`sets the coefficient to ${expected} for ${type} and saves`, () => {
        spyOn(fanAnalysisServiceMock.getResults, 'next').and.callThrough();
        component.pitotDataForm.controls.pitotTubeCoefficient.setValue(.5);
        component.pitotDataForm.controls.pitotTubeType.setValue(type);
        component.setCoefficient();
        expect(component.pitotDataForm.controls.pitotTubeCoefficient.value).toBe(expected);
        expect(inputData.PlaneData.FlowTraverse.pitotTubeCoefficient).toBe(expected);
        expect(fanAnalysisServiceMock.setPlane).toHaveBeenCalledWith('3a', component.planeData);
        expect(fanAnalysisServiceMock.getResults.next).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('updateTraverseData', () => {
    it('saves the plane and broadcasts a traverse update for valid counts', () => {
      const emitted: Array<boolean> = [];
      fanAnalysisServiceMock.updateTraverseData.subscribe(v => emitted.push(v));
      emitted.length = 0;
      component.pitotDataForm.controls.numTraverseHoles.setValue(5);
      component.updateTraverseData();
      expect(inputData.PlaneData.FlowTraverse.numTraverseHoles).toBe(5);
      expect(fanAnalysisServiceMock.setPlane).toHaveBeenCalledWith('3a', component.planeData);
      expect(emitted).toEqual([true, false]);
    });

    const invalidCases = [
      { control: 'numTraverseHoles', value: 11 },
      { control: 'numTraverseHoles', value: 0 },
      { control: 'numInsertionPoints', value: 11 },
      { control: 'numInsertionPoints', value: 0 },
    ];
    invalidCases.forEach(({ control, value }) => {
      it(`does not broadcast a traverse update when ${control} is ${value}`, () => {
        const emitted: Array<boolean> = [];
        fanAnalysisServiceMock.updateTraverseData.subscribe(v => emitted.push(v));
        emitted.length = 0;
        component.pitotDataForm.controls[control].setValue(value);
        component.updateTraverseData();
        expect(fanAnalysisServiceMock.setPlane).not.toHaveBeenCalled();
        expect(emitted).toEqual([]);
      });
    });
  });

  describe('observers', () => {
    it('rebuilds the form from the plane when forms are reset', () => {
      inputData.PlaneData.FlowTraverse.numTraverseHoles = 7;
      fanAnalysisServiceMock.resetForms.next(true);
      expect(component.pitotDataForm.controls.numTraverseHoles.value).toBe(7);
    });

    it('rebuilds the form from the plane when traverse data is updated', () => {
      inputData.PlaneData.FlowTraverse.numInsertionPoints = 6;
      fanAnalysisServiceMock.updateTraverseData.next(true);
      expect(component.pitotDataForm.controls.numInsertionPoints.value).toBe(6);
    });

    it('keeps the current form when reset or update is false', () => {
      const form = component.pitotDataForm;
      fanAnalysisServiceMock.resetForms.next(false);
      fanAnalysisServiceMock.updateTraverseData.next(false);
      expect(component.pitotDataForm).toBe(form);
    });
  });

  describe('template visibility: validation messages', () => {
    const cases = [
      { control: 'pitotTubeCoefficient', value: null, expected: 'Value Required' },
      { control: 'pitotTubeCoefficient', value: 1.1, expected: "Value can't be greater than 1." },
      { control: 'numTraverseHoles', value: null, expected: 'Value Required' },
      { control: 'numTraverseHoles', value: 11, expected: "Value can't be greater than 10." },
      { control: 'numTraverseHoles', value: 0, expected: "Value can't be less than 1." },
      { control: 'numInsertionPoints', value: 11, expected: "Value can't be greater than 10." },
      { control: 'numInsertionPoints', value: 0, expected: "Value can't be less than 1." },
    ];
    cases.forEach(({ control, value, expected }) => {
      it(`shows "${expected}" for ${control} = ${value}`, () => {
        setDirty(control, value);
        expect(text(alertFor(control))).toBe(expected);
      });
    });

    ['pitotTubeCoefficient', 'numTraverseHoles', 'numInsertionPoints'].forEach(control => {
      it(`hides the ${control} alert when valid`, () => {
        setDirty(control, 1);
        expect(alertFor(control)).toBeNull();
      });

      it(`hides the ${control} alert when invalid but pristine`, () => {
        component.pitotDataForm.controls[control].setValue(11);
        component.pitotDataForm.controls[control].markAsPristine();
        fixture.detectChanges();
        expect(alertFor(control)).toBeNull();
      });
    });

    it('shows no alert for an empty number of insertion points (not required)', () => {
      setDirty('numInsertionPoints', null);
      expect(alertFor('numInsertionPoints')).toBeNull();
    });
  });

  describe('destroy', () => {
    it('stops rebuilding the form after destroy', () => {
      const form = component.pitotDataForm;
      fixture.destroy();
      fanAnalysisServiceMock.resetForms.next(true);
      fanAnalysisServiceMock.updateTraverseData.next(true);
      expect(component.pitotDataForm).toBe(form);
    });
  });
});
