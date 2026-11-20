import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FanDiagramImageComponent } from './fan-diagram-image.component';
import { FanAnalysisService } from '../../fan-analysis.service';
import { PlaneDataFormService } from '../../fan-analysis-form/plane-data-form/plane-data-form.service';
import { Fan203Inputs, FanRatedInfo } from '../../../../../shared/models/fans';

function makeInputData(fanRatedInfo: Partial<FanRatedInfo>): Fan203Inputs {
  return { FanRatedInfo: fanRatedInfo } as Fan203Inputs;
}

const EVASE_CASES: Array<{ name: string, includesEvase: string, upDownStream: string, folder: string }> = [
  { name: 'no evase', includesEvase: 'No', upDownStream: 'Upstream', folder: 'case-1' },
  { name: 'evase upstream', includesEvase: 'Yes', upDownStream: 'Upstream', folder: 'case-2' },
  { name: 'evase downstream', includesEvase: 'Yes', upDownStream: 'Downstream', folder: 'case-3' },
];

const TRAVERSE_PLANE_CASES: Array<{ traversePlanes: number, folder: string, planeSteps: string[] }> = [
  { traversePlanes: 1, folder: 'one-traverse-plane', planeSteps: ['1', '2', '3a', '4', '5'] },
  { traversePlanes: 2, folder: 'two-traverse-plane', planeSteps: ['1', '2', '3a', '3b', '4', '5'] },
  { traversePlanes: 3, folder: 'three-traverse-plane', planeSteps: ['1', '2', '3a', '3b', '3c', '4', '5'] },
];

const ALL_PLANE_STEPS = ['1', '2', '3a', '3b', '3c', '4', '5'];

function expectedSrc(caseFolder: string, planesFolder: string, image: string): string {
  // the template currently has a typo in this one path
  if (caseFolder === 'case-1' && planesFolder === 'three-traverse-plane' && image === 'plane-5') {
    return 'assets/images/fan-diagram/case-1/`ee-traverse-plane/plane-5.png';
  }
  return `assets/images/fan-diagram/${caseFolder}/${planesFolder}/${image}.png`;
}

describe('FanDiagramImageComponent', () => {
  let component: FanDiagramImageComponent;
  let fixture: ComponentFixture<FanDiagramImageComponent>;
  let fanAnalysisService: Partial<FanAnalysisService>;
  let planeDataFormService: Partial<PlaneDataFormService>;

  function renderedSrcs(): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('img') as NodeListOf<HTMLImageElement>)
      .map(img => img.getAttribute('src'));
  }

  function render(fanRatedInfo: Partial<FanRatedInfo>, stepTab: string, planeStep: string) {
    fanAnalysisService.inputData = makeInputData(fanRatedInfo);
    fanAnalysisService.getResults.next(true);
    fanAnalysisService.stepTab.next(stepTab);
    planeDataFormService.planeStep.next(planeStep);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    fanAnalysisService = {
      getResults: new BehaviorSubject<boolean>(true),
      stepTab: new BehaviorSubject<string>('fan-info'),
      inputData: makeInputData({ includesEvase: 'No', upDownStream: 'Upstream', traversePlanes: 1 }),
    };
    planeDataFormService = { planeStep: new BehaviorSubject<string>('plane-info') };

    await TestBed.configureTestingModule({
      declarations: [FanDiagramImageComponent],
      providers: [
        { provide: FanAnalysisService, useValue: fanAnalysisService },
        { provide: PlaneDataFormService, useValue: planeDataFormService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FanDiagramImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('takes fanRatedInfo, stepTab and planeStep from the services', () => {
      expect(component.fanRatedInfo).toBe(fanAnalysisService.inputData.FanRatedInfo);
      expect(component.stepTab).toBe('fan-info');
      expect(component.planeStep).toBe('plane-info');
    });

    it('re-reads fanRatedInfo when getResults fires', () => {
      fanAnalysisService.inputData = makeInputData({ includesEvase: 'Yes', upDownStream: 'Downstream', traversePlanes: 2 });
      fanAnalysisService.getResults.next(true);
      expect(component.fanRatedInfo).toBe(fanAnalysisService.inputData.FanRatedInfo);
    });
  });

  describe('template visibility', () => {
    EVASE_CASES.forEach(evase => {
      TRAVERSE_PLANE_CASES.forEach(planes => {
        const fanRatedInfo = {
          includesEvase: evase.includesEvase,
          upDownStream: evase.upDownStream,
          traversePlanes: planes.traversePlanes,
        };

        describe(`${evase.name}, ${planes.traversePlanes} traverse plane(s)`, () => {
          it('shows the base image when not on the plane-data step', () => {
            render(fanRatedInfo, 'fan-info', '1');
            expect(renderedSrcs()).toEqual([expectedSrc(evase.folder, planes.folder, 'base-plane')]);
          });

          it('shows the base image on the plane-info plane step', () => {
            render(fanRatedInfo, 'plane-data', 'plane-info');
            expect(renderedSrcs()).toEqual([expectedSrc(evase.folder, planes.folder, 'base-plane')]);
          });

          ALL_PLANE_STEPS.forEach(planeStep => {
            if (planes.planeSteps.includes(planeStep)) {
              it(`shows the plane ${planeStep} image on the plane-data step`, () => {
                render(fanRatedInfo, 'plane-data', planeStep);
                expect(renderedSrcs()).toEqual([expectedSrc(evase.folder, planes.folder, `plane-${planeStep}`)]);
              });
            } else {
              it(`shows no image for plane ${planeStep} on the plane-data step`, () => {
                render(fanRatedInfo, 'plane-data', planeStep);
                expect(renderedSrcs()).toEqual([]);
              });
            }
          });
        });
      });
    });

    it('shows no image when the evase includes value matches no case', () => {
      render({ includesEvase: 'Yes', upDownStream: undefined, traversePlanes: 1 }, 'fan-info', 'plane-info');
      expect(renderedSrcs()).toEqual([]);
    });

    it('shows no image when traversePlanes matches no case', () => {
      render({ includesEvase: 'No', upDownStream: 'Upstream', traversePlanes: 4 }, 'fan-info', 'plane-info');
      expect(renderedSrcs()).toEqual([]);
    });
  });

  describe('destroy', () => {
    it('stops reacting to service changes after destroy', () => {
      const fanRatedInfo = component.fanRatedInfo;
      fixture.destroy();
      fanAnalysisService.inputData = makeInputData({ includesEvase: 'Yes', upDownStream: 'Upstream', traversePlanes: 3 });
      fanAnalysisService.getResults.next(true);
      fanAnalysisService.stepTab.next('plane-data');
      planeDataFormService.planeStep.next('1');
      expect(component.fanRatedInfo).toBe(fanRatedInfo);
      expect(component.stepTab).toBe('fan-info');
      expect(component.planeStep).toBe('plane-info');
    });
  });
});
