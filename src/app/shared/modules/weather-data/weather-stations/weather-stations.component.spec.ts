import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherStationsComponent } from './weather-stations.component';

describe('WeatherStationsComponent', () => {
  let component: WeatherStationsComponent;
  let fixture: ComponentFixture<WeatherStationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeatherStationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeatherStationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
