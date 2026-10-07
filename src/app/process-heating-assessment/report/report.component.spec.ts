import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { ProcessHeatingReportAdapter } from './process-heating-report.adapter';
import { ReportComponent } from './report.component';

describe('ReportComponent', () => {
  let fixture: ComponentFixture<ReportComponent>;
  let assessment$: BehaviorSubject<Assessment | undefined>;
  let adapter: jasmine.SpyObj<ProcessHeatingReportAdapter>;

  const text = (): string => fixture.nativeElement.textContent.replace(/\s+/g, ' ');

  beforeEach(() => {
    assessment$ = new BehaviorSubject<Assessment | undefined>(undefined);
    adapter = jasmine.createSpyObj<ProcessHeatingReportAdapter>('ProcessHeatingReportAdapter', ['buildDocument']);
    adapter.buildDocument.and.returnValue(of({ meta: { title: 'x', date: '' }, sections: [] }));
    TestBed.configureTestingModule({
      declarations: [ReportComponent],
      providers: [
        { provide: ProcessHeatingAssessmentService, useValue: { assessment$ } },
        { provide: ProcessHeatingReportAdapter, useValue: adapter },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ReportComponent);
    fixture.detectChanges();
  });

  it('renders nothing until the assessment is loaded', () => {
    expect(fixture.nativeElement.querySelector('.report-container')).toBeNull();
  });

  it('renders every report tab once the assessment loads', () => {
    assessment$.next({ name: 'Furnace 1' } as Assessment);
    fixture.detectChanges();
    ['Energy Summary', 'Executive Summary', 'Result Data', 'Report Graphs', 'Sankey', 'Input Summary', 'Facility Info']
      .forEach(label => expect(text()).toContain(label));
  });

  it('renders the export button with the assessment name', () => {
    assessment$.next({ name: 'Furnace 1' } as Assessment);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-export-button').length).toBe(2);
  });

  it('builds the export document from the adapter', () => {
    assessment$.next({ name: 'Furnace 1' } as Assessment);
    fixture.componentInstance.reportDocument$.subscribe();
    expect(adapter.buildDocument).toHaveBeenCalledWith(jasmine.objectContaining({ name: 'Furnace 1' }));
  });
});
