import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Co2SavingsSettingsComponent } from './co2-savings-settings.component';

describe('Co2SavingsSettingsComponent', () => {
  let component: Co2SavingsSettingsComponent;
  let fixture: ComponentFixture<Co2SavingsSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Co2SavingsSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Co2SavingsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
