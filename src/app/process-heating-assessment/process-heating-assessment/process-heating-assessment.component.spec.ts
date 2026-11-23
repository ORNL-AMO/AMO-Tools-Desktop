import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalyticsService } from '../../shared/analytics/analytics.service';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
import { ProcessHeatingAssessmentComponent } from './process-heating-assessment.component';

class FakeProcessHeatingUiService {
  readonly canContinue = signal(true);
  readonly canGoBack = signal(true);
  readonly blockedReason = signal<string | undefined>(undefined);
  readonly continue = jasmine.createSpy('continue');
  readonly back = jasmine.createSpy('back');
}

describe('ProcessHeatingAssessmentComponent', () => {
  let fixture: ComponentFixture<ProcessHeatingAssessmentComponent>;
  let uiService: FakeProcessHeatingUiService;
  let analyticsService: jasmine.SpyObj<AnalyticsService>;

  beforeEach(() => {
    analyticsService = jasmine.createSpyObj<AnalyticsService>('AnalyticsService', ['sendEvent']);
    TestBed.configureTestingModule({
      declarations: [ProcessHeatingAssessmentComponent],
      providers: [
        { provide: ProcessHeatingUiService, useClass: FakeProcessHeatingUiService },
        { provide: AnalyticsService, useValue: analyticsService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    uiService = TestBed.inject(ProcessHeatingUiService) as unknown as FakeProcessHeatingUiService;
    fixture = TestBed.createComponent(ProcessHeatingAssessmentComponent);
    fixture.detectChanges();
  });

  it('records the page view', () => {
    expect(analyticsService.sendEvent).toHaveBeenCalledWith('view-process-heating-assessment', undefined);
  });

  it('moves to the next and previous step', () => {
    fixture.componentInstance.next();
    fixture.componentInstance.back();

    expect(uiService.continue).toHaveBeenCalled();
    expect(uiService.back).toHaveBeenCalled();
  });
});
