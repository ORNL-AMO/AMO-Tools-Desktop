import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FanDataHelpComponent } from './fan-data-help.component';
import { FanAnalysisService } from '../../../fan-analysis.service';
import { PlaneDataFormService } from '../../../fan-analysis-form/plane-data-form/plane-data-form.service';
import { Fan203Inputs } from '../../../../../../shared/models/fans';

function makeInputData(): Fan203Inputs {
  return {
    PlaneData: {
      FanInletFlange: { planeType: 'Rectangular' },
      FanEvaseOrOutletFlange: { planeType: 'Circular' },
      FlowTraverse: { planeType: 'Rectangular' },
      AddlTraversePlanes: [{ planeType: 'Circular' }, { planeType: 'Rectangular' }],
      InletMstPlane: { planeType: 'Circular' },
      OutletMstPlane: { planeType: 'Rectangular' },
    },
  } as unknown as Fan203Inputs;
}

const PLANE_STEP_HEADINGS: Array<{ planeStep: string, heading: string }> = [
  { planeStep: 'plane-info', heading: 'Plane Information' },
  { planeStep: '1', heading: 'Plane 1' },
  { planeStep: '2', heading: 'Plane 2' },
  { planeStep: '3a', heading: 'Plane 3' },
  { planeStep: '3b', heading: 'Plane 3' },
  { planeStep: '3c', heading: 'Plane 3' },
  { planeStep: '4', heading: 'Plane 4' },
  { planeStep: '5', heading: 'Plane 5' },
];

const PLANE_STEP_TYPES: Array<{ planeStep: string, planeType: string }> = [
  { planeStep: '1', planeType: 'Rectangular' },
  { planeStep: '2', planeType: 'Circular' },
  { planeStep: '3a', planeType: 'Rectangular' },
  { planeStep: '3b', planeType: 'Circular' },
  { planeStep: '3c', planeType: 'Rectangular' },
  { planeStep: '4', planeType: 'Circular' },
  { planeStep: '5', planeType: 'Rectangular' },
];

const FIELD_HELP: Array<{ field: string, heading: string }> = [
  { field: 'totalPressureLossBtwnPlanes1and4', heading: 'Total Pressure Loss Between Planes 1 and 4' },
  { field: 'totalPressureLossBtwnPlanes2and5', heading: 'Total Pressure Loss Between Planes 2 and 5' },
  { field: 'inletSEF', heading: 'Inlet System Effect Factor' },
  { field: 'outletSEF', heading: 'Outlet System Effect Factor' },
  { field: 'width', heading: 'Width' },
  { field: 'numInletBoxes', heading: 'Number of Inlet Boxes' },
  { field: 'barometricPressure', heading: 'Barometric Pressure' },
  { field: 'staticPressure', heading: 'Static Pressure' },
  { field: 'pitotTubeCoefficient', heading: 'Pitot Tube Coefficient' },
  { field: 'numTraverseHoles', heading: 'Number of Traverse Holes' },
  { field: 'numInsertionPoints', heading: 'Number of Insertion Points' },
  { field: 'differentialReadings', heading: 'Add Differential Readings' },
  { field: 'variationInBarometricPressure', heading: 'Variation In Barometric Pressure' },
];

const CIRCULAR_IMG = 'img[src="assets/images/circular-insertion-duct.png"]';
const RECTANGULAR_IMG = 'img[src="assets/images/rectangular-insertion-duct.png"]';
const OPERATING_POINT_IMG = 'img[src="assets/images/calculator-icons/fan-icons/operating-point-icon.png"]';

describe('FanDataHelpComponent', () => {
  let component: FanDataHelpComponent;
  let fixture: ComponentFixture<FanDataHelpComponent>;
  let fanAnalysisService: Partial<FanAnalysisService>;
  let planeDataFormService: Partial<PlaneDataFormService>;

  function planeHeadings(): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('h5 > span') as NodeListOf<HTMLElement>)
      .map(span => span.textContent.trim());
  }

  function fieldHelp(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('div.my-2 h6') as NodeListOf<HTMLElement>);
  }

  function setState(planeStep: string, field: string) {
    planeDataFormService.planeStep.next(planeStep);
    fanAnalysisService.currentField.next(field);
    fixture.detectChanges();
  }

  function query(selector: string): HTMLElement {
    return fixture.nativeElement.querySelector(selector);
  }

  beforeEach(async () => {
    fanAnalysisService = {
      currentField: new BehaviorSubject<string>('default'),
      getResults: new BehaviorSubject<boolean>(true),
      inputData: makeInputData(),
    };
    planeDataFormService = { planeStep: new BehaviorSubject<string>('plane-info') };

    await TestBed.configureTestingModule({
      declarations: [FanDataHelpComponent],
      providers: [
        { provide: FanAnalysisService, useValue: fanAnalysisService },
        { provide: PlaneDataFormService, useValue: planeDataFormService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FanDataHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('takes currentField and planeStep from the services', () => {
      expect(component.currentField).toBe('default');
      expect(component.planeStep).toBe('plane-info');
    });

    it('leaves planeType unset on the plane-info step', () => {
      expect(component.planeType).toBeUndefined();
    });
  });

  describe('setPlaneType', () => {
    PLANE_STEP_TYPES.forEach(({ planeStep, planeType }) => {
      it(`uses the ${planeType} type of plane ${planeStep}`, () => {
        planeDataFormService.planeStep.next(planeStep);
        expect(component.planeType).toBe(planeType);
      });
    });

    it('re-reads the plane type when getResults fires', () => {
      planeDataFormService.planeStep.next('1');
      fanAnalysisService.inputData.PlaneData.FanInletFlange.planeType = 'Circular';
      fanAnalysisService.getResults.next(true);
      expect(component.planeType).toBe('Circular');
    });
  });

  describe('plane step headings', () => {
    PLANE_STEP_HEADINGS.forEach(({ planeStep, heading }) => {
      it(`shows only the ${heading} heading when planeStep is ${planeStep}`, () => {
        setState(planeStep, 'default');
        const headings = planeHeadings();
        expect(headings.length).toBe(1);
        expect(headings[0].startsWith(heading)).toBeTrue();
      });
    });

    it('shows no plane heading for an unknown planeStep', () => {
      setState('unknown', 'default');
      expect(planeHeadings()).toEqual([]);
    });
  });

  describe('operating point image', () => {
    ['3a', '3b', '3c'].forEach(planeStep => {
      it(`shows the operating point image on plane ${planeStep}`, () => {
        setState(planeStep, 'default');
        expect(query(OPERATING_POINT_IMG)).not.toBeNull();
      });
    });

    ['plane-info', '1', '2', '4', '5'].forEach(planeStep => {
      it(`hides the operating point image on step ${planeStep}`, () => {
        setState(planeStep, 'default');
        expect(query(OPERATING_POINT_IMG)).toBeNull();
      });
    });
  });

  describe('field help', () => {
    it('shows no field help when currentField matches no field', () => {
      expect(fieldHelp().length).toBe(0);
    });

    FIELD_HELP.forEach(({ field, heading }) => {
      it(`shows only the ${heading} help when currentField is ${field}`, () => {
        setState('1', field);
        const help = fieldHelp();
        expect(help.length).toBe(1);
        expect(help[0].textContent.trim().startsWith(heading)).toBeTrue();
      });
    });

    describe('length', () => {
      it('shows Height wording for a rectangular plane', () => {
        setState('1', 'length');
        const help = fieldHelp();
        expect(help.length).toBe(1);
        expect(help[0].textContent).toContain('Height');
        expect(help[0].textContent).toContain('height');
        expect(help[0].textContent).not.toContain('Diameter');
        expect(help[0].textContent).not.toContain('diameter');
      });

      it('shows Diameter wording for a circular plane', () => {
        setState('2', 'length');
        const help = fieldHelp();
        expect(help.length).toBe(1);
        expect(help[0].textContent).toContain('Diameter');
        expect(help[0].textContent).toContain('diameter');
        expect(help[0].textContent).not.toContain('Height');
        expect(help[0].textContent).not.toContain('height');
      });

      it('shows neither wording when the plane type is unset', () => {
        setState('plane-info', 'length');
        const help = fieldHelp();
        expect(help.length).toBe(1);
        expect(help[0].querySelectorAll('span').length).toBe(0);
      });
    });

    describe('dryBulbTemp', () => {
      it('shows the flow traverse variant on plane 3a', () => {
        setState('3a', 'dryBulbTemp');
        const help = fieldHelp();
        expect(help.length).toBe(1);
        expect(help[0].textContent).toContain('Dry Bulb Temp');
        expect(help[0].textContent).toContain('Fluid page');
      });

      it('shows the short variant on plane 3b', () => {
        setState('3b', 'dryBulbTemp');
        const help = fieldHelp();
        expect(help.length).toBe(1);
        expect(help[0].textContent).toContain('Dry Bulb Temp');
        expect(help[0].textContent).not.toContain('Fluid page');
      });

      ['1', '3c'].forEach(planeStep => {
        it(`shows no dry bulb help on plane ${planeStep}`, () => {
          setState(planeStep, 'dryBulbTemp');
          expect(fieldHelp().length).toBe(0);
        });
      });
    });

    describe('insertion diagram', () => {
      ['numInsertionPoints', 'numTraverseHoles'].forEach(field => {
        it(`shows the rectangular diagram for ${field} on a rectangular plane`, () => {
          setState('1', field);
          expect(query(RECTANGULAR_IMG)).not.toBeNull();
          expect(query(CIRCULAR_IMG)).toBeNull();
        });

        it(`shows the circular diagram for ${field} on a circular plane`, () => {
          setState('2', field);
          expect(query(CIRCULAR_IMG)).not.toBeNull();
          expect(query(RECTANGULAR_IMG)).toBeNull();
        });

        it(`shows no diagram for ${field} when the plane type is unset`, () => {
          setState('plane-info', field);
          expect(query(CIRCULAR_IMG)).toBeNull();
          expect(query(RECTANGULAR_IMG)).toBeNull();
        });
      });

      it('hides the diagram for other fields', () => {
        setState('1', 'width');
        expect(query(CIRCULAR_IMG)).toBeNull();
        expect(query(RECTANGULAR_IMG)).toBeNull();
      });
    });
  });

  describe('destroy', () => {
    it('stops reacting to service changes after destroy', () => {
      fixture.destroy();
      fanAnalysisService.currentField.next('width');
      planeDataFormService.planeStep.next('1');
      fanAnalysisService.getResults.next(true);
      expect(component.currentField).toBe('default');
      expect(component.planeStep).toBe('plane-info');
      expect(component.planeType).toBeUndefined();
    });
  });
});
