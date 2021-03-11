import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirHeatingHelpComponent } from './air-heating-help.component';

describe('AirHeatingHelpComponent', () => {
  let component: AirHeatingHelpComponent;
  let fixture: ComponentFixture<AirHeatingHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AirHeatingHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AirHeatingHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
