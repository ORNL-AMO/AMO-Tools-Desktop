import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoolingWeatherChartComponent } from './cooling-weather-chart.component';

describe('CoolingWeatherChartComponent', () => {
  let component: CoolingWeatherChartComponent;
  let fixture: ComponentFixture<CoolingWeatherChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoolingWeatherChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoolingWeatherChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
