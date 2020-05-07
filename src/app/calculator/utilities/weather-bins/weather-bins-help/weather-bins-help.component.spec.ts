import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherBinsHelpComponent } from './weather-bins-help.component';

describe('WeatherBinsHelpComponent', () => {
  let component: WeatherBinsHelpComponent;
  let fixture: ComponentFixture<WeatherBinsHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeatherBinsHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherBinsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
