import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorPerformanceChartComponent } from './motor-performance-chart.component';

describe('MotorPerformanceChartComponent', () => {
  let component: MotorPerformanceChartComponent;
  let fixture: ComponentFixture<MotorPerformanceChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorPerformanceChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorPerformanceChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
