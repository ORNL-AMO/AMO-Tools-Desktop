import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherStationLookupComponent } from './weather-station-lookup.component';

describe('WeatherStationLookupComponent', () => {
  let component: WeatherStationLookupComponent;
  let fixture: ComponentFixture<WeatherStationLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeatherStationLookupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherStationLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
