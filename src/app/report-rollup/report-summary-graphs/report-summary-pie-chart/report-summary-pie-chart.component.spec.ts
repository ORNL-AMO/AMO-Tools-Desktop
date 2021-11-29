import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSummaryPieChartComponent } from './report-summary-pie-chart.component';

describe('ReportSummaryPieChartComponent', () => {
  let component: ReportSummaryPieChartComponent;
  let fixture: ComponentFixture<ReportSummaryPieChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportSummaryPieChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportSummaryPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
