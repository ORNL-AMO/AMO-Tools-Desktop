import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherStationsMapComponent } from './weather-stations-map.component';

describe('WeatherStationsMapComponent', () => {
  let component: WeatherStationsMapComponent;
  let fixture: ComponentFixture<WeatherStationsMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeatherStationsMapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeatherStationsMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
