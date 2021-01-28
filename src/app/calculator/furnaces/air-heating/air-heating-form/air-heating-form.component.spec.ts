import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirHeatingFormComponent } from './air-heating-form.component';

describe('AirHeatingFormComponent', () => {
  let component: AirHeatingFormComponent;
  let fixture: ComponentFixture<AirHeatingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AirHeatingFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AirHeatingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
