import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemSummaryReportComponent } from './system-summary-report.component';

describe('SystemSummaryReportComponent', () => {
  let component: SystemSummaryReportComponent;
  let fixture: ComponentFixture<SystemSummaryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemSummaryReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemSummaryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
