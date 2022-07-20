import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherBinsFormComponent } from './weather-bins-form.component';

describe('WeatherBinsFormComponent', () => {
  let component: WeatherBinsFormComponent;
  let fixture: ComponentFixture<WeatherBinsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeatherBinsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherBinsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
