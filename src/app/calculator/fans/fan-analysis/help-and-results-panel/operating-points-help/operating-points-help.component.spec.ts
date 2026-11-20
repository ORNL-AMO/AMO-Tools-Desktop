import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OperatingPointsHelpComponent } from './operating-points-help.component';
import { FanAnalysisService } from '../../fan-analysis.service';

const HELP_SELECTORS = [
  'app-gas-density-help',
  'app-fan-shaft-power-help',
  'app-fsat-basics-help',
  'app-fan-data-help',
];

const STEP_TAB_CASES: Array<{ stepTab: string, selector: string }> = [
  { stepTab: 'gas-density', selector: 'app-gas-density-help' },
  { stepTab: 'fan-shaft-power', selector: 'app-fan-shaft-power-help' },
  { stepTab: 'fan-info', selector: 'app-fsat-basics-help' },
  { stepTab: 'plane-data', selector: 'app-fan-data-help' },
];

describe('OperatingPointsHelpComponent', () => {
  let component: OperatingPointsHelpComponent;
  let fixture: ComponentFixture<OperatingPointsHelpComponent>;
  let fanAnalysisService: Partial<FanAnalysisService>;

  function renderedHelp(): string[] {
    return HELP_SELECTORS.filter(selector => fixture.nativeElement.querySelector(selector) !== null);
  }

  beforeEach(async () => {
    fanAnalysisService = { stepTab: new BehaviorSubject<string>('fan-info') };

    await TestBed.configureTestingModule({
      declarations: [OperatingPointsHelpComponent],
      providers: [{ provide: FanAnalysisService, useValue: fanAnalysisService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(OperatingPointsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('takes stepTab from the fan analysis service', () => {
      expect(component.stepTab).toBe('fan-info');
    });
  });

  describe('template visibility', () => {
    STEP_TAB_CASES.forEach(({ stepTab, selector }) => {
      it(`shows only ${selector} when stepTab is ${stepTab}`, () => {
        fanAnalysisService.stepTab.next(stepTab);
        fixture.detectChanges();
        expect(renderedHelp()).toEqual([selector]);
      });
    });

    it('shows no help component for an unknown stepTab', () => {
      fanAnalysisService.stepTab.next('unknown');
      fixture.detectChanges();
      expect(renderedHelp()).toEqual([]);
    });
  });

  describe('destroy', () => {
    it('stops updating stepTab after destroy', () => {
      fixture.destroy();
      fanAnalysisService.stepTab.next('plane-data');
      expect(component.stepTab).toBe('fan-info');
    });
  });
});
