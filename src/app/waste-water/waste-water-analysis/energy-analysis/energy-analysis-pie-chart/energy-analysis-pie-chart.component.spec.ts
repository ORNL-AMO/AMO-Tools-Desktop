import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyAnalysisPieChartComponent } from './energy-analysis-pie-chart.component';

describe('EnergyAnalysisPieChartComponent', () => {
  let component: EnergyAnalysisPieChartComponent;
  let fixture: ComponentFixture<EnergyAnalysisPieChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnergyAnalysisPieChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyAnalysisPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
