import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherBinsHeatMapComponent } from './weather-bins-heat-map.component';

describe('WeatherBinsHeatMapComponent', () => {
  let component: WeatherBinsHeatMapComponent;
  let fixture: ComponentFixture<WeatherBinsHeatMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherBinsHeatMapComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WeatherBinsHeatMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
