import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherBinsBarChartComponent } from './weather-bins-bar-chart.component';

describe('WeatherBinsBarChartComponent', () => {
  let component: WeatherBinsBarChartComponent;
  let fixture: ComponentFixture<WeatherBinsBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeatherBinsBarChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherBinsBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
