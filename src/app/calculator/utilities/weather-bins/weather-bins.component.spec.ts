import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherBinsComponent } from './weather-bins.component';

describe('WeatherBinsComponent', () => {
  let component: WeatherBinsComponent;
  let fixture: ComponentFixture<WeatherBinsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeatherBinsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherBinsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
