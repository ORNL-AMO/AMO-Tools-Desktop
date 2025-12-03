import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherStationsTableComponent } from './weather-stations-table.component';

describe('WeatherStationsTableComponent', () => {
  let component: WeatherStationsTableComponent;
  let fixture: ComponentFixture<WeatherStationsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeatherStationsTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeatherStationsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
