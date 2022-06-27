import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherBinsTableComponent } from './weather-bins-table.component';

describe('WeatherBinsTableComponent', () => {
  let component: WeatherBinsTableComponent;
  let fixture: ComponentFixture<WeatherBinsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeatherBinsTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherBinsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
