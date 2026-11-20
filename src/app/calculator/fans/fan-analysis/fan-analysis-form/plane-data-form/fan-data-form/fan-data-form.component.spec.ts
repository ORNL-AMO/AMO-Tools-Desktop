import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { FanDataFormComponent } from './fan-data-form.component';
import { PlaneDataFormService } from '../plane-data-form.service';
import { FanAnalysisService } from '../../../fan-analysis.service';
import { FsatService } from '../../../../../../fsat/fsat.service';
import { ConvertUnitsService } from '../../../../../../shared/convert-units/convert-units.service';
import { Fan203Inputs, Plane } from '../../../../../../shared/models/fans';
import { Settings } from '../../../../../../shared/models/settings';

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

const IMPERIAL_SETTINGS = {
  unitsOfMeasure: 'Imperial',
  fanPressureMeasurement: 'inH2o',
  fanBarometricPressure: 'inHg',
  fanTemperatureMeasurement: 'F',
  fanFlowRate: 'ft3/min',
} as Settings;

const METRIC_SETTINGS = {
  ...IMPERIAL_SETTINGS,
  unitsOfMeasure: 'Metric',
  fanFlowRate: 'm3/s',
} as Settings;

function makeValidPlane(overrides: Partial<Plane> = {}): Partial<Plane> {
  return {
    planeType: 'Rectangular',
    length: 10,
    width: 12,
    area: 1,
    dryBulbTemp: 70,
    barometricPressure: 29.92,
    staticPressure: 1,
    userDefinedStaticPressure: 1,
    ...overrides,
  };
}

function makeInputData(): Fan203Inputs {
  return FanAnalysisService.prototype.getDefaultData();
}

function makeFanAnalysisServiceMock(inputData: Fan203Inputs) {
  const mock = jasmine.createSpyObj('FanAnalysisService', ['getPlane', 'setPlane', 'calculateVelocityResults']);
  mock.inputData = inputData;
  mock.getResults = new BehaviorSubject<boolean>(true);
  mock.resetForms = new BehaviorSubject<boolean>(false);
  mock.currentField = new BehaviorSubject<string>('default');
  mock.modalOpen = new BehaviorSubject<boolean>(false);
  mock.getPlane.and.callFake((planeNum: string) => FanAnalysisService.prototype.getPlane.call(mock, planeNum));
  mock.setPlane.and.callFake((planeNum: string, plane: Plane) => FanAnalysisService.prototype.setPlane.call(mock, planeNum, plane));
  return mock;
}

function text(el: Element): string {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : null;
}

describe('FanDataFormComponent', () => {
  let component: FanDataFormComponent;
  let fixture: ComponentFixture<FanDataFormComponent>;
  let fanAnalysisServiceMock: any;
  let planeDataFormService: PlaneDataFormService;
  let convertUnitsService: ConvertUnitsService;
  let inputData: Fan203Inputs;

  beforeEach(async () => {
    inputData = makeInputData();
    fanAnalysisServiceMock = makeFanAnalysisServiceMock(inputData);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FanDataFormComponent, SettingsLabelStubPipe, SigFigsStubPipe],
      providers: [
        PlaneDataFormService,
        ConvertUnitsService,
        { provide: FsatService, useValue: {} },
        { provide: FanAnalysisService, useValue: fanAnalysisServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    planeDataFormService = TestBed.inject(PlaneDataFormService);
    convertUnitsService = TestBed.inject(ConvertUnitsService);
  });

  function setup(planeNum: string, settings: Settings = IMPERIAL_SETTINGS, plane: Partial<Plane> = {}) {
    Object.assign(fanAnalysisServiceMock.getPlane(planeNum), plane);
    fixture = TestBed.createComponent(FanDataFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('planeNum', planeNum);
    fixture.componentRef.setInput('planeDescription', 'Test Plane');
    fixture.componentRef.setInput('settings', settings);
    fixture.detectChanges();
  }

  function query(selector: string): Element {
    return fixture.nativeElement.querySelector(selector);
  }

  function formGroupOf(controlName: string): Element {
    return query(`[formControlName="${controlName}"]`).closest('.form-group');
  }

  function alertFor(controlName: string): Element {
    return formGroupOf(controlName).querySelector('.alert-danger');
  }

  function areaDisplay(): string {
    return text(query('label[for="area"]').parentElement.querySelector('.text-center'));
  }

  function setDirty(controlName: string, value: any) {
    const control = component.dataForm.controls[controlName];
    control.setValue(value);
    control.markAsDirty();
    fixture.detectChanges();
  }

  describe('initialization', () => {
    it('creates the component', () => {
      setup('1');
      expect(component).toBeTruthy();
    });

    it('builds the form from the plane for the given plane number', () => {
      setup('2', IMPERIAL_SETTINGS, { planeType: 'Circular', length: 8, dryBulbTemp: 75 });
      expect(component.planeData).toBe(inputData.PlaneData.FanEvaseOrOutletFlange);
      expect(component.dataForm.controls.planeType.value).toBe('Circular');
      expect(component.dataForm.controls.length.value).toBe(8);
      expect(component.dataForm.controls.dryBulbTemp.value).toBe(75);
    });

    it('reads variation in barometric pressure from the plane data', () => {
      inputData.PlaneData.variationInBarometricPressure = true;
      setup('1');
      expect(component.variationInBarometricPressure).toBeTrue();
    });

    it('renders the plane number and description', () => {
      setup('4');
      expect(text(query('.group-label'))).toBe('4: Test Plane');
    });
  });

  describe('calculation: calcArea', () => {
    it('computes a rectangular area including inlet boxes and saves the plane', () => {
      setup('1', IMPERIAL_SETTINGS, { length: 10, width: 12, numInletBoxes: 2 });
      const expected = convertUnitsService.value(240).from('in2').to('ft2');
      expect(component.dataForm.controls.area.value).toBeCloseTo(expected, 8);
      expect(inputData.PlaneData.FanInletFlange.area).toBeCloseTo(expected, 8);
    });

    it('computes a circular area', () => {
      setup('2', IMPERIAL_SETTINGS, { planeType: 'Circular', length: 10 });
      const expected = convertUnitsService.value((Math.PI / 4) * 100).from('in2').to('ft2');
      expect(component.dataForm.controls.area.value).toBeCloseTo(expected, 8);
    });

    it('recomputes and re-renders the area when a dimension changes', () => {
      setup('2', IMPERIAL_SETTINGS, { length: 10, width: 12 });
      component.dataForm.controls.length.setValue(20);
      component.calcArea();
      fixture.detectChanges();
      const expected = convertUnitsService.value(240).from('in2').to('ft2');
      expect(component.dataForm.controls.area.value).toBeCloseTo(expected, 8);
      expect(areaDisplay()).toBe(`${component.planeData.area} ft2`);
    });

    it('converts the area to square meters for metric flow rates', () => {
      setup('2', METRIC_SETTINGS, { length: 1000, width: 1000 });
      const expected = convertUnitsService.value(1000000).from('mm2').to('m2');
      expect(component.dataForm.controls.area.value).toBeCloseTo(expected, 8);
    });

    it('publishes the plane shape and requests results', () => {
      setup('1', IMPERIAL_SETTINGS, { planeType: 'Circular' });
      spyOn(fanAnalysisServiceMock.getResults, 'next').and.callThrough();
      component.calcArea();
      expect(planeDataFormService.planeShape.getValue()).toBe('Circular');
      expect(fanAnalysisServiceMock.getResults.next).toHaveBeenCalledWith(true);
    });
  });

  describe('getResults observer: calcVelocityResults', () => {
    ['3a', '3b', '3c'].forEach(planeNum => {
      it(`calculates velocity results for valid traverse plane ${planeNum}`, () => {
        setup(planeNum, IMPERIAL_SETTINGS, makeValidPlane());
        fanAnalysisServiceMock.calculateVelocityResults.calls.reset();
        fanAnalysisServiceMock.getResults.next(true);
        expect(fanAnalysisServiceMock.calculateVelocityResults).toHaveBeenCalledWith(component.planeData, IMPERIAL_SETTINGS);
      });
    });

    it('does not calculate velocity results for an invalid traverse plane', () => {
      setup('3a', IMPERIAL_SETTINGS, makeValidPlane({ dryBulbTemp: undefined }));
      fanAnalysisServiceMock.calculateVelocityResults.calls.reset();
      fanAnalysisServiceMock.getResults.next(true);
      expect(fanAnalysisServiceMock.calculateVelocityResults).not.toHaveBeenCalled();
    });

    it('does not calculate velocity results for a non-traverse plane', () => {
      setup('2', IMPERIAL_SETTINGS, makeValidPlane());
      fanAnalysisServiceMock.calculateVelocityResults.calls.reset();
      fanAnalysisServiceMock.getResults.next(true);
      expect(fanAnalysisServiceMock.calculateVelocityResults).not.toHaveBeenCalled();
    });
  });

  describe('staticPressureValue observer', () => {
    it('patches both static pressures and saves on traverse planes', () => {
      setup('3a');
      planeDataFormService.staticPressureValue.next(5);
      expect(component.dataForm.controls.staticPressure.value).toBe(5);
      expect(component.dataForm.controls.userDefinedStaticPressure.value).toBe(5);
      expect(inputData.PlaneData.FlowTraverse.staticPressure).toBe(5);
    });

    it('ignores the static pressure value on non-traverse planes', () => {
      setup('4');
      planeDataFormService.staticPressureValue.next(5);
      expect(component.dataForm.controls.staticPressure.value).not.toBe(5);
      expect(component.dataForm.controls.userDefinedStaticPressure.value).not.toBe(5);
    });

    it('clears the static pressure value when forms are reset', () => {
      setup('3a');
      planeDataFormService.staticPressureValue.next(5);
      fanAnalysisServiceMock.resetForms.next(true);
      expect(planeDataFormService.staticPressureValue.getValue()).toBeUndefined();
    });
  });

  describe('internal dimension modal', () => {
    it('is hidden by default', () => {
      setup('1');
      expect(query('app-internal-dimension-modal')).toBeNull();
    });

    it('opens from the dimension link and notifies the service', () => {
      setup('1');
      (query('label[for="length"] a') as HTMLElement).click();
      fixture.detectChanges();
      expect(query('app-internal-dimension-modal')).not.toBeNull();
      expect(component.currentDimension).toBe('Height');
      expect(fanAnalysisServiceMock.modalOpen.getValue()).toBeTrue();
    });

    it('closes and notifies the service', () => {
      setup('1');
      component.openInternalDimensionModal('Width');
      component.closeInternalDimensionModal();
      fixture.detectChanges();
      expect(query('app-internal-dimension-modal')).toBeNull();
      expect(fanAnalysisServiceMock.modalOpen.getValue()).toBeFalse();
    });

    it('sets width from the modal result for the Width dimension', () => {
      setup('1');
      component.openInternalDimensionModal('Width');
      component.setInternalDimensionAndClose(15);
      fixture.detectChanges();
      expect(component.dataForm.controls.width.value).toBe(15);
      expect(component.showInternalDimensionModal).toBeFalse();
      expect(query('app-internal-dimension-modal')).toBeNull();
    });

    ['Height', 'Diameter'].forEach(dimension => {
      it(`sets length from the modal result for the ${dimension} dimension`, () => {
        setup('1');
        component.openInternalDimensionModal(dimension);
        component.setInternalDimensionAndClose(22);
        expect(component.dataForm.controls.length.value).toBe(22);
      });
    });
  });

  describe('template visibility: plane shape', () => {
    it('shows the height label and width field for rectangular planes', () => {
      setup('1');
      const labels = fixture.nativeElement.querySelectorAll('label[for="length"]');
      expect(labels.length).toBe(1);
      expect(text(labels[0])).toBe('Height Calculate Internal Clear Height');
      expect(query('[formControlName="width"]')).not.toBeNull();
    });

    it('shows the diameter label and hides the width field for circular planes', () => {
      setup('1', IMPERIAL_SETTINGS, { planeType: 'Circular' });
      const labels = fixture.nativeElement.querySelectorAll('label[for="length"]');
      expect(labels.length).toBe(1);
      expect(text(labels[0])).toBe('Diameter Calculate Internal Clear Diameter');
      expect(query('[formControlName="width"]')).toBeNull();
    });

    it('switches labels and width when the shape changes', () => {
      setup('1');
      component.dataForm.controls.planeType.setValue('Circular');
      fixture.detectChanges();
      expect(text(query('label[for="length"]'))).toContain('Diameter');
      expect(query('[formControlName="width"]')).toBeNull();
    });
  });

  describe('template visibility: units', () => {
    it('shows inch units for imperial dimensions', () => {
      setup('1');
      expect(text(formGroupOf('length').querySelector('.units'))).toBe('in');
      expect(text(formGroupOf('width').querySelector('.units'))).toBe('in');
      expect(formGroupOf('length').querySelectorAll('.units').length).toBe(1);
    });

    it('shows millimeter units for metric dimensions', () => {
      setup('1', METRIC_SETTINGS);
      expect(text(formGroupOf('length').querySelector('.units'))).toBe('mm');
      expect(text(formGroupOf('width').querySelector('.units'))).toBe('mm');
      expect(formGroupOf('length').querySelectorAll('.units').length).toBe(1);
    });

    it('shows square feet for ft3/min flow rates', () => {
      setup('1', IMPERIAL_SETTINGS, { length: 12, width: 12 });
      expect(areaDisplay()).toBe(`${component.planeData.area} ft2`);
    });

    it('shows square meters for m3/s flow rates', () => {
      setup('1', METRIC_SETTINGS, { length: 1000, width: 1000 });
      expect(areaDisplay()).toBe(`${component.planeData.area} m2`);
    });

    it('shows no area unit for other flow rates', () => {
      setup('1', { ...IMPERIAL_SETTINGS, fanFlowRate: 'gpm' } as Settings);
      expect(query('label[for="area"]').parentElement.querySelectorAll('.text-center span').length).toBe(0);
    });

    const temperatureCases = [
      { unit: 'F', expected: '℉' },
      { unit: 'C', expected: '℃' },
      { unit: 'K', expected: 'K' },
      { unit: 'R', expected: '°R' },
    ];
    temperatureCases.forEach(({ unit, expected }) => {
      it(`shows only the ${unit} dry bulb temperature unit`, () => {
        setup('1', { ...IMPERIAL_SETTINGS, fanTemperatureMeasurement: unit } as Settings);
        const units = formGroupOf('dryBulbTemp').querySelectorAll('.units');
        expect(units.length).toBe(1);
        expect(text(units[0])).toBe(expected);
      });
    });
  });

  describe('template visibility: plane-specific fields', () => {
    const cases = [
      { planeNum: '1', inletBoxes: true, staticPressure: false },
      { planeNum: '2', inletBoxes: false, staticPressure: false },
      { planeNum: '3a', inletBoxes: false, staticPressure: false },
      { planeNum: '4', inletBoxes: true, staticPressure: true },
      { planeNum: '5', inletBoxes: false, staticPressure: true },
    ];
    cases.forEach(({ planeNum, inletBoxes, staticPressure }) => {
      it(`plane ${planeNum}: inlet boxes ${inletBoxes ? 'shown' : 'hidden'}, static pressure ${staticPressure ? 'shown' : 'hidden'}`, () => {
        setup(planeNum);
        expect(query('[formControlName="numInletBoxes"]') !== null).toBe(inletBoxes);
        expect(query('[formControlName="staticPressure"]') !== null).toBe(staticPressure);
      });
    });
  });

  describe('template visibility: barometric pressure', () => {
    it('shows the barometric pressure input when it varies by plane', () => {
      inputData.PlaneData.variationInBarometricPressure = true;
      setup('1');
      expect(query('[formControlName="barometricPressure"]')).not.toBeNull();
      expect(query('label[for="barometricPressure"]').parentElement.querySelector('.text-center')).toBeNull();
    });

    it('shows the read-only barometric pressure when it does not vary', () => {
      setup('1');
      expect(query('[formControlName="barometricPressure"]')).toBeNull();
      expect(text(query('label[for="barometricPressure"]').parentElement.querySelector('.text-center'))).toBe('29.92 inHg');
    });

    function barometricAlert(): Element {
      return query('label[for="barometricPressure"]').parentElement.querySelector('.alert-danger');
    }

    const cases = [
      { value: null, expected: 'Value Required' },
      { value: 61, expected: "Value can't be greater than 60." },
      { value: 9, expected: "Value can't be less than 10." },
    ];
    cases.forEach(({ value, expected }) => {
      it(`shows "${expected}" for barometric pressure ${value} even when read-only`, () => {
        setup('1');
        setDirty('barometricPressure', value);
        expect(text(barometricAlert())).toBe(expected);
      });
    });

    it('hides the barometric pressure alert when valid', () => {
      setup('1');
      setDirty('barometricPressure', 30);
      expect(barometricAlert()).toBeNull();
    });
  });

  describe('template visibility: validation messages', () => {
    const cases = [
      { planeNum: '1', control: 'length', value: null, expected: 'Value Required' },
      { planeNum: '1', control: 'length', value: -1, expected: "Value can't be less than 0." },
      { planeNum: '1', control: 'width', value: null, expected: 'Value Required' },
      { planeNum: '1', control: 'width', value: -1, expected: "Value can't be less than 0." },
      { planeNum: '1', control: 'numInletBoxes', value: null, expected: 'Value Required' },
      { planeNum: '1', control: 'numInletBoxes', value: 0, expected: "Value can't be less than 1." },
      { planeNum: '1', control: 'dryBulbTemp', value: null, expected: 'Value Required' },
      { planeNum: '1', control: 'dryBulbTemp', value: 1001, expected: "Value can't be greater than 1000." },
      { planeNum: '1', control: 'dryBulbTemp', value: -101, expected: "Value can't be less than -100." },
      { planeNum: '4', control: 'staticPressure', value: null, expected: 'Value Required' },
      { planeNum: '5', control: 'staticPressure', value: 401, expected: "Value can't be greater than 400." },
      { planeNum: '5', control: 'staticPressure', value: -401, expected: "Value can't be less than -400." },
    ];
    cases.forEach(({ planeNum, control, value, expected }) => {
      it(`plane ${planeNum}: shows "${expected}" for ${control} = ${value}`, () => {
        setup(planeNum);
        setDirty(control, value);
        expect(text(alertFor(control))).toBe(expected);
      });
    });

    ['length', 'width', 'numInletBoxes', 'dryBulbTemp'].forEach(control => {
      it(`hides the ${control} alert when invalid but pristine`, () => {
        setup('1');
        component.dataForm.controls[control].setValue(null);
        component.dataForm.controls[control].markAsPristine();
        fixture.detectChanges();
        expect(alertFor(control)).toBeNull();
      });

      it(`hides the ${control} alert when valid`, () => {
        setup('1');
        setDirty(control, 5);
        expect(alertFor(control)).toBeNull();
      });
    });

    it('shows the area min message whenever area is negative, even when pristine', () => {
      setup('1');
      component.dataForm.controls.area.setValue(-1);
      fixture.detectChanges();
      const alert = query('label[for="area"]').parentElement.querySelector('.alert-danger');
      expect(text(alert)).toBe("Value can't be less than 0.");
    });

    it('hides the area alert when area is valid', () => {
      setup('1', IMPERIAL_SETTINGS, { length: 10, width: 10 });
      expect(query('label[for="area"]').parentElement.querySelector('.alert-danger')).toBeNull();
    });

    it('renders an empty area alert for a required-only failure (no required message in template)', () => {
      setup('1');
      component.dataForm.controls.area.setValue(null);
      fixture.detectChanges();
      const alert = query('label[for="area"]').parentElement.querySelector('.alert-danger');
      expect(alert).not.toBeNull();
      expect(text(alert)).toBe('');
    });
  });

  describe('destroy', () => {
    it('stops calculating velocity results after destroy', () => {
      setup('3a', IMPERIAL_SETTINGS, makeValidPlane());
      fanAnalysisServiceMock.calculateVelocityResults.calls.reset();
      fixture.destroy();
      fanAnalysisServiceMock.getResults.next(true);
      expect(fanAnalysisServiceMock.calculateVelocityResults).not.toHaveBeenCalled();
    });

    it('stops applying static pressure values after destroy', () => {
      setup('3a');
      fixture.destroy();
      planeDataFormService.staticPressureValue.next(7);
      expect(component.dataForm.controls.staticPressure.value).not.toBe(7);
    });

    it('stops resetting the static pressure value after destroy', () => {
      setup('1');
      fixture.destroy();
      planeDataFormService.staticPressureValue.next(3);
      fanAnalysisServiceMock.resetForms.next(true);
      expect(planeDataFormService.staticPressureValue.getValue()).toBe(3);
    });
  });
});
