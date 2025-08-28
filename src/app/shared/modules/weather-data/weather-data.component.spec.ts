import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherDataComponent } from './weather-data.component';

describe('WeatherDataComponent', () => {
  let component: WeatherDataComponent;
  let fixture: ComponentFixture<WeatherDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeatherDataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeatherDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
