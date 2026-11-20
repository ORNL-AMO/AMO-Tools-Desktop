import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlaneDataFormComponent } from './plane-data-form.component';
import { PlaneDataFormService } from './plane-data-form.service';
import { FanAnalysisService } from '../../fan-analysis.service';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';
import { Fan203Inputs } from '../../../../../shared/models/fans';
import { Settings } from '../../../../../shared/models/settings';

const MOCK_SETTINGS = {
  unitsOfMeasure: 'Imperial',
  fanPressureMeasurement: 'inH2o',
  fanBarometricPressure: 'inHg',
  fanTemperatureMeasurement: 'F',
  fanFlowRate: 'ft3/min',
} as Settings;

@Component({ selector: 'app-fan-data-form', template: '{{planeNum}}|{{planeDescription}}', standalone: false })
class FanDataFormStubComponent {
  @Input() planeNum: string;
  @Input() planeDescription: string;
  @Input() settings: Settings;
}

@Component({ selector: 'app-traverse-planes', template: '{{planeStep}}', standalone: false })
class TraversePlanesStubComponent {
  @Input() planeStep: string;
  @Input() settings: Settings;
}

function makeInputData(): Fan203Inputs {
  return FanAnalysisService.prototype.getDefaultData();
}

function makeFanAnalysisServiceMock(inputData: Fan203Inputs) {
  const mock = jasmine.createSpyObj('FanAnalysisService', ['getPlane', 'setPlane']);
  mock.inputData = inputData;
  mock.getResults = new BehaviorSubject<boolean>(true);
  mock.getPlane.and.callFake((planeNum: string) => FanAnalysisService.prototype.getPlane.call(mock, planeNum));
  return mock;
}

function text(el: Element): string {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : null;
}

describe('PlaneDataFormComponent', () => {
  let component: PlaneDataFormComponent;
  let fixture: ComponentFixture<PlaneDataFormComponent>;
  let fanAnalysisServiceMock: any;
  let planeDataFormService: PlaneDataFormService;
  let inputData: Fan203Inputs;

  beforeEach(async () => {
    inputData = makeInputData();
    fanAnalysisServiceMock = makeFanAnalysisServiceMock(inputData);

    await TestBed.configureTestingModule({
      declarations: [PlaneDataFormComponent, FanDataFormStubComponent, TraversePlanesStubComponent],
      providers: [
        PlaneDataFormService,
        ConvertUnitsService,
        { provide: FanAnalysisService, useValue: fanAnalysisServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    planeDataFormService = TestBed.inject(PlaneDataFormService);
    fixture = TestBed.createComponent(PlaneDataFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  });

  function setPlaneStep(step: string) {
    planeDataFormService.planeStep.next(step);
    fixture.detectChanges();
  }

  function setTraversePlanes(num: number) {
    inputData.FanRatedInfo.traversePlanes = num;
    fanAnalysisServiceMock.getResults.next(true);
    fixture.detectChanges();
  }

  function stepTabLabels(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('.progress-tabs li .step-number') as NodeListOf<Element>)
      .map(el => text(el));
  }

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('reads the current plane step from the plane data form service', () => {
      expect(component.planeStep).toBe('plane-info');
    });

    it('reads the number of traverse planes from the fan rated info', () => {
      expect(component.numTraversePlanes).toBe(2);
    });

    it('marks the plane info tab active and missing data when plane info is incomplete', () => {
      expect(component.infoClassStatus).toEqual(['missing-data', 'active']);
    });
  });

  describe('observers', () => {
    it('updates the tab status classes when the plane step changes', () => {
      setPlaneStep('1');
      expect(component.infoClassStatus).not.toContain('active');
      expect(component.stepOneClassStatus).toContain('active');
    });

    it('clears missing-data on the plane info tab once the plane info is complete', () => {
      Object.assign(inputData.PlaneData, {
        totalPressureLossBtwnPlanes1and4: 1,
        totalPressureLossBtwnPlanes2and5: 1,
        inletSEF: 1,
        outletSEF: 1,
      });
      fanAnalysisServiceMock.getResults.next(true);
      expect(component.infoClassStatus).toEqual(['active']);
    });

    it('checks plane 3c only when there are three traverse planes', () => {
      spyOn(planeDataFormService, 'getPlaneFormFromObj').and.callThrough();
      setTraversePlanes(2);
      expect(planeDataFormService.getPlaneFormFromObj).not.toHaveBeenCalledWith(jasmine.anything(), jasmine.anything(), '3c');
      setTraversePlanes(3);
      expect(planeDataFormService.getPlaneFormFromObj).toHaveBeenCalledWith(inputData.PlaneData.AddlTraversePlanes[1], MOCK_SETTINGS, '3c');
    });
  });

  describe('changePlaneStepTab', () => {
    it('pushes the selected step to the plane data form service', () => {
      component.changePlaneStepTab('3a');
      expect(planeDataFormService.planeStep.getValue()).toBe('3a');
    });

    it('changes the step when a tab link is clicked', () => {
      const links = fixture.nativeElement.querySelectorAll('.progress-tabs li a');
      (links[1] as HTMLElement).click();
      expect(planeDataFormService.planeStep.getValue()).toBe('1');
    });
  });

  describe('template visibility: traverse plane tabs', () => {
    const cases = [
      { planes: 1, expected: ['', '1', '2', '3a', '4', '5'] },
      { planes: 2, expected: ['', '1', '2', '3a', '3b', '4', '5'] },
      { planes: 3, expected: ['', '1', '2', '3a', '3b', '3c', '4', '5'] },
    ];
    cases.forEach(({ planes, expected }) => {
      it(`renders tabs ${expected.filter(x => x).join(',')} for ${planes} traverse plane(s)`, () => {
        setTraversePlanes(planes);
        expect(stepTabLabels()).toEqual(expected);
      });
    });
  });

  describe('template visibility: plane step content', () => {
    it('shows only the plane info form on the plane-info step', () => {
      expect(fixture.nativeElement.querySelector('app-plane-info-form')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-fan-data-form')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-traverse-planes')).toBeNull();
    });

    const fanDataCases = [
      { step: '1', expected: '1|Fan Inlet Flange' },
      { step: '2', expected: '2|Fan or Evase Outlet Flange' },
      { step: '4', expected: '4|Inlet Measurement Plane' },
      { step: '5', expected: '5|Outlet Measurement Plane' },
    ];
    fanDataCases.forEach(({ step, expected }) => {
      it(`shows a single fan data form for plane ${step}`, () => {
        setPlaneStep(step);
        const forms = fixture.nativeElement.querySelectorAll('app-fan-data-form');
        expect(forms.length).toBe(1);
        expect(text(forms[0])).toBe(expected);
        expect(fixture.nativeElement.querySelector('app-plane-info-form')).toBeNull();
        expect(fixture.nativeElement.querySelector('app-traverse-planes')).toBeNull();
      });
    });

    ['3a', '3b', '3c'].forEach(step => {
      it(`shows the traverse planes component for step ${step}`, () => {
        setPlaneStep(step);
        const traverse = fixture.nativeElement.querySelectorAll('app-traverse-planes');
        expect(traverse.length).toBe(1);
        expect(text(traverse[0])).toBe(step);
        expect(fixture.nativeElement.querySelector('app-fan-data-form')).toBeNull();
        expect(fixture.nativeElement.querySelector('app-plane-info-form')).toBeNull();
      });
    });
  });

  describe('destroy', () => {
    it('resets the plane step to plane-info on destroy', () => {
      setPlaneStep('4');
      fixture.destroy();
      expect(planeDataFormService.planeStep.getValue()).toBe('plane-info');
    });

    it('stops reacting to plane step and results changes after destroy', () => {
      fixture.destroy();
      planeDataFormService.planeStep.next('5');
      inputData.FanRatedInfo.traversePlanes = 3;
      fanAnalysisServiceMock.getResults.next(true);
      expect(component.planeStep).toBe('plane-info');
      expect(component.numTraversePlanes).toBe(2);
    });
  });
});
