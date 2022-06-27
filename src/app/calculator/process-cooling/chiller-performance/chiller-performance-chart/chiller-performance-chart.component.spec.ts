import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChillerPerformanceChartComponent } from './chiller-performance-chart.component';

describe('ChillerPerformanceChartComponent', () => {
  let component: ChillerPerformanceChartComponent;
  let fixture: ComponentFixture<ChillerPerformanceChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChillerPerformanceChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChillerPerformanceChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
