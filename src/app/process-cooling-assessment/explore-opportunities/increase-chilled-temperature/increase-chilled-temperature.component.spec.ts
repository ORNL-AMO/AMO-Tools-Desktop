import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncreaseChilledTemperatureComponent } from './increase-chilled-temperature.component';

describe('IncreaseChilledTemperatureComponent', () => {
  let component: IncreaseChilledTemperatureComponent;
  let fixture: ComponentFixture<IncreaseChilledTemperatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IncreaseChilledTemperatureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncreaseChilledTemperatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});