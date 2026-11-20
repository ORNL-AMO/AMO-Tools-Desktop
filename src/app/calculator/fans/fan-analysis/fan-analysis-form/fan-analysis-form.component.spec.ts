import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FanAnalysisFormComponent } from './fan-analysis-form.component';
import { FanAnalysisService } from '../fan-analysis.service';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

const STEP_FORMS: Array<{ stepTab: string, selector: string }> = [
  { stepTab: 'fan-info', selector: 'app-fan-info-form' },
  { stepTab: 'gas-density', selector: 'app-gas-density-form' },
  { stepTab: 'plane-data', selector: 'app-plane-data-form' },
  { stepTab: 'fan-shaft-power', selector: 'app-fan-shaft-power-form' },
];

describe('FanAnalysisFormComponent', () => {
  let component: FanAnalysisFormComponent;
  let fixture: ComponentFixture<FanAnalysisFormComponent>;
  let fanAnalysisService: FanAnalysisService;

  beforeEach(async () => {
    fanAnalysisService = new FanAnalysisService(null, null, null, null);

    await TestBed.configureTestingModule({
      declarations: [FanAnalysisFormComponent],
      providers: [{ provide: FanAnalysisService, useValue: fanAnalysisService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FanAnalysisFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  });

  function renderedForms(): Array<string> {
    return STEP_FORMS
      .filter(step => fixture.nativeElement.querySelector(step.selector) !== null)
      .map(step => step.selector);
  }

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('subscribes to stepTab and takes its current value', () => {
      expect(component.stepTab).toBe('fan-info');
    });
  });

  describe('template visibility', () => {
    STEP_FORMS.forEach(step => {
      it(`renders only ${step.selector} when stepTab is ${step.stepTab}`, () => {
        fanAnalysisService.stepTab.next(step.stepTab);
        fixture.detectChanges();
        expect(renderedForms()).toEqual([step.selector]);
      });
    });

    it('renders no step form when stepTab is fan-analysis-results', () => {
      fanAnalysisService.stepTab.next('fan-analysis-results');
      fixture.detectChanges();
      expect(renderedForms()).toEqual([]);
    });
  });

  describe('destroy', () => {
    it('stops following stepTab after the component is destroyed', () => {
      fixture.destroy();
      fanAnalysisService.stepTab.next('gas-density');
      expect(component.stepTab).toBe('fan-info');
    });
  });
});
