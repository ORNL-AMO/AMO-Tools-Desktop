import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemTrueCostReportComponent } from './system-true-cost-report.component';

describe('SystemTrueCostReportComponent', () => {
  let component: SystemTrueCostReportComponent;
  let fixture: ComponentFixture<SystemTrueCostReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemTrueCostReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemTrueCostReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
