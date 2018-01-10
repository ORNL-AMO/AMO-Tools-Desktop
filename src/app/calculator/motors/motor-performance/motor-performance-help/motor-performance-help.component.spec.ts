import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorPerformanceHelpComponent } from './motor-performance-help.component';

describe('MotorPerformanceHelpComponent', () => {
  let component: MotorPerformanceHelpComponent;
  let fixture: ComponentFixture<MotorPerformanceHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorPerformanceHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorPerformanceHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
