import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessCoolingReportComponent } from './process-cooling-report.component';

describe('ProcessCoolingReportComponent', () => {
  let component: ProcessCoolingReportComponent;
  let fixture: ComponentFixture<ProcessCoolingReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessCoolingReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessCoolingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
