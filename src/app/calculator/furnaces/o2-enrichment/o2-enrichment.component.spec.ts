import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
import { EnrichmentInput } from '../../../shared/models/phast/o2Enrichment';
import { Settings } from '../../../shared/models/settings';
import { O2EnrichmentFormService } from './o2-enrichment-form.service';
import { O2EnrichmentComponent } from './o2-enrichment.component';
import { O2EnrichmentService } from './o2-enrichment.service';

describe('O2EnrichmentComponent', () => {
  let fixture: ComponentFixture<O2EnrichmentComponent>;
  let enrichmentInputs: BehaviorSubject<EnrichmentInput[]>;
  let savedCalculator: Calculator;

  const baseline = { inputData: { name: 'Baseline', isBaseline: true } } as EnrichmentInput;

  beforeEach(() => {
    enrichmentInputs = new BehaviorSubject<EnrichmentInput[]>([baseline]);
    savedCalculator = { id: 1, assessmentId: 1, o2EnrichmentInputs: [baseline] };

    TestBed.configureTestingModule({
      declarations: [O2EnrichmentComponent],
      providers: [
        { provide: O2EnrichmentService, useValue: { enrichmentInputs, calculate: () => {} } },
        { provide: O2EnrichmentFormService, useValue: {} },
        { provide: SettingsDbService, useValue: { globalSettings: {} } },
        { provide: AnalyticsService, useValue: { sendEvent: () => {} } },
        {
          provide: CalculatorDbService,
          useValue: { getByAssessmentId: () => savedCalculator, saveAssessmentCalculator: () => Promise.resolve() },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(O2EnrichmentComponent);
    fixture.componentInstance.inAssessment = true;
    fixture.componentInstance.assessment = { id: 1 } as Assessment;
    fixture.componentInstance.settings = { unitsOfMeasure: 'Imperial' } as Settings;
    fixture.detectChanges();
  });

  it('saves inputs that replace the array, such as a generated example', () => {
    const example = [baseline, { inputData: { name: 'Modification', isBaseline: false } } as EnrichmentInput];

    enrichmentInputs.next(example);

    expect(savedCalculator.o2EnrichmentInputs).toBe(example);
  });
});
