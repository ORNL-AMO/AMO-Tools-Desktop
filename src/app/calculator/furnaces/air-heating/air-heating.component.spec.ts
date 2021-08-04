import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirHeatingComponent } from './air-heating.component';

describe('AirHeatingComponent', () => {
  let component: AirHeatingComponent;
  let fixture: ComponentFixture<AirHeatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AirHeatingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AirHeatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
