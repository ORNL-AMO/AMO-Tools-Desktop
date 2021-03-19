import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyAnalysisBarChartComponent } from './energy-analysis-bar-chart.component';

describe('EnergyAnalysisBarChartComponent', () => {
  let component: EnergyAnalysisBarChartComponent;
  let fixture: ComponentFixture<EnergyAnalysisBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnergyAnalysisBarChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyAnalysisBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
