import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorPerformanceFormComponent } from './motor-performance-form.component';

describe('MotorPerformanceFormComponent', () => {
  let component: MotorPerformanceFormComponent;
  let fixture: ComponentFixture<MotorPerformanceFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorPerformanceFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorPerformanceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
