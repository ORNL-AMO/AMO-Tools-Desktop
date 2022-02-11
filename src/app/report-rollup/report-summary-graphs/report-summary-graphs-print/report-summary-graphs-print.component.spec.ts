import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSummaryGraphsPrintComponent } from './report-summary-graphs-print.component';

describe('ReportSummaryGraphsPrintComponent', () => {
  let component: ReportSummaryGraphsPrintComponent;
  let fixture: ComponentFixture<ReportSummaryGraphsPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportSummaryGraphsPrintComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportSummaryGraphsPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
