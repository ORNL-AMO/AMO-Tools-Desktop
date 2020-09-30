import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyCostBarChartComponent } from './energy-cost-bar-chart.component';

describe('EnergyCostBarChartComponent', () => {
  let component: EnergyCostBarChartComponent;
  let fixture: ComponentFixture<EnergyCostBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergyCostBarChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyCostBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
