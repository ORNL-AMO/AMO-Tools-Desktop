import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { TraversePlanesComponent } from './traverse-planes.component';
import { PlaneDataFormService } from '../plane-data-form.service';
import { FanAnalysisService } from '../../../fan-analysis.service';
import { ConvertUnitsService } from '../../../../../../shared/convert-units/convert-units.service';
import { Fan203Inputs, PlaneResults, VelocityResults } from '../../../../../../shared/models/fans';
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

@Component({ selector: 'app-fan-data-form', template: '{{planeNum}}|{{planeDescription}}', standalone: false })
class FanDataFormStubComponent {
  @Input() planeNum: string;
  @Input() planeDescription: string;
  @Input() settings: Settings;
}

@Component({ selector: 'app-pressure-readings-form', template: '{{planeNum}}|{{pressureType}}', standalone: false })
class PressureReadingsFormStubComponent {
  @Input() planeNum: string;
  @Input() pressureType: string = 'Velocity';
}

const IMPERIAL_SETTINGS = {
  unitsOfMeasure: 'Imperial',
  fanPressureMeasurement: 'inH2o',
  fanBarometricPressure: 'inHg',
  fanTemperatureMeasurement: 'F',
  fanFlowRate: 'ft3/min',
} as Settings;

const METRIC_SETTINGS = { ...IMPERIAL_SETTINGS, unitsOfMeasure: 'Metric' } as Settings;

const PLANE_STEPS = [
  { step: '3a', toggle: 'a', description: 'Additional Traverse Plane 1' },
  { step: '3b', toggle: 'b', description: 'Additional Traverse Plane 2' },
  { step: '3c', toggle: 'c', description: 'Additional Traverse Plane 3' },
];

function makeInputData(): Fan203Inputs {
  return FanAnalysisService.prototype.getDefaultData();
}

function makeFanAnalysisServiceMock(inputData: Fan203Inputs) {
  const mock = jasmine.createSpyObj('FanAnalysisService', ['getPlane', 'getPlaneResults']);
  mock.inputData = inputData;
  mock.getResults = new BehaviorSubject<boolean>(true);
  mock.velocityResults = new BehaviorSubject<VelocityResults>(undefined);
  mock.currentField = new BehaviorSubject<string>('default');
  mock.getPlane.and.callFake((planeNum: string) => FanAnalysisService.prototype.getPlane.call(mock, planeNum));
  mock.getPlaneResults.and.returnValue(undefined);
  return mock;
}

function text(el: Element): string {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : null;
}

describe('TraversePlanesComponent', () => {
  let component: TraversePlanesComponent;
  let fixture: ComponentFixture<TraversePlanesComponent>;
  let fanAnalysisServiceMock: any;
  let planeDataFormService: PlaneDataFormService;
  let inputData: Fan203Inputs;

  beforeEach(async () => {
    inputData = makeInputData();
    fanAnalysisServiceMock = makeFanAnalysisServiceMock(inputData);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [
        TraversePlanesComponent,
        SettingsLabelStubPipe,
        SigFigsStubPipe,
        FanDataFormStubComponent,
        PressureReadingsFormStubComponent,
      ],
      providers: [
        PlaneDataFormService,
        ConvertUnitsService,
        { provide: FanAnalysisService, useValue: fanAnalysisServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    planeDataFormService = TestBed.inject(PlaneDataFormService);
  });

  function setup(planeStep: string, settings: Settings = IMPERIAL_SETTINGS) {
    fixture = TestBed.createComponent(TraversePlanesComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('planeStep', planeStep);
    fixture.componentRef.setInput('settings', settings);
    fixture.detectChanges();
  }

  function query(selector: string): Element {
    return fixture.nativeElement.querySelector(selector);
  }

  function queryAll(selector: string): Array<Element> {
    return Array.from(fixture.nativeElement.querySelectorAll(selector));
  }

  function staticPressureLinks(): Array<string> {
    return queryAll('form .click-link').map(el => text(el));
  }

  function pressureReadings(): Array<string> {
    return queryAll('app-pressure-readings-form').map(el => text(el));
  }

  function resultFor(label: string): Element {
    const labelEl = queryAll('label').find(el => text(el) === label);
    return labelEl.parentElement.querySelector('.text-center');
  }

  function setVelocityResults(results: VelocityResults) {
    fanAnalysisServiceMock.velocityResults.next(results);
    fixture.detectChanges();
  }

  describe('initialization', () => {
    PLANE_STEPS.forEach(({ step, description }) => {
      it(`sets the description to "${description}" for ${step}`, () => {
        setup(step);
        expect(component.planeDescription).toBe(description);
      });
    });

    it('builds the static pressure form from the current plane', () => {
      inputData.PlaneData.AddlTraversePlanes[0].userDefinedStaticPressure = 2.5;
      setup('3b');
      expect(component.fanDataForm.controls.userDefinedStaticPressure.value).toBe(2.5);
    });

    it('starts with user-defined static pressure on every plane', () => {
      setup('3a');
      expect(component.showUserPressurePlaneA).toBeTrue();
      expect(component.showUserPressurePlaneB).toBeTrue();
      expect(component.showUserPressurePlaneC).toBeTrue();
    });
  });

  describe('template visibility: plane sections', () => {
    PLANE_STEPS.forEach(({ step, description }) => {
      it(`renders only the ${step} section with its child forms`, () => {
        setup(step);
        const fanDataForms = queryAll('app-fan-data-form');
        expect(fanDataForms.length).toBe(1);
        expect(text(fanDataForms[0])).toBe(`${step}|${description}`);
        expect(queryAll('app-plane-three-form').length).toBe(1);
        expect(queryAll('form').length).toBe(1);
      });
    });

    it('renders no plane section for a non-traverse step', () => {
      setup('1');
      expect(query('app-fan-data-form')).toBeNull();
      expect(query('app-plane-three-form')).toBeNull();
      expect(query('form')).toBeNull();
      expect(query('app-pressure-readings-form')).toBeNull();
    });
  });

  describe('template visibility: static pressure input type', () => {
    PLANE_STEPS.forEach(({ step, toggle }) => {
      describe(`plane ${step}`, () => {
        it('shows the user-defined input and only the velocity readings by default', () => {
          setup(step);
          expect(staticPressureLinks()).toEqual(['Calculate Static Pressure']);
          expect(query('#userDefinedStaticPressure')).not.toBeNull();
          expect(query('.calculated-error')).toBeNull();
          expect(pressureReadings()).toEqual([`${step}|Velocity`]);
        });

        it('shows the calculated value and the static readings when calculating', () => {
          setup(step);
          component.toggleStaticPressureInputType(toggle);
          fixture.detectChanges();
          expect(staticPressureLinks()).toEqual(['Define Static Pressure']);
          expect(query('#userDefinedStaticPressure')).toBeNull();
          expect(pressureReadings()).toEqual([`${step}|Static`, `${step}|Velocity`]);
        });

        it('shows a placeholder when the calculated static pressure is empty', () => {
          setup(step);
          component.toggleStaticPressureInputType(toggle);
          fixture.detectChanges();
          expect(text(query('.calculated-error'))).toBe('— —');
        });

        it('shows the calculated static pressure when present', () => {
          setup(step);
          component.toggleStaticPressureInputType(toggle);
          component.fanDataForm.controls.staticPressure.setValue(3.456);
          fixture.detectChanges();
          expect(query('.calculated-error')).toBeNull();
          expect(text(query('form .input-group.justify-content-center'))).toContain('3.46');
        });

        it('toggles back to the user-defined input', () => {
          setup(step);
          component.toggleStaticPressureInputType(toggle);
          (query('form .click-link') as HTMLElement).click();
          fixture.detectChanges();
          expect(staticPressureLinks()).toEqual(['Calculate Static Pressure']);
          expect(query('#userDefinedStaticPressure')).not.toBeNull();
        });

        const errorCases = [
          { value: null, expected: 'Value Required' },
          { value: 401, expected: "Value can't be greater than 400." },
          { value: -401, expected: "Value can't be less than -400." },
        ];
        errorCases.forEach(({ value, expected }) => {
          it(`shows "${expected}" for user-defined static pressure ${value}`, () => {
            setup(step);
            const control = component.fanDataForm.controls.userDefinedStaticPressure;
            control.setValue(value);
            control.markAsDirty();
            fixture.detectChanges();
            expect(text(query('form .alert-danger'))).toBe(expected);
          });
        });

        it('hides the user-defined static pressure alert when invalid but pristine', () => {
          setup(step);
          component.fanDataForm.controls.userDefinedStaticPressure.setValue(null);
          component.fanDataForm.controls.userDefinedStaticPressure.markAsPristine();
          fixture.detectChanges();
          expect(query('form .alert-danger')).toBeNull();
        });

        it('hides the user-defined static pressure alert when valid', () => {
          setup(step);
          const control = component.fanDataForm.controls.userDefinedStaticPressure;
          control.setValue(5);
          control.markAsDirty();
          fixture.detectChanges();
          expect(query('form .alert-danger')).toBeNull();
        });
      });
    });

    it('shows the pressure units with the calculated value on plane 3a only', () => {
      setup('3a');
      component.toggleStaticPressureInputType('a');
      component.fanDataForm.controls.staticPressure.setValue(2);
      fixture.detectChanges();
      expect(text(query('form .input-group.justify-content-center'))).toBe('2 inH2o');
    });

    PLANE_STEPS.filter(p => p.step !== '3a').forEach(({ step, toggle }) => {
      it(`shows the calculated value without units on plane ${step}`, () => {
        setup(step);
        component.toggleStaticPressureInputType(toggle);
        component.fanDataForm.controls.staticPressure.setValue(2);
        fixture.detectChanges();
        expect(text(query('form .input-group.justify-content-center'))).toBe('2');
      });
    });

    it('toggling a different plane letter does not change the current plane', () => {
      setup('3a');
      component.toggleStaticPressureInputType('b');
      fixture.detectChanges();
      expect(staticPressureLinks()).toEqual(['Calculate Static Pressure']);
      expect(component.showUserPressurePlaneB).toBeFalse();
    });
  });

  describe('setUserDefinedStaticPressure', () => {
    it('publishes the user-defined static pressure when defining it', () => {
      setup('3a');
      component.fanDataForm.controls.userDefinedStaticPressure.setValue(4);
      component.setUserDefinedStaticPressure();
      expect(planeDataFormService.staticPressureValue.getValue()).toBe(4);
    });

    it('does not publish while calculating static pressure', () => {
      setup('3b');
      component.toggleStaticPressureInputType('b');
      component.fanDataForm.controls.userDefinedStaticPressure.setValue(4);
      component.setUserDefinedStaticPressure();
      expect(planeDataFormService.staticPressureValue.getValue()).toBeUndefined();
    });

    it('publishes the user-defined value when toggling back to defined', () => {
      setup('3c');
      component.fanDataForm.controls.userDefinedStaticPressure.setValue(6);
      component.toggleStaticPressureInputType('c');
      expect(planeDataFormService.staticPressureValue.getValue()).toBeUndefined();
      component.toggleStaticPressureInputType('c');
      expect(planeDataFormService.staticPressureValue.getValue()).toBe(6);
    });
  });

  describe('ngOnChanges', () => {
    it('clears the static pressure value when the plane step changes', () => {
      setup('3a');
      planeDataFormService.staticPressureValue.next(5);
      fixture.componentRef.setInput('planeStep', '3b');
      fixture.detectChanges();
      expect(planeDataFormService.staticPressureValue.getValue()).toBeUndefined();
    });

    it('re-renders the section for the new plane step', () => {
      setup('3a');
      fixture.componentRef.setInput('planeStep', '3c');
      fixture.detectChanges();
      expect(queryAll('app-fan-data-form').length).toBe(1);
      expect(text(query('app-fan-data-form'))).toContain('3c|');
    });
  });

  describe('getResults observer', () => {
    it('rebuilds the form from the plane when results update', () => {
      setup('3a');
      inputData.PlaneData.FlowTraverse.userDefinedStaticPressure = 9;
      fanAnalysisServiceMock.getResults.next(true);
      expect(component.fanDataForm.controls.userDefinedStaticPressure.value).toBe(9);
    });

    it('keeps the current form when results is false', () => {
      setup('3a');
      const form = component.fanDataForm;
      fanAnalysisServiceMock.getResults.next(false);
      expect(component.fanDataForm).toBe(form);
    });
  });

  describe('velocityResults observer: traverse velocity', () => {
    const planeResults = {
      FlowTraverse: { gasVelocity: 10 },
      AddlTraversePlanes: [{ gasVelocity: 20 }, { gasVelocity: 30 }],
    } as unknown as PlaneResults;
    const cases = [
      { step: '3a', expected: 10 },
      { step: '3b', expected: 20 },
      { step: '3c', expected: 30 },
    ];
    cases.forEach(({ step, expected }) => {
      it(`uses the ${step} gas velocity as the traverse velocity`, () => {
        setup(step);
        fanAnalysisServiceMock.getPlaneResults.and.returnValue(planeResults);
        setVelocityResults({ pv3: 1, percent75Rule: 80 });
        expect(fanAnalysisServiceMock.getPlaneResults).toHaveBeenCalledWith(IMPERIAL_SETTINGS);
        expect(component.velocityResults.traverseVelocity).toBe(expected);
      });
    });

    it('leaves the traverse velocity unset when plane results have an error', () => {
      setup('3a');
      fanAnalysisServiceMock.getPlaneResults.and.returnValue({ ...planeResults, error: true });
      setVelocityResults({ pv3: 1, percent75Rule: 80 });
      expect(component.velocityResults.traverseVelocity).toBeUndefined();
    });
  });

  describe('template visibility: velocity results', () => {
    it('shows placeholders for pressure and 75% rule without results, and no traverse velocity text', () => {
      setup('3a');
      expect(text(resultFor('Traverse Velocity Pressure'))).toBe('— —');
      expect(text(resultFor('Points Satisfying 75% Rule'))).toBe('— —');
      expect(text(resultFor('Traverse Velocity'))).toBe('');
    });

    it('renders the velocity results when present', () => {
      setup('3a');
      setVelocityResults({ pv3: 1.5, percent75Rule: 80, traverseVelocity: 1234.5 });
      expect(text(resultFor('Traverse Velocity Pressure'))).toBe('1.5 inH2o');
      expect(text(resultFor('Points Satisfying 75% Rule'))).toBe('80.0 %');
      expect(text(resultFor('Traverse Velocity'))).toBe('1,234.5 ft/min');
    });

    it('renders the traverse velocity in m/min for metric', () => {
      setup('3a', METRIC_SETTINGS);
      setVelocityResults({ pv3: 1.5, percent75Rule: 80, traverseVelocity: 12 });
      expect(text(resultFor('Traverse Velocity'))).toBe('12.0 m/min');
    });

    it('shows placeholders for zero results', () => {
      setup('3a');
      setVelocityResults({ pv3: 0, percent75Rule: 0, traverseVelocity: 0 });
      expect(text(resultFor('Traverse Velocity Pressure'))).toBe('— —');
      expect(text(resultFor('Points Satisfying 75% Rule'))).toBe('— —');
      expect(text(resultFor('Traverse Velocity'))).toBe('— —');
    });

    it('updates the rendered results when new results arrive', () => {
      setup('3a');
      setVelocityResults({ pv3: 1.5, percent75Rule: 80, traverseVelocity: 100 });
      setVelocityResults({ pv3: 2.5, percent75Rule: 60, traverseVelocity: 200 });
      expect(text(resultFor('Traverse Velocity Pressure'))).toBe('2.5 inH2o');
      expect(text(resultFor('Points Satisfying 75% Rule'))).toBe('60.0 %');
      expect(text(resultFor('Traverse Velocity'))).toBe('200.0 ft/min');
    });
  });

  describe('destroy', () => {
    it('stops reacting to velocity results and results updates after destroy', () => {
      setup('3a');
      const form = component.fanDataForm;
      fixture.destroy();
      fanAnalysisServiceMock.velocityResults.next({ pv3: 1, percent75Rule: 80 });
      fanAnalysisServiceMock.getResults.next(true);
      expect(component.velocityResults).toBeUndefined();
      expect(component.fanDataForm).toBe(form);
    });
  });
});
