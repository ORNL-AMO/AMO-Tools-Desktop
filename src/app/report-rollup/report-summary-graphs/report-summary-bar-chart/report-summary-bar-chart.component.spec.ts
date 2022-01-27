import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSummaryBarChartComponent } from './report-summary-bar-chart.component';

describe('ReportSummaryBarChartComponent', () => {
  let component: ReportSummaryBarChartComponent;
  let fixture: ComponentFixture<ReportSummaryBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportSummaryBarChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportSummaryBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
