import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorHelpComponent } from './motor-help.component';

describe('MotorHelpComponent', () => {
  let component: MotorHelpComponent;
  let fixture: ComponentFixture<MotorHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
