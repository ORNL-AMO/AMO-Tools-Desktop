import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorPerformanceComponent } from './motor-performance.component';

describe('MotorPerformanceComponent', () => {
  let component: MotorPerformanceComponent;
  let fixture: ComponentFixture<MotorPerformanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorPerformanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
