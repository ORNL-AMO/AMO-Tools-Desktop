import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanMotorComponent } from './fan-motor.component';

describe('FanMotorComponent', () => {
  let component: FanMotorComponent;
  let fixture: ComponentFixture<FanMotorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanMotorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanMotorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
