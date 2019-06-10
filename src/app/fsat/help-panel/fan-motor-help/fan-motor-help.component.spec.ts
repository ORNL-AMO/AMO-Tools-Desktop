import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanMotorHelpComponent } from './fan-motor-help.component';

describe('FanMotorHelpComponent', () => {
  let component: FanMotorHelpComponent;
  let fixture: ComponentFixture<FanMotorHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanMotorHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanMotorHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
