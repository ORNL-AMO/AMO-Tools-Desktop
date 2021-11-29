import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSummaryGraphsComponent } from './report-summary-graphs.component';

describe('ReportSummaryGraphsComponent', () => {
  let component: ReportSummaryGraphsComponent;
  let fixture: ComponentFixture<ReportSummaryGraphsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportSummaryGraphsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportSummaryGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
