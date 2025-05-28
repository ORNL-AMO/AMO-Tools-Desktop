import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyFlowChartComponent } from './monthly-flow-chart.component';

describe('MonthlyFlowChartComponent', () => {
  let component: MonthlyFlowChartComponent;
  let fixture: ComponentFixture<MonthlyFlowChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyFlowChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyFlowChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
