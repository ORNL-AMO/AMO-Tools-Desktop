import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpMotorHelpComponent } from './pump-motor-help.component';

describe('PumpMotorHelpComponent', () => {
  let component: PumpMotorHelpComponent;
  let fixture: ComponentFixture<PumpMotorHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpMotorHelpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PumpMotorHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
