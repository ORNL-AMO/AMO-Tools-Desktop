import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyCostPieChartComponent } from './energy-cost-pie-chart.component';

describe('EnergyCostPieChartComponent', () => {
  let component: EnergyCostPieChartComponent;
  let fixture: ComponentFixture<EnergyCostPieChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergyCostPieChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyCostPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
